'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileCheck, Loader2, Eye } from 'lucide-react';
import { toast } from './sileo-toast';
import { api } from '@/app/services/api';
import Image from 'next/image';

interface FileUploadProps {
  value?: string; // URL del archivo actual
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // en MB
  preview?: boolean; // Mostrar preview de la imagen
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  label = 'Subir archivo',
  accept = 'image/*,.pdf',
  maxSize = 5,
  preview = true,
  className = '',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`El archivo debe ser menor a ${maxSize} MB`);
      return;
    }

    // Crear preview local antes de subir
    if (preview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Subir archivo
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: any = await api.postFormData('/uploads/firma', formData);

      // Actualizar valor con la URL del servidor
      onChange(response.url);
      setPreviewUrl(response.url);
      toast.success('Archivo subido exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al subir el archivo');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleView = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const isImage = previewUrl && (
    previewUrl.startsWith('data:image') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(previewUrl) ||
    previewUrl.includes('/uploads/') // Assume uploads are images for now unless pdf specified
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Área de preview/upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        {previewUrl ? (
          <div className="relative bg-gray-50 min-h-[120px] flex items-center justify-center p-4">
            {isImage && preview ? (
              <div className="relative w-full h-32">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <FileCheck className="h-12 w-12 text-green-500" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Archivo cargado</p>
                  <p className="text-xs text-gray-400">
                    {previewUrl.split('/').pop()}
                  </p>
                </div>
              </div>
            )}

            {/* Botones de acción sobre el archivo */}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white hover:bg-gray-100"
                onClick={handleView}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full p-6 text-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-gray-500">Subiendo archivo...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600 font-medium">{label}</p>
                <p className="text-xs text-gray-400">
                  Haz clic para seleccionar un archivo
                </p>
                <p className="text-xs text-gray-400">
                  Tamaño máximo: {maxSize} MB
                </p>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}


