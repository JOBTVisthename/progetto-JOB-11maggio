import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Building2 } from 'lucide-react';

interface CompanyLogoUploadProps {
  currentLogo: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove: () => Promise<{ success: boolean }>;
  uploading?: boolean;
}

export default function CompanyLogoUpload({
  currentLogo,
  onUpload,
  onRemove,
  uploading = false
}: CompanyLogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    onUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    const result = await onRemove();
    if (result.success) {
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Logo Preview/Upload Area */}
        <div className="relative group">
          {preview ? (
            // Show current logo
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 bg-white shadow-sm">
              <img
                src={preview}
                alt="Logo azienda"
                className="w-full h-full object-contain"
              />
              {!uploading && (
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Rimuovi logo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            // Upload area
            <div
              className={`w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                ${dragActive ? 'border-jobtv-blue bg-jobtv-blue/5' : 'border-gray-300 hover:border-jobtv-teal bg-gray-50'}
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-jobtv-teal animate-spin" />
              ) : (
                <>
                  <Building2 className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Logo</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Upload Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Logo Aziendale</h3>
          <p className="text-sm text-gray-600 mb-3">
            Carica il logo della tua azienda per rendere il profilo più riconoscibile.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-1" />
              {preview ? 'Cambia logo' : 'Carica logo'}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Rimuovi
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 mt-2">
            Formati: JPG, PNG, WEBP, GIF (max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
}
