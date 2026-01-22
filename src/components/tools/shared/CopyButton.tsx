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
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        disabled
          ? "cursor-not-allowed text-neutral-300 dark:text-neutral-700"
          : copied
            ? "text-neutral-900 dark:text-neutral-100"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
      } ${className}`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
