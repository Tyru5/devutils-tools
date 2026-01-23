import { useCallback, useState } from "react";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
}

export default function FileDropzone({
  onFile,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024,
  label = "Drop file here or click to upload",
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (maxSize && file.size > maxSize) {
        setError(
          `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`,
        );
        return;
      }

      onFile(file);
    },
    [onFile, maxSize],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-neutral-400 bg-neutral-100 dark:border-neutral-500 dark:bg-neutral-800"
            : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500"
        }`}
      >
        <svg
          className="mb-2 h-10 w-10 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {label}
        </span>
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
