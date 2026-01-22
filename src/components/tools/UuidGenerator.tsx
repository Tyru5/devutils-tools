import { useState } from "react";
import CopyButton from "./shared/CopyButton";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

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

  const formattedUuids = uuids.map(formatUuid);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="count" className="text-sm text-neutral-500">
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
            className="input w-20"
          />
        </div>

        <button onClick={generate} className="btn btn-primary">
          Generate
        </button>

        <div className="ml-auto flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-700"
            />
            <span className="text-neutral-600 dark:text-neutral-400">
              Uppercase
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={noDashes}
              onChange={(e) => setNoDashes(e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-700"
            />
            <span className="text-neutral-600 dark:text-neutral-400">
              No dashes
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="max-h-80 space-y-1 overflow-y-auto font-mono text-sm">
          {formattedUuids.map((uuid, index) => (
            <div
              key={index}
              className="group flex items-center justify-between gap-4 rounded px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <code className="select-all text-neutral-900 dark:text-neutral-100">
                {uuid}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(uuid)}
                className="text-xs text-neutral-400 opacity-0 transition-opacity hover:text-neutral-600 group-hover:opacity-100 dark:hover:text-neutral-300"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <CopyButton text={formattedUuids.join("\n")} />
        <span className="text-sm text-neutral-500">
          {uuids.length} UUID{uuids.length !== 1 ? "s" : ""} generated
        </span>
      </div>
    </div>
  );
}
