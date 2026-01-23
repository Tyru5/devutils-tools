import { useState } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Format = "seconds" | "milliseconds" | "auto";

interface ConvertedTimestamp {
  original: string;
  timestamp: number;
  date: string;
  iso: string;
  relative: string;
  error?: string;
}

const YEAR_3000_IN_SECONDS = 32503680000;

function detectFormat(value: string): "seconds" | "milliseconds" {
  const num = parseInt(value.trim());
  return num > YEAR_3000_IN_SECONDS ? "milliseconds" : "seconds";
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.abs(diffMs / 1000);
  const future = diffMs < 0;
  const prefix = future ? "in " : "";
  const suffix = future ? "" : " ago";

  if (diffSec < 60) return `${prefix}${Math.round(diffSec)}s${suffix}`;
  if (diffSec < 3600) return `${prefix}${Math.round(diffSec / 60)}m${suffix}`;
  if (diffSec < 86400)
    return `${prefix}${Math.round(diffSec / 3600)}h${suffix}`;
  if (diffSec < 2592000)
    return `${prefix}${Math.round(diffSec / 86400)}d${suffix}`;
  if (diffSec < 31536000)
    return `${prefix}${Math.round(diffSec / 2592000)}mo${suffix}`;
  return `${prefix}${Math.round(diffSec / 31536000)}y${suffix}`;
}

function convertTimestamp(value: string, format: Format): ConvertedTimestamp {
  const trimmed = value.trim();
  const result: ConvertedTimestamp = {
    original: trimmed,
    timestamp: 0,
    date: "",
    iso: "",
    relative: "",
  };

  if (!trimmed || !/^-?\d+$/.test(trimmed)) {
    return { ...result, error: "Invalid number" };
  }

  const num = parseInt(trimmed);
  const actualFormat = format === "auto" ? detectFormat(trimmed) : format;
  const ms = actualFormat === "milliseconds" ? num : num * 1000;

  try {
    const date = new Date(ms);
    if (isNaN(date.getTime())) {
      return { ...result, error: "Invalid date" };
    }

    return {
      original: trimmed,
      timestamp: num,
      date: date.toLocaleString(),
      iso: date.toISOString(),
      relative: getRelativeTime(date),
    };
  } catch {
    return { ...result, error: "Conversion failed" };
  }
}

export default function EpochBatchConverter() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<Format>("auto");
  const [results, setResults] = useState<ConvertedTimestamp[]>([]);

  const convert = () => {
    const lines = input
      .split(/[\n,;]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    setResults(lines.map((line) => convertTimestamp(line, format)));
  };

  const clear = () => {
    setInput("");
    setResults([]);
  };

  const copyAll = () => {
    const text = results
      .filter((r) => !r.error)
      .map((r) => `${r.original}\t${r.date}\t${r.iso}`)
      .join("\n");
    return text;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <Textarea
            value={input}
            onChange={setInput}
            placeholder="Enter timestamps (one per line, or comma/semicolon separated)&#10;&#10;Examples:&#10;1705593600&#10;1705593600000&#10;1705593600, 1705680000"
            label="Timestamps"
            rows={6}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            className="input"
          >
            <option value="auto">Auto-detect</option>
            <option value="seconds">Seconds</option>
            <option value="milliseconds">Milliseconds</option>
          </select>
        </div>

        <div className="flex items-end gap-3">
          <button onClick={convert} className="btn btn-primary">
            Convert
          </button>
          <CopyButton
            text={copyAll()}
            disabled={results.length === 0}
            label="Copy All"
          />
          <button onClick={clear} className="btn btn-ghost">
            Clear
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  Timestamp
                </th>
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  Local Date
                </th>
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  ISO 8601
                </th>
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  Relative
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-100 dark:border-neutral-800"
                >
                  <td className="py-2 font-mono text-neutral-700 dark:text-neutral-300">
                    {result.original}
                  </td>
                  {result.error ? (
                    <td
                      colSpan={3}
                      className="py-2 text-red-500 dark:text-red-400"
                    >
                      {result.error}
                    </td>
                  ) : (
                    <>
                      <td className="py-2 text-neutral-700 dark:text-neutral-300">
                        {result.date}
                      </td>
                      <td className="py-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                        {result.iso}
                      </td>
                      <td className="py-2 text-neutral-500">
                        {result.relative}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length > 0 && (
        <p className="text-xs text-neutral-500">
          {results.filter((r) => !r.error).length} of {results.length} converted
          successfully
        </p>
      )}
    </div>
  );
}
