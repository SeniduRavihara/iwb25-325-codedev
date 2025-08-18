"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Code, Italic, List, ListOrdered, Quote } from "lucide-react";
import { useRef, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const formatHTML = (text: string) => {
    let html = text;

    // Handle bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Handle inline code
    html = html.replace(
      /`(.*?)`/g,
      "<code class='bg-gray-200 px-1 py-0.5 rounded text-sm'>$1</code>"
    );

    // Handle headings
    html = html.replace(
      /^### (.*$)/gm,
      "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>"
    );
    html = html.replace(
      /^## (.*$)/gm,
      "<h2 class='text-xl font-semibold mt-4 mb-2'>$1</h2>"
    );
    html = html.replace(
      /^# (.*$)/gm,
      "<h1 class='text-2xl font-bold mt-4 mb-2'>$1</h1>"
    );

    // Handle blockquotes
    html = html.replace(
      /^> (.*$)/gm,
      "<blockquote class='border-l-4 border-gray-300 pl-4 italic text-gray-600'>$1</blockquote>"
    );

    // Handle unordered lists
    const lines = html.split("\n");
    let inUList = false;
    let inOList = false;
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Unordered list items
      if (line.match(/^\* (.+)/)) {
        if (!inUList) {
          processedLines.push(
            '<ul class="list-disc list-inside ml-4 space-y-1">'
          );
          inUList = true;
        }
        processedLines.push(`<li>${line.replace(/^\* /, "")}</li>`);
      }
      // Ordered list items
      else if (line.match(/^\d+\. (.+)/)) {
        if (!inOList) {
          processedLines.push(
            '<ol class="list-decimal list-inside ml-4 space-y-1">'
          );
          inOList = true;
        }
        processedLines.push(`<li>${line.replace(/^\d+\. /, "")}</li>`);
      }
      // Regular lines
      else {
        if (inUList) {
          processedLines.push("</ul>");
          inUList = false;
        }
        if (inOList) {
          processedLines.push("</ol>");
          inOList = false;
        }
        processedLines.push(line);
      }
    }

    // Close any open lists
    if (inUList) processedLines.push("</ul>");
    if (inOList) processedLines.push("</ol>");

    // Join lines and handle line breaks
    html = processedLines.join("\n").replace(/\n/g, "<br>");

    return html;
  };

  return (
    <div className="border-2 border-border rounded-md focus-within:border-primary transition-colors">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("**", "**")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("*", "*")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("`", "`")}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("* ")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("1. ")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown("> ")}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {isPreview ? (
        <div
          className="p-4 min-h-[200px] max-w-none prose-sm space-y-2"
          dangerouslySetInnerHTML={{ __html: formatHTML(value) }}
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] border-0 resize-none focus-visible:ring-0"
        />
      )}
    </div>
  );
}
