import { useState, useEffect } from "react";
import CopyButton from "./shared/CopyButton";

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score <= 6) return { score, label: "Strong", color: "bg-blue-500" };
  return { score, label: "Very Strong", color: "bg-green-500" };
}

function generatePassword(
  length: number,
  options: {
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  },
): string {
  let charset = "";
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.numbers) charset += CHARSETS.numbers;
  if (options.symbols) charset += CHARSETS.symbols;

  if (!charset) charset = CHARSETS.lowercase;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (n) => charset[n % charset.length]).join("");
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");
  const [count, setCount] = useState(1);

  const generate = () => {
    if (count === 1) {
      setPassword(generatePassword(length, options));
    } else {
      const passwords = Array.from({ length: count }, () =>
        generatePassword(length, options),
      );
      setPassword(passwords.join("\n"));
    }
  };

  useEffect(() => {
    generate();
  }, []);

  const strength = count === 1 ? getStrength(password) : null;

  const toggleOption = (key: keyof typeof options) => {
    const newOptions = { ...options, [key]: !options[key] };
    const hasAtLeastOne = Object.values(newOptions).some(Boolean);
    if (hasAtLeastOne) {
      setOptions(newOptions);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Length
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-32"
            />
            <input
              type="number"
              min={4}
              max={128}
              value={length}
              onChange={(e) =>
                setLength(
                  Math.max(4, Math.min(128, parseInt(e.target.value) || 4)),
                )
              }
              className="input w-20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Count
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) =>
              setCount(
                Math.max(1, Math.min(100, parseInt(e.target.value) || 1)),
              )
            }
            className="input w-20"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {(Object.keys(CHARSETS) as Array<keyof typeof CHARSETS>).map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => toggleOption(key)}
              className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
            />
            <span className="capitalize">{key}</span>
            <span className="font-mono text-xs text-neutral-400">
              {key === "symbols" ? "!@#$..." : CHARSETS[key].slice(0, 4)}
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={generate} className="btn btn-primary">
          Generate
        </button>
        <CopyButton text={password} disabled={!password} />
      </div>

      {password && (
        <div className="space-y-2">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <pre className="whitespace-pre-wrap break-all font-mono text-sm text-neutral-700 dark:text-neutral-300">
              {password}
            </pre>
          </div>

          {strength && (
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className={`h-full transition-all ${strength.color}`}
                  style={{ width: `${(strength.score / 7) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {strength.label}
              </span>
            </div>
          )}

          <p className="text-xs text-neutral-500">
            {password.length} characters
            {count > 1 && ` • ${count} passwords`}
          </p>
        </div>
      )}
    </div>
  );
}
