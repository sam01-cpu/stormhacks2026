<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MusicCraft

MusicCraft is a web application that teaches beginner music producers practical music theory by having them make music.

## Product philosophy

The core idea is:

**Learn theory by making music, not by studying theory before making music.**

The experience should constantly follow:

**Explain → Hear → Try → Apply**

Theory should always be connected to something the user can immediately hear or change.

## Target user

The primary user is a beginner music producer who:

- has used or wants to use a DAW such as FL Studio, Ableton, Logic, or GarageBand
- has little or no music-theory knowledge
- does not understand why certain notes or chords sound good together
- finds traditional theory education intimidating or disconnected from producing music

Assume the user does not know terms such as scale degree, interval, triad, tonic, dominant, or Roman-numeral analysis until the UI explains them.

## MVP

The main demo flow is:

1. User learns what notes are through an interactive piano.
2. User learns that C + E + G makes C major.
3. User sees and hears several chords that naturally belong to C major.
4. User builds a four-bar chord progression.
5. User presses Play and hears the progression loop.
6. User sees the underlying notes represented visually.
7. MusicCraft explains why their progression works.
8. User changes a chord and immediately hears and sees the difference.

The product should make someone go from:

"I don't understand music theory."

to:

"I just made a loop, and I understand a little bit about why it works."

## MVP features

Prioritize:

- polished landing/onboarding experience
- interactive piano keyboard
- note playback
- selected-note highlighting
- basic chord recognition
- C-major chord family
- four-bar chord progression builder
- tempo control
- loop playback
- simple piano-roll visualization
- contextual theory explanations
- responsive design
- good loading/error/empty states

Optional only after the above works:

- physical MIDI keyboard support
- MIDI export
- extra keys
- additional scales

## Explicit non-goals

Do NOT spend time adding:

- authentication
- accounts
- databases
- payments
- social features
- multiplayer
- complicated backends
- a full DAW
- dozens of music-theory lessons
- unnecessary AI APIs

The demo should be excellent before adding more scope.

## Technical direction

Use:

- Next.js
- React
- TypeScript
- Tailwind CSS

Prefer browser-native APIs when reasonable.

For audio, a small well-supported audio dependency is acceptable if it materially simplifies reliable playback.

Keep music-theory logic separate from UI components.

Keep components reasonably small and reusable.

Avoid premature abstraction.

## Design direction

MusicCraft should feel like a modern music-production tool, not:

- a school portal
- a generic SaaS dashboard
- a children's educational game
- a template website

Visual direction:

- dark interface
- premium and minimal
- excellent typography
- generous spacing
- clear hierarchy
- restrained accent color
- rounded but not excessively bubbly
- subtle animations
- DAW-inspired visual language
- highly legible
- sophisticated rather than flashy

The music-making surface should visually dominate the application.

Avoid filling the page with unrelated cards.

## Development rules

Before changing architecture, inspect the existing implementation.

Do not rewrite working features without a reason.

For each meaningful task:

1. Inspect relevant existing files.
2. Implement the requested feature.
3. Run lint/type checks.
4. Run a production build when appropriate.
5. Fix errors introduced by the change.
6. Summarize what changed.

Do not leave obvious placeholders, fake buttons, or controls that appear functional but do nothing.

Do not silently remove working functionality to solve an error.

Prioritize a reliable demo over unnecessary complexity.
