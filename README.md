# AO1 · 名校申请深度规划自查表

A redesigned, bilingual (中文 primary / English secondary), one-question-at-a-time
version of the AcademiaOne "AO1" Zoho intake form — black-and-gold styling,
animated transitions, autosaving progress, and email delivery on submit.

Everything lives in a single self-contained file: **`index.html`**. No build
step, no framework, no dependencies to install.

## Before this goes live

Open `index.html` and find the `CONFIG` block near the top of the `<script>`
tag:

```js
var CONFIG = {
  FORMSPREE_ENDPOINT: "https://formspree.io/f/YOUR_FORM_ID",
  DESTINATION_EMAIL: "you@example.com"
};
```

1. **Create a Formspree endpoint** (free tier is fine): go to
   [formspree.io](https://formspree.io), sign up, create a new form, and set
   its notification email to whichever inbox should receive submissions.
   Formspree gives you an endpoint like `https://formspree.io/f/xxxxabcd` —
   paste that into `FORMSPREE_ENDPOINT`.
2. **Set `DESTINATION_EMAIL`** to the same inbox. It's only used to build the
   "Send via email instead" fallback link that appears if the network
   request to Formspree ever fails — the primary send still goes through
   Formspree straight to the inbox you configured there.
3. Optional: in the Formspree dashboard you can add reCAPTCHA / spam
   filtering, and customize the auto-reply sent back to the applicant.

Until step 1 is done, the page still works end-to-end (fill it out, hit
submit) but the browser console will warn that the endpoint is a placeholder,
and submissions will fall back to the "send via email" link instead of
sending automatically.

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
