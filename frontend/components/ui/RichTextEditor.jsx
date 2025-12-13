"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-sm text-neutral-500">Loading editor...</span>
    </div>
  ),
});

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "code-block",
  "link",
  "color",
  "background",
  "align",
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const quillModules = useMemo(() => modules, []);

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={quillModules}
        formats={formats}
        placeholder={placeholder || "Write your content here..."}
        className="bg-white dark:bg-neutral-900 rounded-lg"
      />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
          border-color: #e5e7eb;
        }
        .dark .rich-text-editor .ql-toolbar {
          background: #262626;
          border-color: #404040;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          min-height: 200px;
          font-size: 14px;
          border-color: #e5e7eb;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #404040;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .dark .rich-text-editor .ql-editor {
          color: #e5e5e5;
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: #737373;
        }
        .dark .rich-text-editor .ql-stroke {
          stroke: #a3a3a3;
        }
        .dark .rich-text-editor .ql-fill {
          fill: #a3a3a3;
        }
        .dark .rich-text-editor .ql-picker-label {
          color: #a3a3a3;
        }
        .dark .rich-text-editor .ql-picker-options {
          background: #262626;
          border-color: #404040;
        }
        .dark .rich-text-editor .ql-picker-item {
          color: #e5e5e5;
        }
        .dark .rich-text-editor .ql-picker-item:hover {
          color: #3b82f6;
        }
        .rich-text-editor .ql-editor h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ql-editor h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ql-editor h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ql-editor p {
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ql-editor ul,
        .rich-text-editor .ql-editor ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 0.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .dark .rich-text-editor .ql-editor blockquote {
          color: #a3a3a3;
        }
        .rich-text-editor .ql-editor pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 0.75rem;
          border-radius: 0.375rem;
          font-family: monospace;
          font-size: 0.875rem;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
