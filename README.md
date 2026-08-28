# AO1 · 名校申请深度规划自查表

A redesigned, bilingual (中文 primary / English secondary) version of the
AcademiaOne "AO1" Zoho intake form — black-and-gold styling, animated
transitions, autosaving progress, and three layers of submission delivery
(Google Sheets + Drive + PDF, Formspree email, and a mailto fallback).

Everything the visitor sees lives in a single self-contained file:
**`index.html`**. No build step, no framework, no dependencies to install.

## Submission delivery — three layers, in order

1. **Google Sheets + Drive + PDF** (`apps-script/Code.gs`) — the primary
   path once deployed (see setup below). One call: appends a row to the
   "AO1 Submissions" Sheet, builds a branded PDF of that submission (logo,
   gold/black AcademiaOne styling, organized by the form's own sections
   with the real question text — not a plain data dump) and saves it into
   the "AO1 Submission PDFs" Drive folder, then emails everyone listed in
   `RECIPIENTS` (see below) a notification with links to both.
2. **Formspree** (`CONFIG.FORMSPREE_ENDPOINT`) — used automatically
   whenever the Sheets endpoint isn't configured yet, or a submission to it
   fails. Email-only, no Sheet/PDF/Drive.
3. **mailto fallback** — if both of the above fail (e.g. the visitor is
   offline), the page shows a "Send via email instead" button that opens
   their own email client, pre-filled with every answer, addressed to
   `CONFIG.DESTINATION_EMAIL`.

Layer 1 is skipped entirely (falling straight to layer 2) until it's set up —
the page always works, it just starts logging to the Sheet/Drive/PDF once
you've done the one-time deploy below.

### Setting up the Sheets/Drive/PDF pipeline

Two Drive items already exist and are shared with josie@academiaone.co.uk:

- Sheet: [AO1 Submissions](https://docs.google.com/spreadsheets/d/1SSVSWtrPXcw06oaJKDWGsgJWqS6CIxVGZam2yQPmpTw/edit)
- Folder: [AO1 Submission PDFs](https://drive.google.com/drive/folders/1BUlv3JWvTzJe8FcbqwCslr_TlQsHzMWi)

To wire them up (~5 minutes, one-time):

1. Open the Sheet above, then **Extensions → Apps Script**.
2. Delete the default `Code.gs` contents and paste in this repo's
   `apps-script/Code.gs` instead.
3. **Deploy → New deployment**, type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click Deploy, and authorize the script when prompted (first time only —
   this is Google's normal "this script wants access to your Sheets/Drive/
   Gmail" consent screen, since the script acts under your own account).
5. Copy the **Web app URL** it gives you (looks like
   `https://script.google.com/macros/s/AKfycb.../exec`).
6. Paste it into `CONFIG.SHEETS_WEBAPP_ENDPOINT` in `index.html` (replacing
   the `YOUR_DEPLOYMENT_ID` placeholder), then push.

From then on, every submission appends a row to the Sheet (headers
self-initialize from the first real submission — new questions later just
show up as new trailing columns automatically), saves a PDF into the
Drive folder, and emails Josie a notification with links to both. If you
ever edit the questions in `index.html`, no changes to `Code.gs` are
needed — it adapts to whatever keys the payload contains.

**Redeploying after editing `Code.gs`:** Apps Script keeps the same Web
app URL across redeployments as long as you choose **Deploy → Manage
deployments → (pencil icon) → Version: New version** rather than creating
a brand new deployment.

### Sending to specific people with specific messages

Near the top of `Code.gs` is a `RECIPIENTS` list — one entry per person who
should be emailed on every submission, each with their own greeting:

```js
var RECIPIENTS = [
  {
    email: 'josie@academiaone.co.uk',
    messageZh: '你好 Josie，新的问卷提交了，请查收 PDF 和表格链接。',
    messageEn: 'Hi Josie, a new questionnaire has come in. PDF and sheet links below.'
  }
  // add more people the same way:
  // { email: 'victor@academiaone.co.uk', messageZh: '...', messageEn: '...' }
];
```

Add, remove, or edit entries directly in the Apps Script editor, then
**Deploy → Manage deployments → New version** (same URL, no changes needed
in `index.html`). Everyone in the list gets the same PDF/Sheet links, each
with their own message ahead of it.

## What's on the form

The flow mirrors the original Zoho form's content exactly (same questions,
same options), organized into 5 pages — close to the original form's own
pagination, just restyled and animated:

1. Welcome screen (the original "Hi 亲爱的…" message)
2. Before We Begin + Your Basic Information (13 questions)
3. Why Are You Here? (12 questions)
4. About Your Goals + About Yourself (9 questions)
5. About Your Life Pace (5 questions)
6. Final Questions — track-record stats, fit questions, agreement terms (5 questions)
7. Review & Submit
8. Success screen

Every question is required. A small rotating sketchbook-style icon sits
beside each page's content, and the progress bar advances live as each
question is answered (not just when you hit Next), with occasional generic
"great job" encouragement toasts along the way.

## Language toggle

Top-right of the header. Chinese is the default/primary language; switching
to English re-renders all question text and UI chrome without losing any
answers already entered. The chosen language is remembered in
`localStorage` and used again on return visits.

## Progress persistence

Answers and current step are saved to `localStorage` on every change, so a
refreshed tab or a closed browser resumes exactly where the visitor left
off. A discreet "Start over" link (bottom-left) clears everything after a
confirmation prompt.

## Branding

- Black-and-gold palette, "Playfair Display"/"Noto Serif SC" for headings,
  "Inter"/"Noto Sans SC" for body text (all via Google Fonts).
- The real AcademiaOne logo (`<img class="brand-logo">` in the header,
  embedded as base64 so the page stays a single file) is used both on the
  page itself and in the header of every generated PDF.

## Deploying

This is static HTML — host it anywhere: GitHub Pages, Netlify, Vercel, or
any static file host. For GitHub Pages on this repo: Settings → Pages →
Deploy from branch → select this branch and `/ (root)`.
