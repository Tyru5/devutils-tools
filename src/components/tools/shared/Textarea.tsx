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
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        readOnly={readOnly}
        className={`w-full resize-y rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:placeholder:text-gray-500 ${readOnly ? "cursor-default bg-gray-100 dark:bg-gray-800" : ""} ${className} `}
        spellCheck={false}
      />
    </div>
  );
}
