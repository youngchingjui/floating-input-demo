"use client"

import { useEffect, useMemo, useRef, useState } from "react"

interface TranscriptionMockProps {
  // Start/stop the animated transcription
  active: boolean
  // Pause/resume animation without resetting words
  paused?: boolean
  // Optional: provide your own text
  text?: string
  // How fast new words appear (ms)
  intervalMs?: number
  // Max words to keep visible on the single line (older words are truncated)
  maxVisibleWords?: number
}

export function TranscriptionMock({
  active,
  paused = false,
  text,
  intervalMs = 275,
  maxVisibleWords = 14,
}: TranscriptionMockProps) {
  const defaultText =
    "Once upon a time we dreamed of effortless creation. Now ideas flow naturally, word by word, shaping delightful experiences as if by magic."

  const words = useMemo(() => (text ?? defaultText).split(/\s+/).filter(Boolean), [text, defaultText])
  const [index, setIndex] = useState(0)
  const timerRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  // Reset when toggling from inactive to active
  useEffect(() => {
    if (!active) {
      setIndex(0)
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
      startedRef.current = false
      return
    }
    // When becoming active, start from the beginning
    setIndex(0)
    startedRef.current = true
  }, [active])

  // Drive the word-by-word animation
  useEffect(() => {
    if (!active || paused) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    // Avoid multiple timers
    if (timerRef.current) window.clearInterval(timerRef.current)

    timerRef.current = window.setInterval(() => {
      setIndex((i) => {
        if (i < words.length) return i + 1
        // If we reached the end, keep showing the whole sentence without advancing
        return i
      })
    }, intervalMs)

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [active, paused, words.length, intervalMs])

  // Compute visible window of words
  const visible = useMemo(() => {
    const start = Math.max(0, index - maxVisibleWords)
    const slice = words.slice(start, index)
    return slice
  }, [index, words, maxVisibleWords])

  if (!active && !startedRef.current) return null

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden rounded-lg border bg-card/70 px-3 py-2 text-sm">
        {/* Left fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent" />

        {/* Single-line flowing text */}
        <div className="relative whitespace-nowrap">
          {visible.length === 0 ? (
            <span className="text-muted-foreground">Listening…</span>
          ) : (
            visible.map((w, i) => {
              const isLast = i === visible.length - 1 && index > 0
              return (
                <span
                  key={i}
                  className={`mr-1 inline-block transition-colors duration-400 ${isLast ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {w}
                </span>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

