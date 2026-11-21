# Sannyas Website (sannyas.pages.dev)

Source for the Sovereign Order of KAILASA's Nithyananda "Sannyas" website.
Plain static site: HTML pages, images, fonts and one script. No build step.

Live: https://sannyas.pages.dev
Custom domain: https://sannyas.kailasa.ai

## What is in this folder

- 16 HTML pages: index, sph, vows-and-rules, four-tattvas, why-sannyas,
  life-of-a-sannyasi, apply, before-you-apply, pss-program, faq, ask-ai,
  library, safeguards-and-contact, sannyas-in-the-upanishads,
  take-the-leap, what-is-sannyas
- video-embed.js : in-site YouTube lightbox (see "Videos and timestamps")
- img/ and fonts/ : all images and self-hosted fonts

## History / where this came from

The site was authored as a Claude artifact
(https://claude.ai/artifact/2DughFAj2hEDDgs2cf5L1w, 173 files) and deployed
to Cloudflare Pages. The deployed copy differs from the artifact in exactly
one way: every page has `<script src="video-embed.js" defer></script>`
before `</body>`, and `video-embed.js` was added. That is verified: all 16
live pages match these files byte for byte.

## Deploy to Cloudflare Pages

One-time login (browser opens; use the account that owns the project):

    npx wrangler@latest login

Deploy this folder (the project name is the `*.pages.dev` subdomain):

    npx wrangler@latest pages deploy . --project-name sannyas --branch main

Wrangler's Pages commands need an API token when run non-interactively.
Create one at dash.cloudflare.com/profile/api-tokens with
Account > Cloudflare Pages > Edit, then:

    setx CLOUDFLARE_API_TOKEN "<token>"        (Windows; open a new shell)

Pages serves clean URLs: faq.html is reached at /faq (the .html URL
redirects with a 308). Links inside the pages use the .html form and work.

Optional: connect this GitHub repo in Cloudflare (Workers & Pages >
sannyas > Settings > Builds) with build command empty and output directory
`/`, so every push to `main` deploys automatically.

## Custom domain (sannyas.kailasa.ai)

1. In the Cloudflare account that owns the Pages project: Workers & Pages >
   sannyas > Custom domains > add `sannyas.kailasa.ai`.
2. In the Cloudflare account that holds kailasa.ai, add DNS:

       Type: CNAME   Name: sannyas   Target: sannyas.pages.dev
       Proxy: Proxied   TTL: Auto

   Pages only serves a hostname that was added in step 1; the CNAME alone
   shows an error page.

## Videos and timestamps

Two mechanisms, both use youtube-nocookie.com embeds:

1. FAQ clips (faq.html). A click-to-play poster with
   `data-vid`, `data-s` (start seconds) and `data-e` (end seconds). Clicking
   swaps in an iframe `...embed/<id>?start=<s>&end=<e>&autoplay=1`, so only
   that moment plays. Current clips:

   - j1kAQDDPyQo  1179-1222  (satsang 22 Nov 2013)
   - TGXYdKZaC_w  1610-1644  (satsang 18 Nov 2013)
   - N63rUEfy62g   386-436   (satsang 26 May 2013)
   - v8XZr-Omslo  2306-2340  (satsang 13 Aug 2017)
   - v8XZr-Omslo  2702-2795  (satsang 13 Aug 2017)
   - j1kAQDDPyQo  1209-1222  (satsang 22 Nov 2013)

2. Quote links (video-embed.js). Any link to
   `youtube.com/watch?v=ID&t=NNNs` opens in an on-site lightbox starting at
   that second (`?start=NNN`), and links inside `<cite>` get a play icon and
   an mm:ss label. Plain `watch` links with no `t` start at 0.

To add a timestamped quote, link its citation as
`https://www.youtube.com/watch?v=<id>&t=<seconds>s`. To add a clip that stops
at a set second, copy an existing `<div class="clip" data-vid data-s data-e>`
block in faq.html.

Playback requires a real https origin (the Cloudflare URL or the custom
domain). It will not play from the claude.ai artifact preview or from a
`file://` page.

## Known gaps

- The pages reference `audio/viraja-homa.mp3` (background mantras with a
  sound button). That file is NOT in the artifact and NOT deployed: the live
  site returns the HTML fallback page for that URL. Add the mp3 to an
  `audio/` folder and redeploy to enable it.
- No `_headers`, `_redirects`, robots.txt, sitemap.xml or 404 page exist on
  the live site.
