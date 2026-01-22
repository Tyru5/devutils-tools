import { useState, useMemo } from "react";
import Textarea from "./shared/Textarea";

interface Match {
  value: string;
  index: number;
  groups: Record<string, string> | undefined;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [error, setError] = useState<string | null>(null);

  const flagOptions = [
    { flag: "g", label: "Global", description: "Find all matches" },
    { flag: "i", label: "Case Insensitive", description: "Ignore case" },
    {
      flag: "m",
      label: "Multiline",
      description: "^ and $ match line boundaries",
    },
    { flag: "s", label: "Dotall", description: ". matches newlines" },
    { flag: "u", label: "Unicode", description: "Enable Unicode support" },
  ];

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ""));
    } else {
      setFlags(flags + flag);
    }
  };

  const { regex, matches, highlightedText } = useMemo(() => {
    if (!pattern) {
      return { regex: null, matches: [], highlightedText: testString };
    }

    try {
      const regex = new RegExp(pattern, flags);
      setError(null);

      const matches: Match[] = [];
      let match;

      if (flags.includes("g")) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.groups,
          });
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.groups,
          });
        }
      }

      let highlighted = "";
      let lastIndex = 0;

      const highlightRegex = new RegExp(pattern, flags);
      const allMatches: { start: number; end: number }[] = [];

      if (flags.includes("g")) {
        let m;
        while ((m = highlightRegex.exec(testString)) !== null) {
          allMatches.push({ start: m.index, end: m.index + m[0].length });
          if (m[0].length === 0) highlightRegex.lastIndex++;
        }
      } else {
        const m = highlightRegex.exec(testString);
        if (m) {
          allMatches.push({ start: m.index, end: m.index + m[0].length });
        }
      }

      for (const { start, end } of allMatches) {
        highlighted += escapeHtml(testString.slice(lastIndex, start));
        highlighted += `<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">${escapeHtml(testString.slice(start, end))}</mark>`;
        lastIndex = end;
      }
      highlighted += escapeHtml(testString.slice(lastIndex));

      return { regex, matches, highlightedText: highlighted };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid regex");
      return { regex: null, matches: [], highlightedText: testString };
    }
  }, [pattern, flags, testString]);

  const clear = () => {
    setPattern("");
    setTestString("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-400">
          Regular Expression
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-neutral-400">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className={`input flex-1 font-mono ${
              error ? "border-red-500 dark:border-red-500" : ""
            }`}
          />
          <span className="font-mono text-neutral-400">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value.toLowerCase())}
            className="input w-16 font-mono"
            placeholder="gi"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {flagOptions.map(({ flag, label, description }) => (
          <button
            key={flag}
            onClick={() => toggleFlag(flag)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              flags.includes(flag)
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
            title={description}
          >
            {label} ({flag})
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <Textarea
        value={testString}
        onChange={setTestString}
        placeholder="Enter text to test against..."
        label="Test String"
        rows={6}
      />

      {testString && pattern && !error && (
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-400">
            Matches Highlighted
          </label>
          <div
            className="min-h-[100px] w-full whitespace-pre-wrap break-all rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-sm dark:border-neutral-800 dark:bg-neutral-900"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>
      )}

      {matches.length > 0 && (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            {matches.length} match{matches.length !== 1 ? "es" : ""} found
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {matches.map((match, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded bg-white p-2 text-sm dark:bg-neutral-800"
              >
                <span className="w-8 text-neutral-400">#{i + 1}</span>
                <div className="flex-1">
                  <code className="break-all text-neutral-900 dark:text-neutral-100">
                    "{match.value}"
                  </code>
                  <span className="ml-2 text-neutral-500">
                    at index {match.index}
                  </span>
                  {match.groups && Object.keys(match.groups).length > 0 && (
                    <div className="mt-1 text-xs text-neutral-500">
                      Groups: {JSON.stringify(match.groups)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {testString && pattern && !error && matches.length === 0 && (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          No matches found
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          Quick Reference
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-md bg-neutral-50 p-3 text-xs dark:bg-neutral-900 md:grid-cols-4">
          <div>
            <code>.</code> Any character
          </div>
          <div>
            <code>\d</code> Digit
          </div>
          <div>
            <code>\w</code> Word character
          </div>
          <div>
            <code>\s</code> Whitespace
          </div>
          <div>
            <code>^</code> Start of string
          </div>
          <div>
            <code>$</code> End of string
          </div>
          <div>
            <code>*</code> 0 or more
          </div>
          <div>
            <code>+</code> 1 or more
          </div>
          <div>
            <code>?</code> 0 or 1
          </div>
          <div>
            <code>{"{n}"}</code> Exactly n
          </div>
          <div>
            <code>[abc]</code> Character class
          </div>
          <div>
            <code>(abc)</code> Capture group
          </div>
        </div>
      </details>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}
