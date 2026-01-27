import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import CopyButton from "./shared/CopyButton";

const markedInstance = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      try {
        const highlighted = hljs.highlight(text, { language }).value;
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
      } catch {
        return `<pre><code>${text}</code></pre>`;
      }
    },
  },
});

const DEFAULT_MARKDOWN = `# Markdown Preview

Write markdown here and see live preview.

## Features

- **Bold** and *italic* text
- [Links](https://example.com)
- \`inline code\`

### Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Bullet point
- Another point

### Blockquote

> This is a blockquote.
> It can span multiple lines.

### Table

| Header | Header 2 |
|--------|----------|
| Cell 1 | Cell 2   |
| Cell 3 | Cell 4   |
`;

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  const isScrollingSyncRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const html = useMemo(() => {
    if (!mounted) return "";
    try {
      const rawHtml = markedInstance.parse(markdown) as string;
      return DOMPurify.sanitize(rawHtml);
    } catch {
      return "<p>Error parsing markdown</p>";
    }
  }, [markdown, mounted]);

  const clear = () => setMarkdown("");

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = useCallback(() => {
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.name.endsWith(".md") || file.name.endsWith(".markdown"))
    ) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result;
        if (typeof content === "string") setMarkdown(content);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const syncScroll = useCallback((source: "editor" | "preview") => {
    if (isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    const editor = textareaRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) {
      isScrollingSyncRef.current = false;
      return;
    }

    const sourceEl = source === "editor" ? editor : preview;
    const targetEl = source === "editor" ? preview : editor;

    const scrollRatio =
      sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);
    targetEl.scrollTop =
      scrollRatio * (targetEl.scrollHeight - targetEl.clientHeight);

    requestAnimationFrame(() => {
      isScrollingSyncRef.current = false;
    });
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPos = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.min(Math.max(newPos, 20), 80));
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .hljs{color:#383a42;background:#fafafa}
      .dark .hljs{color:#abb2bf;background:#282c34}
      .hljs-keyword,.hljs-selector-tag,.hljs-built_in{color:#a626a4}
      .dark .hljs-keyword,.dark .hljs-selector-tag,.dark .hljs-built_in{color:#c678dd}
      .hljs-string,.hljs-attr{color:#50a14f}
      .dark .hljs-string,.dark .hljs-attr{color:#98c379}
      .hljs-number,.hljs-literal{color:#986801}
      .dark .hljs-number,.dark .hljs-literal{color:#d19a66}
      .hljs-comment{color:#a0a1a7;font-style:italic}
      .dark .hljs-comment{color:#5c6370}
      .hljs-function,.hljs-title{color:#4078f2}
      .dark .hljs-function,.dark .hljs-title{color:#61afef}
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const editorContent = (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 p-4 dark:border-neutral-800">
        <CopyButton text={markdown} className="btn btn-secondary" />
        <CopyButton text={html} className="btn btn-secondary" />
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="btn btn-secondary"
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      <div
        ref={containerRef}
        className={`flex min-h-0 ${isFullscreen ? "flex-1" : "h-[500px]"} ${isResizing ? "select-none" : ""}`}
      >
        <div
          className={`relative flex min-h-0 flex-col ${isDragging ? "ring-2 ring-inset ring-blue-500" : ""}`}
          style={{ width: `${splitPos}%` }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="shrink-0 border-b border-neutral-200 px-3 py-2 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
            Markdown
          </label>
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onScroll={() => syncScroll("editor")}
            placeholder="Enter markdown..."
            className="min-h-0 w-full flex-1 resize-none border-0 bg-neutral-50 px-3 py-2 font-mono text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:bg-neutral-900 dark:placeholder:text-neutral-600"
            spellCheck={false}
          />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
              <span className="text-lg font-medium text-blue-600 dark:text-blue-400">
                Drop .md file here
              </span>
            </div>
          )}
        </div>

        <div
          className="w-1 shrink-0 cursor-col-resize bg-neutral-200 transition-colors hover:bg-blue-400 dark:bg-neutral-700 dark:hover:bg-blue-500"
          onMouseDown={handleResizeStart}
        />

        <div
          className="flex min-h-0 flex-col"
          style={{ width: `${100 - splitPos}%` }}
        >
          <label className="shrink-0 border-b border-neutral-200 px-3 py-2 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
            Preview
          </label>
          <div
            ref={previewRef}
            onScroll={() => syncScroll("preview")}
            className="prose prose-neutral min-h-0 max-w-none flex-1 overflow-y-auto bg-white p-4 dark:prose-invert prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-neutral-100 dark:bg-neutral-950 dark:prose-code:bg-neutral-800 dark:prose-pre:bg-neutral-800"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <p className="border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        Drag and drop .md files • Drag divider to resize • GFM supported
      </p>
    </>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-900">
        {editorContent}
      </div>
    );
  }

  return (
    <div className="-m-6 flex flex-col overflow-hidden rounded-lg">
      {editorContent}
    </div>
  );
}
