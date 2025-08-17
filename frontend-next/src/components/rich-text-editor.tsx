"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, Code, List, ListOrdered, Quote } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertMarkdown = (before: string, after = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const formatHTML = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^\* (.*$)/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
      .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
      .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
      .replace(/\n/g, "<br>")
  }

  return (
    <div className="border border-border rounded-md">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("**", "**")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("*", "*")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("`", "`")}>
          <Code className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("* ")}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("1. ")}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkdown("> ")}>
          <Quote className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {isPreview ? (
        <div
          className="p-4 min-h-[200px] prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: formatHTML(value) }}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] border-0 resize-none focus-visible:ring-0"
        />
      )}
    </div>
  )
}
