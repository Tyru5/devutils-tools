import { useState } from "react";
import CopyButton from "./shared/CopyButton";

function generateUUID(): string {
  // crypto.randomUUID() is available in modern browsers
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([generateUUID()]);
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const formatUuid = (uuid: string): string => {
    let formatted = uuid;
    if (noDashes) formatted = formatted.replace(/-/g, "");
    if (uppercase) formatted = formatted.toUpperCase();
    return formatted;
  };

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  };

  const copyAll = () => {
    const text = uuids.map(formatUuid).join("\n");
    navigator.clipboard.writeText(text);
  };

  const formattedUuids = uuids.map(formatUuid);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="count"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Count:
          </label>
          <input
            id="count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) =>
              setCount(
                Math.min(100, Math.max(1, parseInt(e.target.value) || 1)),
              )
            }
            className="w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
          />
        </div>

        <button
          onClick={generate}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Generate
        </button>

        <div className="ml-auto flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Uppercase</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={noDashes}
              onChange={(e) => setNoDashes(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-gray-700 dark:text-gray-300">No dashes</span>
          </label>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900">
        <div className="max-h-80 space-y-2 overflow-y-auto font-mono text-sm">
          {formattedUuids.map((uuid, index) => (
            <div
              key={index}
              className="group flex items-center justify-between gap-4 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <code className="select-all">{uuid}</code>
              <button
                onClick={() => navigator.clipboard.writeText(uuid)}
                className="text-xs text-gray-500 opacity-0 transition-opacity hover:text-gray-700 group-hover:opacity-100 dark:hover:text-gray-300"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center gap-3">
        <CopyButton text={formattedUuids.join("\n")} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {uuids.length} UUID{uuids.length !== 1 ? "s" : ""} generated
        </span>
      </div>
    </div>
  );
}
