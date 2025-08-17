"use client"

import { useState, useEffect } from "react"

interface AutoTypingProps {
  phrases: string[]
  className?: string
}

export function AutoTyping({ phrases, className = "" }: AutoTypingProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (currentText.length < currentPhrase.length) {
            setCurrentText(currentPhrase.slice(0, currentText.length + 1))
          } else {
            // Pause before deleting
            setTimeout(() => setIsDeleting(true), 2000)
          }
        } else {
          // Deleting
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
          }
        }
      },
      isDeleting ? 50 : 100,
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentPhraseIndex, phrases])

  return <span className={`${className} border-r-2 border-primary animate-pulse`}>{currentText}</span>
}
