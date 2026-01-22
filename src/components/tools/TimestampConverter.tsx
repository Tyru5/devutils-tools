import { useState, useEffect } from "react";
import CopyButton from "./shared/CopyButton";

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("");
  const [dateString, setDateString] = useState("");
  const [isMilliseconds, setIsMilliseconds] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const parseTimestamp = (ts: string, ms: boolean): Date | null => {
    const num = parseInt(ts, 10);
    if (isNaN(num)) return null;

    const isMs = ms || ts.length >= 13;
    const timestamp = isMs ? num : num * 1000;

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;

    return date;
  };

  const handleTimestampChange = (value: string) => {
    setTimestamp(value);
    setError(null);

    if (!value.trim()) {
      setDateString("");
      return;
    }

    const date = parseTimestamp(value, isMilliseconds);
    if (date) {
      setDateString(formatDate(date));
    } else {
      setError("Invalid timestamp");
      setDateString("");
    }
  };

  const handleDateChange = (value: string) => {
    setDateString(value);
    setError(null);

    if (!value.trim()) {
      setTimestamp("");
      return;
    }

    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const ts = isMilliseconds
        ? date.getTime()
        : Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
    } else {
      setError("Invalid date format");
      setTimestamp("");
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  const setNow = () => {
    const now = new Date();
    const ts = isMilliseconds
      ? now.getTime()
      : Math.floor(now.getTime() / 1000);
    setTimestamp(ts.toString());
    setDateString(formatDate(now));
    setError(null);
  };

  const clear = () => {
    setTimestamp("");
    setDateString("");
    setError(null);
  };

  const currentTimestamp = isMilliseconds
    ? currentTime
    : Math.floor(currentTime / 1000);
  const parsedDate = timestamp
    ? parseTimestamp(timestamp, isMilliseconds)
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-1 text-xs font-medium uppercase tracking-widest text-neutral-400">
          Current Unix Timestamp
        </div>
        <div className="flex items-center gap-4">
          <code className="font-mono text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {currentTimestamp}
          </code>
          <span className="text-sm text-neutral-500">
            ({new Date(currentTime).toISOString()})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isMilliseconds}
            onChange={(e) => {
              setIsMilliseconds(e.target.checked);
              if (timestamp) {
                handleTimestampChange(timestamp);
              }
            }}
            className="rounded border-neutral-300 dark:border-neutral-700"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Use milliseconds
          </span>
        </label>
        <button onClick={setNow} className="btn btn-secondary">
          Use current time
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-400">
            Unix Timestamp {isMilliseconds ? "(ms)" : "(seconds)"}
          </label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => handleTimestampChange(e.target.value)}
            placeholder={isMilliseconds ? "1705600000000" : "1705600000"}
            className="input font-mono"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-400">
            Date/Time (UTC)
          </label>
          <input
            type="text"
            value={dateString}
            onChange={(e) => handleDateChange(e.target.value)}
            placeholder="2024-01-18 12:00:00"
            className="input font-mono"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {parsedDate && (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            Parsed Date
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">ISO 8601:</span>
              <code className="font-mono text-neutral-900 dark:text-neutral-100">
                {parsedDate.toISOString()}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">UTC:</span>
              <code className="font-mono text-neutral-900 dark:text-neutral-100">
                {parsedDate.toUTCString()}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Local:</span>
              <code className="font-mono text-neutral-900 dark:text-neutral-100">
                {parsedDate.toLocaleString()}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Relative:</span>
              <code className="font-mono text-neutral-900 dark:text-neutral-100">
                {getRelativeTime(parsedDate)}
              </code>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <CopyButton text={timestamp} disabled={!timestamp} />
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const isFuture = diffMs < 0;
  const prefix = isFuture ? "in " : "";
  const suffix = isFuture ? "" : " ago";

  if (diffSec < 60) return `${prefix}${diffSec} seconds${suffix}`;
  if (diffMin < 60) return `${prefix}${diffMin} minutes${suffix}`;
  if (diffHour < 24) return `${prefix}${diffHour} hours${suffix}`;
  if (diffDay < 7) return `${prefix}${diffDay} days${suffix}`;
  if (diffWeek < 4) return `${prefix}${diffWeek} weeks${suffix}`;
  if (diffMonth < 12) return `${prefix}${diffMonth} months${suffix}`;
  return `${prefix}${diffYear} years${suffix}`;
}
