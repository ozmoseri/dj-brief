# DJ Brief

Hebrew, RTL, mobile-first web app for event DJs. The DJ sends each client a link, the client fills in event details, music and a shared timeline, and the DJ gets a run sheet for the laptop at the event.

Owner: Oz. First user: Liel (DJ LIELMALKA). Always answer Oz in Hebrew. Never use an em dash in any output.

## Live

- Site: https://ozmoseri.github.io/dj-brief/ (GitHub Pages, deploys automatically from `main`, about a minute after a push)
- Client link: `?e=<token>`. Review link: `?r=<token>`. Admin link: `#k=<admin key>`.
- This repo is public. Never commit the admin key, service keys or any secret. The Supabase anon key in `index.html` is public by design.

## Code

- `index.html`: the whole app, vanilla JS, no build step. One `S` state object, `render()` redraws from state, events are delegated from `#app` through `data-act`.
- `sw.js`: service worker. Network-first for navigation, cached shell and fonts for offline. Bump `C` when the caching logic changes.
- `vercel.json`, `netlify.toml`, `_redirects`, `_headers`: leftovers from hosting attempts, unused on GitHub Pages. Path routes (`/e/<token>`) only work on hosts with rewrites, so links use the query form on `github.io`.

Modes: `admin` (list, event editor, settings, booth), `client` (5-step wizard), `review` (rating page), `landing`.

## Backend

Supabase project `dj-event-brief` (ref `vtuyhvbgcwlzwtjlnydb`, eu-central-1, org of ozmosseri1).

- Tables `djs` and `events`, RLS on, no policies. Nothing reads tables directly.
- All access goes through `security definer` RPCs, gated by a secret: `dj_*` take the admin key, `client_*` take the event token.
- `dj_get`, `dj_get_event`, `dj_create_event`, `dj_save_event`, `dj_delete_event` (soft delete, 30 days), `dj_restore_event`, `dj_update_profile`, `client_get`, `client_save`, `client_review`.
- Saves send `p_base` (the `updated_at` last seen). A mismatch returns `{conflict:true,...}` and the client merges per top-level field (`merge3`) and saves again.
- Event content lives in `events.data` (jsonb): `names, pron, type, date, start, end, venue, city, guests, contact_name, contact_phone, genres[], vibe, moments{}, playlist, must[], nice[], no[], timeline[], notes, submitted`.
- Locking: `locked`, or automatic `lock_days` before `data.date`, enforced in `client_save`.

## Rules

- Every user-facing string is Hebrew. Isolate Latin text, phones and links with `dir="ltr"` or `.ltr`.
- Escape everything that comes from data with `esc()`. Only render a link when `okUrl()` passes.
- A change must be checked in a browser before it is called done: admin flow, client flow on a phone-sized viewport, booth mode, and one save.
- Schema changes go through migrations, and new RPCs need `revoke ... from public, anon, authenticated` followed by an explicit `grant`.
- No automatic outbound messages to people who did not contact us first. WhatsApp buttons open a prefilled chat and a human presses send.

## Open work

- Real login (magic link or Google) instead of the secret admin link, and a way to rotate a leaked link.
- Self-signup and billing. Today each new DJ is a row inserted by hand into `djs`.
- Automated reminders (needs the official WhatsApp Business API), server-rendered PDF, change log after lock.
- Custom domain instead of `ozmoseri.github.io`.
- Import songs from a pasted Spotify or Apple Music playlist (today only the link is stored).
- Delete the `demo-assets` branch (temporary video files).

## Business context

Competitors in Israel: Setly (setly.pro) and Plya (plya.io), both with a free tier of 3 events. Plan: side product, gate of 10 paying DJs in 30 days without ads, then the same engine for wedding photographers and makeup artists. Suggested pricing: free for 2 events, solo 69 ILS/month, agency 199 ILS/month.
