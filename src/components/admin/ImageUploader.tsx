'use client';

import { useRef, useState } from 'react';

interface ImageUploaderProps {
  /** Storage bucket to upload into. Both flows use this same component. */
  bucket?: 'product-images' | 'lookbook';
  /** Called with the public storage URL after a successful single upload. */
  onUploaded?: (url: string) => void;
  /** Whether to allow multiple file selection. */
  multiple?: boolean;
  /** Called with an array of public storage URLs after successful mass upload. */
  onUploadedMultiple?: (urls: string[]) => void;
}

export default function ImageUploader({ bucket = 'product-images', onUploaded, multiple, onUploadedMultiple }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const uploadedUrls: string[] = [];

    try {
      // Upload sequentially so we don't spam the connection/server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`/api/admin/upload?bucket=${bucket}`, {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || `Upload failed for ${file.name}`);
        
        const url = json.url as string;
        uploadedUrls.push(url);
        if (onUploaded && !multiple) onUploaded(url); // Legacy callback for single upload
      }
      
      if (multiple && onUploadedMultiple) {
        onUploadedMultiple(uploadedUrls);
      }
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
          multiple={multiple}
          disabled={uploading}
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) handleFiles(files);
          }}
        />
      </label>
      {error && <span className="text-red-400 text-sm">{error}</span>}
    </div>
  );
}