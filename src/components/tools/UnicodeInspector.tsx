import { useState } from "react";
import CopyButton from "./shared/CopyButton";

interface CharInfo {
  char: string;
  codePoint: number;
  hex: string;
  name: string;
  utf8: string;
  utf16: string;
  htmlEntity: string;
  category: string;
}

function getCharacterName(codePoint: number): string {
  const ranges: [number, number, string][] = [
    [0x0000, 0x001f, "Control character"],
    [0x0020, 0x007f, "Basic Latin"],
    [0x0080, 0x00ff, "Latin-1 Supplement"],
    [0x0100, 0x017f, "Latin Extended-A"],
    [0x0180, 0x024f, "Latin Extended-B"],
    [0x0370, 0x03ff, "Greek and Coptic"],
    [0x0400, 0x04ff, "Cyrillic"],
    [0x0590, 0x05ff, "Hebrew"],
    [0x0600, 0x06ff, "Arabic"],
    [0x3040, 0x309f, "Hiragana"],
    [0x30a0, 0x30ff, "Katakana"],
    [0x4e00, 0x9fff, "CJK Unified Ideographs"],
    [0x1f300, 0x1f9ff, "Emoji"],
  ];

  for (const [start, end, name] of ranges) {
    if (codePoint >= start && codePoint <= end) return name;
  }
  return "Unknown";
}

function getUtf8Bytes(char: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(char);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
}

function getUtf16Units(char: string): string {
  const units: string[] = [];
  for (let i = 0; i < char.length; i++) {
    units.push(char.charCodeAt(i).toString(16).padStart(4, "0").toUpperCase());
  }
  return units.join(" ");
}

function analyzeCharacter(char: string): CharInfo {
  const codePoint = char.codePointAt(0) || 0;
  return {
    char,
    codePoint,
    hex: codePoint.toString(16).toUpperCase().padStart(4, "0"),
    name: getCharacterName(codePoint),
    utf8: getUtf8Bytes(char),
    utf16: getUtf16Units(char),
    htmlEntity: `&#${codePoint};`,
    category: getCharacterName(codePoint),
  };
}

function splitIntoCharacters(str: string): string[] {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  return [...segmenter.segment(str)].map((s) => s.segment);
}

export default function UnicodeInspector() {
  const [input, setInput] = useState("");
  const [characters, setCharacters] = useState<CharInfo[]>([]);

  const inspect = (value: string) => {
    setInput(value);
    if (!value) {
      setCharacters([]);
      return;
    }

    const chars = splitIntoCharacters(value);
    setCharacters(chars.map(analyzeCharacter));
  };

  const clear = () => {
    setInput("");
    setCharacters([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Enter text to inspect
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => inspect(e.target.value)}
          placeholder="Type or paste text here... 🎉"
          className="input w-full text-lg"
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={clear} className="btn btn-ghost" disabled={!input}>
          Clear
        </button>
        {characters.length > 0 && (
          <span className="text-sm text-neutral-500">
            {characters.length} character{characters.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {characters.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  Char
                </th>
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  Code Point
                </th>
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  UTF-8
                </th>
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  UTF-16
                </th>
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  HTML
                </th>
                <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                  Category
                </th>
              </tr>
            </thead>
            <tbody>
              {characters.map((char, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-100 dark:border-neutral-800"
                >
                  <td className="py-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-neutral-100 text-xl dark:bg-neutral-800">
                      {char.char}
                    </span>
                  </td>
                  <td className="py-2 font-mono">
                    <div className="text-neutral-700 dark:text-neutral-300">
                      U+{char.hex}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {char.codePoint}
                    </div>
                  </td>
                  <td className="py-2 font-mono text-neutral-600 dark:text-neutral-400">
                    {char.utf8}
                  </td>
                  <td className="py-2 font-mono text-neutral-600 dark:text-neutral-400">
                    {char.utf16}
                  </td>
                  <td className="py-2 font-mono text-neutral-600 dark:text-neutral-400">
                    {char.htmlEntity}
                  </td>
                  <td className="py-2 text-neutral-500">{char.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {characters.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-medium text-neutral-500">
              Total Bytes (UTF-8)
            </p>
            <p className="mt-1 font-mono text-lg text-neutral-900 dark:text-neutral-100">
              {new TextEncoder().encode(input).length} bytes
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm font-medium text-neutral-500">
              String Length
            </p>
            <p className="mt-1 font-mono text-lg text-neutral-900 dark:text-neutral-100">
              {input.length} code units ({characters.length} graphemes)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
