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
          // Prevent infinite loop on zero-length matches
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

      // Build highlighted text
      let highlighted = "";
      let lastIndex = 0;

      // Need to re-execute for highlighting since we consumed the iterator
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
        highlighted += `<mark class="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">${escapeHtml(testString.slice(start, end))}</mark>`;
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
      {/* Pattern Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Regular Expression
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-gray-400">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className={`flex-1 rounded-md border bg-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
          />
          <span className="font-mono text-gray-400">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value.toLowerCase())}
            className="w-16 rounded-md border border-gray-300 bg-white px-2 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
            placeholder="gi"
          />
        </div>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-2">
        {flagOptions.map(({ flag, label, description }) => (
          <button
            key={flag}
            onClick={() => toggleFlag(flag)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              flags.includes(flag)
                ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:ring-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
            title={description}
          >
            {label} ({flag})
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Test String */}
      <Textarea
        value={testString}
        onChange={setTestString}
        placeholder="Enter text to test against..."
        label="Test String"
        rows={6}
      />

      {/* Highlighted Preview */}
      {testString && pattern && !error && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Matches Highlighted
          </label>
          <div
            className="min-h-[100px] w-full whitespace-pre-wrap break-all rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-900"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>
      )}

      {/* Match Results */}
      {matches.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="mb-3 text-sm font-medium text-green-800 dark:text-green-300">
            {matches.length} match{matches.length !== 1 ? "es" : ""} found
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {matches.map((match, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded bg-white p-2 text-sm dark:bg-gray-800"
              >
                <span className="w-8 text-gray-500 dark:text-gray-400">
                  #{i + 1}
                </span>
                <div className="flex-1">
                  <code className="break-all text-green-700 dark:text-green-400">
                    "{match.value}"
                  </code>
                  <span className="ml-2 text-gray-400">
                    at index {match.index}
                  </span>
                  {match.groups && Object.keys(match.groups).length > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      Groups: {JSON.stringify(match.groups)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No matches */}
      {testString && pattern && !error && matches.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-100 p-4 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          No matches found
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={clear}
          className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear
        </button>
      </div>

      {/* Cheat Sheet */}
      <details className="text-sm">
        <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          Quick Reference
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800 md:grid-cols-4">
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
