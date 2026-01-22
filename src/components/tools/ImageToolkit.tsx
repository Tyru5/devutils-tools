import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import TabGroup from "./shared/TabGroup";
import FileDropzone from "./shared/FileDropzone";
import CopyButton from "./shared/CopyButton";

type Tab = "base64" | "compress" | "resize" | "convert";

const TABS = [
  { id: "base64", label: "To Base64" },
  { id: "compress", label: "Compress" },
  { id: "resize", label: "Resize" },
  { id: "convert", label: "Convert" },
];

interface ImageInfo {
  file: File;
  url: string;
  width: number;
  height: number;
}

export default function ImageToolkit() {
  const [activeTab, setActiveTab] = useState<Tab>("base64");
  const [image, setImage] = useState<ImageInfo | null>(null);
  const [output, setOutput] = useState<string>("");
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [quality, setQuality] = useState(0.8);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">(
    "jpeg",
  );

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setOutput("");
    setOutputFile(null);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage({
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setResizeWidth(img.naturalWidth);
      setResizeHeight(img.naturalHeight);
    };
    img.src = url;
  }, []);

  const toBase64 = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setOutput(reader.result as string);
        setProcessing(false);
      };
      reader.onerror = () => {
        setError("Failed to convert to Base64");
        setProcessing(false);
      };
      reader.readAsDataURL(image.file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setProcessing(false);
    }
  }, [image]);

  const compressImage = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setError(null);

    try {
      const compressed = await imageCompression(image.file, {
        maxSizeMB: 1,
        maxWidthOrHeight: Math.max(image.width, image.height),
        useWebWorker: true,
        initialQuality: quality,
      });
      setOutputFile(compressed);
      setOutput(URL.createObjectURL(compressed));
      setProcessing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed");
      setProcessing(false);
    }
  }, [image, quality]);

  const resizeImage = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = resizeWidth;
      canvas.height = resizeHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, resizeWidth, resizeHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `resized.${outputFormat}`, {
                type: `image/${outputFormat}`,
              });
              setOutputFile(file);
              setOutput(URL.createObjectURL(file));
            }
            setProcessing(false);
          },
          `image/${outputFormat}`,
          quality,
        );
      };
      img.src = image.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resize failed");
      setProcessing(false);
    }
  }, [image, resizeWidth, resizeHeight, outputFormat, quality]);

  const convertFormat = useCallback(async () => {
    if (!image) return;
    setProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `converted.${outputFormat}`, {
                type: `image/${outputFormat}`,
              });
              setOutputFile(file);
              setOutput(URL.createObjectURL(file));
            }
            setProcessing(false);
          },
          `image/${outputFormat}`,
          quality,
        );
      };
      img.src = image.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setProcessing(false);
    }
  }, [image, outputFormat, quality]);

  const handleProcess = () => {
    switch (activeTab) {
      case "base64":
        toBase64();
        break;
      case "compress":
        compressImage();
        break;
      case "resize":
        resizeImage();
        break;
      case "convert":
        convertFormat();
        break;
    }
  };

  const download = () => {
    if (!outputFile) return;
    const url = URL.createObjectURL(outputFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setImage(null);
    setOutput("");
    setOutputFile(null);
    setError(null);
  };

  const handleWidthChange = (w: number) => {
    setResizeWidth(w);
    if (maintainAspect && image) {
      setResizeHeight(Math.round((w / image.width) * image.height));
    }
  };

  const handleHeightChange = (h: number) => {
    setResizeHeight(h);
    if (maintainAspect && image) {
      setResizeWidth(Math.round((h / image.height) * image.width));
    }
  };

  return (
    <div className="space-y-4">
      <TabGroup
        tabs={TABS}
        activeTab={activeTab}
        onChange={(id) => {
          setActiveTab(id as Tab);
          setOutput("");
          setOutputFile(null);
          setError(null);
        }}
      />

      <FileDropzone onFile={handleFile} accept="image/*" />

      {image && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Original
            </p>
            <div className="flex items-center justify-center rounded border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <img
                src={image.url}
                alt="Original"
                className="max-h-48 max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-neutral-500">
              {image.width}×{image.height} •{" "}
              {(image.file.size / 1024).toFixed(1)} KB
            </p>
          </div>

          {output && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Output
              </p>
              <div className="flex items-center justify-center rounded border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                {activeTab === "base64" ? (
                  <textarea
                    value={output}
                    readOnly
                    className="h-48 w-full resize-none bg-transparent font-mono text-xs"
                  />
                ) : (
                  <img
                    src={output}
                    alt="Output"
                    className="max-h-48 max-w-full object-contain"
                  />
                )}
              </div>
              {outputFile && (
                <p className="text-xs text-neutral-500">
                  {(outputFile.size / 1024).toFixed(1)} KB
                  {image && (
                    <span className="ml-2 text-green-600">
                      (
                      {Math.round(
                        (1 - outputFile.size / image.file.size) * 100,
                      )}
                      % smaller)
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "resize" && image && (
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
              Width
            </label>
            <input
              type="number"
              value={resizeWidth}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="input w-24"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
              Height
            </label>
            <input
              type="number"
              value={resizeHeight}
              onChange={(e) =>
                handleHeightChange(parseInt(e.target.value) || 0)
              }
              className="input w-24"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Maintain aspect ratio
          </label>
        </div>
      )}

      {(activeTab === "compress" ||
        activeTab === "resize" ||
        activeTab === "convert") &&
        image && (
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
                Quality
              </label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.1}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="ml-2 text-sm">{Math.round(quality * 100)}%</span>
            </div>
            {(activeTab === "resize" || activeTab === "convert") && (
              <div>
                <label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">
                  Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) =>
                    setOutputFormat(e.target.value as "png" | "jpeg" | "webp")
                  }
                  className="input"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            )}
          </div>
        )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleProcess}
          disabled={!image || processing}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {processing ? "Processing..." : "Process"}
        </button>
        {activeTab === "base64" && output && (
          <CopyButton text={output} disabled={!output} />
        )}
        {activeTab !== "base64" && outputFile && (
          <button onClick={download} className="btn btn-secondary">
            Download
          </button>
        )}
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>
    </div>
  );
}
