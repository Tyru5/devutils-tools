import { useState, useEffect } from "react";
import CopyButton from "./shared/CopyButton";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// Conversion functions
function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    // Try 3-digit hex
    const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (short) {
      return {
        r: parseInt(short[1] + short[1], 16),
        g: parseInt(short[2] + short[2], 16),
        b: parseInt(short[3] + short[3], 16),
      };
    }
    return null;
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export default function ColorConverter() {
  const [hex, setHex] = useState("#3b82f6");
  const [rgb, setRgb] = useState<RGB>({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 });
  const [error, setError] = useState<string | null>(null);

  // Update all values when hex changes
  const updateFromHex = (value: string) => {
    setHex(value);
    const parsed = hexToRgb(value);
    if (parsed) {
      setRgb(parsed);
      setHsl(rgbToHsl(parsed.r, parsed.g, parsed.b));
      setError(null);
    } else if (value.length > 0) {
      setError("Invalid hex color");
    }
  };

  // Update all values when RGB changes
  const updateFromRgb = (r: number, g: number, b: number) => {
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
    setError(null);
  };

  // Update all values when HSL changes
  const updateFromHsl = (h: number, s: number, l: number) => {
    setHsl({ h, s, l });
    const newRgb = hslToRgb(h, s, l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setError(null);
  };

  const hexValue = hex.startsWith("#") ? hex : `#${hex}`;
  const rgbValue = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslValue = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  // Random color
  const randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    updateFromRgb(r, g, b);
  };

  return (
    <div className="space-y-6">
      {/* Color Preview */}
      <div className="flex items-center gap-4">
        <div
          className="h-24 w-24 rounded-lg border border-gray-200 shadow-inner dark:border-gray-700"
          style={{ backgroundColor: hexValue }}
        />
        <div className="flex-1">
          <input
            type="color"
            value={hexValue}
            onChange={(e) => updateFromHex(e.target.value)}
            className="h-12 w-full cursor-pointer rounded"
          />
          <button
            onClick={randomColor}
            className="mt-2 rounded-md bg-gray-200 px-3 py-1 text-sm transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            🎲 Random
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* HEX Input */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            HEX
          </label>
          <CopyButton text={hexValue} />
        </div>
        <input
          type="text"
          value={hex}
          onChange={(e) => updateFromHex(e.target.value)}
          placeholder="#000000"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
        />
      </div>

      {/* RGB Input */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            RGB
          </label>
          <CopyButton text={rgbValue} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              R
            </label>
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) =>
                updateFromRgb(parseInt(e.target.value) || 0, rgb.g, rgb.b)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
            />
            <input
              type="range"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) =>
                updateFromRgb(parseInt(e.target.value), rgb.g, rgb.b)
              }
              className="mt-1 w-full accent-red-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              G
            </label>
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) =>
                updateFromRgb(rgb.r, parseInt(e.target.value) || 0, rgb.b)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
            />
            <input
              type="range"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) =>
                updateFromRgb(rgb.r, parseInt(e.target.value), rgb.b)
              }
              className="mt-1 w-full accent-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              B
            </label>
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) =>
                updateFromRgb(rgb.r, rgb.g, parseInt(e.target.value) || 0)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
            />
            <input
              type="range"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) =>
                updateFromRgb(rgb.r, rgb.g, parseInt(e.target.value))
              }
              className="mt-1 w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* HSL Input */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            HSL
          </label>
          <CopyButton text={hslValue} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              H (°)
            </label>
            <input
              type="number"
              min={0}
              max={360}
              value={hsl.h}
              onChange={(e) =>
                updateFromHsl(parseInt(e.target.value) || 0, hsl.s, hsl.l)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
            />
            <input
              type="range"
              min={0}
              max={360}
              value={hsl.h}
              onChange={(e) =>
                updateFromHsl(parseInt(e.target.value), hsl.s, hsl.l)
              }
              className="mt-1 w-full"
              style={{
                background: `linear-gradient(to right, 
                  hsl(0, 100%, 50%), 
                  hsl(60, 100%, 50%), 
                  hsl(120, 100%, 50%), 
                  hsl(180, 100%, 50%), 
                  hsl(240, 100%, 50%), 
                  hsl(300, 100%, 50%), 
                  hsl(360, 100%, 50%))`,
              }}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              S (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={hsl.s}
              onChange={(e) =>
                updateFromHsl(hsl.h, parseInt(e.target.value) || 0, hsl.l)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={hsl.s}
              onChange={(e) =>
                updateFromHsl(hsl.h, parseInt(e.target.value), hsl.l)
              }
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              L (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={hsl.l}
              onChange={(e) =>
                updateFromHsl(hsl.h, hsl.s, parseInt(e.target.value) || 0)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={hsl.l}
              onChange={(e) =>
                updateFromHsl(hsl.h, hsl.s, parseInt(e.target.value))
              }
              className="mt-1 w-full"
            />
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
        <div className="flex items-center justify-between rounded bg-gray-100 px-3 py-2 dark:bg-gray-800">
          <code>{hexValue}</code>
        </div>
        <div className="flex items-center justify-between rounded bg-gray-100 px-3 py-2 dark:bg-gray-800">
          <code>{rgbValue}</code>
        </div>
        <div className="flex items-center justify-between rounded bg-gray-100 px-3 py-2 dark:bg-gray-800">
          <code>{hslValue}</code>
        </div>
      </div>
    </div>
  );
}
