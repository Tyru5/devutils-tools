import { useState, useMemo } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type InputDelimiter = "auto" | "comma" | "newline" | "space" | "tab" | "custom";
type OutputDelimiter = "comma" | "newline" | "space" | "tab" | "pipe";
type SortMode = "none" | "alpha-asc" | "alpha-desc" | "num-asc" | "num-desc";

const INPUT_DELIMITERS: { value: InputDelimiter; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: "comma", label: "Comma" },
  { value: "newline", label: "New line" },
  { value: "space", label: "Space" },
  { value: "tab", label: "Tab" },
  { value: "custom", label: "Custom" },
];

const OUTPUT_DELIMITERS: { value: OutputDelimiter; label: string; char: string }[] = [
  { value: "newline", label: "New line", char: "\n" },
  { value: "comma", label: "Comma", char: ", " },
  { value: "space", label: "Space", char: " " },
  { value: "tab", label: "Tab", char: "\t" },
  { value: "pipe", label: "Pipe (|)", char: " | " },
];

const SORT_MODES: { value: SortMode; label: string }[] = [
  { value: "none", label: "No sorting" },
  { value: "alpha-asc", label: "A → Z" },
  { value: "alpha-desc", label: "Z → A" },
  { value: "num-asc", label: "0 → 9" },
  { value: "num-desc", label: "9 → 0" },
];

function detectDelimiter(input: string): string {
  // Priority: newline > tab > comma > pipe > space
  if (input.includes("\n")) return "\n";
  if (input.includes("\t")) return "\t";
  if (input.includes(",")) return ",";
  if (input.includes("|")) return "|";
  if (input.includes(" ")) return " ";
  return "\n"; // default
}

function getInputDelimiterChar(delimiter: InputDelimiter, customDelim: string, input: string): string {
  switch (delimiter) {
    case "auto":
      return detectDelimiter(input);
    case "comma":
      return ",";
    case "newline":
      return "\n";
    case "space":
      return " ";
    case "tab":
      return "\t";
    case "custom":
      return customDelim || ",";
  }
}

function getOutputDelimiterChar(delimiter: OutputDelimiter): string {
  return OUTPUT_DELIMITERS.find((d) => d.value === delimiter)?.char || "\n";
}

export default function ListSorter() {
  const [input, setInput] = useState("");
  const [inputDelimiter, setInputDelimiter] = useState<InputDelimiter>("auto");
  const [customInputDelim, setCustomInputDelim] = useState("");
  const [outputDelimiter, setOutputDelimiter] = useState<OutputDelimiter>("newline");
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);

  const { output, itemCount, detectedDelimiter } = useMemo(() => {
    if (!input.trim()) {
      return { output: "", itemCount: 0, detectedDelimiter: "" };
    }

    const inputDelimChar = getInputDelimiterChar(inputDelimiter, customInputDelim, input);
    const outputDelimChar = getOutputDelimiterChar(outputDelimiter);

    // Split by delimiter
    let items = input.split(inputDelimChar);

    // Process items
    if (trimWhitespace) {
      items = items.map((item) => item.trim());
    }

    if (removeEmpty) {
      items = items.filter((item) => item.length > 0);
    }

    if (removeDuplicates) {
      items = [...new Set(items)];
    }

    // Sort
    if (sortMode !== "none") {
      items.sort((a, b) => {
        if (sortMode === "alpha-asc") {
          return a.localeCompare(b, undefined, { sensitivity: "base" });
        }
        if (sortMode === "alpha-desc") {
          return b.localeCompare(a, undefined, { sensitivity: "base" });
        }
        if (sortMode === "num-asc") {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return numA - numB;
        }
        if (sortMode === "num-desc") {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return numB - numA;
        }
        return 0;
      });
    }

    // Detect which delimiter was used (for display)
    let detected = "";
    if (inputDelimiter === "auto") {
      const detectedChar = detectDelimiter(input);
      if (detectedChar === "\n") detected = "newline";
      else if (detectedChar === "\t") detected = "tab";
      else if (detectedChar === ",") detected = "comma";
      else if (detectedChar === "|") detected = "pipe";
      else if (detectedChar === " ") detected = "space";
    }

    return {
      output: items.join(outputDelimChar),
      itemCount: items.length,
      detectedDelimiter: detected,
    };
  }, [input, inputDelimiter, customInputDelim, outputDelimiter, sortMode, trimWhitespace, removeDuplicates, removeEmpty]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Textarea
        label="Input"
        value={input}
        onChange={setInput}
        placeholder="Paste your list here..."
        rows={6}
      />

      {/* Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Delimiter */}
        <div className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Input Delimiter
          </label>
          <div className="flex flex-wrap gap-2">
            {INPUT_DELIMITERS.map((delim) => (
              <label
                key={delim.value}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  inputDelimiter === delim.value
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <input
                  type="radio"
                  name="inputDelimiter"
                  value={delim.value}
                  checked={inputDelimiter === delim.value}
                  onChange={(e) => setInputDelimiter(e.target.value as InputDelimiter)}
                  className="sr-only"
                />
                {delim.label}
              </label>
            ))}
          </div>
          {inputDelimiter === "custom" && (
            <input
              type="text"
              value={customInputDelim}
              onChange={(e) => setCustomInputDelim(e.target.value)}
              placeholder="Enter delimiter..."
              className="input w-full"
            />
          )}
          {inputDelimiter === "auto" && detectedDelimiter && (
            <p className="text-xs text-neutral-500">
              Detected: <span className="font-medium">{detectedDelimiter}</span>
            </p>
          )}
        </div>

        {/* Output Delimiter */}
        <div className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Output Delimiter
          </label>
          <div className="flex flex-wrap gap-2">
            {OUTPUT_DELIMITERS.map((delim) => (
              <label
                key={delim.value}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  outputDelimiter === delim.value
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <input
                  type="radio"
                  name="outputDelimiter"
                  value={delim.value}
                  checked={outputDelimiter === delim.value}
                  onChange={(e) => setOutputDelimiter(e.target.value as OutputDelimiter)}
                  className="sr-only"
                />
                {delim.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sort & Processing Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sort Mode */}
        <div className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Sort Order
          </label>
          <div className="flex flex-wrap gap-2">
            {SORT_MODES.map((mode) => (
              <label
                key={mode.value}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  sortMode === mode.value
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <input
                  type="radio"
                  name="sortMode"
                  value={mode.value}
                  checked={sortMode === mode.value}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="sr-only"
                />
                {mode.label}
              </label>
            ))}
          </div>
        </div>

        {/* Processing Options */}
        <div className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Options
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={trimWhitespace}
                onChange={(e) => setTrimWhitespace(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              <span className="text-neutral-600 dark:text-neutral-400">Trim whitespace</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              <span className="text-neutral-600 dark:text-neutral-400">Remove empty</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              <span className="text-neutral-600 dark:text-neutral-400">Remove duplicates</span>
            </label>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <Textarea
        label="Output"
        value={output}
        readOnly
        placeholder="Formatted list will appear here..."
        rows={6}
      />

      {/* Footer */}
      <div className="flex items-center gap-3">
        <CopyButton text={output} disabled={!output} />
        {itemCount > 0 && (
          <span className="text-sm text-neutral-500">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
