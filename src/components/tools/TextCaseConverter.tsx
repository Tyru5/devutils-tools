import { useState } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type CaseType =
  | "lowercase"
  | "uppercase"
  | "titlecase"
  | "sentencecase"
  | "camelcase"
  | "pascalcase"
  | "snakecase"
  | "kebabcase"
  | "constantcase"
  | "dotcase"
  | "pathcase"
  | "slug";

const CASE_OPTIONS: { value: CaseType; label: string; example: string }[] = [
  { value: "lowercase", label: "lowercase", example: "hello world" },
  { value: "uppercase", label: "UPPERCASE", example: "HELLO WORLD" },
  { value: "titlecase", label: "Title Case", example: "Hello World" },
  { value: "sentencecase", label: "Sentence case", example: "Hello world" },
  { value: "camelcase", label: "camelCase", example: "helloWorld" },
  { value: "pascalcase", label: "PascalCase", example: "HelloWorld" },
  { value: "snakecase", label: "snake_case", example: "hello_world" },
  { value: "kebabcase", label: "kebab-case", example: "hello-world" },
  { value: "constantcase", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
  { value: "dotcase", label: "dot.case", example: "hello.world" },
  { value: "pathcase", label: "path/case", example: "hello/world" },
  { value: "slug", label: "url-slug", example: "hello-world" },
];

function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_./\\]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function convertCase(text: string, caseType: CaseType): string {
  if (!text.trim()) return "";

  const words = toWords(text);

  switch (caseType) {
    case "lowercase":
      return text.toLowerCase();
    case "uppercase":
      return text.toUpperCase();
    case "titlecase":
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    case "sentencecase":
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case "camelcase":
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
        )
        .join("");
    case "pascalcase":
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    case "snakecase":
      return words.map((w) => w.toLowerCase()).join("_");
    case "kebabcase":
      return words.map((w) => w.toLowerCase()).join("-");
    case "constantcase":
      return words.map((w) => w.toUpperCase()).join("_");
    case "dotcase":
      return words.map((w) => w.toLowerCase()).join(".");
    case "pathcase":
      return words.map((w) => w.toLowerCase()).join("/");
    case "slug":
      return words
        .map((w) => w.toLowerCase())
        .join("-")
        .replace(/[^a-z0-9-]/g, "");
    default:
      return text;
  }
}

export default function TextCaseConverter() {
  const [input, setInput] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseType>("camelcase");

  const output = convertCase(input, selectedCase);

  const clear = () => {
    setInput("");
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={input}
        onChange={setInput}
        placeholder="Enter text to convert..."
        label="Input"
        rows={4}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Convert to
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {CASE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedCase(option.value)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                selectedCase === option.value
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <span className="mt-0.5 block text-xs opacity-60">
                {option.example}
              </span>
            </button>
          ))}
        </div>
      </div>

      {output && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Output
          </label>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="break-all font-mono text-sm text-neutral-700 dark:text-neutral-300">
              {output}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <CopyButton text={output} disabled={!output} />
        <button onClick={clear} className="btn btn-ghost" disabled={!input}>
          Clear
        </button>
      </div>
    </div>
  );
}
