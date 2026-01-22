import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import CopyButton from "./shared/CopyButton";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

const ERROR_LEVELS: {
  value: ErrorCorrectionLevel;
  label: string;
  recovery: string;
}[] = [
  { value: "L", label: "Low", recovery: "~7%" },
  { value: "M", label: "Medium", recovery: "~15%" },
  { value: "Q", label: "Quartile", recovery: "~25%" },
  { value: "H", label: "High", recovery: "~30%" },
];

export default function QrGenerator() {
  const [text, setText] = useState("https://devutils.tools");
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const [svgData, setSvgData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQR();
  }, [text, size, errorLevel, fgColor, bgColor]);

  const generateQR = async () => {
    if (!text.trim()) {
      setDataUrl("");
      setSvgData("");
      setError(null);
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, text, {
          width: size,
          errorCorrectionLevel: errorLevel,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          margin: 2,
        });
        setDataUrl(canvas.toDataURL("image/png"));
      }

      const svg = await QRCode.toString(text, {
        type: "svg",
        width: size,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        margin: 2,
      });
      setSvgData(svg);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate QR code");
      setDataUrl("");
      setSvgData("");
    }
  };

  const downloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = dataUrl;
    link.click();
  };

  const downloadSvg = () => {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "qrcode.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Text or URL
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or URL..."
          className="input w-full"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Size
          </label>
          <select
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="input"
          >
            <option value={128}>128px</option>
            <option value={256}>256px</option>
            <option value={512}>512px</option>
            <option value={1024}>1024px</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Error Correction
          </label>
          <select
            value={errorLevel}
            onChange={(e) =>
              setErrorLevel(e.target.value as ErrorCorrectionLevel)
            }
            className="input"
          >
            {ERROR_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label} ({level.recovery})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Foreground
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded border border-neutral-300 dark:border-neutral-600"
            />
            <input
              type="text"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="input w-24 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded border border-neutral-300 dark:border-neutral-600"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="input w-24 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <canvas
          ref={canvasRef}
          className="rounded"
          style={{ display: dataUrl ? "block" : "none" }}
        />
        {!text.trim() && (
          <p className="text-sm text-neutral-500">
            Enter text to generate QR code
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={downloadPng}
          disabled={!dataUrl}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download PNG
        </button>
        <button
          onClick={downloadSvg}
          disabled={!svgData}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download SVG
        </button>
        <CopyButton text={dataUrl} disabled={!dataUrl} label="Copy Data URI" />
      </div>

      {text && (
        <p className="text-xs text-neutral-500">
          {text.length} characters • {size}x{size}px
        </p>
      )}
    </div>
  );
}
