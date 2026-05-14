// ============================================================================
// Send Email API Route
// POST /api/send-email - Send emails via SMTP
// ============================================================================

import express from 'express';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { smtpConfig, emailTemplates } from '../../../../config/smtp.config.js';

const router = express.Router();

// Initialize Supabase admin client for password reset
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// In-memory store for password reset tokens (in production, use Redis or database)
const resetTokens = new Map();

// Clean up expired tokens (run every hour)
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expiresAt < now) {
      resetTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);

// Create transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email via SMTP
const sendEmail = async (to, subject, html) => {
  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from: smtpConfig.from,
      to,
      subject,
      html
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// POST endpoint - Send confirmation email
router.post('/confirm', async (req, res) => {
  try {
    const { email, name, confirmUrl } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const emailContent = emailTemplates.confirmation(name || email.split('@')[0], confirmUrl);
    const result = await sendEmail(email, emailContent.subject, emailContent.html);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send email',
        details: result.error
      });
    }

    res.json({
      success: true,
      message: 'Confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error in send-email/confirm:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST endpoint - Send welcome email
router.post('/welcome', async (req, res) => {
  try {
    const { email, name, userType } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const emailContent = emailTemplates.welcome(name || email.split('@')[0], userType || 'candidate');
    const result = await sendEmail(email, emailContent.subject, emailContent.html);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send email',
        details: result.error
      });
    }

    res.json({
      success: true,
      message: 'Welcome email sent successfully'
    });

  } catch (error) {
    console.error('Error in send-email/welcome:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check for email service
router.get('/health', async (req, res) => {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection is working' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST endpoint - Send password reset email
router.post('/reset-password', async (req, res) => {
  try {
    const { email, redirectUrl } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

    // Store the token with email
    resetTokens.set(token, { email, expiresAt });

    // Create reset URL with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8022';
    const baseUrl = redirectUrl ? new URL(redirectUrl).origin : frontendUrl;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Extract user name from email
    const userName = email.split('@')[0];

    // Send password reset email via SMTP
    const emailContent = emailTemplates.passwordReset(userName, resetUrl);
    const result = await sendEmail(email, emailContent.subject, emailContent.html);

    if (!result.success) {
      console.error('Failed to send reset email:', result.error);
      // Still return success for security
      return res.json({
        success: true,
        message: 'Se l\'email è associata a un account, riceverai un link per resettare la password.'
      });
    }

    console.log('Password reset email sent to:', email);
    res.json({
      success: true,
      message: 'Se l\'email è associata a un account, riceverai un link per resettare la password.'
    });

  } catch (error) {
    console.error('Error in send-email/reset-password:', error);
    // For security, still return success
    res.json({
      success: true,
      message: 'Se l\'email è associata a un account, riceverai un link per resettare la password.'
    });
  }
});

// GET endpoint - Verify reset token
router.get('/verify-reset-token', (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token is required' });
    }

    const tokenData = resetTokens.get(token );

    if (!tokenData) {
      return res.json({ valid: false, error: 'Invalid or expired token' });
    }

    if (tokenData.expiresAt < Date.now()) {
      resetTokens.delete(token );
      return res.json({ valid: false, error: 'Token expired' });
    }

    res.json({ valid: true, email: tokenData.email });

  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(500).json({ valid: false, error: 'Server error' });
  }
});

// POST endpoint - Update password with token
router.post('/update-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token and new password are required' });
    }

    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    if (tokenData.expiresAt < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({ success: false, error: 'Token expired' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ success: false, error: 'Supabase not configured' });
    }

    // Update user password in Supabase
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return res.status(500).json({ success: false, error: 'Failed to update password' });
    }

    const user = users.find(u => u.email === tokenData.email);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update password' });
    }

    // Remove the used token
    resetTokens.delete(token);

    console.log('Password updated for:', tokenData.email);
    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
