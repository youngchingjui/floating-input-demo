"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface InputPillProps {
  onSubmit: (input: string, isVoice: boolean) => Promise<void>
  isProcessing: boolean
}

export default function InputPill({ onSubmit, isProcessing }: InputPillProps) {
  const [mode, setMode] = useState<"collapsed" | "text" | "voice">("collapsed")
  const [textInput, setTextInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Reset recording time when stopping
  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0)
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        console.log("[v0] Recording completed:", audioBlob.size, "bytes")
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      console.log("[v0] Recording started")
    } catch (error) {
      console.error("[v0] Error accessing microphone:", error)
      alert("Could not access microphone. Please grant permission and try again.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }

      console.log("[v0] Recording stopped")
    }
  }

  const handleVoiceSubmit = async () => {
    stopRecording()
    await onSubmit(`Voice recording (${recordingTime}s)`, true)
    setMode("collapsed")
  }

  const handleTextSubmit = async () => {
    if (textInput.trim()) {
      await onSubmit(textInput, false)
      setTextInput("")
      setMode("collapsed")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
      <div className="w-full max-w-2xl pointer-events-auto slide-up">
        {/* Collapsed State */}
        {mode === "collapsed" && (
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border bg-card/95 p-2 shadow-lg backdrop-blur-sm">
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 rounded-full hover:bg-accent"
              onClick={() => setMode("voice")}
              disabled={isProcessing}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </Button>
            <div className="h-8 w-px bg-border" />
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 rounded-full hover:bg-accent"
              onClick={() => setMode("text")}
              disabled={isProcessing}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Button>
          </div>
        )}

        {/* Text Input Mode */}
        {mode === "text" && (
          <div className="rounded-2xl border bg-card/95 p-4 shadow-xl backdrop-blur-sm">
            <div className="space-y-3">
              <Textarea
                placeholder="Type your message..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-24 resize-none border-0 bg-transparent text-base focus-visible:ring-0"
                disabled={isProcessing}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMode("collapsed")
                    setTextInput("")
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isProcessing}
                  className="min-w-20"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Recording Mode */}
        {mode === "voice" && (
          <div className="rounded-2xl border bg-card/95 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              {!isRecording ? (
                <>
                  <Button size="lg" className="h-20 w-20 rounded-full" onClick={startRecording} disabled={isProcessing}>
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </Button>
                  <p className="text-sm text-muted-foreground">Tap to start recording</p>
                  <Button variant="ghost" size="sm" onClick={() => setMode("collapsed")} disabled={isProcessing}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <div className="recording-pulse flex h-20 w-20 items-center justify-center rounded-full bg-destructive">
                    <div className="h-4 w-4 rounded-full bg-destructive-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-2xl font-bold font-mono tabular-nums">{formatTime(recordingTime)}</p>
                    <p className="text-sm text-muted-foreground">Recording...</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        stopRecording()
                        setMode("collapsed")
                      }}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleVoiceSubmit} disabled={isProcessing} className="min-w-20">
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing
                        </span>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
