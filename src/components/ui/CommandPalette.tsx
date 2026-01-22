import { useState, useEffect, useRef, useMemo } from "react";
import { tools, type Tool } from "../../lib/tools";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredTools = useMemo(() => {
    if (!query.trim()) return tools;

    const q = query.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setQuery("");
      setSelectedIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
          inputRef.current?.focus();
        });
      });
    } else {
      setAnimating(false);
      const timeout = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const selectedEl = listRef.current?.children[selectedIndex] as HTMLElement;
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const navigateToTool = (tool: Tool) => {
    window.location.href = `/${tool.slug}`;
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredTools.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          navigateToTool(filteredTools[selectedIndex]);
        }
        break;
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${
          animating ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl transition-all duration-150 dark:border-neutral-700 dark:bg-neutral-900 ${
          animating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-neutral-200 px-4 dark:border-neutral-700">
          <svg
            className="h-4 w-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools..."
            className="w-full bg-transparent px-3 py-4 text-sm outline-none placeholder:text-neutral-400 dark:text-neutral-100"
          />
          <kbd className="hidden rounded border border-neutral-200 px-1.5 py-0.5 text-xs text-neutral-400 dark:border-neutral-600 sm:inline-block">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filteredTools.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">
              No tools found
            </div>
          ) : (
            filteredTools.map((tool, index) => (
              <button
                key={tool.slug}
                onClick={() => navigateToTool(tool)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-sm dark:border-neutral-700 dark:bg-neutral-800">
                  {tool.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {tool.name}
                  </div>
                  <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {tool.shortDescription}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-xs text-neutral-400 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-neutral-200 px-1 py-0.5 dark:border-neutral-600">
                ↑
              </kbd>
              <kbd className="rounded border border-neutral-200 px-1 py-0.5 dark:border-neutral-600">
                ↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-neutral-200 px-1 py-0.5 dark:border-neutral-600">
                ↵
              </kbd>
              select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
