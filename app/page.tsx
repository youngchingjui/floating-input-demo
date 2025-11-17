"use client"

import { useCallback, useMemo, useState } from "react"
import InputPill from "@/components/input-pill"

type Theme = {
  primary: string
  accent: string
  bg: string
}

type Job = {
  id: string
  input: string
  isVoice: boolean
  status: "processing" | "ready"
  theme?: Theme
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])

  const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const themes: Theme[] = useMemo(
    () => [
      {
        primary: "oklch(0.55 0.22 340)", // Pink
        accent: "oklch(0.65 0.25 350)",
        bg: "oklch(0.98 0.01 340)",
      },
      {
        primary: "oklch(0.45 0.18 180)", // Teal
        accent: "oklch(0.55 0.22 190)",
        bg: "oklch(0.98 0.01 180)",
      },
      {
        primary: "oklch(0.50 0.20 120)", // Green
        accent: "oklch(0.60 0.24 130)",
        bg: "oklch(0.98 0.01 120)",
      },
      {
        primary: "oklch(0.48 0.19 30)", // Orange
        accent: "oklch(0.58 0.23 40)",
        bg: "oklch(0.98 0.01 30)",
      },
      {
        primary: "oklch(0.42 0.16 264)", // Blue-Purple
        accent: "oklch(0.52 0.20 280)",
        bg: "oklch(0.98 0.01 264)",
      },
    ],
    [],
  )

  const simulateProcessing = async (): Promise<Theme> => {
    // Simulate workflow with 3 second delay
    await new Promise((resolve) => setTimeout(resolve, 3000))
    // Pick a random theme result
    return themes[Math.floor(Math.random() * themes.length)]
  }

  const applyTheme = (t: Theme) => {
    document.documentElement.style.setProperty("--primary", t.primary)
    document.documentElement.style.setProperty("--accent", t.accent)
    document.documentElement.style.setProperty("--background", t.bg)
    console.log("[v0] Theme applied:", t)
  }

  const handleSubmit = async (input: string, isVoice: boolean) => {
    const id = createId()
    // Add a processing job
    setJobs((prev) => [...prev, { id, input, isVoice, status: "processing" }])

    console.log("[v0] Processing input:", { id, input, isVoice })

    try {
      const theme = await simulateProcessing()
      // Mark job ready with its theme result
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: "ready", theme } : j)))
      console.log("[v0] Job ready:", id)
    } catch (e) {
      console.error("[v0] Processing failed for job:", id, e)
      // Remove failed job
      setJobs((prev) => prev.filter((j) => j.id !== id))
    }
  }

  const handleRevealJob = useCallback((id: string) => {
    setJobs((prev) => {
      const job = prev.find((j) => j.id === id)
      if (job?.theme) {
        applyTheme(job.theme)
      }
      return prev.filter((j) => j.id !== id)
    })
  }, [])

  const pillJobs = jobs.map((j) => ({ id: j.id, status: j.status, label: j.status === "processing" ? "Working in background…" : `Change ready${j.isVoice ? " (voice)" : " (text)"}` }))

  return (
    <main className="min-h-screen pb-32">
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <h1 className="font-sans text-5xl font-bold tracking-tight text-balance md:text-7xl">
            Transform Your Ideas Into Reality
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
            Experience the power of seamless interaction. Speak or type your thoughts, and watch as your experience
            transforms in real-time.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">Powerful Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4 rounded-xl border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Voice Input</h3>
              <p className="text-muted-foreground leading-relaxed">
                Speak naturally and let your voice drive the experience. Perfect for hands-free interaction.
              </p>
            </div>

            <div className="space-y-4 rounded-xl border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Text Input</h3>
              <p className="text-muted-foreground leading-relaxed">
                Type your thoughts with precision. Sometimes words on screen capture ideas best.
              </p>
            </div>

            <div className="space-y-4 rounded-xl border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Dynamic Themes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Watch your experience transform. Each interaction brings a fresh, vibrant color palette.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl text-balance">
            Ready to Experience Something New?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed md:text-xl">
            Use the input pill below to get started. Your journey begins with a single word or voice command.
          </p>
        </div>
      </section>

      {/* Floating Input Pill */}
      <InputPill
        onSubmit={handleSubmit}
        jobs={pillJobs}
        onRevealJob={handleRevealJob}
      />
    </main>
  )
}

