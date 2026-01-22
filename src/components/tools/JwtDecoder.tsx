import { useState, useEffect } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

interface JwtParts {
  header: Record<string, any> | null;
  payload: Record<string, any> | null;
  signature: string;
  isValid: boolean;
  error?: string;
}

function decodeJwt(token: string): JwtParts {
  const parts = token.trim().split(".");

  if (parts.length !== 3) {
    return {
      header: null,
      payload: null,
      signature: "",
      isValid: false,
      error: "Invalid JWT format. Expected 3 parts separated by dots.",
    };
  }

  try {
    const decodeBase64Url = (str: string): string => {
      const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      const padding = "=".repeat((4 - (base64.length % 4)) % 4);
      return atob(base64 + padding);
    };

    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const signature = parts[2];

    return {
      header,
      payload,
      signature,
      isValid: true,
    };
  } catch (e) {
    return {
      header: null,
      payload: null,
      signature: "",
      isValid: false,
      error: e instanceof Error ? e.message : "Failed to decode JWT",
    };
  }
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000);
  return date.toISOString();
}

function isExpired(exp: number): boolean {
  return Date.now() > exp * 1000;
}

function getTimeUntilExpiry(exp: number): string {
  const now = Date.now();
  const expMs = exp * 1000;
  const diff = expMs - now;

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `Expired ${hours}h ${minutes}m ago`;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `Expires in ${hours}h ${minutes}m`;
}

export default function JwtDecoder() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<JwtParts | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setDecoded(null);
      return;
    }
    setDecoded(decodeJwt(input));
  }, [input]);

  const clear = () => {
    setInput("");
    setDecoded(null);
  };

  const commonClaims: Record<string, string> = {
    iss: "Issuer",
    sub: "Subject",
    aud: "Audience",
    exp: "Expiration Time",
    nbf: "Not Before",
    iat: "Issued At",
    jti: "JWT ID",
  };

  const renderValue = (key: string, value: any): React.ReactNode => {
    if (["exp", "nbf", "iat"].includes(key) && typeof value === "number") {
      const isExp = key === "exp";
      const expired = isExp && isExpired(value);

      return (
        <div className="flex flex-col gap-1">
          <code>{value}</code>
          <span className="text-xs text-neutral-500">
            {formatTimestamp(value)}
            {isExp && (
              <span
                className={
                  expired
                    ? "ml-2 text-red-500"
                    : "ml-2 text-green-600 dark:text-green-400"
                }
              >
                ({getTimeUntilExpiry(value)})
              </span>
            )}
          </span>
        </div>
      );
    }

    if (typeof value === "object") {
      return <code className="break-all">{JSON.stringify(value)}</code>;
    }

    return <code className="break-all">{String(value)}</code>;
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={input}
        onChange={setInput}
        placeholder="Paste your JWT token here (eyJhbGciOiJIUzI1NiIs...)"
        label="JWT Token"
        rows={4}
        className={
          decoded && !decoded.isValid
            ? "border-red-500 dark:border-red-500"
            : ""
        }
      />

      {decoded && !decoded.isValid && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {decoded.error}
        </div>
      )}

      {decoded?.isValid && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Header
              </span>
              <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(decoded.header || {}).map(([key, value]) => (
                    <tr
                      key={key}
                      className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                    >
                      <td className="whitespace-nowrap py-2 pr-4 font-medium text-neutral-600 dark:text-neutral-400">
                        {key}
                        {key === "alg" && (
                          <span className="ml-1 text-xs text-neutral-400">
                            (Algorithm)
                          </span>
                        )}
                        {key === "typ" && (
                          <span className="ml-1 text-xs text-neutral-400">
                            (Type)
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-neutral-900 dark:text-neutral-100">
                        <code>{String(value)}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Payload
              </span>
              <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(decoded.payload || {}).map(([key, value]) => (
                    <tr
                      key={key}
                      className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                    >
                      <td className="whitespace-nowrap py-2 pr-4 align-top font-medium text-neutral-600 dark:text-neutral-400">
                        {key}
                        {commonClaims[key] && (
                          <span className="ml-1 text-xs text-neutral-400">
                            ({commonClaims[key]})
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-neutral-900 dark:text-neutral-100">
                        {renderValue(key, value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              <span className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                Signature
              </span>
              <CopyButton text={decoded.signature} />
            </div>
            <div className="p-4">
              <code className="break-all text-sm text-neutral-700 dark:text-neutral-300">
                {decoded.signature}
              </code>
              <p className="mt-2 text-xs text-neutral-500">
                This tool decodes but does not verify the signature. Never trust
                a JWT without verifying its signature server-side.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>
    </div>
  );
}
