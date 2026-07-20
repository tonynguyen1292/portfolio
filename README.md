# Vy Nguyen — Portfolio Website

A single-page portfolio positioning Vy for Business Analyst / Data Analyst roles in Perth.
Hand-built static site: **semantic HTML + modern CSS + vanilla JavaScript**. No frameworks,
no build step, no trackers — open `index.html` and it works; push to Netlify and it's live.

## Folder structure

```
Portfolio Website/
├── index.html          ← all content lives here (edit this 95% of the time)
├── thanks.html         ← contact-form success page
├── css/styles.css      ← design system (tokens at the top control everything)
├── js/main.js          ← interactions (theme, filters, dialog, counters…)
├── assets/
│   ├── Vy-Nguyen-CV-Business-Analyst.pdf   ← the CV the download buttons serve
│   ├── og-image.png    ← social-share preview image (LinkedIn/Teams)
│   ├── favicon.svg / favicon-32.png / apple-touch-icon.png
├── netlify.toml        ← security headers + publish config
├── robots.txt / sitemap.xml
└── .gitignore
```

## Run it locally

Any of these from this folder:

```powershell
# simplest — just open the file
start index.html

# or a proper local server (recommended, matches production)
python -m http.server 8000     # then visit http://localhost:8000
```

> Note: the contact form only actually delivers on Netlify (see below). Locally it
> falls back to opening your email app — that's intentional.

## Deploy to Netlify (recommended — free)

### One-time setup, Option A: drag & drop (2 minutes, no git)

1. Sign in at [app.netlify.com](https://app.netlify.com) (use GitHub login).
2. **Sites → Add new site → Deploy manually**, drag this whole folder in.
3. Done — you get `https://<random-name>.netlify.app`. Rename it:
   **Site configuration → Site details → Change site name** → e.g. `vynguyen`.

### One-time setup, Option B: GitHub + continuous deploy (best long-term)

```powershell
# from this folder (git repo is already initialised with an initial commit)
gh auth login                                  # or create the repo on github.com
gh repo create portfolio --public --source . --push
# without gh CLI: create an empty repo on github.com, then:
#   git remote add origin https://github.com/tonynguyen1292/portfolio.git
#   git push -u origin main
```

Then in Netlify: **Add new site → Import an existing project → GitHub → portfolio**.
Build command: *(leave empty)* · Publish directory: `.` — deploy.
From now on **every `git push` redeploys the site automatically**.

### Activate the contact form (once, after first deploy)

Netlify detects the form at deploy time automatically (`data-netlify="true"` is already
in the markup). To get submissions by email:
**Site → Forms → Form notifications → Add notification → Email** → tonynguyen1996.jb@gmail.com.
Free tier: 100 submissions/month — plenty.

### Go live checklist (after first deploy)

> The site is live at **https://vynguyen-perth.netlify.app** (deployed 20 Jul 2026 via
> `netlify deploy --prod`; the folder is linked to project `vynguyen-perth`, so future
> deploys are just `npx netlify-cli deploy --prod --dir .`).

1. **Domain URLs** — already set to `vynguyen-perth.netlify.app` in `index.html`
   (canonical/OG/JSON-LD), `robots.txt` and `sitemap.xml`. If you attach a custom
   domain later, update the same three files.
2. Commit + push (or redeploy via CLI).
3. Test the form once from the live site.
4. Paste your live URL into [opengraph.xyz](https://www.opengraph.xyz) to preview the
   LinkedIn share card.
5. Submit the sitemap in [Google Search Console](https://search.google.com/search-console)
   (add property → URL prefix → verify via Netlify DNS or HTML file).

## Custom domain (optional, ~A$15–20/yr)

1. Buy a domain (e.g. `vynguyen.dev` / `ducvynguyen.com`) at Porkbun/Namecheap/Cloudflare.
2. Netlify: **Domain management → Add a domain you already own** → follow the DNS
   instructions (either point nameservers at Netlify, or add the shown `A`/`CNAME` records).
3. HTTPS is automatic (Let's Encrypt) — nothing to configure.
4. Re-run the "Update the domain placeholder" step with the new domain.

## Editing content later

| What | Where |
|---|---|
| Hero headline / intro | `index.html` → `<!-- HERO -->` section |
| Stats (421 / 356 / …) | hero `.hero-stats` — change `data-count` **and** the visible text |
| About story / strength cards | `<!-- ABOUT -->` |
| Project cards + case studies | `<!-- PROJECTS -->` cards, and the `<template id="case-…">` blocks near the bottom |
| Skills groups | `<!-- SKILLS -->` |
| Timeline entries | `<!-- JOURNEY -->` |
| Certifications / education | `<!-- CREDENTIALS -->` |
| Colours / fonts / spacing | `css/styles.css` → `:root` token blocks at the top |
| Replace the CV | overwrite `assets/Vy-Nguyen-CV-Business-Analyst.pdf` (keep the same filename) |

After editing: `git add -A ; git commit -m "update content" ; git push` — Netlify redeploys in ~20 seconds.

## Notes & decisions

- **Why no framework:** a portfolio changes a few times a year; a static page loads in
  milliseconds, costs nothing, can't break from dependency rot, and is editable in Notepad.
- **Accessibility:** WCAG AA contrast (both themes), keyboard navigable, skip link,
  ARIA on all interactive widgets, `prefers-reduced-motion` respected everywhere,
  content never hidden if JavaScript fails.
- **The Jira backlog link** was removed from the WA Mining case study because the board
  currently shows a login wall to anonymous visitors. If you enable public access in Jira
  (Project settings → Access), restore the link — the commented-out button is still in
  `index.html` inside `<template id="case-wa-mining">`.
- **Vercel / Cloudflare Pages** also work (it's just static files) — but the contact form
  is Netlify-specific. On other hosts, swap the form for [formspree.io](https://formspree.io)
  (free tier) or keep the built-in mailto fallback.
