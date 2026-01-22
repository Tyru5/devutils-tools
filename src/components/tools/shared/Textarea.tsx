interface TextareaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  className?: string;
  label?: string;
}

export default function Textarea({
  value,
  onChange,
  placeholder,
  rows = 10,
  readOnly = false,
  className = "",
  label,
}: TextareaProps) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="mb-2 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={`w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-600 dark:focus:border-neutral-600 ${readOnly ? "bg-neutral-50 dark:bg-neutral-900" : ""} ${className}`}
        spellCheck={false}
      />
    </div>
  );
}
