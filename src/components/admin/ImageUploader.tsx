'use client';

import { useRef, useState } from 'react';

interface ImageUploaderProps {
  /** Storage bucket to upload into. Both flows use this same component. */
  bucket?: 'product-images' | 'lookbook';
  /** Called with the public storage URL after a successful upload. */
  onUploaded: (url: string) => void;
}

export default function ImageUploader({ bucket = 'product-images', onUploaded }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/admin/upload?bucket=${bucket}`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Upload failed');
      onUploaded(json.url as string);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700">
        {uploading ? 'Uploading…' : 'Upload image'}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {error && <span className="text-red-400 text-sm">{error}</span>}
    </div>
  );
}