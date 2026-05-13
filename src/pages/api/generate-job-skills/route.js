-- Generate job skills using OpenAI API
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jobTitle } = req.body;

  if (!jobTitle) {
    return res.status(400).json({ error: 'Job title is required' });
  }

  try {
    const prompt = `Analizza il seguente titolo di lavoro e genera una lista di competenze tecniche (hard skills) e competenze trasversali (soft skills) richieste per questa posizione.

Titolo lavoro: "${jobTitle}"

Rispondi in formato JSON con questa struttura:
{
  "hardSkills": ["competenza1", "competenza2", ...],
  "softSkills": ["competenza1", "competenza2", ...]
}

Includi solo le competenze più rilevanti e comuni per questa posizione. Limita a 5-8 competenze per categoria.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Sei un esperto HR che analizza posizioni lavorative e identifica le competenze richieste.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const skills = JSON.parse(response);

    res.status(200).json(skills);
  } catch (error) {
    console.error('Error generating skills:', error);
    res.status(500).json({
      error: 'Failed to generate skills',
      details: error.message
    });
  }
}