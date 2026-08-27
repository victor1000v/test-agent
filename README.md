# AO1 · 名校申请深度规划自查表

A redesigned, bilingual (中文 primary / English secondary), one-question-at-a-time
version of the AcademiaOne "AO1" Zoho intake form — black-and-gold styling,
animated transitions, autosaving progress, and email delivery on submit.

Everything lives in a single self-contained file: **`index.html`**. No build
step, no framework, no dependencies to install.

## Email delivery

Submissions are wired to send to **josie@academiaone.co.uk** via Formspree's
no-signup endpoint (`https://formspree.io/josie@academiaone.co.uk` — see the
`CONFIG` block near the top of `index.html`'s `<script>` tag).

**One-time step:** the *first* real submission triggers a confirmation email
from Formspree to josie@academiaone.co.uk. Someone needs to open it and click
"Confirm" once — after that, every submission delivers automatically with no
further action needed. The free tier caps at 50 submissions/month; if that's
ever a limit, create a proper account at [formspree.io](https://formspree.io),
create a form there (it'll give you an endpoint like
`https://formspree.io/f/xxxxabcd`), and swap that into `FORMSPREE_ENDPOINT` —
it also unlocks spam filtering and a custom auto-reply to the applicant.

If the network request to Formspree ever fails for a visitor, the page falls
back to a "Send via email instead" button that opens their own email client
pre-filled with all their answers, addressed to `DESTINATION_EMAIL`.

## What's on the form

The flow mirrors the original Zoho form's content exactly (same questions,
same options), reorganized into:

1. Welcome screen (the original "Hi 亲爱的…" message)
2. Before We Begin (email, who you're filling this out for)
3. Your Basic Information
4. Why Are You Here?
5. About Your Goals
6. About Yourself
7. About Your Life Pace
8. Final Questions (track-record stats, fit questions, agreement terms)
9. Review & Submit
10. Success screen

Each question is its own screen with its own progress step — nothing is
grouped into a long scroll. Single/multi-choice question types use tappable
cards, the two 1–10 questions use a styled slider, and grouped questions
(Top 3 schools, Top 3 traits, Top 3 outcomes) keep their small multi-field
layout on one screen since they're naturally one question with sub-parts.

## Language toggle

Top-right of the header. Chinese is the default/primary language; switching
to English re-renders all question text and UI chrome without losing any
answers already entered (including mid-question). The chosen language is
remembered in `localStorage` and used again on return visits.

## Progress persistence

Answers and current step are saved to `localStorage` on every change, so a
refreshed tab or a closed browser resumes exactly where the visitor left
off. A discreet "Start over" link (bottom-left) clears everything after a
confirmation prompt.

## Branding

- Black-and-gold palette, "Playfair Display"/"Noto Serif SC" for headings,
  "Inter"/"Noto Sans SC" for body text (all via Google Fonts).
- The logo is a hand-drawn SVG monogram ("AO" inside a laurel-and-ring
  crest) plus the "AcademiaOne Education" wordmark, built to resemble the
  original form's header since no logo file was supplied. **Swap in the
  real logo file** by replacing the `<svg class="logo-mark">…</svg>` block
  in the header with an `<img>` tag pointing at the actual logo asset
  whenever you have it.

## Deploying

This is static HTML — host it anywhere: GitHub Pages, Netlify, Vercel, or
any static file host. For GitHub Pages on this repo: Settings → Pages →
Deploy from branch → select this branch and `/ (root)`.
