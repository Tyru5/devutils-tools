import { useState, useEffect } from "react";
import CopyButton from "./shared/CopyButton";

type Base = "binary" | "octal" | "decimal" | "hex";

const BASE_CONFIG: Record<
  Base,
  { radix: number; label: string; prefix: string; placeholder: string }
> = {
  binary: { radix: 2, label: "Binary", prefix: "0b", placeholder: "1010" },
  octal: { radix: 8, label: "Octal", prefix: "0o", placeholder: "12" },
  decimal: { radix: 10, label: "Decimal", prefix: "", placeholder: "10" },
  hex: { radix: 16, label: "Hexadecimal", prefix: "0x", placeholder: "A" },
};

const BASES: Base[] = ["binary", "octal", "decimal", "hex"];

export default function NumberBaseConverter() {
  const [values, setValues] = useState<Record<Base, string>>({
    binary: "",
    octal: "",
    decimal: "",
    hex: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [lastEdited, setLastEdited] = useState<Base>("decimal");

  const convertFrom = (base: Base, value: string) => {
    const cleanValue = value
      .trim()
      .toLowerCase()
      .replace(/^0b/, "")
      .replace(/^0o/, "")
      .replace(/^0x/, "");

    if (!cleanValue) {
      setValues({ binary: "", octal: "", decimal: "", hex: "" });
      setError(null);
      return;
    }

    const { radix } = BASE_CONFIG[base];

    const validChars =
      base === "hex"
        ? /^[0-9a-f]+$/i
        : base === "decimal"
          ? /^[0-9]+$/
          : base === "octal"
            ? /^[0-7]+$/
            : /^[01]+$/;

    if (!validChars.test(cleanValue)) {
      setError(`Invalid ${BASE_CONFIG[base].label.toLowerCase()} number`);
      setValues((prev) => ({ ...prev, [base]: value }));
      return;
    }

    try {
      const decimal = BigInt(
        `0${base === "hex" ? "x" : base === "octal" ? "o" : base === "binary" ? "b" : ""}${cleanValue}`,
      );

      setValues({
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        decimal: decimal.toString(10),
        hex: decimal.toString(16).toUpperCase(),
      });
      setError(null);
    } catch {
      setError("Number too large or invalid");
    }
  };

  const handleChange = (base: Base, value: string) => {
    setLastEdited(base);
    setValues((prev) => ({ ...prev, [base]: value }));
    convertFrom(base, value);
  };

  const clear = () => {
    setValues({ binary: "", octal: "", decimal: "", hex: "" });
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {BASES.map((base) => {
          const config = BASE_CONFIG[base];
          return (
            <div key={base}>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {config.label}
                {config.prefix && (
                  <span className="ml-1 text-neutral-400">
                    ({config.prefix})
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={values[base]}
                  onChange={(e) => handleChange(base, e.target.value)}
                  placeholder={config.placeholder}
                  className={`input flex-1 font-mono ${
                    error && lastEdited === base
                      ? "border-red-500 dark:border-red-500"
                      : ""
                  }`}
                />
                <CopyButton text={values[base]} disabled={!values[base]} />
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>

      {values.decimal && !error && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
            <span className="text-neutral-400">0b</span>
            {values.binary} = <span className="text-neutral-400">0o</span>
            {values.octal} = {values.decimal} ={" "}
            <span className="text-neutral-400">0x</span>
            {values.hex}
          </p>
        </div>
      )}
    </div>
  );
}
