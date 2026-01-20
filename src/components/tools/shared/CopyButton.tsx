import { useState } from "react";

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
  className?: string;
}

export default function CopyButton({
  text,
  disabled = false,
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text || disabled) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      className={`rounded-md px-4 py-2 font-medium transition-colors ${
        disabled
          ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700"
          : copied
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      } ${className} `}
    >
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}
