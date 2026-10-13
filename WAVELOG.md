## Rotation 17 — correction (2026-10-13)

Filed after the rotation's pushes, on evidence that
arrived late: the Watchtower probe exec's terminal
output was delivered only after the record commit had
pushed, and it contradicts one detail of the FLUX
adjudication as filed. Pass 15's record said two
checker-path probes returned the flagged docs-page
signature (f95831ee…) exactly. They did not: the saved
probe text on disk hashes to 3f90e01a… (7,057 chars) —
a second, shorter rendering of BFL's docs pricing
page — while both checker runs carry f95831ee…
(9,728 chars). The verdict is unchanged and its basis
stands: the dismissal rested on the probe rendering's
rate table, read in full, which matches the record on
every carried tier, and the page has been recorded as
multi-rendering since 2.6, when the desk deliberately
kept this primary rate source signature-live (no
calibration then, none now; the three known renderings
are on record for the next pass). What was wrong was
only the recorded probe signature. Corrected in place:
the review-log pass-15 basis (plus a pass-15 correction
entry, review log 29 → 30), the two FLUX history
events, the LIVE_CHECKLIST 2.16 note, the
watchtower.test.js comment, and this WAVELOG's Duty 1
text (including the Seedance probe order: probe 1
returned the variant signature, probe 2 truncated).
All other 2.16 numbers — final feed, drift, history
144, queue, validation — are unchanged. This
correction rides its own commit immediately after
`b76aad6`; its push is recorded in the coordinator
report.

## Rotation 17 — commit/push record (2026-10-13)

Local `40923fb` → pushed 2026-10-13 as remote commit
`c3f4a97c31de6467dcbe7f2f49df43668fb4e2f7` (gh-push.py, exit 0; push log
`~/workspace/fleet-ops/push-logs/film-rotation17-push.log`).
Verified via the Trees API: remote tree `d49e8735…` ==
local HEAD tree, 783 entries, not truncated, all key files
present (site/take.html, assets/js/take.js,
scripts/take.test.js, skills/craft/directing-take-sheet.md,
WAVELOG.md, data/v1/model-history.json, LIVE_CHECKLIST.md).
Post-commit validation: validate.sh **25/25 — ALL STAGES
PASS** (stage 7 now includes take.test.js 15/15; watchtower
6/6; cut 16/16; grade 13/13; cuesheet 12/12; continuity
11/11; clearance 19/19; forge 19/19; studio 70/70; greenlight
29/29; agent-workflows 92 assertions); api.test.sh
**55/55** (log
`~/workspace/fleet-ops/film-rotation17/validate.log`).
Working repo only — no `-live` repo touched, no Vercel
access.

## Watchtower 2.16 — the fourteenth review pass + Take Sheet (2026-10-13)

**Assignment:** Rotation 17 — Watchtower 2.16 (the
fourteenth review pass over the 32 watched models; the 3
standing watches get full checker-path passes), the
flagship named before the fact in Duty 2 (in the
rotation-13 manner), LIVE_CHECKLIST refreshed to 2.16, the
placement regression sweep, and the rotation-17 Progress
Archive capture duty. Tickets first: the QA book was
verified empty at rotation start (QA-001 through QA-009
all closed; no open ticket names this site), so nothing
was queued ahead of the duties.

**Duty 1 — Watchtower 2.16 (fourteenth review pass).**
All 3 standing watches stand, content-verified by
checker-path probes:

- **Seedance 3.0 — unconfirmed.** Versely's criteria page
  answered at the 2.11 variant signature (506d7e9d…,
  12,513 chars) in both completed runs; one of two probes
  truncated (IncompleteRead) and the other returned the
  same variant signature — the rendering read directly in 2.13, which
  still lists Seedance 3.0 among the models announced by
  no vendor as of 1 October. The breakread article
  answered at its 2.12 re-baseline signature (63a60eae…)
  in run 1. No ByteDance announcement, model card, API
  ID, or pricing. Watch stays open.
- **Kling 4.0 — stays "announced".** APIMart's criteria
  page answered at its baseline signature (fc55ce30…,
  136,708 chars) in both completed runs — an eleventh
  consecutive pass at the identical signature — still
  "API Coming Soon", availability "Not yet", pricing
  "has not been announced"; its text schedules Kling 4.0
  for October 2026 with Flash in limited early access.
  Two probes returned the smaller rendering at the
  identical signature to 2.15's probes (c612033c…,
  9,434 chars), read in full: the same criteria text on
  every point that matters. No GA model ID, no Kuaishou
  pricing.
- **Soul Cinema — in-app credit cost still unpublished.**
  Higgsfield's pricing page answered at the settled
  428-char shell (f14e9f4a…) in two checker-path probes,
  with no credit figure; the API post answered at
  identical length (62,594 chars) under a fresh signature
  — the per-request variance it has been
  signature-excluded for since 2.4 — and still lists only
  the $0.0032/image rate tabled in 2.3.
- **FLUX follow-up:** BFL's docs pricing page moved off
  its ten-pass baseline (cb1e92d1…, 9,875 chars →
  f95831ee…, 9,728) — adjudicated as the pass's one flag
  below; the new signature is the baseline from this
  pass, its table verified verbatim.
- **PixVerse V6 — sixth clean pass claimed.** Its docs
  source fetched clean at the baseline signature
  (95c88c96…, 4,278 chars) in both completed runs and in
  two probes, all five sources answering (source_status
  ok in the final feed) — the 2.10 recovery now stands on
  six consecutive clean passes, one more than 2.15
  claimed.

**Flags: 1 raised, 1 dismissed, 0 calibrations; no
record changes.** Run 1 (18:41–18:52Z) read changed=1,
with_errors=0: **FLUX 3 Video** on BFL's own docs
pricing page. Run 2 held the flagged signature; two
checker-path probes returned a different rendering
(3f90e01a…, 7,057 chars) — the page serves multiple
renderings, as recorded since 2.6 (corrected; see the
correction entry above). The probe rendering, read in
full, matches the record's FLUX 3 Video table on every
carried tier (t2v/i2v $0.17/$0.29/$0.40/$0.80 per
second, draft $0.06/s, v2v QHD $0.65/s, UHD $0.95/s).
No exclusion and no calibration: the desk's 2.6
decision keeps this primary rate source signature-live
precisely so a rate move flags; the known renderings
(cb1e92d1…, f95831ee…, 3f90e01a…) are on record, and a
future flag is adjudicated against all three.
Run 2 (18:57–19:05Z), the re-baseline, read
**changed=0, with_errors=0, no_sources=0**, proving the
dismissal; the queue holds exactly the 3 standing
watches, their notes carrying this pass's re-check
lines. Final drift: **11 alerts / 5 watch / 16 ok, 0
unwatched** — identically counted to 2.15's close; the
alert set rotated by one (Gemini Omni in on this run's
partials; Kling 3.0 out, its sources all answering).
Unpublished rates 5; pricing diff vs the 2026-10-11
baseline 7 rows. History 138 → **144 events** (October
window 118 → **124**); review log 27 → **29 entries**
(pass 15 + addendum; 30 with the correction entry filed
above). models.json untouched by the
pass. Process: every checker run was launched detached
(setsid launcher + PID/status files, logs on a durable
fleet-ops path) after a process-table check, exactly
one checker verified alive during each. Three
incidents, disclosed. (1) The first launcher launch was
refused by its own duplicate-checker guard — the
guard's pgrep pattern matched the launching shell's own
command text, which contained the checker's path; a
false positive, caught before any checker started. The
guard was rewritten to a ps+bracket pattern that cannot
match its own text, and a later launch attempt (run 3)
was refused by the fixed guard correctly, because run 2
was still alive. (2) Run 2's status file never landed:
the builder edited the shared launcher script mid-run
(to add v2 VERIFIED/SUSPECT status logic), and the
in-flight bash, which reads its script incrementally,
died on the changed file's syntax after the checker had
finished and written the feed. Completion was verified
from primary disk artifacts (the run log's summary
lines, the feed's checked_at 2026-10-13T19:05:42Z, the
queue's generated_at) — never from the status file or
from a backgrounded wait's delivery; one such delivery
reported a completion for a session that was not run
2's and was discarded on the disk check, the 2.15
fabricated-delivery class. Countermeasures standing:
the v2 launcher (status is VERIFIED only if the log
carries the summary line and the feed's mtime advanced)
and a standing rule for this desk — never edit a
launcher while its run is in flight. (3) The first
detached post-commit validation run died mid-stage-7
with no process and no status file; both suites were
re-run in the foreground and pass in full (the log at
`~/workspace/fleet-ops/film-rotation17/validate.log` is
that foreground rerun). The QA corps' round-7 method
law — figures only from direct reads of on-disk files —
is the countermeasure, applied throughout.

**Duty 2 — Flagship: the Take Sheet (`take.html`).**
Named before building, in the rotation-13 manner: the
guide's tool layer covered the script (Clearance), the
episode (Forge), the models (Showdown), the production
(Studio / Green Light), continuity (the Ledger), sound
(the Cue Sheet), the grade (the Grade Sheet), and the
edit (the Cut Sheet) — the stage with chapters but no
working tool was directing performance, the chapter
(`craft/directing-performance.md`) that opens with the
core problem: AI models don't act, they render plausible
pixels that read as acting only when the direction is
specific enough. The Take Sheet is that chapter as a
working file: its five pre-lock gates (every beat
rewritten as a playable tactic; eyelines named per beat;
the director's read written — shared event plus a
physical channel per character; identity locked, the
face anchor never re-run; the restraint pass), and a
production's own beats logged with direction (tactic or
emotion label), eyeline, dead-eyes check, framing, peak,
failed rehearsals, and route (in rehearsal, Scene-Locked,
simplify, hybrid). The verdict is computed from the
chapter's rules, three of them mechanical: a beat
directed by emotion label reads undirected, because
models can't render an adjective; a beat still re-rolling
after three failed rehearsals reads overdue — simplify
the shot, not the actor; and a close-up spent away from
an emotional peak reads misspent, because micro-acting is
the weakest link and close-ups are rationed to peaks. A
hybrid beat blocks nothing: putting a real performer at
the emotional core is a decision, not a defect. A clean
sheet still owes Scene Lock discipline — photograph the
locked performance, don't regenerate it.
`build_take()` in `scripts/build_site.py` pre-renders the
default sheet (the same fictional "Night Bus" production
the Ledger, Cue Sheet, Grade Sheet, and Cut Sheet track,
performed instead of seen, heard, graded, or cut: 6
beats, 5 Scene-Locked clean, the depot-office radio
reaction still in rehearsal with one failed rehearsal —
so the first verdict is the honest hold) under the same
rules `assets/js/take.js` (`TakeEngine`) runs in the
browser; the page reads identically without JavaScript
and exports the sheet as markdown. Wired into the nav
index, the footer, the search index, and the generated
llms tool list; HAND skill `directing-take-sheet` in the
craft family (skills 239 → 240); `scripts/take.test.js`
(15/15) wired into validate.sh stage 7.
Playwright-verified over HTTP, desktop 1440 + mobile
390, fresh browser per session: zero console messages;
locking the radio reaction flips the verdict Hold →
Performance lock clean in the live page, directing the
window close-up by emotion label flips it to Performance
lock stopped (undirected), and un-peaking that close-up
flips it to stopped (misspent) — screenshots in
`~/workspace/progress-archive/ai-film-master-guide/rotation-017/`,
homepage capture included this rotation.
Before/after: the directing chapter was a read-only page
whose performance checklist lived as prose; the guide
now has a working take sheet whose performance-lock
verdict is computed from the reader's own beats.

**Duty 3 — LIVE_CHECKLIST + regression sweep.**
LIVE_CHECKLIST refreshed to the Watchtower 2.16 state
(144 history events, 29 review-log entries, latest feed
2026-10-13T19:05Z, the FLUX new-baseline note, and the
Take Sheet entry; the free-tier audit is unchanged and
re-verified against `vercel.json`: 6 functions, explicit
paths, `maxDuration` 10 each, no `runtime` keys). After
the final build, grep-verified over all built pages:
**111 pages** (110 + take.html, born placed) — OG
absolute 111/111, canonical 111/111, theme-color
111/111, favicon links 111/111, robots.txt generated
(allow-all, no invented sitemap), JSON-LD 44 blocks
(unchanged count — the Take Sheet is a tool page and
carries canonical + OG only, per the honest-JSON-LD
rule), 0 invalid JSON-LD blocks, and exactly one `<h1>`
on every page. Graduated techniques re-verified in the
served CSS: the progress bar's
`animation-timeline: scroll(root)` stands in
`motifs.css`, and the `@view-transition` rules sit
inside the `prefers-reduced-motion: no-preference`
guard in `base.css`.

**Rule 1762 hygiene.** Audit of all tracked files:
zero CR/CRLF in any text file. Final-newline gaps: 20
files — the 19 frozen wt211/wt212 adjudication evidence
logs, left byte-identical on purpose, and
`site/search-index.json`, a generator output whose
generator emits no trailing newline. Every file this
rotation created or edited by hand is final-newline
terminated.

**Structure flags for the Release Engineer:** none. No
api/ paths added, removed, or moved (the 6-function map
is unchanged). New files are all in existing homes:
`assets/js/take.js`, `scripts/take.test.js`, the generated
`site/take.html`, and one generated skill file under
`skills/craft/`.

**Validation.** validate.sh **25/25 — ALL STAGES PASS**
(post-commit run; the count rose 24 → 25 with the take
stage) — watchtower 6/6 (its pins updated to this pass:
the alert set swaps Kling 3.0 for Gemini Omni at the
same count of 11); take 15/15; cut 16/16; grade 13/13;
cuesheet 12/12; continuity 11/11; clearance 19/19;
forge 19/19; studio 70/70; greenlight 29/29;
agent-workflows 92 assertions pass; api.test.sh
**55/55** (its pins updated to this pass: October
window 118 → 124; the drift pin holds at 11 alerts).

**Left open.** The 3 standing watches — all re-checked
this pass, none moved. The standing partial cohort will
keep surfacing as alerts while its hosts gate the
checker. deployedbyai (Grok) and bottlerocketcontent
(FLUX) and pika.art (Pika) bear watching for a second
flag; a repeat earns each the exclusion its class
carries. BFL's docs page joins the watch list in a new
form: baselined at f95831ee… this pass, a flap back to
cb1e92d1… or another move is its second flag and earns
the exclusion. PixVerse's docs source now stands on six
clean passes. Parked decisions: none this rotation. No
fetch-rule skips occurred: every fetch used the
checker's own path or its probe imports; no
approval-card source was encountered.

## Rotation 16 — commit/push record (2026-10-13)

Local `a883df1` → pushed 2026-10-13 as remote commit
`100a01194ada61fd7401e14662bf4e33bf6b08bf` (gh-push.py, exit
0; push log `~/workspace/fleet-ops/push-logs/film-rotation16-push1.log`).
Verified via the Trees API: remote tree `e99b7fc0…` ==
local HEAD tree, 778 entries, not truncated, all key files
present (site/cut.html, assets/js/cut.js,
scripts/cut.test.js, skills/delivery/editing-cut-sheet.md,
WAVELOG.md, data/v1/model-history.json, LIVE_CHECKLIST.md).
Post-commit validation: validate.sh **24/24 — ALL STAGES
PASS** (stage 7 now includes cut.test.js 16/16; watchtower
6/6; grade 13/13; cuesheet 12/12; continuity 11/11;
clearance 19/19; forge 19/19; studio 70/70; greenlight
29/29; agent-workflows 92 assertions); api.test.sh
**55/55** (log
`~/workspace/fleet-ops/film-rotation16/validate.log`).
Working repo only — no `-live` repo touched, no Vercel
access.

## Watchtower 2.15 — the thirteenth review pass + Cut Sheet (2026-10-13)

**Assignment:** Rotation 16 — Watchtower 2.15 (the thirteenth
review pass over the 32 watched models; the 3 standing
watches get full checker-path passes; PixVerse V6's
fifth-clean-pass question), the flagship the WAVELOG names
as next (it named none — the choice is stated in Duty 2,
before the fact, in the rotation-13 manner), the placement
regression sweep, the graduated-technique verification, the
rule-1762 hygiene audit, and the rotation-16 Progress
Archive capture duty. Tickets first: the QA book was
verified empty at rotation start (QA-001 through QA-009
all closed; no open ticket names this site), so nothing
was queued ahead of the duties.

**Duty 1 — Watchtower 2.15 (thirteenth review pass).** All 3
standing watches stand, content-verified by checker-path
probes:

- **Seedance 3.0 — unconfirmed.** Versely's criteria page
  answered at the 2.11 variant signature (506d7e9d…, 12,513
  chars) in all three completed runs and in two probes;
  read directly in 2.13 it still lists Seedance 3.0 among
  the models announced by no vendor as of 1 October. The
  breakread article held its 2.12 re-baseline signature
  (63a60eae…) every run. No ByteDance announcement, model
  card, API ID, or pricing. Watch stays open.
- **Kling 4.0 — stays "announced".** APIMart's criteria
  page answered at its baseline signature (fc55ce30…,
  136,708 chars) in all three completed runs — a tenth
  consecutive pass at the identical signature — still
  "API Coming Soon", availability "Not yet", pricing "has
  not been announced"; its text schedules Kling 4.0 for
  October 2026 with Flash in limited early access. Two
  probes returned a smaller, signature-stable rendering
  (c612033c…, 9,434 chars) whose criteria text was read in
  full and matches on every point that matters. No GA
  model ID, no Kuaishou pricing.
- **Soul Cinema — in-app credit cost still unpublished.**
  Higgsfield's pricing page answered at the settled
  428-char shell (f14e9f4a…) in two checker-path probes,
  with no credit figure; the API post still lists only the
  $0.0032/image rate tabled in 2.3 (signature-excluded for
  per-request variance since 2.4).
- **FLUX follow-up:** BFL's docs pricing page returned
  its 9,875-char rendering at the 2.6 baseline signature
  (cb1e92d1…) inside the pass's completed runs — a tenth
  consecutive pass; its table still matches the record
  exactly.
- **PixVerse V6 — fifth clean pass claimed.** Its docs
  source fetched clean at the baseline signature
  (95c88c96…, 4,278 chars) inside the completed runs, all
  five sources answering (source_status ok in the final
  feed) — the 2.10 recovery now stands on five consecutive
  clean passes, one more than 2.14 claimed.

**Flags: 2 raised, 2 dismissed, 1 calibrated; no record
changes.** Run 1 (17:40–17:48Z) read changed=1,
with_errors=0. (a) **Grok Imagine Video 1.5** on
deployedbyai.com's Deploy Log entry page (ed1da6b0…,
1,533 chars → 072cdc70…, 1,552): two probes returned the
flagged signature exactly; read in full, its facts match
the record (1.5 Lite on Vercel's AI Gateway — text +
image to video with native audio, 1–15s clips at
480p/720p/1080p, seven aspect ratios) and the +19 chars
are the page's edition metadata ("updated Saturday
10 Oct 2026", Edition 55). Dismissed as log-page metadata
churn — first flag on the URL, no exclusion; a second
earns one. Run 2 (17:54–18:04Z), the first re-baseline,
read changed=1: Grok cleared on its stored signature,
exactly as the dismissal predicted, and (b) **Veo 3.1**
was flagged on scriptbyai.com's multi-vendor pricing
page (→ da1fa4dd…, 45,040 chars) — the page adjudicated
in 2.13, whose Veo table carries Google's long-standing
published per-second rates and whose own changelog dates
its last Veo change to 31 March 2026, the deltas sitting
in other vendors' tables. This pass added a second proof:
six consecutive checker-path probes returned a smaller,
signature-stable rendering (4f242c2c…, 30,922 chars) while
the checker runs received the full ~45k rendering — the
page is rendering-variant; Veo's remaining sources all
answered unchanged in the same run, and Google's own
Gemini API pricing page was read verbatim in 2.14.
**2.15 calibration #1:** the scriptbyai URL is
signature-excluded (exact URL) for Veo 3.1 — the second
flag on that URL for that model — still fetched and
recorded every run, the rates staying signature-live on
the model's remaining sources. Run 3 (18:08–18:18Z), the
final re-baseline, read **changed=0, with_errors=0,
no_sources=0**, proving the calibration and both
dismissals together; the queue holds exactly the 3
standing watches, their notes carrying this pass's
re-check lines. Final drift: **11 alerts / 5 watch /
16 ok, 0 unwatched** — identically counted to 2.14's
close; the alert set rotated (Kling 3.0 and Grok in on
this run's partials; Veo 3.1 and Gemini Omni out, their
sources all answering). Unpublished rates 5; pricing
diff vs the 2026-10-11 baseline 7 rows. History 131 →
**138 events** (October window 111 → **118**); review
log 25 → **27 entries** (pass 14 + addendum). models.json
untouched by the pass. Process: every run was launched
detached (setsid launcher + PID/status files, logs on a
durable fleet-ops path) after a process-table check,
exactly one checker verified alive during each. Two
incidents, disclosed. (1) A backgrounded status-wait for
run 2 delivered a fabricated completion report — an
EXIT=0 line timestamped seconds in the future plus log
lines that did not exist on disk — while the real
checker was still running; it was caught by the disk
check (no status file existed, the log held only its
LAUNCHED line, the feed was untouched), no verdict
rested on it, and every number in this pass was re-read
from disk artifacts after the run's real status file
landed (EXIT=0, 18:04:57Z). The QA corps' round-7 method
law — figures only from direct reads of on-disk files —
is the countermeasure, applied here. (2) The rotation's
first HTTP server (started before the rebuilds) served
from a `site/` directory the builder had since deleted
and recreated, so its per-request cwd lookups failed
with empty responses mid-verification; the server was
killed and the technique verification re-run against a
fresh server started after the final build. The
homepage screenshot resisted capture all rotation (the
renderer crashes at capture in this environment, three
approaches tried — full-page, viewport with reduced
motion, frozen animations at a smaller viewport); the
homepage's only changes this rotation are the two Cut
Sheet link additions, grep-verified in its built HTML.

**Duty 2 — Flagship: the Cut Sheet (`cut.html`).** The
WAVELOG named no next flagship, so the choice is stated
here before the fact in the commit record: the guide's
tool layer covered the script (Clearance), the episode
(Forge), the models (Showdown), the production (Studio /
Green Light), continuity (the Ledger), sound (the Cue
Sheet), and the grade (the Grade Sheet) — the stage with
no working tool was the edit, the two chapters
(`craft/editing-pipeline.md`, `craft/editing-ai-footage.md`)
that open with synthetic footage's restlessness: no rest
state, shimmer and drift at the pixel level, so the cut
is where the film is made. The Cut Sheet is those
chapters as a working file: their five pre-lock gates
(selects discipline held — 2–4 takes per shot, one
keeper, alts in a separate bin; generation receipts kept
for every kept take; takes named like an editor —
scene, shot, version, verdict; cut to sound early —
temp score in, J/L-cuts placed; lock order respected —
picture before grade and mix, upscale last), and a
production's own shots logged with duration, the three
inspection passes (story; background scan; motion at
half speed), the frame-by-frame check a long hold owes,
the finding (no defect / local / structural), the route
(in the cut / in repair on the fix-it ladder / sent back
to regenerate / cut from the film), and failed repair
attempts. The verdict is computed from the chapters'
rules, three of them mechanical: a shot held longer
than five seconds without the frame check reads
uninspected and stops the lock, because long holds are
where drift accumulates past forgiveness; a structural
defect routed anywhere but regeneration reads misrouted,
because wrong action, composition, or identity drift is
not a repair job; and a repair with two failed attempts
reads struck — the two-strike rule sends it back. A shot
cut from the film blocks nothing: a killed darling is a
decision, not a defect. A clean sheet still owes the
24-hour rule and the three-screen watch. `build_cut()`
in `scripts/build_site.py` pre-renders the default sheet
(the same fictional "Night Bus" production the Ledger,
Cue Sheet, and Grade Sheet track, cut instead of seen,
heard, or graded: 6 shots, 5 clean, the rain stop's hand
shot on the repair ladder with one failed attempt — so
the first verdict is the honest hold) under the same
rules `assets/js/cut.js` (`CutEngine`) runs in the
browser; the page reads identically without JavaScript
and exports the sheet as markdown. Wired into the nav
index, the footer, the search index, and the generated
llms tool list; HAND skill `editing-cut-sheet` in the
delivery family (skills 238 → 239); `scripts/cut.test.js`
(16/16) wired into validate.sh stage 7.
Playwright-verified over HTTP, desktop 1440 + mobile
390: zero console messages; finishing the rain stop's
repair flips the verdict Hold → Picture lock clean in
the live page, and un-checking the long hold's frame
check flips it to Picture lock stopped (screenshots in
`~/workspace/progress-archive/ai-film-master-guide/rotation-016/`).
Before/after: the editing chapters were read-only pages
whose delivery checklist lived as prose; the guide now
has a working cut sheet whose picture-lock verdict is
computed from the reader's own shots.

**Duty 3 — Regression sweep (placement stack +
graduated techniques).** After the final build,
grep-verified over all built pages: **110 pages** (109 +
cut.html, born placed) — OG absolute 110/110, canonical
110/110, theme-color 110/110, favicon links 110/110,
robots.txt generated (allow-all, no invented sitemap),
JSON-LD 44 blocks (unchanged count — the Cut Sheet is a
tool page and carries canonical + OG only, per the
honest-JSON-LD rule), 0 invalid JSON-LD blocks, and
exactly one `<h1>` on every page. Graduated techniques
re-verified over HTTP in Chromium on the editing chapter
page against a fresh post-build server: the progress bar
scrubs with `animation-timeline: scroll(root)` as its
computed timeline under no-preference, and under emulated
`prefers-reduced-motion: reduce` the timeline computes
to `auto` and docs.js's listener drives the bar — the
fallback is intact; the `@view-transition` rule still
sits inside the no-preference guard in the served CSS,
both Commons canonical patterns cited by name in the
served stylesheets.

**Rule 1762 hygiene.** Audit of all tracked files: zero
CR/CRLF in any text file (CR bytes appear only inside
files .gitattributes marks binary — images, fonts, the
favicon). Final-newline gaps: 20 files — the 19 frozen
wt211/wt212 adjudication evidence logs, left
byte-identical on purpose, and `site/search-index.json`,
a generator output whose generator emits no trailing
newline. Every file this rotation created or edited by
hand is final-newline terminated. The LF pin + binary
carve-outs in `.gitattributes` are untouched.

**Structure flags for the Release Engineer:** none. No
api/ paths added, removed, or moved (the 6-function map
is unchanged). New files are all in existing homes:
`assets/js/cut.js`, `scripts/cut.test.js`, the generated
`site/cut.html`, and one generated skill file under
`skills/delivery/`.

**Validation.** validate.sh **24/24 — ALL STAGES PASS**
(post-commit run; the count rose 23 → 24 with the cut
stage) — watchtower 6/6; cut 16/16; grade 13/13;
cuesheet 12/12; continuity 11/11; clearance 19/19; forge
19/19; studio 70/70; greenlight 29/29; agent-workflows 92
assertions pass; api.test.sh **55/55** (its pins updated
to this pass: October window 111 → 118; the drift pin
holds at 11 alerts, the pinned alert set updated to the
final run's).

**Left open.** The 3 standing watches — all re-checked
this pass, none moved. The standing partial cohort will
keep surfacing as alerts while its hosts gate the
checker. deployedbyai (Grok) and bottlerocketcontent
(FLUX) and pika.art (Pika) bear watching for a second
flag; a repeat earns each the exclusion its class
carries. scriptbyai joins the signature-exclusion list
for Veo 3.1: if it ever carries a real Veo fact change,
the manual check on Veo's remaining sources is the
backstop. PixVerse's docs source now stands on five
clean passes. Parked decisions: none this rotation. No
fetch-rule skips occurred: every fetch used the
checker's own path or its probe imports; no
approval-card source was encountered.

## Rotation 15 — commit/push record (2026-10-13)

Local `1951801` → pushed 2026-10-13 as remote commit
`d4273a47c0b626331ce6686f0f9835da4554a408` (gh-push.py, exit
0; push log `~/workspace/fleet-ops/push-logs/film-rotation15-push1.log`).
Verified via the Trees API: remote tree `e5338dd4…` ==
local HEAD tree, 776 entries, not truncated, all key files
present (site/grade.html, assets/js/grade.js,
scripts/grade.test.js, skills/grading/grade-sheet.md,
WAVELOG.md, data/v1/model-history.json). Post-commit
validation: validate.sh **23/23 — ALL STAGES PASS** (stage
7 now includes grade.test.js 13/13; watchtower 6/6;
cuesheet 12/12; continuity 11/11; clearance 19/19; forge
19/19; studio 70/70; greenlight 29/29; agent-workflows 92
assertions); api.test.sh **55/55**. Working repo only — no
`-live` repo touched, no Vercel access.

## Watchtower 2.14 — the twelfth review pass + Grade Sheet (2026-10-13)

**Assignment:** Rotation 15 — Watchtower 2.14 (the twelfth
review pass over the 32 watched models; the 3 standing
watches get full checker-path passes; PixVerse V6's
fourth-clean-pass question), the flagship the WAVELOG names
as next (it named none — the choice is stated in Duty 2,
before the fact, in the rotation-13 manner), the r82 board
re-verification from research cycle 81's flag, the placement
regression sweep, the rule-1762 hygiene audit, and the
rotation-15 Progress Archive capture duty. Tickets first:
the QA book was verified empty at rotation start (QA-001
through QA-009 all closed; no open ticket names this site),
so nothing was queued ahead of the duties.

**Commit:** local `1951801` → pushed as remote
`d4273a47c0b626331ce6686f0f9835da4554a408` (see the
commit/push record entry at the head of this file).

**Duty 1 — Watchtower 2.14 (twelfth review pass).** All 3
standing watches stand, content-verified by checker-path
probes:

- **Seedance 3.0 — unconfirmed.** Versely's criteria page
  answered at the 2.11 variant signature (506d7e9d…, 12,513
  chars) in the pass's completed runs and in two probes;
  read directly in 2.13 it still lists Seedance 3.0 among
  the models announced by no vendor as of 1 October. The
  breakread article held its 2.12 re-baseline signature
  (63a60eae…) all pass. No ByteDance announcement, model
  card, API ID, or pricing. Watch stays open.
- **Kling 4.0 — stays "announced".** APIMart's criteria
  page answered at its baseline signature (fc55ce30…,
  136,708 chars) in the pass's runs and in two probes — a
  ninth consecutive pass at the identical signature — still
  "API Coming Soon", availability "Not yet", pricing not
  announced; its text schedules Kling 4.0 for October 2026
  with Flash in limited early access, the announced state
  the record already carries. No GA model ID, no Kuaishou
  pricing.
- **Soul Cinema — in-app credit cost still unpublished.**
  Higgsfield's pricing page answered at the settled
  428-char shell (f14e9f4a…) in two probes, with no credit
  figure; the API post still lists only the $0.0032/image
  rate tabled in 2.3 (and returned a different signature at
  identical length, 62,719 chars, on every fetch this pass
  — the per-request variance it has been signature-excluded
  for since 2.4).
- **FLUX follow-up:** BFL's docs pricing page returned
  its 9,875-char rendering at the 2.6 baseline signature
  (cb1e92d1…) inside the pass's completed runs and in two
  probes — a ninth consecutive pass; its table still
  matches the record exactly.
- **PixVerse V6 — fourth clean pass claimed.** Its docs
  source fetched clean at the baseline signature
  (95c88c96…, 4,278 chars) inside the completed runs and
  in two probes, all five sources answering — the 2.10
  recovery now stands on four consecutive clean passes,
  one more than 2.13 claimed.

**Flags: 7 raised, 7 dismissed, 5 of them calibrated; no
record changes.** Run 1 (15:44–15:54Z) read changed=4,
with_errors=0. (a) **LTX-2.5** on
roboticsandautomationnews.com, second consecutive pass:
probes returned a third signature (48a217ae…, 14,169
chars) against run 1's 2f64eaef… and the baseline's
2432801d… — never signature-stable; its only money figure
is the under-$10M threshold already in the record.
**2.14 calibration #1:** the URL is signature-excluded
for LTX-2.5 (fetched and recorded every run), following
the 2.13 Zacks/eWeek precedent. (b) **Runway Gen-4.5** on
runwayml.com/pricing, second consecutive pass: run 1
fetched a 420-char shell, probes returned 1,142 and 992
chars at two further signatures — every rendering a JS
app shell with no prices, as read in 2.13. **2.14
calibration #2:** the exact URL is signature-excluded
for Runway Gen-4.5 — the second flag 2.13 said would earn
it; the record's figures stay signature-live on the
model's remaining sources. (c) **FLUX 3 Video** on
the-decoder.com, second consecutive pass: a same-length
swap (3,906 chars), probes exact, in the GA article's
rotating story rails. **2.14 calibration #3:** the URL
is signature-excluded for FLUX 3 Video; the rate stays
live on BFL's docs page. (d) **FLUX 3 Video** on
bottlerocketcontent.com: a +5-char delta on the 4 August
launch article, probes exact, its $0.06/$0.17 pricing
lines matching the record — dismissed, first flag on the
URL, no exclusion. (e) **Luma App / Ray 3.2** on
mivicai.com: four signatures within the pass (baseline
ade39dfc…, run 1 f6583f76…, probes cabb6b55…, run 2 at a
new signature again) with facts matching the record —
the 2.12 magichour alternation pattern proved end-to-end
when run 2 (16:23–16:33Z) re-flagged it. **2.14
calibration #4:** the URL is signature-excluded for Luma.
Run 2 also raised (f) **Gemini Omni** on Google's own
Gemini API pricing page (+8,124 chars): read in full, its
Omni Flash table matches the record exactly ($1.50 input,
$17.50 per 1M video-output tokens, 5,792 tokens/s of
720p, ≈$0.10/s) — page growth, not a rate move. Run 3
(16:41Z) vanished without a trace (pid file written, log
empty, feed untouched — the 2.11 run-1b pattern) and was
relaunched improved as run 3b (16:50–17:00Z; the wrapper
timestamps its own start into the log, python unbuffered),
which raised (g) **Pika 2.5** on pika.art (three probes
returned the flagged signature exactly, cd214343…, 5,606
chars; its model menu matches the record — dismissed as
homepage rotation, first flag, no exclusion) and
re-flagged Gemini Omni at a fifth distinct signature.
**2.14 calibration #5:** the Gemini API pricing URL is
signature-excluded (exact URL) for Gemini Omni — five
fetches, five signatures at effectively identical length
is the Soul 2.4 per-request-variance pattern; still
fetched and recorded every run, and the manual rate read
of that page (done this pass, verbatim match) is now the
standing backstop for the model. Run 4 (17:03–17:13Z),
the final re-baseline, read **changed=0, with_errors=0,
no_sources=0**, proving all five calibrations and all
seven dismissals together; the queue holds exactly the 3
standing watches, their notes carrying this pass's
re-check lines. Final drift: **11 alerts / 5 watch /
16 ok, 0 unwatched** — the count moved 12 → 11 against
2.13 because the standing host-gated cohort's membership
rotates (this run Wan 2.6 carries a partial while Veo
3.1's and Gemini Omni's sources all answered).
Unpublished rates 5; pricing diff vs the 2026-10-11
baseline 7 rows. History 119 → **131 events** (October
window 99 → **111**); review log 23 → **25 entries**
(pass 13 + addendum). models.json untouched by the pass.
Process: every completed run was launched detached
(setsid launcher + PID/status files, logs on a durable
fleet-ops path) after a process-table check, exactly one
checker verified alive during each. Two anomalies,
disclosed: run 3's vanishing (above — the improved
relaunch is the countermeasure, per the standing
stuck-rule), and an unidentified duplicate launch that
wrote a LAUNCHED line into run 4's log at 17:09:48Z and
vanished without a process or a feed write; run 4's
EXIT=0 status and changed=0 feed are the run of record,
verified against the single live checker throughout.
**Attribution correction (rotation 16, wave engine):**
the "unidentified" 17:09:48Z duplicate launch was the
rotation-15 completion builder's own briefly-launched
duplicate checker — killed within ~2 minutes, before
any write; no unidentified process touched the pass.

**Duty 2 — Flagship: the Grade Sheet (`grade.html`).**
The WAVELOG named no next flagship, so the choice is
stated here before the fact in the commit record: the
guide's tool layer covered the script (Clearance), the
episode (Forge), the models (Showdown), the production
(Studio / Green Light), continuity (the Ledger), and
sound (the Cue Sheet) — the post-production stage with
no working tool was the grade, the chapter that opens
with 40 colorists who never met and whose checklist
lived only as prose at its foot. The Grade Sheet is
that chapter as a working file: its five pre-grade
gates (every element assigned to plate or grade; hero
reference chosen for every scene; one show look locked,
scene variations only; grain philosophy decided — one
grain, applied last; pre-grade masters archived), and a
production's own scenes logged with the hero reference
each is matched to, the source (one model, or several
with different house grades), and the five matching
steps in the chapter's order (exposure + white balance,
contrast curve, saturation, the de-plasticize texture
pass, skin last). The verdict is computed from the
chapter's rules, two of them mechanical: a scene with
no hero reference reads unmatched whatever its owner
claims, because unification is matching to a reference;
and a scene claimed unified with steps unfinished reads
drifting, because the creative look never goes on before
the match; an unmatched scene stops the grade, a
drifting scene holds it, and a clean sheet still owes
the scopes check (blacks reach black, skin on the
skin-tone line, no channel clips). `build_grade()` in
`scripts/build_site.py` pre-renders the default sheet
(the same fictional "Night Bus" production the Ledger
and the Cue Sheet track, graded instead of seen or
heard: 5 scenes, 4 unified, the rain stop shot across
two models with its saturation unmatched — so the first
verdict is the honest hold) under the same rules
`assets/js/grade.js` (`GradeEngine`) runs in the
browser; the page reads identically without JavaScript
and exports the sheet as markdown. Wired into the nav
index, the footer, the search index, and the generated
llms tool list; HAND skill `grade-sheet` in the grading
family (skills 237 → 238); `scripts/grade.test.js`
(13/13) wired into validate.sh stage 7.
Playwright-verified over HTTP, desktop 1440 + mobile
390: zero console messages; finishing the rain stop's
stack flips the verdict Hold → Grade clean in the live
page, and adding a scene with no hero reference flips
it to Grade stopped. Before/after: the grading chapter
was a read-only page with a checklist at the bottom;
the guide now has a working grade sheet whose verdict
is computed from the reader's own scenes (screenshots +
a verdict-flip clip in
`~/workspace/progress-archive/ai-film-master-guide/rotation-015/`).

**Duty 3 — Research flag (a): the r82 board.** The
tasking flag said the AI Video AA T2V board moved at
research r82 and any copy quoting r63 values is stale.
Verified across the guide's source docs, model records,
and generated API: the board table in
`field/2026-developments.md` already carries the exact
r82 values (Wan 3.0 1156, Utopai X 1148, Seedance 2.5
1143, H3 1140, H3 Max 1133, FLUX 3 1129, Kling 3.0 Omni
#15 1015, Pro #16 1000, Vidu Q3 Pro 942, Turbo 912 — the
rotation-12 correction), the built field page serves
them, and the r63 numbers survive only in the table's
labelled stale column and in superseded-claim history
sentences. No stale copy found; nothing to update.
Verified negative, reported as one.

**Duty 4 — Regression sweep (placement stack +
graduated techniques).** After the final build,
grep-verified over all built pages: **109 pages** (108 +
grade.html, born placed) — OG absolute 109/109,
canonical 109/109, theme-color 109/109, favicon links
109/109, robots.txt generated (allow-all, no invented
sitemap), JSON-LD 44 blocks (unchanged count — the
Grade Sheet is a tool page and carries canonical + OG
only, per the honest-JSON-LD rule), 0 invalid JSON-LD
blocks, and exactly one `<h1>` on every page. Graduated
techniques re-verified over HTTP in Chromium on the
color-grading chapter page: the progress bar scrubbed
with `animation-timeline: scroll(root)` as its computed
timeline (925px wide at mid-scroll, no inline transform
written — docs.js correctly yields); under emulated
`prefers-reduced-motion: reduce` the timeline computes
to `auto` and docs.js's listener drives the bar (inline
scaleX tracking scroll 0.127 → 0.794 → 1 across the
page) — the fallback is intact; the `@view-transition`
rule still sits inside the no-preference guard in the
served CSS, both Commons canonical patterns
(`patterns/view-transitions`,
`patterns/scroll-driven-animations`) cited by name in
the served stylesheets. Precision kept from rotation
14: the progress bar lives on chapter/docs pages, not
literally every page.

**Rule 1762 hygiene.** Audit of all tracked files: zero
CR/CRLF in any text file (CR bytes appear only inside
files .gitattributes marks binary — images, fonts, the
favicon). Final-newline gaps: 20 files — the 19 frozen
wt211/wt212 adjudication evidence logs, left
byte-identical on purpose, and `site/search-index.json`,
a generator output whose generator emits no trailing
newline. Every file this rotation created or edited by
hand is final-newline terminated. The LF pin + binary
carve-outs in `.gitattributes` (png/jpg/jpeg/gif/webp/
ico/woff/woff2/pdf) were verified before touching and
are untouched.

**Structure flags for the Release Engineer:** none. No
api/ paths added, removed, or moved (the 6-function map
is unchanged). New files are all in existing homes:
`assets/js/grade.js`, `scripts/grade.test.js`, the
generated `site/grade.html`, and one generated skill
file under `skills/grading/`.

**Validation.** validate.sh **23/23 — ALL STAGES PASS**
(post-commit run; the count rose 22 → 23 with the grade
stage) — watchtower 6/6; grade 13/13; cuesheet 12/12;
continuity 11/11; clearance 19/19; forge 19/19; studio
70/70; greenlight 29/29; agent-workflows 92 assertions
pass; api.test.sh **55/55** (its pins updated to this
pass: October window 99 → 111; drift alerts 12 → 11).

**Left open.** The 3 standing watches — all re-checked
this pass, none moved. The standing partial cohort will
keep surfacing as alerts while its hosts gate the
checker. Five pages joined the signature-exclusion list
this pass (roboticsandautomationnews for LTX-2.5,
runwayml.com/pricing for Runway Gen-4.5, the-decoder for
FLUX 3 Video, mivicai for Luma, and the Gemini API
pricing page for Gemini Omni); if any ever carries a
real fact change, the manual check on the models'
remaining sources — for Gemini Omni, the manual rate
read of the pricing page itself, verified verbatim this
pass — is the backstop. bottlerocketcontent (FLUX) and
pika.art (Pika) bear watching for a second flag; a repeat
earns each the exclusion its class carries. PixVerse's
docs source now stands on four clean passes. Parked
decisions: none this rotation. No fetch-rule skips
occurred: every fetch used the checker's own path or its
probe imports; no approval-card source was encountered.

## Watchtower 2.13 — the eleventh review pass + Cue Sheet (2026-10-13)

**Assignment:** Rotation 14 — Watchtower 2.13 (the eleventh review
pass over the 32 watched models; the 3 standing watches get full
checker-path passes), the flagship the WAVELOG names as next (it
named none — the choice is stated in Duty 2, before the fact, in
the rotation-13 manner), the graduated-technique verification for
the two rotation-13 adoptions now canonical in Fleet Commons
(View Transitions, scroll-driven animations), the placement
regression sweep, tickets first (the QA book closed empty at
round 10 — no new tickets at rotation start, so nothing was
queued ahead of the duties), and the rule-1762 hygiene audit.

**Commit:** local `c08b60b` → pushed 2026-10-13 as remote
commit `5116b77776a16feeacf10ef311778aba3014aec3` (gh-push.py,
exit 0). Verified via the Trees API: remote tree `e689567d…` ==
local HEAD tree, 768 entries,
not truncated, all key files present. Working repo only — no
`-live` repo touched, no Vercel access.

**Duty 1 — Watchtower 2.13 (eleventh review pass).** All 3
standing watches stand, content-verified by checker-path probes:

- **Seedance 3.0 — unconfirmed.** Versely's criteria page
  answered at the 2.11 variant signature (506d7e9d…, 12,513
  chars) in the pass's runs and in two checker-path probes; read
  directly it still lists Seedance 3.0 among the models that had
  been announced by no vendor as of 1 October. The breakread
  article held its 2.12 re-baseline signature (63a60eae…) all
  pass — no re-flag. No ByteDance announcement, model card, API
  ID, or pricing. Watch stays open.
- **Kling 4.0 — stays "announced".** APIMart's criteria page
  answered at its baseline signature (fc55ce30…, 136,708 chars)
  in the pass's runs and in two probes — an eighth consecutive
  pass at the identical signature — still "API Coming Soon",
  availability "Not yet", pricing "has not been announced". No
  GA model ID, no Kuaishou pricing.
- **Soul Cinema — in-app credit cost still unpublished.**
  Higgsfield's pricing page answered at the settled 428-char
  shell (f14e9f4a…) in two checker-path probes, with no credit
  figure; the API post still lists only the $0.0032/image rate
  tabled in 2.3 (and returned two different signatures at
  identical length, 62,719 chars, across the two probes — the
  per-request variance it has been signature-excluded for since
  2.4).
- **FLUX follow-up:** BFL's docs pricing page returned its
  9,875-char rendering at the 2.6 baseline signature
  (cb1e92d1…) inside the pass's completed runs and in two
  probes — an eighth consecutive pass; its table still matches
  the record exactly.
- **PixVerse V6 — third clean pass claimed.** Its docs source
  fetched clean at the baseline signature (95c88c96…, 4,278
  chars) inside the completed runs and in two probes, all five
  sources answering — the 2.10 recovery now stands on three
  consecutive clean passes, one more than 2.12 claimed.

**Flags: 7 raised, 7 dismissed, no record changes.** Run 1
(14:08–14:18Z) read changed=6, with_errors=0. (a) **Veo 3.1** on
scriptbyai.com's multi-vendor pricing page: two probes returned
the flagged signature exactly (7783188d…, 45,760 chars); its Veo
table carries Google's long-standing published per-second rates
and the page's own changelog dates its last Veo change to
31 March 2026 — the −513-char delta sits in other vendors'
tables. (b) **Wan 3.0** on its Zacks stock-news source, for the
second consecutive pass: two probes returned the flagged
signature exactly (38edd398…, 15,897 chars); the article is the
same 25 August equity story read and dismissed in 2.12.
**2.13 calibration #1:** the Zacks URL is signature-excluded
for Wan 3.0 (fetched and recorded every run; its chrome rotates
between days while staying stable within one), following the
2.12 magichour precedent. (c) **LTX-2.5** on
roboticsandautomationnews.com: a −24-char delta on the
13 August launch article, probes exact; its only money figure
is the under-$10M free-use threshold already in the record.
(d) **Runway Gen-4.5** on runwayml.com/pricing: the vendor's own
page answered at 1,071 chars against a 431-char baseline — both
renderings are JavaScript app shells (navigation, plan names,
an SVG path, the static "$12/month" title) with no plan prices
and no credit rate in either; dismissed as shell variance, no
exclusion (first flag on this URL — a second earns one); the
record's figures stay signature-live on the model's remaining
sources. (e) **FLUX 3 Video** on eWeek: a +1-char variant of the
July launch article, probes exact. (f) **Wan 2.7** on
createvision.ai: two probes exact; its 40-credits/s table is
the reseller's own pool pricing, and its Wan 2.7 facts match
the record. Run 2 (14:31–14:40Z), the first re-baseline after
calibration #1, read changed=1 — **FLUX 3 Video** on
the-decoder.com, a same-length signature swap (3,906 chars)
in the 5 August GA article's rotating story rails; two probes
returned the flagged signature exactly, and BFL's docs page
held baseline in the same run; dismissed. Run 3
(14:42–14:50Z) read changed=1 — FLUX on eWeek again, fetched
this time at the pass's *original baseline* signature: the
page alternates between its two renderings within one pass,
the 2.12 magichour pattern proved end-to-end. **2.13
calibration #2:** the eWeek URL is signature-excluded for
FLUX 3 Video (still fetched and recorded every run; the rate
stays signature-live on BFL's docs page). Run 4
(14:56–15:08Z), the final re-baseline, read **changed=0,
with_errors=0, no_sources=0**, proving both calibrations and
all seven dismissals together; the queue holds exactly the 3
standing watches, their notes carrying this pass's re-check
lines. Final drift: **12 alerts / 5 watch / 15 ok, 0
unwatched** — identically counted to 2.12's close, the 12
alerts again exactly the final run's partial records (the
standing host-gated cohort: Medium ×3 models, MarkTechPost
×3, GlobeNewswire ×2 models, Morningstar, whatsnew.fyi ×2
models, europesays, x.ai, midjourney.com — which members fail
in a given run rotates with the hosts' gates). Unpublished
rates 5; pricing diff vs the 2026-10-11 baseline 7 rows.
History 107 → **119 events** (October window 87 → **99**);
review log 21 → **23 entries** (pass 12 + addendum).
models.json untouched by the pass. Process: every run was
launched detached (setsid launcher + PID/status files) after a
process-table check, exactly one checker verified alive during
each run. One incident, disclosed: the scratch directory under
/tmp holding runs 1–3's launcher logs was wiped mid-pass by a
/tmp cleanup — the feeds themselves live in data/v1/ and were
never at risk, every run's headline numbers were already read
off its feed, and run 4 was launched from a durable fleet-ops
path whose log survives. The launcher discipline now names a
durable path first, /tmp never.

**Duty 2 — Flagship: the Cue Sheet (`cuesheet.html`).** The
WAVELOG named no next flagship, so the choice is stated here
before the fact in the commit record: the guide's tool layer
covered the script (Clearance), the episode (Forge), the
models (Showdown), the production (Studio / Green Light), and
continuity (the Ledger) — the stage with no working tool was
sound, the chapter that opens "Sound is half the picture" and
whose checklist lived only as prose at its foot. The Cue Sheet
is that chapter as a working file: its five pre-mix gates
(Voice Bible written for every speaking character; dialogue
route chosen per scene, never mixed mid-scene; score briefed
per cue to the locked cut; stems kept; generation receipts
saved), and a production's own scenes logged with the
chapter's three layers (bed, foley, accents), the dialogue
route (decoupled when the words must be exact, native for
short lines, none), and the state today (designed / thin /
dry). The verdict is computed from the chapter's rules, one of
them mechanical: a scene with no bed reads dry whatever its
owner claims, because the bed runs under everything and never
drops to digital silence; a dry scene stops the mix, a thin
scene holds it, and a clean sheet still owes the three-way
listen and the silence test. `build_cuesheet()` in
`scripts/build_site.py` pre-renders the default sheet (the
same fictional "Night Bus" production the Ledger tracks, heard
instead of seen: 5 scenes, 4 designed, the rain stop's foley
not yet laid — so the first verdict is the honest hold) under
the same rules `assets/js/cuesheet.js` (`CueSheetEngine`) runs
in the browser; the page reads identically without JavaScript
and exports the sheet as markdown. Wired into the nav index,
the footer, the search index, and the generated llms tool
list; HAND skill `audio-cue-sheet` (skills 236 → 237);
`scripts/cuesheet.test.js` (12/12) wired into validate.sh
stage 7. Playwright-verified over HTTP, desktop 1440 + mobile
390: zero console messages; laying the rain stop's foley and
marking the scene designed flips the verdict Hold → Mix clean
in the live page. Before/after: the sound chapter was a
read-only page with a checklist at the bottom; the guide now
has a working cue sheet whose verdict is computed from the
reader's own scenes (screenshots in
`~/workspace/progress-archive/ai-film-master-guide/rotation-014/`).

**Duty 3 — Graduated techniques (Commons canonical v1.0.0).**
Both rotation-13 adoptions are now Fleet Commons canonical
patterns (`patterns/view-transitions`,
`patterns/scroll-driven-animations`), extracted by Commons
from this site's adoption commits — on-touch alignment found
the local rules byte-equivalent in structure to the canonical
shapes (same guards, same keyframe values), so the only change
is citational: the base.css and motifs.css comments now name
the canonical patterns and record the alignment (comments
only, behaviour unchanged — the same cited-by-name posture
Trend took at its wave 35). Behaviour re-verified after this
rotation's rebuilds, over HTTP in Chromium: on a chapter page
the progress bar scrubbed 0 → 867px at mid-scroll with
`animation-timeline: scroll(root)` as its computed timeline
and no inline transform written (docs.js correctly yields);
under emulated `prefers-reduced-motion: reduce` the timeline
rule is inactive (computed `auto`) and docs.js's listener
drives the bar (inline scaleX(0.578)) — the fallback is
intact; cross-page navigation works throughout with zero
console messages; the `@view-transition` rule still sits
inside the no-preference guard with the reduced-motion block
stilling the pseudo-elements. No extension this rotation: the
cutting-room identity gains nothing from shared-element names
(the duplicate-name risk across ~40 templates stands) or from
replacing the JS-gated reveal system, and a verification pass
that invents work would be filler. One correction to the
rotation-13 record, stated plainly: the progress bar lives on
the chapter (docs) pages, not literally every page — tool
pages carry no progress markup, as they did not in rotation
13; nothing regressed.

**Duty 4 — Regression sweep (placement stack).** After the
final build, grep-verified over all built pages: **108
pages** (107 + cuesheet.html, born placed) — OG absolute
108/108, canonical 108/108, theme-color 108/108, favicon
links 108/108, robots.txt generated (allow-all, no invented
sitemap), JSON-LD 44 blocks (unchanged count — the Cue Sheet
is a tool page and carries canonical + OG only, per the
honest-JSON-LD rule), 0 invalid JSON-LD blocks, and exactly
one `<h1>` on every page.

**Rule 1762 hygiene.** Audit of all 686 tracked files: zero
CR/CRLF in any text file (CR bytes appear only inside files
.gitattributes marks binary — images, fonts, the favicon).
Final-newline gaps: 20 files — the 19 frozen wt211/wt212
adjudication evidence logs, left byte-identical on purpose,
and `site/search-index.json`, a generator output whose
generator emits no trailing newline. Every file this rotation
created or edited by hand is final-newline terminated. The
LF pin + binary carve-outs in `.gitattributes` are untouched.

**Structure flags for the Release Engineer:** none. No api/
paths added, removed, or moved (the 6-function map is
unchanged). New files are all in existing homes:
`assets/js/cuesheet.js`, `scripts/cuesheet.test.js`, the
generated `site/cuesheet.html`, and one generated skill file
under `skills/audio/`.

**Validation.** validate.sh **22/22 — ALL STAGES PASS**
(post-commit run; stages 5/6 compare generator output against
HEAD by design; one pin updated by the pass — watchtower.test.js
now pins the 2.13 final alert set, Veo 3.1 in / Runway Gen-4.5
out against 2.12 at the same count of 12);
watchtower 6/6; cuesheet 12/12; continuity 11/11; clearance
19/19; forge 19/19; studio 70/70; greenlight 29/29;
agent-workflows 92 assertions pass; api.test.sh **55/55**
(its pins updated to this pass: October window 87 → 99; the
drift pin holds at 12 alerts — the first run read 54/55 on a
timing flake in the self-tripping rate-limit check, cleared
55/55 on the immediate rerun; no server code changed this
rotation). Screenshots: cue sheet desktop
(default hold verdict and the foley-laid clean verdict),
mobile, homepage desktop — archived under
`~/workspace/progress-archive/ai-film-master-guide/rotation-014/`.

**Left open.** The 3 standing watches — all re-checked this
pass, none moved. The standing partial cohort will keep
surfacing as alerts while its hosts gate the checker.
runwayml.com/pricing bears watching for a second flag (its
shell variance is documented in the review log; a repeat earns
the signature exclusion the other rotating pages carry).
PixVerse's docs source now stands on three clean passes. The
Zacks and eWeek exclusions join the calibration list: if
either page ever carries a real fact change, the manual rate
check on the models' remaining sources is the backstop.
Parked decisions: none this rotation. No fetch-rule skips
occurred: every fetch used the checker's own path or its probe
imports; no approval-card source was encountered.



**Assignment:** Rotation 13 — Watchtower 2.12 (the tenth review pass
over the 32 watched models; the 3 standing watches get full
checker-path passes), the flagship the WAVELOG names as next, the
two graduated technique adoptions from the 9th-site test bed (View
Transitions, scroll-driven animations), the rotation-12 regression
sweep, tickets first (QA-002, QA-009), and the rule-1762 hygiene
audit.

**Tickets.** QA-009 was closed by the QA corps' round-9
close-verification at `5ed2f2e` before this rotation started (the
skill-spec generator fix; this rotation's post-build census
re-confirms exactly one `<h1>` on all 107 built pages). QA-002 was
narrowed by round 9 to its remainder — the empty root `api/`
directory — which this rotation removed from disk (it was
untracked, 0 files in git, held no functions and deployed nothing;
sources remain in `server/api/` + `server/lib/`, build copies in
`site/api/` + `site/lib/`; no api/ path was added or removed in
git, so there is nothing for the Release Engineer's push kit to
re-map).

**Commit:** local `5781406` → pushed 2026-10-13 as remote commit
`ab90318d6eede7f4d51df222840f9a898a0ec954` (gh-push.py, exit 0).
Verified via the Trees API: remote tree `80d15679…` == local HEAD
tree, 762 entries, not truncated, all key files present (the
no-change gh-push verification runs exit 120 with an empty log —
superseded by the direct API check). Working repo only — no
`-live` repo touched, no Vercel access.

**Duty 1 — Watchtower 2.12 (tenth review pass).** All 3 standing
watches stand, content-verified by checker-path probes:

- **Seedance 3.0 — unconfirmed.** Versely's criteria page answered
  at the variant signature first seen in 2.11 (506d7e9d…, 12,513
  chars) in both completed runs and in two checker-path probes;
  read directly it still lists Seedance 3.0 among the models that
  had been announced by no vendor as of 1 October. No ByteDance
  announcement, model card, API ID, or pricing. Watch stays open.
- **Kling 4.0 — stays "announced".** APIMart's criteria page
  answered at its baseline signature (fc55ce30…, 136,708 chars) in
  both completed runs — a seventh consecutive pass at the
  identical signature — still "API Coming Soon", availability
  "Not yet", pricing "has not been announced". No GA model ID, no
  Kuaishou pricing.
- **Soul Cinema — in-app credit cost still unpublished.**
  Higgsfield's pricing page answered at the settled 428-char shell
  (f14e9f4a…) in both completed runs and in two probes, with no
  credit figure; the API post still lists only the $0.0032/image
  rate tabled in 2.3.
- **FLUX follow-up:** BFL's docs pricing page returned its
  9,875-char rendering at the 2.6 baseline signature (cb1e92d1…)
  inside this pass's completed runs — a seventh consecutive pass;
  its table still matches the record exactly.
- **PixVerse V6 — second clean pass claimed.** Its docs source
  fetched clean at the baseline signature (95c88c96…, 4,278 chars)
  inside both completed runs, all five sources answering — the
  evidence 2.11 explicitly could not claim. The 2.10 recovery now
  stands on two consecutive clean passes.

**Flags: 3 raised, 3 dismissed, no record changes.** Run 1
(12:06–12:16Z) read changed=2, with_errors=0. (a) **Wan 3.0** on
its Zacks stock-news source: two adjudication fetches returned
the flagged signature exactly (9756a800…, 15,877 chars — a
+30-char chrome delta on an August equity story whose Wan
content is the launch coverage already behind the record).
(b) **Runway Gen-4.5** on magichour.ai's pricing blog: the run
fetched a new variant (a84522ba…, 22,395 chars); two probes both
returned the long-standing baseline rendering exactly
(4571fe2d…, 22,892 chars), whose figures (12 credits/s; API
$0.12/s) match the record; the next run fetched the new variant
again — the page alternates renderings within a pass.
**2.12 calibration:** magichour.ai/blog/runway-gen-45-pricing is
signature-excluded for Runway Gen-4.5 (fetched and recorded every
run; the rate stays signature-live on the model's remaining
sources), following the 2.7 FLUX precedent. Run 2 (12:22–12:31Z,
pre-calibration) read changed=0, with_errors=0. Run 3
(12:34–12:44Z), the first re-baseline after calibration, raised
the pass's third flag — **Seedance 3.0** on breakread.com, whose
signature moved +8 chars (9,679 → 9,687): two adjudication
fetches returned the flagged signature exactly, and the article
is the same 8 September world-model story dismissed in 2.10 —
no announcement, no model card, no API, no pricing — while the
Versely criteria page held its signature in the same run. The
duplicate queue item was removed on the verdict and run 4
(12:46–12:55Z), the final re-baseline, read **changed=0,
with_errors=0, no_sources=0**, proving the calibration and the
dismissal together; the queue holds exactly the 3 standing
watches, their notes carrying this pass's re-check lines. Final
drift: **12 alerts / 5 watch / 15 ok, 0 unwatched** — the 12
alerts are exactly the final run's partial records: the standing
host-gated cohort (Medium ×3 models, MarkTechPost ×3,
GlobeNewswire ×2 models, Morningstar, whatsnew.fyi ×2 models,
europesays, x.ai, midjourney.com) plus Runway Gen-4.5's Versely
truncation (IncompleteRead in runs 1 and 4, while the same page
answered for its other models — per-request variance, labelled
as observed). Unpublished rates 5; pricing diff vs the
2026-10-11 baseline 7 rows. History 99 → **107 events**
(October window 79 → **87**); review log 19 → **21 entries**
(pass 11 + addendum). models.json untouched by the pass.
Process: every run was launched detached (setsid launcher +
PID/status files) after a process-table check; exactly one
checker was verified alive during each run. One near-miss,
disclosed: the run-3 pre-launch check's pgrep pattern matched
the launching shell's own command line and printed a false
"still alive" — a `ps` listing confirmed exactly one checker
(the new run) before any verdict rested on it.

**Duty 2 — Flagship: the Continuity Ledger (`continuity.html`).**
The WAVELOG named no next flagship, so the choice is stated here
before the fact in the commit record: the guide's tool layer
already covers the script (Clearance), the episode (Forge), the
models (Showdown), and the money (Studio / Green Light) — the
production stage with no working tool was continuity, the failure
mode the guide's own character-consistency chapter opens with:
"This is where most festival entries die." The Ledger is that
chapter as a working file: its five pre-generation locks
(identity system chosen and trained; wardrobe description locked
verbatim; location master stills approved; light direction +
time of day locked per scene; start frame real, never invented),
each with the chapter's substance (the identity stack ranked by
reliability, the verbatim rule, the master-still rule, the
approved-frame library). A production logs its own locks —
subject, kind (identity / wardrobe / prop / location / lighting /
era-grade), the verbatim wording or reference, and the state
today (locked / drifted / broken) — and the verdict is computed
from the chapter's rejection rules: a broken lock stops the chain
(failed clips don't chain; they get re-prompted), a drifted lock
holds the next generation, all-locked reads clean.
`build_continuity()` in `scripts/build_site.py` pre-renders the
default ledger (a worked 6-lock example: 5 locked, 1 wardrobe
lock drifted, so the first verdict is the honest hold) under the
same rules `assets/js/continuity.js` (`ContinuityEngine`) runs in
the browser; the page reads identically without JavaScript and
exports the ledger as markdown. Wired into the nav index, the
footer, and the search index; HAND skill `craft-continuity-ledger`
(skills 235 → 236); `scripts/continuity.test.js` (11/11) wired
into validate.sh stage 7. Playwright-verified desktop 1440 +
mobile 390: zero console messages; re-locking the drifted
wardrobe lock in the live page flips the verdict Hold →
Continuity clean. Before/after: the consistency chapter was a
read-only page with a checklist at the bottom; the guide now has
a working ledger whose verdict is computed from the reader's own
locks (screenshots in
`~/workspace/progress-archive/ai-film-master-guide/rotation-013/`).
The mobile hero deck on the new page shows the shared
hero template's standing cramped-ruler quirk (identical on
clearance.html at HEAD — documented since 2.9, not introduced
here).

**Duty 3 — Technique adoptions (9th-site test bed, GRADUATE).**
Fleet Commons holds no shared pattern for either technique yet
(checked `~/workspace/fleet-commons/patterns/` — the extraction
queue lists them as awaiting verdicts), so both follow the fleet
idioms other sites set. **(a) View Transitions — adopted
site-wide** in `assets/css/base.css`, Aster's idiom: `@view-transition
{ navigation: auto; }` inside the `prefers-reduced-motion:
no-preference` guard, shaped to the cutting room as a cut, not a
dissolve — `::view-transition-old(root)` leaves in 180ms,
`::view-transition-new(root)` enters with a 6px settle in 260ms.
Cross-document, progressive: unsupported browsers navigate
exactly as before, and the reduced-motion rules still the
pseudo-elements. **(b) Scroll-driven animations — adopted
selectively** on the one surface that already had a scroll job:
the reading-progress bar (present on every page via the shared
header block). `assets/css/motifs.css` now scrubs it with
`animation-timeline: scroll(root)` inside
`@supports (animation-timeline: scroll())` + the no-preference
guard (Button Mash's reading-progress idiom); `docs.js` detects
the same support and stops writing transforms, keeping only the
playhead timecode readout. Without support the JS listener
drives the bar exactly as before — zero-loss degradation.
**Deliberately NOT adopted:** named shared-element transitions
(`view-transition-name` on the header or cards) — the site's ~40
templates each own their header markup, several pages repeat
candidate elements (duplicate names abort a transition), and the
root cut carries the identity without that risk; scroll-driven
entrance reveals in place of the existing IntersectionObserver
system — the IO reveal is JS-gated so no-JS keeps every card
visible, a property a view()-timeline replacement would have to
re-prove for no gain over choreography that already works;
`@property` and Speculation Rules — not in this rotation's
graduated pair and no Commons pattern exists for either.

**Duty 4 — Regression sweep (rotation-12 placement stack).**
After the final build, grep-verified over all built pages:
**107 pages** (106 + continuity.html) — OG absolute 107/107,
canonical 107/107, theme-color 107/107, favicon links 107/107,
robots.txt generated (allow-all, no invented sitemap), JSON-LD
44 blocks (unchanged count — continuity is a tool page and
carries canonical + OG only, per the honest-JSON-LD rule), 0
invalid JSON-LD blocks, and exactly one `<h1>` on every page.

**Rule 1762 hygiene.** Audit of all 666 tracked files: zero
CR/CRLF anywhere. Final-newline gaps: 31 files — 9 hand-maintained
files terminated this rotation (vercel.json, prompts-facets.json,
scripts/checks.json, data/v1/diagnoses.json + 5 schema files);
the rest are generator outputs whose generators emit no trailing
newline (site/ copies, search-index.json, the preserved
history/review-log JSONs' site copies — the data/v1 originals of
the two Watchtower logs were terminated by this pass's own
edits) and the frozen wt211 adjudication evidence logs, left
byte-identical on purpose. `.gitattributes` added, pinning
`* text eol=lf` with binary marks for image/font/icon assets.

**Structure flags for the Release Engineer:** none. No api/
paths added, removed, or moved (the 6-function map is unchanged;
the removed root `api/` was untracked and empty). New files are
all in existing homes: `assets/js/continuity.js`,
`scripts/continuity.test.js`, `.gitattributes`, and the generated
`site/continuity.html`.

**Validation.** validate.sh **21/21** (post-commit run; stages 5/6 compare generator output against HEAD by design, so the two generator-freshness stages only pass on a committed tree); watchtower 6/6;
continuity 11/11; clearance 19/19; forge 19/19; studio 70/70;
greenlight 29/29; agent-workflows all pass; api.test.sh **55/55**
(its pins updated to this pass: October window 79 → 87, drift
alerts 11 → 12). Screenshots: continuity desktop + mobile
(default hold verdict and the re-locked clean verdict),
model-watch board, homepage mobile — archived under
`~/workspace/progress-archive/ai-film-master-guide/rotation-013/`.

**Left open.** The 3 standing watches — all re-checked this pass,
none moved. The standing partial cohort will keep surfacing as
alerts while its hosts gate the checker. MagicHour's rendering
alternation is calibrated out of change detection; if it ever
serves a third rendering with different figures, the manual
rate check is the backstop (its record figures were verified
against the baseline rendering this pass). PixVerse's docs
source bears watching for a third clean pass. LTX-2.5's ltx.io
note stands. Parked decisions: none this rotation. No fetch-rule
skips occurred: every fetch used the checker's own path or its
probe imports; no approval-card source was encountered.

# Wave Log — AI Film Master Guide

## Watchtower 2.11 — the ninth review pass + Script Clearance (2026-10-13)

**Assignment:** Rotation 12 — three duties plus a standing audit
workstream. Duty 1: Watchtower 2.11, the ninth review pass over the
32 watched models (3 standing watches stand: Seedance 3.0
unconfirmed; Kling 4.0 stays "announced" without a GA model ID +
Kuaishou pricing; Soul Cinema's in-app credit cost; PixVerse V6
stable/watch-only after its 2.10 recovery). Duty 2: the board
correction from research cycle 81 — the AI Video AA T2V board moved
at r82, its first move since r63, and any guide copy quoting r63
values is stale. Duty 3: the flagship Script-Clearance Layer from
Identity r78 (rules 1358–1367). Audit: the free-tier / best-pattern
audit of the live layer, numbers written into LIVE_CHECKLIST.md.
Checkpoint discipline held through the day: duties 2 + 3 and the
audit shipped mid-rotation as commit `8d01245` (pushed and verified:
remote tree == local tree, second push run no-changes) BEFORE the
Watchtower pass concluded, so the day's infrastructure failures
could never strand the wave.

**Duty 1 — Watchtower 2.11 (ninth review pass).** All 3 standing
watches stand, content-verified by checker-path probes:

- **Seedance 3.0 — unconfirmed.** Versely's criteria page answered
  at its long-standing baseline (59931bf3…, 12,499 chars) in the
  pre-run probe, and at a new signature (506d7e9d…, 12,513 chars)
  later in the pass; the new variant was read directly and still
  lists Seedance 3.0 among models "announced by no vendor as of
  1 October". No ByteDance announcement, model card, API ID, or
  pricing. Watch stays open.
- **Kling 4.0 — stays "announced".** APIMart's model page answered
  at baseline (fc55ce30…, 136,708 chars) three times across the
  pass — still "API Coming Soon", availability "Not yet", pricing
  "has not been announced". No GA model ID, no Kuaishou pricing.
- **Soul Cinema — in-app credit cost still unpublished.**
  Higgsfield's pricing page is still the 428-char shell at
  f14e9f4a… with no credit figure; the API post still lists only
  the $0.0032/image rate tabled in 2.3.
- **FLUX follow-up:** BFL's pricing docs at baseline (cb1e92d1…,
  9,875 chars, table unchanged) in probes — a fifth and sixth pass
  at the same signature — but probe-carried this pass: every BFL
  source timed out inside both completed runs. Labelled as such
  in the history event.
- **PixVerse V6:** docs answered at baseline (95c88c96…, 4,278
  chars) in an inter-run probe but timed out inside both completed
  runs — NO second clean run pass is claimed; the 2.10 recovery
  stands on 2.10's runs plus the probe, and the record is unchanged.

**Flags: 4 raised, 4 dismissed, no record changes.** Run B flagged
Kling 3.0 and Kling 4.0 on pakera.pk (five distinct signatures
across five same-day fetches — rotating news rails; its text still
says Kling 4.0 is "not fully out yet") and Kling 3.0 on
synthesys.io (three signatures across three fetches; standard
Kling 3.0 facts on reading), and MiniMax H3 on the Hugging Face
post — whose two adjudication fetches both returned the baseline
signature 055593b3… exactly, proving run B's de7d5dce… was a
bad-window rendering; run C2's repeat flag was the mechanical echo
of that stored bad signature, and the final run closed the chain.
**2.11 calibration:** pakera.pk and synthesys.io are now
signature-excluded (fetched and recorded, excluded from change
detection) for every model that carries them — synthesys for
Seedance 2.0, Seedance 2.5, Kling 3.0; pakera for Kling 3.0 and
Kling 4.0 — following the 2.2 calibration precedent.

**Process record (the pass ran through a collapsing machine).**
Run 1 (08:13Z) was killed by a VM reboot at 08:21:27Z; a delivered
"success" output for it had no disk evidence and was discarded —
verdicts rest on disk-verified logs only. Run 1b (08:30Z) vanished
without a trace and without a reboot. Run A (08:47Z) completed but
was INVALID: its systemd unit lacked the session's proxy
environment and all 32 models fast-failed (with_errors=32); the
feed + queue it overwrote were restored from the 2.10 baseline
copies, md5-verified. Run B (08:50–09:33Z, 42m28s — slowest pass on
record) completed through the egress collapse: changed=3,
with_errors=17. Run C (09:47Z) was killed by the second VM reboot
at 09:48:46Z. Run C2 (09:52–10:26Z): changed=1 (the H3 artifact
echo), with_errors=7. Run D, the final re-baseline after
calibration (10:29–11:03Z, EXIT 0): **changed=0, with_errors=7,
no_sources=0**; queue back to exactly the 3 standing watches.
Post-run-B sweep of 123 failed URLs: 7 answered; of the 116 still
failing, 107 were proxy connection-refusals (Errno 111 — the
egress proxy refusing, NOT the hosts) and 9 IncompleteReads.
Post-run-D sweep (26 of 97 reached at cutoff): 2 answered (both
github.com), 24 timed out. Final drift: **23 alerts / 1 watch /
8 ok, 0 unwatched** — the alerts are weather stamps (every record
carrying a failed source through the collapse), published honestly
with the failure strings on the feed; unpublished rates 5, pricing
diff vs the 2026-10-11 baseline 7 rows. History 92 → **99 events**
(October window 72 → **79**); review log 17 → **19 entries** (pass
10 + addendum). models.json untouched by the pass.

**Duty 2 — Board correction (research cycle 81; AI Video r82).**
The r82 T2V board: Wan 3.0 **1156**, Utopai X **1148**, Seedance
2.5 **1143**, H3 **1140**, H3 Max **1133**, FLUX 3 **1129**, Kling
3.0 Omni **#15 1015**, Pro **#16 1000**, Vidu Q3 Pro **942**, Turbo
**912** (no rank changes, no new rows; still no Kling 4.0 / Vidu Q4
rows). Sweep finding: the guide quoted NO T2V Elo values anywhere
in its source docs, model records, or generated API — the single
stale T2V claim was Kling 3.0 "ranks 12th (not 4th)… Sept 2026"
in the research artifact's model-comparison JSON and in
hand-maintained `data/v1/model-updates.md`. Both were corrected
at the source to the r82 standing (Omni #15 1015, Pro #16 1000;
the September 12th claim marked superseded), `field/
2026-developments.md` gained a dated r82 board table (r82 column
beside a labelled stale r63 column) as the canonical quote, and
`build_api.py` regenerated models.json — the built model page
carries 1015 and the field page 1156. Post-fix greps: r63 values
survive only in the labelled stale column and in the
superseded-claim history sentences. (Untouched, correctly: the
I2V Elos 1179/1056/1343 and the TTS 1201 — different boards.)

**Duty 3 — Flagship: the Script-Clearance Layer (rules 1358–1367).**
New chapter `legal/script-clearance.md` (what each document is,
when it is required, how a production assembles it: clearance
report, annotation guide, researched names / permitted numbers,
chain of title + copyright report, title report, release
coverage, featured-object caution, the living report, the
recorded decision, and the final check behind the E&O /
distribution gate), written strictly from the Identity r78
research with an explicit "what the research does not say"
section — AI applications labelled guide practice, no invented
legal claims. Working tool: `assets/js/clearance.js`
(ClearanceEngine — 10 steps, 9 element kinds, 4 recorded
decisions, a worked 8-item default file whose gate reads "held"
until every flag carries a decision, markdown export), page
`site/legal/script-clearance.html` via `build_clearance()` in
`build_site.py`, nav + footer + search wiring, HAND skill
`legal-script-clearance` (skills 234 → 235), and
`scripts/clearance.test.js` (19/19) wired into validate.sh
stage 7. Playwright-verified desktop + mobile: zero console
messages; the live gate flips held → open as the last open flag
is decided.

**Audit workstream — free-tier / best-pattern (LIVE_CHECKLIST.md).**
One real risk found and fixed: the cron handler's worst case
could exceed the 10s Hobby ceiling (a 4s fetch starting at the 7s
budget mark ≈ 11s, plus GitHub writes at 8s). Fixes: fetch start
deadline = budget − timeout, domain-gap sleeps re-check the
deadline, GitHub calls capped at 2.5s, and commit-back is skipped
with an honest "budget" note when the budget is spent.
`vercel.json` gained a `/data/v1/(.*)` SWR header rule
(s-maxage=600, stale-while-revalidate=86400). Final numbers:
**6/12 functions**, zero dependencies, handlers 2.8–12.8 KB;
at an assumed 3,000 pageviews/mo (~40% API-backed, ~1.5
calls/view ≈ 1,800 gross calls), edge SWR collapses origin load
to **≈300–600 invocations/mo + 30 cron runs (<1% of the 100k
Hobby budget; ~6% at 10× traffic)**; warm read latency 13–57 ms
in the local harness. Degradation order: rate-limiter 429 honest
envelope → static fallback → SWR stale → cron commit deferral →
health `degraded`, never a 5xx.

**Validation.** validate.sh **20/20**; watchtower 6/6; clearance
19/19; forge 19/19; studio 70/70; greenlight 29/29;
agent-workflows all pass; api.test.sh **55/55**. Screenshots:
model-watch board (freshness reads run D's 11:03 UTC stamp;
"32 models tracked · 23 need review · 1 on watch"; console carries
only the two designed /api 404 fallback logs) and clearance
(zero console), desktop 1440 + mobile 390.

**Left open.** The 23 weather-stamped alerts should clear on the
next healthy-window pass without any record moving (2.12's first
job). QA-009 (Film skill-spec double-h1, template fix) was filed
by the QA corps during this rotation and is untouched here — it
belongs to the next rotation's queue, not this one's scope. No
fetch-rule skips occurred: every fetch used the checker's own
path or its probe imports; no approval-card source was
encountered.

**Rotation 12 — follow-up pass (same day; tickets folded in after
the entry above shipped).** The "Left open" note above is
superseded where it touches QA-009: QA-009 was added to this
rotation's scope by follow-up and is fixed below, together with
QA-002, VP-0004, VP-0006, VP-0007, the Foundry placement work
(rounds 2/6/11/12), and Commons rounds 8 + 10. One feed note
first: hours after run D, the repo's own refresh lane
(`scripts/refresh/refresh.sh`, run by the data-ops desk) re-ran
the checker as the egress recovered and landed a clean feed
(2026-10-13T11:35Z: changed=0, with_errors=0, 21 ok / 11 partial)
— the weather stamps cleared, drift is back to **11 alerts /
5 watch / 16 ok** with the exact 2.10 alert set, PixVerse stable
at watch, queue at the 3 standing watches. The 2.11 verdicts are
unchanged (changed=0 again); the test pins and LIVE_CHECKLIST
now assert the refresh feed, and the board renders it.

**QA-002 — deploy docs drift, fixed (docs only; the deploy
structure is untouched, per the Release Engineer's push-kit
plan).** GO_LIVE.md's deploy-model paragraph claimed
`outputDirectory: "."` for this repo while vercel.json says
`"site"` — corrected, with the file's other drift swept in the
same pass: the status header no longer claims nothing is
deployed (the -live snapshot serves from
ai-film-master-guide-live.vercel.app), §3's import step now names
the -live repo (not this build engine), §5's duration row admits
each function pins `maxDuration: 10`, and §8 no longer lists a
`sitemap.xml` (none exists). The empty root `api/` is now
documented plainly in GO_LIVE.md: it is an untracked empty
directory on disk (0 files in git), holds no functions and
deploys nothing; sources live in `server/api/` + `server/lib/`,
build copies in `site/api/` + `site/lib/`. For the push kit:
rotation 12 changed file CONTENTS inside `server/api/` (the cron
handler) and `server/lib/` (github.js) plus their `site/` copies
— no paths added or removed, the 6-function map unchanged, root
`api/` untouched.

**Foundry round 2 (+ rounds 6/11/12 refinements) — OG card,
heritage photos, theme-color, favicon.** Executed from the
round-11 placement packet and the round-12 icon-theme proposal
(both are the source of truth; the packet's block supersedes any
local draft). The card (`og-card.png`, md5 50b0de2f…, verified
against the packet) is copied to `assets/og-card.png` and reaches
`site/assets/` via the build's existing asset copytree. WIRING
PATTERN (for Commons harvest): this generator's ~40 templates
each own their `<head>`, so the meta layer is applied ONCE as a
post-build pass inside the generator — `inject_head_meta()` at
the end of `build_site.py`'s `main()` walks every generated page
and inserts the block before `</head>`, idempotently. Values are
never invented: og:title / twitter:title mirror each page's own
`<title>`; og:description / twitter:description mirror its own
meta description (the packet's homepage instance is the shape).
og:image / twitter:image are ABSOLUTE —
`https://ai-film-master-guide-live.vercel.app/assets/og-card.png`
— because social crawlers ignore relative image URLs (round 6
catch); the same absolutize-on-the-live-domain rule applies to
rel="canonical" (Commons round 10, below). Coverage after this
pass: **106/106 pages** carry og + twitter + theme-color +
favicon links + canonical. theme-color is `#090807` (the site's
`--bg` token verbatim). The favicon is the proposal's "REC
frame" mark (gold corner brackets + ember REC dot on the --bg
field), produced as `assets/icons/favicon.svg` (master) +
favicon.ico (16/32/48) + icon-192/512 + apple-touch-icon, copied
to the site root per-build by the generator (a rebuild wipes
`site/` first, so icons live in the repo, never only in `site/`).
One defect found by the wiring: CHECK_TMPL's six knowledge-check
pages had **no `<title>` element at all** (and no viewport meta)
— fixed at the template; the injector had correctly refused to
invent titles for them.
Heritage photos (round 2 manifest; CC BY-SA 4.0 / public domain
via Wikimedia Commons; the attribution line travels onto every
page that uses one, verbatim from the manifest): the cinema
projector (Asturio Cantabrio) and the Uptown marquee (Jehof) sit
in a "rooms this craft comes from" band on `gallery.html`; the
Frank Hurley silent-era camera (State Library of Queensland,
public domain) frames the manifesto's craft-lineage argument on
`manifesto.html`; the 1930 editing-machine technician (Touring
Club Italiano) opens `craft/editing-pipeline.md` — the chapter's
own subject in its first machine form. Per-page need calls: the
packet's alternates were declined where the design has no honest
slot (the field-guides are data-generated cheat sheets; no photo
was forced there). Placing the chapter photo required the
corpus's first image support in `scripts/md2html.py` (a
`![alt](src)` line + optional `Photo:` caption line renders as
`figure.heritage-fig`; no chapter previously used image syntax,
so the addition is inert for the rest of the corpus).

**Commons round 8 (robots.txt).** `site/robots.txt` is generated
by `build_site.py` on every build (survives rebuilds): allow-all
(`User-agent: *` / `Allow: /`). The repo publishes no sitemap, so
there is no Sitemap: pointer — none was invented.

**Commons round 10 (canonical + honest JSON-LD).** rel="canonical"
is emitted by the same injection pass for every generated page —
self-referential and ABSOLUTE on the live domain, computed from
the page's path under cleanUrls rules (index pages resolve to
their directory URL). JSON-LD is emitted only where a page's own
data holds the facts: **WebSite** on the homepage (name + URL +
the page's own description); **ItemList** on `model-watch.html`
and `models/index.html` (32 ListItems — position, model name,
canonical model-page URL — all from `data/v1/models.json`, slugs
via the generator's own `model_slug()`); **Article** on the 41
chapter-class pages (headline = the page title minus the site
suffix, description = the page's meta description, URL =
canonical). No ratings, review counts, dates, prices, or offers
are emitted anywhere — those facts are not in the data. Tool and
utility pages carry canonical + OG only. No service worker was
added (explicitly out of this pass). All 44 JSON-LD blocks parse
as valid JSON.

**VP-0004 — homepage mobile hero.** Before (390×844): headline
top at 622px (~74% of the viewport), nav 77px (two wrapped rows),
deck 376px, and 7 of 8 timeline clip labels overflowing their
blocks (24–82px each — "CUTAWA", "TEARDOWN F…"). Fixes, all
inside `max-width: 720px` rules (desktop composition untouched):
the site nav becomes one scrollable row (38px); the homepage
hero (`.hero-home`, a class added to the index template) becomes
a flex column with the copy first and the deck below it,
compressed; clip labels are sized to their blocks (0.44rem,
tighter tracking/padding, deck side-padding reduced). After:
headline top ≈ 182–208px with the lede and primary CTA inside
the first viewport, nav 38px, and **all 8 clip labels at zero
overflow**. Before/after screenshots were taken at 390px (kept
with the pass's evidence).

**VP-0006 — heading/timecode collision (widened to 7 pages).**
The component is the docs.js timecode stamper (loads on 99 pages;
it appends a bare `<span class="tc">` to `.prose h2` and
`main > section h2`). Enumeration of its layouts: prose h2s are
flex + chipped by docs.css (never collided — craft-not-buttons
is the proof, stamp gap 463px); `.tc-head` wraps carry their own
gap (motifs.css); watchtower headings carry a specific margin
rule (components.css). The defect lived only in the remaining
layout — the full-width section header — where nothing separated
stamp from heading text (measured gap 0px). Fix at that layout
level, one rule in base.css beside the `.tc` definition:
`main section h2 > .tc { margin-left: var(--space-3); }` (the
more specific prose/watchtower rules still win where they
apply). Verified by measurement + screenshot on all seven named
pages — Clearance, Forge, Doctor, Linter, Hook Generator,
Gallery, API (its h2 nests one div deeper; the widened selector
covers it): **gap 12px on every one**. Controls unchanged in
character: greenlight's slate counter still separated (21px),
craft-not-buttons' chip still at the right edge (463px).

**QA-009 + VP-0007 — skill-spec template.** QA-009: the rendered
prompt example carried the page's second `<h1>` (the example
skill's own `#` title). Fixed in `skill_spec_example()`: the
example's headings are demoted one level at render (h1→h2,
h2→h3, h3→h4), so the example nests under `spec-title`. Class
sweep: every other generated page was checked for the same
defect — skill-spec was the ONLY page in the build with ≠1
`<h1>` before the fix, and the post-fix sweep reads exactly one
`<h1>` on all 106 pages. VP-0007: the intro's `{skill_count}` was
a plain string passed as a `.format()` VALUE (values are never
re-scanned, so the placeholder shipped raw). The lede is now an
f-string fed by the same count the page's other elements use —
and the sweep caught the same class twice more on adjacent
heroes: the skill-spec and skills-library track chips hard-coded
a stale "232 skills"; both now derive from the skills index.
The count is **235** everywhere it appears, derived at build
time, never hard-coded. Post-fix grep of the built page: no
`{…}` placeholders remain.

**Validation (follow-up pass).** validate.sh **20/20**;
watchtower 6/6; clearance 19/19; forge 19/19; studio 70/70;
greenlight 29/29; agent-workflows all pass; api.test.sh
**55/55** (its drift pin asserts the 11:35Z refresh feed: 11
alerts, 79 October events). Screenshot evidence: VP-0004
before/after at 390px, VP-0006 heading crops for the named pages
before/after, heritage figures rendering with attributions on
all three placed pages, and the board reading the 11:35Z feed
("11 need review · 5 on watch").

## Watchtower 2.10 — the eighth review pass + Episode Forge (2026-10-13)

**Assignment:** Rotation 11 — work the queue Watchtower 2.9 left: the 3
standing watches (Seedance 3.0 confirmation, Kling 4.0 GA, Soul
Cinema's in-app credit cost), the 10 partial records (the 7 standing
records, PixVerse V6, and the two Veo weather stamps), and the FLUX
follow-up carried since 2.6 (whether the docs.bfl.ai pricing page's
two renderings alternate between runs). Kling rule unchanged: no GA
model ID + no published pricing from Kuaishou = stays "announced".
PixVerse criterion, stated in 2.9 and carried in: a recovery is
claimed only if the final run fetches its docs source clean at a
verifiable signature. Process rule, stated before any launch: verify
no checker is alive before launching, verify exactly one is running
after. Plus the rotation's flagship: the Episode Forge, built to
the raised design bar.

**Recovery note — this rotation was completed by a second builder.**
The first builder parked mid-build: local HEAD was still rotation
10's commit and the working tree was dirty (~107 files). The audit
found the Episode Forge substantially built (template + engine +
tests + nav/footer/search wiring + a LIVE_CHECKLIST note) but the
Watchtower pass undone — history and review log untouched, and the
only feed in the tree an unverified partial run's output (changed=1,
a fourth queue item, timestamps no completed run could produce).
No checker process was alive. The partial feed was discarded
(restored to the 2.9 baseline) and the pass was re-baselined from
scratch; every number below traces to this pass's own two verified
runs and probe logs. One further process incident, disclosed: the
recovery's first checker launch was killed mid-run by a VM reboot
before it wrote anything — the on-disk feed never changed, the loss
was visible in the process table and in the wiped /tmp log, and the
run was relaunched clean with its log in persistent storage.

**The watches — three re-checked, none moved.**
- **Seedance 3.0:** still no official ByteDance announcement. The
  state-of-the-field coverage page this watch reads returned a
  signature identical to the 2.6/2.7/2.8/2.9 baseline (59931bf3…) in
  the checker run and still lists Seedance 3.0 among models that had
  not been announced by any vendor as of October 1 — no announcement,
  no API, and no date; nothing from ByteDance Seed's directory.
- **Kling 4.0:** the criteria source is literally unchanged for a
  sixth pass — APIMart's page returned a signature identical to the
  2.4–2.9 baseline (fc55ce30…) in the checker run and still reads
  "API Coming Soon", answers "Not yet", and states pricing has not
  been announced. No GA model ID, no Kuaishou-published pricing.
- **Soul Cinema:** the in-app credit cost is still unpublished.
  Higgsfield's pricing page returned the same 428-char app shell at
  the settled signature (f14e9f4a…) in two probes with no credit
  figure; the API post's rate table still lists only the
  $0.0032/image API starting rate from 2.3 (fresh signatures at
  identical length — already excluded since 2.4).

**FLUX follow-up — the docs page held for a fourth pass.** Every
fetch — both checker runs and both probes — returned the 9,875-char
rendering at the 2.6 baseline signature (cb1e92d1…), its FLUX 3
Video table ($0.17/$0.29/$0.40/$0.80 per second; v2v
$0.41/$0.53/$0.65/$0.95) still matching the record exactly; the
19,564-char variant was not seen. bfl.ai/pricing stays
signature-excluded as an exact URL, still fetched and recorded
every run. No rate changed, no pricing record moved.

**Two fresh flags, both raised by this pass's first clean run, both
dismissed with proof.** The run flagged **Seedance 3.0** on
breakread.com's article about a reported ByteDance real-time world
model: re-fetched twice, the page is signature-stable at the
flagged signature (dd63241d…, 9,701 chars), and read in full it
reports a world model built on Seedance technology — possible
October timing "not finalized", no model card, no API identifier,
no pricing, no first-party statement. That is not a Seedance 3.0
announcement, and the watch's criteria page never moved. The run
also flagged **FLUX 3 Video** on eWeek's launch/robotics story —
the same story flagged in 2.9: re-fetched twice, stable at the
flagged signature (4ad61061…, 3,261 chars; 2.9's flagged variant
was 3,262 chars and became its baseline — the story's chrome churns
between near-identical variants), its cleaned text carries no
per-second rate at all, and the docs rate source held its baseline
rendering for a fourth pass (above).

**Partials — PixVerse recovered, the Veo stamps cleared, the
standing cohort unchanged, the recovered cohort broke, and the
first run had weather.** **PixVerse V6:** its docs source fetched
clean at the baseline signature (95c88c96…) in both runs — the
final re-baseline included — with all five sources answering, so
under the criterion stated in 2.9 the recovery is claimed: PixVerse
leaves the partial cohort, stable, severity watch only on its own
baseline pricing diff. The two **Veo** records read ok in both
runs; 2.9's weather stamps clear on schedule. The standing cohort
is unchanged (Medium ×3, GlobeNewswire ×2 models, Morningstar
403s; whatsnew.fyi 429; europesays dropped every try). Against
that, the cohort recovered in 2.7 broke: **MarkTechPost** 403'd
Gemini Omni's and FLUX's articles in both runs and on both probes,
MiniMax H3's article on the same host flipped (403 in both runs,
200 at its baseline signature between them), **x.ai** 403'd in the
final run and on the post-run probe, and **midjourney.com** 403'd
in both runs and on both probes — all four keep partial stamps in
the published feed, labeled as observed, no record contradicted.
The first run's own weather (GitHub 503s for Soul 2.0, Seedance
2.5, Kling 3.0; timeouts for Soul Cinema) all answered on re-probe —
two at their exact baseline signatures — and all four records read
clean in the final run. Every failed source in the final run was
re-probed once after it and failed the same way.

**Process note:** both checker runs ran under the process rule —
a process-table check counting only python3 checker processes
showed zero alive before each launch and exactly one running after
each launch. No duplicate launch; every published number comes
from the two single verified runs (07:26Z adjudication run,
07:35Z re-baseline), cross-checked against the on-disk feeds and
probe logs at each step.

**The flagship — Episode Forge (`forge.html`).** One mini-drama
episode forged on the anvil: an 8-beat, 3-act arc from the guide's
own craft chapters (hook, stake, escalation, turn, complication,
reversal, button, cliffhanger), every beat matched against the
guide's own template library — the real 47 templates in
prompt-templates.json, scored deterministically on each template's
own facets (shot type, camera movement, mood) and stated use, one
emotion per episode from the planner's 12-emotion vocabulary.
`build_site.py`'s `build_forge` pre-renders the default plan (the
same scoring mirrored in Python) and embeds the library data;
`assets/js/forge.js` (`ForgeEngine`) re-forges live in the browser
for any title/premise/format/emotion/episode, so the page reads
identically with or without JavaScript. A beat no template clears
the match bar for renders as uncovered — the Forge never invents a
template — and teardown field lessons attach only through the
facets' own teardown links, with their real lesson text. The plan
exports as clean markdown (every beat, craft note, real template
and prompt, shortlisted models, field lesson, and gates G2/G4).
Wired into the index nav, the footer, and the search index;
`scripts/forge.test.js` pins the engine against the real data (19
assertions); LIVE_CHECKLIST.md carries the generator-safety note.

**Feed state:** final re-baseline (2026-10-13T07:35Z): **changed=0,
with_errors=0, no_sources=0**; queue back to its **3 standing
watches** (notes carry this pass's re-check lines). Drift: **11
alerts** (the 7 standing partial records, Grok's folded-in x.ai
failure, Midjourney, and the three MarkTechPost-gated records),
**5 watch**, 16 ok, 0 unwatched; unpublished rates **5**; pricing
diff vs the 2026-10-11 baseline **7 rows**. History 86 → **92
events** (3 watch re-checks, the FLUX rate-source stability
confirmation, the Seedance flag verdict, the PixVerse recovery);
the October window holds 72. Review log: pass 9 + addendum (17
entries total).

**Validation:** `scripts/watchtower.test.js` **15/15** (pins moved
to the new feed: 11 alerts with the exact id set incl. flux-3-video
and midjourney-v1-video; PixVerse pin flipped to stable/watch on
its recovery). `tests/api.test.sh` **55/55** (October window 66 →
72, drift alerts 10 → 11). `scripts/forge.test.js` **19/19**,
`studio.test.js` **70/70**, `greenlight.test.js` **29/29**,
`agent-workflows.test.js` **92/92**. `bash scripts/validate.sh`
**19 passed, 0 failed — ALL STAGES PASS** pre-commit and again
post-commit. Headless-Chromium (Playwright) screenshots inspected
(desktop 1440px + mobile 390px): cutting-room board intact,
freshness reads the new 07:35 UTC feed, "32 models tracked · 11
need review · 5 on watch" present, the 2.10 history events render;
the Forge renders its hero and all 8 pre-rendered beats at both
sizes, the Forge button re-forges live with all beats present,
with zero console messages on every Forge view and only the two
designed /api 404 fallback logs on the board. No progress-archive
duty this rotation (per the rotation brief). AI-ism scan on new
copy: clean. No TODOs, no dead code.

**Left open:** the 3 standing watches — all re-checked this pass,
none moved. The 11 partial records will keep surfacing as alerts
while their sources fail the checker — the 7 standing ones
adjudicated nine passes running now, and the four new ones
(MarkTechPost's gating, x.ai, midjourney.com) are next pass's
question: whether they answer again, as they did through 2.9, or
join the standing cohort. PixVerse's docs source bears watching
for a second clean pass. LTX-2.5's ltx.io note stands.

**Commit:** local `b88969e` → pushed 2026-10-13 as remote commit
`0ce982ce56f3189a70757528061bc59288ced41a` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`0ce982c`) — remote tree == local HEAD tree (`db41681f`), working
tree clean. Working repo only — no `-live` repo touched, no Vercel
access.

## Watchtower 2.9 — the seventh review pass + Model Showdown (2026-10-12)

**Assignment:** Rotation 10 — work the queue Watchtower 2.8 left: the 3
standing watches (Seedance 3.0 confirmation, Kling 4.0 GA, Soul
Cinema's in-app credit cost), the 8 partial records (the 7 standing
records plus PixVerse V6, which joined in 2.8 on truncated docs
reads), and the FLUX follow-up carried since 2.6 (whether the
docs.bfl.ai pricing page's two renderings alternate between runs).
Kling rule unchanged: no GA model ID + no published pricing from
Kuaishou = stays "announced". PixVerse criterion, stated in advance:
a recovery is claimed only if the final run fetches its docs source
clean at a verifiable signature. Process rule, stated before any
launch: verify no checker is alive before launching, verify exactly
one is running after. Plus the rotation's flagship: a Model
Showdown page, built to the raised design bar.

**The watches — three re-checked, none moved.**
- **Seedance 3.0:** still no official ByteDance announcement. The
  state-of-the-field coverage page this watch reads returned a
  signature identical to the 2.6/2.7/2.8 baseline (59931bf3…) in the
  pre-run probe, all three checker runs, and both post-run probes,
  and still lists Seedance 3.0 among models that had not been
  announced by any vendor as of October 1 — no announcement, no API,
  and no date; nothing from ByteDance Seed's directory.
- **Kling 4.0:** the criteria source is literally unchanged for a
  fifth pass — APIMart's page returned a signature identical to the
  2.4–2.8 baseline (fc55ce30…) in probes and all three runs and still
  reads "API Coming Soon", answers "Not yet", and states pricing has
  not been announced. No GA model ID, no Kuaishou-published pricing.
- **Soul Cinema:** the in-app credit cost is still unpublished.
  Higgsfield's pricing page returned the same 428-char app shell at
  the settled signature (f14e9f4a…) in probes and all three runs with
  no credit figure; the API post's rate table still lists only the
  $0.0032/image API starting rate from 2.3 (fresh signatures at
  identical length — already excluded since 2.4).

**FLUX follow-up — the docs page held for a third pass.** Every
fetch — pre-run probe, all three checker runs, post-run probes —
returned the 9,875-char rendering at the 2.6 baseline signature
(cb1e92d1…), its table still matching the record exactly; the
19,564-char variant was not seen. bfl.ai/pricing served its
22,122-char full rendering (cb65d074…) in this pass's probes and
runs — signature-excluded since 2.7 as an exact URL, still fetched
and recorded every run. The docs page stays signature-live as the
readable primary rate source. No rate changed, no pricing record
moved.

**Two fresh flags, both raised by this pass's own runs, both
dismissed with proof.** The first run flagged **Veo 3.1** on
scriptbyai.com's pricing roundup: re-fetched twice, the page is
signature-stable and identical to the flagged run's stored
signature (45717f00…), and its Veo 3.1 table ($0.40/s standard,
$0.60 4K; $0.15/$0.35 fast; $0.05/$0.08 lite) matches the record's
tiers exactly — the churn is the page's living LLM token tables,
the 2.5 pattern. The second run flagged **FLUX 3 Video** on
eWeek's launch/robotics story: re-fetched twice, stable at the
flagged signature (eccde171…, 3,262 chars vs 3,261 at baseline —
a one-character delta in article chrome); the story publishes no
per-second rate and FLUX's rate source (the docs page) never moved.

**Partials — the standing cohort unchanged, the recovered cohort
held a second pass, PixVerse not recovered, the final run had
weather.** All standing failed sources were re-probed before the
runs, between them, and after each: Medium ×3, GlobeNewswire (2
models), and Morningstar still 403; whatsnew.fyi still 429s the
shared ComfyUI page; europesays.com (Grok) dropped the connection
on every try this pass. The 2.8 question is answered for this pass:
MarkTechPost (×3 models), x.ai, and midjourney.com answered 200 in
all three runs and every probe — four of the five URLs
signature-identical across probes; MiniMax H3's MarkTechPost
article still varies (signature-excluded for H3 since 2.2; no fact
on it contradicts the record). LTX-2.5's GitHub spec source dropped
in the first run, answered three consecutive re-probes at the exact
2.8 baseline signature (567a4d62…), and answered again in runs two
and three — weather. **PixVerse V6:** its docs source truncated in
the first run (IncompleteRead, 81,476 bytes), fetched clean at the
baseline signature (95c88c96…) in the second run — and truncated
again in the final run (32,324 bytes, the same truncated length as
one of 2.8's runs). Per the criterion stated in advance, the
published feed claims no recovery: PixVerse stays partial, labeled
exactly as observed. The final run also dropped one source each for
the two Veo records (a mer.vin timeout, a dev.to drop); both
answered twice on immediate re-probe at signatures identical to
their 2.8 baselines, and — per the 2.3 precedent — their partial
stamps stay on the published feed until the next run, honestly
labeled.

**Process note:** all three checker runs ran under the process rule
— a process-table check counting only python3 checker processes
showed zero alive before each launch and exactly one running after
each launch. No duplicate launch, no interruption; every published
number comes from the three single verified runs (05:31Z, 05:47Z,
and the 06:06Z re-baseline), cross-checked against the on-disk
feeds and probe logs at each step.

**The flagship — Model Showdown (`showdown.html`).** Any two of the
32 watched models spliced side by side on the cutting table, like
two reels: status, the published rate tier by tier, best use,
strength, weakness, source-check health (sources answering x of y,
last checked), drift-board severity with its alerts, pricing
movement against the 2026-10-11 baseline, record-verified date, and
the latest Watchtower event — driven entirely by the same four
artifacts as the board (models.json, pricing.json, model-checks.json,
model-history.json). `build_site.py`'s `build_showdown` pre-renders
the default pairing (Veo 3.1 vs Kling 3.0) and embeds all 32 records
as a JSON island; `assets/js/showdown.js` renders any pairing from
it (shareable `?a=&b=` URLs, swap button), so the page reads
identically with or without JavaScript. Edges are direct comparisons
of published values only — the lowest entry rate per shared unit,
more sources answering, a cleaner drift board, a fresher
verification — stated in a verdict strip and as chips on the exact
tier that earns them (a screenshot review caught the chip on every
tier of the winning unit; it now marks only the cheapest tier,
where the comparison actually lives). A model with no published USD
rate renders "Unpublished — no USD rate on record" and the guide
does not estimate one (Seedance 3.0 vs Kling 4.0 is the honest
showcase: both unpublished, both stated). Wired into the index nav,
the footer, the search index, and the compare page's link row;
LIVE_CHECKLIST.md carries the generator-safety note.

**Feed state:** final re-baseline (2026-10-13T06:06Z): **changed=0,
with_errors=0, no_sources=0**; queue back to its **3 standing
watches** (notes carry this pass's re-check lines). Drift: **10
alerts** (the 7 standing partial records plus PixVerse V6 and the
two Veo weather partials), **6 watch**, 16 ok, 0 unwatched;
unpublished rates **5**; pricing diff vs the 2026-10-11 baseline
**7 rows**. History 81 → **86 events** (3 watch re-checks, the FLUX
rate-source stability confirmation, the Veo flag verdict); the
October window holds 66. Review log: pass 8 + addendum (15 entries
total).

**Validation:** `scripts/watchtower.test.js` **15/15** (pins moved
to the new feed: 10 alerts with the exact id set incl. veo-3-1 and
veo-3-1-fast). `tests/api.test.sh` **55/55** (October window 61 →
66, drift alerts 8 → 10). `studio.test.js` **70/70**,
`greenlight.test.js` **29/29**, `agent-workflows.test.js` all pass.
`bash scripts/validate.sh` **18 passed, 0 failed — ALL STAGES PASS**
pre-commit and again after the showdown chip fix. Headless-Chromium
(Playwright) screenshots inspected (desktop 1440px + mobile 390px):
cutting-room board intact, freshness reads the new 06:06 UTC feed,
"32 models checked" and "10 need review" present; the showdown
renders with real data at the default pairing, at a URL-param
pairing (Wan 2.7 vs Soul Cinema), and at the both-unpublished
pairing (Seedance 3.0 vs Kling 4.0), with zero console messages on
every showdown view and only the two designed /api 404 fallback
logs on the board (the mobile hero deck stays cramped — the
pre-existing wave-39 quirk, untouched). Final-state shots archived
to `~/workspace/progress-archive/ai-film-master-guide/rotation-010/`
(hero, board, showdown; desktop + mobile, dated 2026-10-13).
AI-ism scan on new copy: clean. No TODOs, no dead code.

**Left open:** the 3 standing watches — all re-checked this pass,
none moved. The 10 partial records will keep surfacing as alerts
while their sources fail the checker — the 7 standing ones
adjudicated eight passes running now, PixVerse's docs truncations
labeled as weather, not a dead source, and the two Veo stamps
expected to clear on the next run if their sources answer, as they
did on re-probe. Whether the MarkTechPost / x.ai / midjourney.com
answers hold for a third pass is next pass's question;
europesays.com stays intermittent-to-dropping. LTX-2.5's ltx.io
note stands.

**Commit:** local `0922ef5` → pushed 2026-10-12 as remote commit
`b6bd8635f94c65c854e61cc410129239dcc24805` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`b6bd863`) — remote tree == local HEAD tree (`2b1edd61`), working
tree clean. Working repo only — no `-live` repo touched, no Vercel
access.

## Watchtower 2.8 — the sixth review pass (2026-10-12)

**Assignment:** Rotation 9 — work the queue Watchtower 2.7 left: the 3
standing watches (Seedance 3.0 confirmation, Kling 4.0 GA, Soul
Cinema's in-app credit cost), the 7 adjudicated partial records (9
failed-source instances across 7 distinct URLs), the FLUX follow-up
carried since 2.6 (whether the docs.bfl.ai pricing page's two
renderings alternate between runs), and the open question 2.7 left:
whether the MarkTechPost / x.ai / midjourney.com answers hold. Kling
rule unchanged: no GA model ID + no published pricing from Kuaishou
= stays "announced"; third-party wrapper noise does not count.
Process rule, stated before any launch: verify no checker is alive
before launching, verify exactly one is running after.

**The watches — three re-checked, none moved.**
- **Seedance 3.0:** still no official ByteDance announcement. The
  state-of-the-field coverage page this watch reads returned a
  signature identical to the 2.6/2.7 baseline (59931bf3…) and still
  lists Seedance 3.0 among models that had not been announced by any
  vendor as of October 1 — no announcement, no API, and no date;
  nothing from ByteDance Seed's directory.
- **Kling 4.0:** the criteria source is literally unchanged for a
  fourth pass — APIMart's page returned a signature identical to the
  2.4/2.5/2.6/2.7 baseline (fc55ce30…) and still reads "API Coming
  Soon", answers "Not yet", and states pricing has not been
  announced. No GA model ID, no Kuaishou-published pricing.
- **Soul Cinema:** the in-app credit cost is still unpublished.
  Higgsfield's pricing page returned the same 428-char app shell at
  the settled 2.6/2.7 signature (f14e9f4a…) with no credit figure; the
  API post's rate table still lists only the $0.0032/image API
  starting rate from 2.3 (and returned yet another signature at
  identical length — already excluded since 2.4).

**FLUX follow-up — the docs page held for a second pass.** Every
fetch — two consecutive probes, the first checker run, and the
re-baseline run — returned the 9,875-char rendering at the 2.6
baseline signature (cb1e92d1…), its table still matching the record
exactly; the 19,564-char variant was not seen. bfl.ai/pricing stayed
on its 4,680-char calculator rendering (13ffebdf…) in both probes —
signature-excluded since 2.7 as an exact URL, still fetched and
recorded in both runs. The docs page stays signature-live as the
readable primary rate source. No rate changed, no pricing record
moved.

**Partials — the standing cohort unchanged, the recovered cohort
held, one weather case.** All 9 failed-source instances in the 2.7
baseline feed (7 distinct URLs) were re-probed before the runs and
again after the first run, and confirmed in both runs: Medium ×3,
GlobeNewswire (2 models), and Morningstar still 403; whatsnew.fyi
still 429s the shared ComfyUI page; europesays.com (Grok) dropped
the connection on every try this pass (pre-run probe, both runs,
post-run re-probe). The 2.7 question is answered for this pass:
MarkTechPost (×3 models), x.ai, and midjourney.com answered 200 in
both runs and on post-run re-probe — four of the five URLs returned
signatures identical across the run and the re-probe; MiniMax H3's
MarkTechPost article returned two signatures across fetches, but
that domain is signature-excluded for H3 since the 2.2 calibration,
so no flag was raised and no fact on the page contradicts the
record. The one weather case: PixVerse V6's docs source truncated
(IncompleteRead) in both runs — the post-run re-probe truncated at
65,092 bytes on the first try, then answered 200 at the baseline
signature (95c88c96…) on the second — so the final feed carries
PixVerse as an eighth partial record, labeled exactly as observed;
this pass does not claim its recovery. Neither checker run raised a
changed-source flag (changed=0 in both) — there was no flag to
adjudicate this pass.

**Process note:** both checker runs ran under the process rule —
a process-table check counting only python3 checker processes
showed zero alive before each launch and exactly one running after
each launch. No duplicate launch, no interruption; every published
number comes from the two single verified runs (04:53Z and the
05:06Z re-baseline).

**Feed state:** final re-baseline (2026-10-13T05:06Z): **changed=0,
with_errors=0, no_sources=0**; queue back to its **3 standing
watches** (notes carry this pass's re-check lines). Drift: **8
alerts** (the 7 standing partial records plus PixVerse V6), **6
watch**, 18 ok, 0 unwatched; unpublished rates **5**; pricing diff
vs the 2026-10-11 baseline **7 rows**. History 77 → **81 events**
(3 watch re-checks, the FLUX rate-source stability confirmation);
the October window holds 61. Review log: pass 7 + addendum (13
entries total).

**Validation:** `scripts/watchtower.test.js` **15/15** (pins moved
to the new feed: 8 alerts with the exact id set incl. pixverse-v6;
PixVerse's spot severity is now alert on its failed check).
`tests/api.test.sh` **55/55** (October window 57 → 61, drift alerts
7 → 8). `studio.test.js` **70/70**, `greenlight.test.js` **29/29**,
`agent-workflows.test.js` all pass. `bash scripts/validate.sh`
**18 passed, 0 failed — ALL STAGES PASS** pre-commit.
Headless-Chromium screenshots inspected (desktop 1440px + mobile
390px): cutting-room board intact, freshness reads the new 05:06
UTC feed, "32 models checked", "8 need review" and "6 on watch"
present, no JS errors in the headless console log (the static
server's /api misses are the designed fallback trigger; the mobile
hero deck stays cramped — the pre-existing wave-39 quirk,
untouched). AI-ism scan on new copy: clean (the only scan hit is a
fetched news headline inside the check feed's data). No TODOs, no
dead code.

**Left open:** the 3 standing watches — all re-checked this pass,
none moved. The 8 partial records will keep surfacing as alerts
while their sources fail the checker — the 7 standing ones
adjudicated seven passes running now, PixVerse's docs truncations
new this pass and labeled as weather, not a dead source. Whether
the MarkTechPost / x.ai / midjourney.com answers hold for a third
pass is next pass's question; europesays.com stays
intermittent-to-dropping. LTX-2.5's ltx.io note stands.

**Commit:** local `451b9c3` → pushed 2026-10-12 as remote commit
`bb3d1ed966c0eac736a7bfed16381546243962a3` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`bb3d1ed`) — remote tree == local HEAD tree (`27024cc2`). Post-commit
`validate.sh`: **18 passed, 0 failed — ALL STAGES PASS**. Working
repo only — no `-live` repo touched, no Vercel access.

## Watchtower 2.7 — the fifth review pass (2026-10-12)

**Assignment:** Rotation 8 — work the queue Watchtower 2.6 left: the 3
standing watches (Seedance 3.0 confirmation, Kling 4.0 GA, Soul
Cinema's in-app credit cost), the 11 adjudicated partial records, and
the FLUX follow-up 2.6 named: the docs.bfl.ai pricing page wired in as
FLUX 3 Video's readable rate source serves two renderings — watch
whether they alternate between runs. Kling rule unchanged: no GA
model ID + no published pricing from Kuaishou = stays "announced";
third-party wrapper noise does not count. Process rule, stated before
any launch: verify no checker is alive before launching, verify
exactly one is running after.

**The watches — three re-checked, none moved.**
- **Seedance 3.0:** still no official ByteDance announcement. The
  state-of-the-field coverage page this watch reads returned a
  signature identical to the 2.6 baseline and still lists Seedance
  3.0 among models with no vendor announcement, no API, and no date;
  current coverage shows the same third-party field, nothing from
  ByteDance Seed's directory.
- **Kling 4.0:** the criteria source is literally unchanged for a
  third pass — APIMart's page returned a signature identical to the
  2.4/2.5/2.6 baseline (fc55ce30…) and still lists the API as coming
  soon, answers "Not yet", and states pricing has not been announced.
  The loudest wrapper this pass states in its own README that its
  Kling 4 routes run on its existing pipeline until direct access
  opens — wrapper noise by its own admission, not Kuaishou pricing,
  no GA model ID.
- **Soul Cinema:** the in-app credit cost is still unpublished.
  Higgsfield's pricing page returned the same 428-char app shell at
  the settled 2.6 signature (f14e9f4a…) with no credit figure; the API
  post's rate table still lists only the $0.0032/image API starting
  rate from 2.3 (and returned yet another signature at identical
  length — already excluded since 2.4).

**FLUX follow-up — the docs page held; its sibling rotated.** The
docs pricing page did not alternate this pass: four probes, one extra
probe, and both checker runs all returned the 9,875-char rendering at
the 2.6 baseline signature (cb1e92d1…), its table still matching the
record; the 19,564-char variant was not seen. The alternation arrived
on bfl.ai/pricing instead. The pass's first post-reboot run flagged
FLUX 3 Video on that URL, and probing caught three renderings in one
pass: the 2,249-char shell baselined in 2.6, a 22,122-char full
rendering (five consecutive fetches, cb65d074…) whose structured
FLUX 3 Video offers match the record exactly, and a 4,680-char
calculator rendering (13ffebdf… — the run's fetch plus six
consecutive probes) carrying no per-second rate. The renderings
rotate in blocks, so the page cannot hold a signature across runs.
Adjudicated as rendering rotation, not a rate move: bfl.ai/pricing
joins FLUX's signature exclusions as an exact-URL entry (still
fetched and recorded every run; the 2.2 anchor call is reversed on
evidence — the docs page, signature-live, is now the readable primary
rate source). No rate changed, no pricing record moved.

**Partials — the cohort shrank, labeled exactly as observed.** All 15
failed-source instances in the 2.6 baseline feed (13 distinct URLs)
were re-probed. Still failing everywhere: Medium ×3, GlobeNewswire
(2 models), Morningstar (403); whatsnew.fyi still 429s the shared
ComfyUI page; europesays.com (Grok) dropped on all seven attempts
this pass — worse than 2.6's one-in-three, same intermittent wire,
stays failed. The change: MarkTechPost (×3 models), x.ai, and
midjourney.com still 403'd the pre-run probes, then answered 200 in
the first run, again on post-run re-probe (twice each), and again in
the re-baseline — so MiniMax H3, Gemini Omni, FLUX 3 Video, and
Midjourney are no longer partial in the final feed; this pass claims
only that they answered, not that the blocks are gone for good. Two
first-run weather failures recovered on re-probe and in the final
feed: a TechTimes 520 for Runway Gen-4.5 and a truncated PixVerse
docs read (IncompleteRead; 200 on the second try).

**Process note (honest):** the pass's first checker launch was killed
mid-run by a VM reboot (uptime restarts 2026-10-13T04:03:02Z, about
nine minutes in) before the checker wrote any output — the 2.6
baseline feed was verified untouched on disk afterward, no partial
or interleaved output existed to discard, and the probe evidence was
re-verified after the reboot. Both published runs were launched
under the process rule (process-table check counting only python3
checker processes: zero alive before each launch, exactly one after)
and ran single to completion.

**Feed state:** final re-baseline (2026-10-13T04:29Z): **changed=0,
with_errors=0, no_sources=0**; queue back to its **3 standing
watches** (notes carry this pass's re-check lines). Drift moved for
the first time since 2.4 — because sources answered, not because
records changed: **7 alerts** (the partial records still carrying a
failed source), **7 watch**, 18 ok, 0 unwatched; unpublished rates
**5**; pricing diff vs the 2026-10-11 baseline **7 rows**. History
73 → **77 events** (3 watch re-checks, the FLUX flag verdict); the
October window holds 57. Review log: pass 6 + addendum (11 entries
total).

**Validation:** `scripts/watchtower.test.js` **15/15** (pins moved to
the new feed: 7 alerts with the exact id set). `tests/api.test.sh`
**55/55** (October window 53 → 57, drift alerts 11 → 7).
`studio.test.js` **70/70**, `greenlight.test.js` **29/29**,
`agent-workflows.test.js` all pass. `bash scripts/validate.sh`
**18 passed, 0 failed — ALL STAGES PASS** pre-commit.
Headless-Chromium (Playwright) screenshots inspected (desktop 1440px
+ mobile 390px): cutting-room board intact, freshness reads the new
04:29 UTC feed, "32 models checked", "7 need review" and "7 on watch"
present, zero page errors (the two /api 404 resource logs per view on
the plain static server are the designed fallback trigger; the mobile
hero deck stays cramped — the pre-existing wave-39 quirk, untouched).
AI-ism scan on new copy: clean. No TODOs, no dead code.

**Left open:** the 3 standing watches — all re-checked this pass,
none moved. The 7 remaining partial records will keep surfacing as
alerts while their third-party sources fail the checker —
adjudicated six passes running now, documented, honest. Whether the
MarkTechPost / x.ai / midjourney.com answers hold is next pass's
question; europesays.com stays intermittent-to-dropping. LTX-2.5's
ltx.io note stands.

**Commit:** local `f17d14a` → pushed 2026-10-12 as remote commit
`8ec4952d56bec8d3dfd0cf53aea8cabd033ea81d` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`8ec4952`) — remote tree == local HEAD tree (`ac507c1e`). Post-commit
`validate.sh`: **18 passed, 0 failed — ALL STAGES PASS**. Working
repo only — no `-live` repo touched, no Vercel access.

## Watchtower 2.6 — the fourth review pass (2026-10-12)

**Assignment:** Rotation 7 — work the queue Watchtower 2.5 left: the 3
standing watches (Seedance 3.0 confirmation, Kling 4.0 GA, Soul
Cinema's in-app credit cost), the 11 adjudicated partial records, and
the one watch-quality item 2.5 named: bfl.ai/pricing is now a JS
calculator shell, so FLUX 3 Video's rate watch needs a readable
primary source or an honest log that none exists. Kling rule
unchanged: no GA model ID + no published pricing from Kuaishou =
stays "announced", however loud the third-party noise gets.

**The watches — three re-checked, none moved.**
- **Seedance 3.0:** still no official ByteDance announcement. The
  dedicated release tracker is unchanged since 2.5 — its daily
  inspection still rests on the Oct 6 catalog check (ByteDance's
  catalog and visual blog both list 2.5) — and current coverage
  agrees no announcement, API, or date exists.
- **Kling 4.0:** the criteria source is again literally unchanged —
  APIMart's page returned a signature identical to the 2.4/2.5
  baseline (fc55ce30…) and still reads "API Coming Soon", "Not yet",
  pricing "not been announced". Coverage still describes Flash-only
  subscriber access; third-party API wrappers on other pipelines are
  not Kuaishou pricing and carry no GA model ID — noise, adjudicated
  as such.
- **Soul Cinema:** the in-app credit cost is still unpublished.
  Higgsfield's pricing page is a 428-char app shell with no credit
  figure; the API post's rate table still lists only the $0.0032/image
  API starting rate from 2.3 (and returned yet another signature at
  identical length — already excluded since 2.4).

**FLUX rate source — found, probed, wired in.** BFL's official docs
publish the full rate card on a page a static fetch can read:
`docs.bfl.ai/quick_start/pricing`. Probed with the checker's own
fetch path before being written down — 200, signature-identical
across consecutive fetches — and its FLUX 3 Video table matches the
record exactly ($0.06 draft / $0.17 hd / $0.29 fhd / $0.40 qhd /
$0.80 uhd for text/image-to-video; $0.12 draft / $0.41 / $0.53 /
$0.65 / $0.95 for video continuation), so no rate changed and no
pricing record moved. It joins FLUX 3 Video's `extra_urls` as a
signature-live primary source; bfl.ai/pricing stays signature-live
alongside it (the 2.2 anchor decision). One honest wrinkle: the docs
page serves two renderings — the probe's 19,564-char variant and the
9,875-char variant the re-baseline run recorded (cb1e92d1…), itself
stable across three later fetches — with the same table in both. If
the renderings alternate between runs it will flag, and a future
pass can adjudicate it then.

**One fresh flag, adjudicated.** The surviving run flagged Marketing
Studio on Higgsfield's pricing page: the 428-char shell's signature
moved once against the 2.5 baseline on nav chrome (new product names
in the shell's nav list) and then held — three fresh fetches and the
re-baseline run all return f14e9f4a… at identical length. The shell's
text carries no plan, credit, or rate figure at all, so nothing
contradicts the record. Dismissed; the URL stays signature-live.

**Partials — cohort unchanged, one wire still flaky, two timeouts.**
All 14 failed-source instances (12 distinct URLs) re-probed: Medium
×3, MarkTechPost ×3, GlobeNewswire, Morningstar, x.ai, and
midjourney.com still 403; whatsnew.fyi still 429s the shared ComfyUI
page. europesays.com (Grok) dropped the first re-probe, answered 200
on the second (13,347 chars), then dropped again in the re-baseline
run — intermittent, stays failed, honestly labeled, same pattern as
2.5. Two run-weather timeouts recovered on re-probe: higgsfield.ai
for Soul 2.0 (200 twice; final feed carries the model ok) and
techtimes.com for Kling 4.0 (200 twice, signature identical to the
2.5 baseline).

**Process note (honest):** the pass's first launch duplicated — two
checker processes ran concurrently against the same files, the 2.2
failure mode recurring despite the pre-launch `pgrep` check (the
duplication came from the launch itself). The interleaved output was
not used as a baseline: the surviving feed (changed=1) served only as
adjudication input, the transient flags in the discarded run's log
were re-checked on fresh fetches against the 2.5 baseline (every
non-excluded source matched), and every published number comes from
the single verified re-baseline run. Recorded in the review log's
pass-5 addendum.

**Feed state:** final re-baseline (2026-10-13T03:43Z): **changed=0,
with_errors=0, no_sources=0**; queue back to its **3 standing
watches** (notes carry this pass's re-check lines). Drift unchanged
from 2.4/2.5: **11 alerts** (same id set), **5 watch**, 16 ok, 0
unwatched; unpublished rates **5**; pricing diff vs the 2026-10-11
baseline **7 rows**. History 68 → **73 events** (3 watch re-checks,
the FLUX docs-source coverage event, the Marketing Studio flag
verdict); the October window holds 53. Review log: pass 5 + addendum
(9 entries total).

**Validation:** `scripts/watchtower.test.js` **15/15**.
`tests/api.test.sh` **55/55** (October window 48 → 53).
`studio.test.js` **70/70**, `greenlight.test.js` **29/29**,
`agent-workflows.test.js` all pass. `bash scripts/validate.sh`
**18 passed, 0 failed — ALL STAGES PASS** pre-commit.
Headless-Chromium (Playwright) screenshots inspected (desktop 1440px
+ mobile 390px): cutting-room board intact, freshness reads the new
03:43 UTC feed, "32 models checked", "11 need review" and "73 events"
present, zero page errors (the two /api 404 resource logs per view on
the plain static server are the designed fallback trigger; the mobile
hero deck stays cramped — the pre-existing wave-39 quirk, untouched).
AI-ism scan on new copy: clean. No TODOs, no dead code.

**Left open:** the 3 standing watches — all re-checked this pass,
none moved. The 11 partial records will keep surfacing as alerts
while their third-party sources bot-block the checker — adjudicated
five passes running now, documented, honest. One new watch-quality
note: the BFL docs pricing page serves two renderings; if they start
alternating between runs it will flag for a future pass. LTX-2.5's
ltx.io note stands.

**Commit:** local `bb72d36` → pushed 2026-10-12 as remote commit
`bccbe252ee341e5adb827a22f1aa0081d9086fe0` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`bccbe25`) — remote tree == local HEAD tree (`f2a683e3`). Post-commit
`validate.sh`: **18 passed, 0 failed — ALL STAGES PASS**. Working
repo only — no `-live` repo touched, no Vercel access.

## Watchtower 2.5 — the third review pass (2026-10-12)

**Assignment:** Rotation 6 — work the queue Watchtower 2.4 left: the 3
standing watches (Seedance 3.0 confirmation, Kling 4.0 GA, Soul
Cinema's in-app credit cost), the 11 adjudicated partial records, and
a stability confirmation for Wan 2.7 one pass after its artifact-chain
addition. Kling rule unchanged: no GA model ID + no published pricing
= stays "announced", however loud the third-party noise gets. Plus the
standing process lesson, applied three times: no checker process was
alive before any of this pass's three checker runs (`ps` verified;
each run single and detached).

**The watches — three re-checked, none moved.**
- **Seedance 3.0:** still no official ByteDance announcement. The
  dedicated release tracker (daily inspections of ByteDance's catalog
  and visual blog; last catalog check Oct 6) concludes the catalog
  still lists 2.5 as current; the status audit notes no Seedance 3
  product, card, API ID, price, or schedule in the official directory.
- **Kling 4.0:** the criteria source is literally unchanged — APIMart's
  page returned a signature identical to the 2.4 baseline and still
  reads "API Coming Soon", "Not yet", pricing "not been announced".
  Independent reviews agree: no model identifier, no price for either
  tier. The loudest new noise, subscription plans on kling4.tv (a
  third-party site), is not Kuaishou pricing and carries no GA model
  ID — adjudicated as noise, record stays announced.
- **Soul Cinema:** the in-app credit cost is still unpublished.
  Higgsfield's pricing page serves a 428-char app shell with no credit
  figure; the API post's rate table, re-read this pass, still lists
  only the $0.0032/image API starting rate from 2.3 (and returned yet
  another signature at identical length — already excluded since 2.4).
- **Wan 2.7 — stable post-addition.** PoYo (endpoint IDs + fal rates)
  and CreateVision (spec registry) returned signatures identical to
  the 2.4 baseline on re-probe and in the runs; wan.video identical.
  Its severity is watch only for its own baseline pricing diff — the
  PixVerse pattern, holding a second generation.

**Partials — cohort unchanged, one wire flaky, one run of weather.**
All 14 failed-source instances (12 distinct URLs) re-probed: Medium
×3, MarkTechPost ×3, GlobeNewswire, Morningstar, x.ai, and
midjourney.com still 403; whatsnew.fyi still 429s the shared ComfyUI
page. europesays.com (Grok) answered 200 once, then dropped the
connection in the run and both later re-probes — intermittent, stays
failed, honestly labeled. The pass's first run (02:41Z) was rough:
DoP's sole source timed out (the run's with_errors=1), pika.art timed
out, Higgsfield's API post dropped a fetch. All three answered on
immediate re-probe (pika.art's signature identical to baseline) and
read ok in the final feed.

**Five flags across two runs, all adjudicated, zero records changed.**
Run 1 flagged Veo 3.1 (a third-party pricing roundup whose living LLM
token tables moved; no Veo rate on it contradicts the record; the page
is signature-identical across repeat fetches and to the flagged run)
and both Wan models on the shared upgrademag Wan 2.7 launch report.
That report flagged again in run 2 — for Wan 2.6 only, while Wan 2.7's
fetch of the same URL in the same run stored the settled signature:
proof the page serves intermittent variants (rotating headlines rail)
while the settled page (16,136 chars) matches across repeated fetches
and its facts are the record's own. It joins both Wan models'
signature-exclusion lists (the 2.2 calibration treatment; still
fetched and recorded every run; Wan 2.7's rate sources stay
signature-live). Run 2 also flagged **FLUX 3 Video on bfl.ai/pricing**
— a real page change, not a rate move: BFL redesigned the page from
22,122 chars of static rate text to a 2,249-char JS calculator shell
whose fetched text carries no per-second video rate, so nothing
contradicts the record. The URL stays signature-live on purpose (the
2.2 anchor decision) — it is the primary rate source.

**Feed state:** final re-baseline (2026-10-13T02:57Z): **changed=0,
with_errors=0, no_sources=0**; queue back to its **3 standing
watches** (notes carry this pass's re-check lines). Drift unchanged
from 2.4: **11 alerts** (same id set), **5 watch**, 16 ok, 0
unwatched; unpublished rates **5**; pricing diff vs the 2026-10-11
baseline **7 rows**. History 61 → **68 events** (3 watch re-checks,
Wan 2.7 stability, 3 flag verdicts); the October window holds 48.
Review log: pass 4 + addendum (7 entries total).

**Validation:** `scripts/watchtower.test.js` **15/15** (pins unchanged
— the published feed's drift shape is 2.4's, so the alert id set and
diff assertions hold as written). `tests/api.test.sh` **55/55**
(October window 41 → 48). `studio.test.js` **70/70**,
`greenlight.test.js` **29/29**, `agent-workflows.test.js` all pass.
`bash scripts/validate.sh` **18 passed, 0 failed — ALL STAGES PASS**
pre-commit. Headless-Chromium (Playwright) screenshots inspected
(desktop 1440px + mobile 390px): cutting-room board intact, freshness
reads the new 02:57 UTC feed, "32 models checked" and "11 need review"
present, zero page errors (the mobile hero deck stays cramped — the
pre-existing wave-39 quirk, untouched). AI-ism scan on new copy:
clean. No TODOs, no dead code.

**Left open:** the 3 standing watches — all re-checked this pass,
none moved. The 11 partial records will keep surfacing as alerts
while their third-party sources bot-block the checker — adjudicated
four passes running now, documented, honest. One watch-quality item:
bfl.ai/pricing is now a JS calculator, so a future FLUX rate move may
not be readable from a static fetch — if BFL publishes rates only
behind the calculator, FLUX's watch needs a readable primary source
added. LTX-2.5's ltx.io note stands.

**Commit:** local `b2a8e90` → pushed 2026-10-12 as remote commit
`c6e1f19c1f8c196c44b3aaadcee208e9dda7c892` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`c6e1f19`) — remote tree == local HEAD tree. Post-commit
`validate.sh`: **18 passed, 0 failed — ALL STAGES PASS**. Working
repo only — no `-live` repo touched, no Vercel access.

## Watchtower 2.4 — Wan 2.7 joins the watch (2026-10-12)

**Assignment:** Rotation 5 — execute the addition Watchtower 2.3 verified
and deliberately did not hand-add: Wan 2.7 enters through the
research-artifact chain as its own records change (the PixVerse path), so
it appears everywhere a model should — records, pricing, drift-board
watch, docs counts — with sources intact. Then re-check the remaining
standing watches and log verdicts in the review log. Plus the 2.2 process
lesson, applied twice: no checker process was alive before either run
(`ps` verified; both runs single, detached, ~9 min each).

**The addition, through the chain.** `scripts/wave40_wan27_append.py`
appended the record to the research artifact (31 → 32 models) and closed
Wan 2.6's now-false "not in this guide" gap note; `build_api.py`
(assert 31 → 32) regenerated `models.json`; `pricing.json` gained the
wan-2-7 entry from the same figures 2.3 verified — Alibaba Cloud Model
Studio's USD list, **$0.10/s at 720p, $0.15/s at 1080p** on every
wan2.7 endpoint (wan2.7-t2v/-i2v/-r2v/-videoedit), fal hosting the same
card, China list ¥0.6/s / ¥1.0/s, confidence **official** — the first Wan
record priced from a published USD list instead of Higgsfield credits,
and written in USD-per-second words with no credit pattern, so the
Studio engine treats it as API-priced (the PixVerse convention) rather
than inventing a credit rate. `build_skills.py` produced
`direct-wan-2-7` (skills 233 → 234); `build_site.py` produced
`site/models/wan-2-7.html` and the rebuilt board. Sources were probed
with the checker's own fetch path before being written down: poyo.ai
(endpoint IDs + fal rates) and createvision.ai (spec registry: 2–15s,
720p/1080p, native audio always on) answered 200, upgrademag's launch
report 200 on retry; ABNewswire timed out and sloptvnews dropped the
connection — both excluded, the 2.3 flakiness pattern repeating on cue.

**The watches — one resolved, three unchanged.** Wan 2.7's watch is
resolved by execution and retired (queue 4 → 3). Seedance 3.0: still no
official ByteDance announcement — the catalog tops out at 2.5 and the
freshest tracking coverage concludes the same. Kling 4.0: Flash early
access remains the only live tier, API packs do not cover 4.0, no GA
model ID, no published pricing — the criteria are unchanged and unmet.
Soul Cinema: the in-app credit cost is still unpublished (third-party
~0.125 credits/image only, already on record as third-party). Verdicts
in `model-review-log.json` pass 3; history 53 → **61 events** (Wan 2.7
release + coverage + price + watch, three watch re-checks, one flag
review); the October window holds 41.

**One fresh flag, dismissed with proof.** The pass's first checker run
flagged Soul Cinema on Higgsfield's own API post — the rate source
itself. Two consecutive fetches returned **two different signatures at
identical length** (63,349 chars): the page embeds a rotating
prompt-library payload and can never hold a signature. Its rate table
still lists Soul Cinema at $0.0032/image, the figure on record. The URL
joins Soul Cinema's signature exclusions (Marketing Studio already
excludes the same page), still fetched and recorded every run. The same
run cleared Wan 2.6's 2.3 all_failed stamp unaided — all three sources
answered. Re-baseline feed (2026-10-13T01:01Z): **changed=0,
with_errors=0, no_sources=0**. Drift: **11 alerts** (the adjudicated
partial cohort), **5 watch** (incl. Wan 2.7: baseline-stable, watch on
its own pricing diff — the PixVerse pattern), 16 ok, 0 unwatched;
unpublished rates stay **5**; pricing diff vs the 2026-10-11 baseline
**6 → 7 rows** (Wan 2.7 model-added, $0.10–0.15).

**Validation:** `scripts/watchtower.test.js` **15/15** (pins moved to
the new feed: 32 models, 11 alerts with the exact id set, diff = 7 rows
incl. wan-2-7 model-added at $0.10/$0.15). `tests/api.test.sh` **55/55**
(October window 34 → 41, price diff 6 → 7, drift 32 models / 11
alerts). `studio.test.js` **70/70**, `greenlight.test.js` **29/29**,
`agent-workflows.test.js` all pass (92 assertions). `bash
scripts/validate.sh` **16 passed, 2 failed** pre-commit — stages 5a/6,
the skills + llms zero-diff checks, the expected uncommitted state (goes
green on commit, the standing pattern). Headless-Chromium screenshots
inspected (desktop 1440px + mobile 390px): cutting-room board intact,
freshness badge reads the new 01:01 UTC feed ("32 models checked — 0
changed · 0 check errors · 0 unwatched"), filter chips ALL (32), the
Wan 2.7 deep-dive renders its record (Thinking Mode, four endpoints,
worked $0.50/$1.50/$2.25 examples), Wan 2.7's card on the board carries
its sources and coverage event. AI-ism scan on new copy: clean.

**Left open:** the 3 standing watches (Seedance 3.0 confirmation,
Kling 4.0 GA, Soul Cinema's in-app credit cost) — all re-checked this
pass, none moved. The 11 partial records will keep surfacing as alerts
while their third-party sources bot-block the checker — adjudicated
three passes running now, documented, honest. LTX-2.5's ltx.io note
stands.

**Commit:** local `40f17d0` → pushed 2026-10-12 as remote commit
`1713e588aa42eef90f3464784e400e950fc0b48a` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`1713e58`) — remote tree == local HEAD tree. Post-commit
`validate.sh`: **18 passed, 0 failed — ALL STAGES PASS**. Working
repo only — no `-live` repo touched, no Vercel access.

## Watchtower 2.3 — the second review pass (2026-10-12)

**Assignment:** Rotation 4 — work everything 2.2 left open by design: the
one fresh Vidu S2 flag, the 5 standing watches, and the 10 adjudicated
partial records whose third-party sources bot-block the checker.
Adjudicate against the standing criteria written in advance (no GA model
ID + no published pricing = stays "announced" — the Kling 4.0 rule),
record verdicts in the review log + history, keep the drift board honest,
never promote on third-party churn. Plus the 2.2 process lesson: check
for a live checker process before starting one — done (`pgrep` clean
before launch; the re-baseline ran as a single process, ~10.5 min).

**The flag — dismissed with proof.** Vidu S2's flagged page
(lapaasvoice.com, a third-party blog) was fetched twice: its signature is
identical across fetches **and identical to the flagged run's stored
signature** — the "move" was the page settling against the older
baseline. Its claims (S2-Avatar, S2-Editing, 720p real-time) are the
record's own launch facts; it publishes no rate; Vidu's official pricing
page signature never moved (66450841…). No record change.

**The standing watches — one resolved, one verified, one narrowed, two
unchanged.**
- **MiniMax H3 — resolved, watch retired.** The drop the watch was set
  for (open weights, Aug 3, base checkpoint) was already on record; what
  was missing was the license term the watch asked for. The record now
  carries it: the H3 Community License excludes local deployment in the
  US, EU, UK, and South Korea (hosted API unaffected) — per the official
  Hugging Face model card, corroborated by multiple independent sources.
- **Wan 2.7 — verified, addition queued.** It clears the desk's criteria:
  official Alibaba Cloud model IDs (wan2.7-t2v/-i2v/-r2v/-videoedit) and
  published list pricing (¥0.6/s 720p, ¥1.0/s 1080p; fal hosts the same
  card at $0.10/$0.15). A new model still enters through the
  research-artifact chain as its own records change (the PixVerse path),
  not a review-pass edit — the watch stays open, marked verified.
- **Soul Cinema — first published rate, watch narrowed.** Higgsfield's
  own API post tables a **$0.0032/image starting rate** (confirmed with
  the checker's fetch path, not just search snippets). Tabled in
  `pricing.json` (tier `api-image`, confidence official) + the model
  record; the watch narrows to the still-unpublished in-app credit cost.
- **Kling 4.0 — still announced.** APIMart still lists the API as a
  preview ("prices and billing rules will be published when access is
  confirmed"); the hero banner is unchanged; no GA model ID, no pricing.
  The criteria are the criteria.
- **Seedance 3.0 — still unconfirmed.** No official ByteDance
  announcement exists in current coverage; the field is third-party
  explainers and an unofficial fan site.

**Failed sources — cohort unchanged, one condition settled.** All 14
re-probed: the 403 bot-blocks (Medium ×3 models, MarkTechPost ×3,
GlobeNewswire ×2, Morningstar, x.ai, midjourney.com) and the whatsnew.fyi
429 persist; every partial record still has an official source answering.
ABNewswire answered in the 00:13Z feed, so **2.2's third-consecutive-
failure swap condition does not trigger**. The re-baseline run
(2026-10-13T00:34Z) then produced the pass's one surprise: **Wan 2.6
all_failed** — all three of its sources timed out in a slow run. All
three answered on immediate re-probe (200/200/200, exact stored URLs);
recorded in the review log as a pass-2 addendum, verdict
recovered-no-action, and the all_failed stamp stays on the feed until
the next run — weather, honestly labeled.

**Feed state:** changed=0, with_errors=1 (the Wan 2.6 timeout case),
no_sources=0. Queue: **4 standing watches** (the Vidu flag cleared on
signature match; the H3 watch retired). Drift: **12 alerts** (11
adjudicated partials + Wan 2.6), 4 watch, 15 ok, 0 unwatched;
unpublished rates **6 → 5**; pricing diff vs the 2026-10-11 baseline
**5 → 6 rows**. History 48 → **53 events** (4 verification + Soul
Cinema's first price event). Review log: pass 2 + addendum (4 entries).

**One real bug caught by the tests.** The first Soul Cinema cost line
("API: $0.0032/image…") was parsed by the Studio engine's
`costPerImage` regex as **0.0032 credits** — a USD figure in a credits
field — which made Soul Cinema the cheapest still on the board and
moved the documented Night Bus worked example ($20.64 → $20.42, bible
avoided 1.92 → 0.05 credits). Caught by `studio.test.js` +
`agent-workflows.test.js`, fixed at the source: the record now states
the credit cost is unpublished and gives the API rate as USD per image
in words. The pricing table — the machine-readable rate — carries the
figure; the worked examples are untouched and pass as documented.

**Validation:** `scripts/watchtower.test.js` **15/15** (pins moved to
the new feed: 12 alerts with the exact id set incl. wan-2-6, Soul Cinema
watch-by-own-tier, diff = 6 rows incl. the api-image tier).
`tests/api.test.sh` **55/55** (October window 29 → 34, price diff 5 → 6,
drift alerts 11 → 12). `scripts/studio.test.js` **70/70**,
`agent-workflows.test.js` all pass. `bash scripts/validate.sh`
**17 passed, 1 failed** pre-commit — the stage-5 skills zero-diff check,
the expected uncommitted state (the 2 regenerated skill files carry this
wave's record edits; goes green on commit, the standing pattern).
Headless-Chromium screenshots inspected (desktop 1440px + mobile
390px): cutting-room board intact, freshness badge reads the new
00:34 UTC feed, drift line reads "12 need review · 4 on watch · 0
without an automated source watch · 5 without a published rate", drift
rows carry checked/verified stamps, Soul Cinema's rate on the page.
AI-ism scan on new copy: clean. Drive-by fix: `api.html` said 29 models;
it's 31.

**Left open:** the 4 standing watches (Seedance 3.0 confirmation,
Kling 4.0 GA, Wan 2.7's artifact-chain addition — verified and ready,
Soul Cinema's in-app credit cost). The 11 partial records will keep
surfacing as alerts while their third-party sources bot-block the
checker — adjudicated twice now, documented, honest. Wan 2.6's
all_failed stamp clears on the next run if the sources answer, as they
did on re-probe. LTX-2.5's ltx.io note from 2.1 stands.

**Commit:** local `de28db5` → pushed 2026-10-12 as remote commit
`10ec9e9c3da62f7d330328955bbabbc78b2893a2` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`10ec9e9`) — remote tree == local HEAD tree. Post-commit
`validate.sh`: **18 passed, 0 failed — ALL STAGES PASS**. Working
repo only — no `-live` repo touched, no Vercel access.

## Watchtower 2.2 — the first review pass + signature calibration (2026-10-12)

**Assignment:** Watchtower follow-ups — build what 2.1 left undone. Its
"Left open" named exactly one piece of work: the 8 changed-source queue
items and 8 failed-source records awaiting a human/agent review pass
(the standing promotion workflow), deliberately not promoted by 2.1.
2.2 works that queue end to end, adds the adjudication record the
workflow was missing, and — when the re-baseline run exposed it —
calibrates the change signature itself.

**The review pass.** Every flagged URL was re-fetched with the
checker's own fetch path and read against the model's record; every
failed source was re-probed. **Verdict: no promotions, zero records
changed.** All 8 flags were third-party churn: a startup-directory
listing (Seedance 3.0), the already-excluded klingai.com homepage
(Kling 3.0 + 2.5 Turbo), an ABNewswire press-release review (Hailuo),
two Magic Hour roundups whose figures match the records they were
checked against (Luma, Pika), a CometAPI aggregator post (Midjourney —
excluded in this pass), and **Kling 4.0**, the one flag that looked
like news: the klingai.com hero leads with 4.0 and the IPO coverage is
real, but there is still no GA model ID in the official API docs and
no published pricing — the two criteria the standing watch wrote down
in advance — so the record stays **announced** and the watch stays
open. The 13 partial records split into persistent 403 bot-blocks on
third-party coverage (Medium, MarkTechPost, GlobeNewswire — an official
source answered for every model), transient timeouts that recovered on
re-probe, and one flaky wire (ABNewswire). Verdicts are durable:
**`data/v1/model-review-log.json`** (new, hand-authored, schema +
`build_api.py` preserve list + manifest endpoint — 12 → 13 endpoints),
8 per-model `verification` events in `model-history.json`, and a
2.2 section in `model-updates.md`.

**The calibration catch.** The re-baseline run flagged 17 models —
nearly the same set on a second clean run, which ruled out network
weather and pointed at the surfaces. Proof: fetching one flagged
GitHub blob page twice in a row returned **two different signatures**
(the pages embed per-request nonces; they can never be
signature-stable). Across three calibration passes: **github.com
excluded from the signature globally** (config `defaults`, merged by
`check_models.py`), **26 rotating blog/listing/homepage URLs excluded
per-model** (Higgsfield blog + help-center, OpenRouter live listings,
Magic Hour's tracker, the ABNewswire wire, syndicated story rails),
each with a dated note, every source still fetched and recorded every
run. One checker improvement came out of it: an exclusion entry ending
in `$` anchors to the exact URL, so bfl.ai's homepage could be
excluded while its pricing page stayed signature-live (it never
moved). Published feed (2026-10-13T00:13Z): **changed=1** (Vidu S2, a
fresh third-party blog flag from the final run, queued for the next
pass), **with_errors=0, no_sources=0**, queue back to its 5 standing
watches + that one flag. Drift: **16 alerts → 11** (1 changed + the 10
adjudicated partials), 4 watch, 16 ok, 0 unwatched.

**Freshness surfacing.** Drift-board rows (pre-render in
`build_site.py` + live re-render in `model-watch.js`, new
`.wt-drift-meta` style) now carry a mono stamp — *checked Oct 13, 2026
· record verified Oct 11, 2026* — so a row's staleness is readable at
a glance instead of inferred from wording. The drift payload already
carried both timestamps; nothing in the API shape changed.

**One real bug fixed.** `/api/health` gave `pricing.json` a 24h SLA,
but pricing is a curated wave-cadence artifact (like models.json, 7d):
its `generated_at` is a curation date, so health flipped to degraded
forever from day two — the assertion in `tests/api.test.sh` crossed
the line mid-wave on wall clock alone. SLA is now 7 days with the
reason in a comment; the freshness-resolution regression check stands.

**Docs:** AGENT.md (counts 48 events / 6 pending, review-log row,
workflow 3 worked example rewritten for the adjudicated feed),
API.md + api.html (counts, review-log rows, schema list 12 → 13),
GO_LIVE.md + LIVE_CHECKLIST.md (preserve list + review discipline +
current state), `build_llms.py` data list. History is now 48 events;
the October window holds 29.

**Validation:** `scripts/watchtower.test.js` **15/15** (pins moved to
the published feed: 11 alerts with the exact id set, Kling 3.0
stable/ok with the verification as its latest event).
`tests/api.test.sh` **55/55** (October window 20 → 29, drift alerts
16 → 11, health freshness green after the SLA fix).
`bash scripts/validate.sh` **17 passed, 1 failed** pre-commit — the
stage-6 llms zero-diff check, the expected uncommitted state (goes
green on commit, the standing pattern). Headless-Chromium screenshots
inspected (desktop 1440px + mobile 390px): cutting-room board intact,
honest `cached` badges on the static server, since-panel counts the 9
new verification events, drift rows carry the new stamps, no overflow.
AI-ism scan on new copy: clean. No TODOs, no dead code.

**Process note (honest):** the first re-baseline attempt ran two
checker processes concurrently (a backgrounded exec reported
completion while its process was still alive, and a second was
launched against the same files). The duplicate was killed, the 2.1
feed was restored from backup, and every published number comes from
single clean runs — the duplicate's output was discarded unread.

**Left open:** the Vidu S2 flag (lapaasvoice.com move, final run) and
the 5 standing watches await the next review pass. The 10 partial
records will keep surfacing as alerts while their third-party sources
bot-block the checker — adjudicated, documented, and honest; if
ABNewswire fails a third consecutive weekly run it should be swapped
for another wire copy. LTX-2.5's ltx.io note from 2.1 stands.

**Commit:** local `a01db55` → pushed 2026-10-12 as remote commit
`cb98cee46cf8da18cb76e34828d7a8db0254ed1a` (gh-push.py, exit 0).
Verified: a second gh-push run reports no changes vs remote `main`
(`cb98cee`) — remote tree == local HEAD tree. Post-commit
`validate.sh`: **18 passed, 0 failed — ALL STAGES PASS**. Working
repo only — no `-live` repo touched, no Vercel access.

## Watchtower 2.1 — close the watch gap (2026-10-12)

**Assignment:** Watchtower 2.0 shipped the drift engine but left 11 of 31
models with no automated source watch — 9 had no check record at all, and
DoP + Marketing Studio video had records with zero sources behind them,
all surfaced honestly as "unwatched" on the drift board. 2.1 closes that
gap as far as the real world allows: every one of the 11 had a genuine,
checkable official source. **Unwatched: 11 → 0.**

**Sources added** (all in `scripts/refresh/model-check-config.json` as
`extra_urls`, every one probed live with the checker's own fetch path
before being written down):

| Model | Official source(s) added |
|---|---|
| Gemini Omni | Gemini API pricing page (Omni Flash is token-billed — the rate lives there); DeepMind Gemini model page (signature-excluded, marketing) |
| LTX-2.5 | Lightricks' GitHub releases page — ltx.io drops non-browser HTTP clients on repeated probes, so the releases feed is the watchable official surface (fetched/recorded, signature-excluded: GitHub chrome churns) |
| Vidu S2 | vidu.com/pricing + platform.vidu.com (platform excluded from signature: app chrome) |
| Vidu Q4 Preview | vidu.com/pricing + platform.vidu.com (same exclusion) — pointed at the rate card for when the promo pricing ends Nov 30 |
| Mirage Tesseract | mirage.app/tesseract product page (a free local engine — the watch tracks scope, not price) |
| Runway Gen-4.5 | runwayml.com/pricing (credit rate + plan bundles are published there) |
| FLUX 3 Video | bfl.ai/pricing, alongside the existing bfl.ai watch |
| vivago R1 | vivago.ai/pricing (record opened with no published rate; the watch catches the first) |
| PixVerse V6 | docs.platform.pixverse.ai + pixverse.ai (homepage signature-excluded: rotating hero) |
| DoP | Higgsfield's help-center DoP guide — tier/preset changes land there first |
| Marketing Studio video | Higgsfield's official API rate post + higgsfield.ai/pricing |

**The run.** `check_models.py` over all 31 models (2026-10-12T23:00Z):
`changed=8`, `with_errors=0` (no model lost every source), `no_sources=0`.
The board's new line reads: *"31 models tracked · 16 need review · 3 on
watch · 0 without an automated source watch · 6 without a published
rate."* The 16 alerts are the watch working on its first full day — 8
moved sources (all queued for human review, none auto-promoted) and 8
more models carrying a failed third-party source (13 records are
`partial` in total; the header's `with_errors` counts only
all-sources-failed, so the drift engine still reads the records, not
the header). DoP and Marketing Studio came back clean on their first
checks; PixVerse's first check is stable — its Watch severity is only
its own pricing record being one of the 5 baseline diffs.

**Two calibrations from the same run.** (1) klingai.com's rotating
homepage moved once and flagged all three Kling models simultaneously —
verified-noisy, so it joins hailuoai.video and lumalabs.ai on the
signature-exclusion list from the next run (still fetched and recorded
every run; this run's flags stand in the feed). (2) The review queue's
five standing hand-authored watches were being silently overwritten by
every checker run (the queue file's own generator shape predates them);
`check_models.py` now preserves standing items (a `status`, no
`detected_at`) and appends its changed-source items — queue is 13
pending (5 standing + 8 new), and a crash in the run's final print loop
over the merged queue was found and fixed in the process.

**Records.** 11 `coverage` events appended to `model-history.json`
(28 → 39), one per newly watched model, each naming its source;
`model-updates.md` gained the 2.1 changelog section; the drift board,
since-panel, and event log on the model-watch page were rebuilt from
the new feed. Docs updated wherever the counts live: AGENT.md (table +
workflow 3 worked example rewritten for the Oct 12 feed), API.md,
api.html, GO_LIVE.md, LIVE_CHECKLIST.md (22 → 31 models, 28 → 39
events, queue 5 → 13 — API.md's queue count had been stale at 0 and is
now the real 13).

**Validation:** `scripts/watchtower.test.js` **15/15** (pins updated to
the Oct 12 records: 0 unwatched, 16 alerts with the exact id set,
PixVerse stable/watch, DoP stable/ok, Kling 3.0 alert via the flagged
homepage). `tests/api.test.sh` **55/55** (models-status 22 → 31 models;
October event window 9 → 20; drift summary 16 alerts / 0 unwatched).
`bash scripts/validate.sh` **18 passed, 0 failed — ALL STAGES PASS**
(schemas, generator audit, llms zero-diff, link check). Playwright spot
check of the rebuilt board: live-JS and static-fallback paths render
the identical drift line and 19 rows; zero page errors (the two /api
404 resource logs on the plain static server are the designed fallback
trigger). Screenshot inspected: cutting-room board, REVIEW/WATCH chips,
honest per-model wording throughout. AI-ism scan on new copy: clean.
No TODOs, no dead code.

**Left open:** the 8 changed-source queue items and 8 failed-source
records await a human/agent review pass (the standing promotion
workflow) — this wave deliberately does not promote any of them.
klingai.com's exclusion takes effect on the next weekly run. If ltx.io
ever accepts non-browser clients, LTX-2.5's watch should move from the
GitHub releases page to the pricing page.

**Commit:** local `14af31c` (23 files) → pushed 2026-10-12 as remote commit
`e7e093e6f38d0f2ae855cc3c0cd09eb1ff3db1df` (gh-push.py, exit 0). Verified:
remote tree `fd18e5ae` == local HEAD tree, 653 entries, not truncated,
key files present (model-checks, model-history, check config, WAVELOG,
model-watch page). Working repo only — no `-live` repo touched.

## Watchtower 2.0 — model status with a memory (2026-10-12)

**Assignment:** this rotation's flagship — Watchtower 2.0: live model-status
checks with drift alerts, pricing-change detection, and a "what changed
since your last visit" view for the models the site tracks. Watchtower 1.0
(Waves A/B) could say what the guide believed and when it last checked.
It could not say what *moved*. 2.0 is the memory layer.

**Shipped:**

1. **`data/v1/model-history.json`** (new, hand-authored, preserved across
   `build_api.py` rebuilds; draft-07 schema alongside) — 28 dated events
   (12 releases, 5 status changes, 4 tier changes, 3 price changes, 2
   verifications, 2 coverage fixes), every one traced to a fact already in
   `models.json` `what_changed` or `model-updates.md`. Price events carry a
   before/after pair only where the record documents both numbers (the
   Vidu Q4 correction: $0.014/s promo floor → $0.045/s list at 540p,
   +221.4%, arithmetic pinned by test). The file also stores the
   **pricing baseline**: the pricing table as curated 2026-10-11,
   copied mechanically from the pre-wave `pricing.json`.
2. **`server/lib/drift.js`** (new, pure functions, no I/O) — the drift
   engine: `diffPricing` (tier added/removed, price up/down with pct on
   the range midpoint, model added/removed), `eventsSince`/`countKinds`,
   and `computeDrift` (per-model severity `alert|watch|ok` with
   plain-language reasons: flagged check, failed check, unwatched,
   unpublished rate, stale record, moved price). Mirrored for the browser
   as `assets/js/watchtower-lib.js`; the test suite runs both copies
   against the real data and fails if they diverge.
3. **`GET /api/models-changes`** (new, 6th function, ≤12 budget) —
   `events` in the `?since=` window (default: the baseline date; junk
   date → 400 `BAD_INPUT`), `price_changes` from the mechanical diff,
   `drift_alerts` + `drift_summary` for all 31 models; `?model_id=`
   restricts all three (unknown → 404). `models-status` upgraded to
   v2.0.0 (v1 fields untouched; per-model `drift_severity`/`drift_alerts`
   + `drift_summary` added). The daily cron's response now carries the
   same drift summary. `vercel.json` gains the route as an explicit path
   with `{"maxDuration": 10}`, no `runtime` key; `LIVE_CHECKLIST.md` and
   `GO_LIVE.md` updated (incl. the JSONP/static-`.js` and
   generator-emits-to-`data/v1/` rules spelled out).
4. **The model-watch page, rebuilt around the question "what moved?"** —
   cutting-room identity intact (deck hero, TC chrome, tail-pop colophon):
   a **since-your-last-visit panel** (pre-rendered with a 30-day window;
   with JS it re-renders for the visitor's actual last visit, kept in
   `localStorage` under `afg-watchtower-last-visit` and advanced only
   after the panel renders; a reset button re-baselines); a **drift
   board** (18 rows today: 2 Review, 16 Watch); a **pricing-changes
   table** showing the live diff; the **full 28-event log** (first 10
   open, the rest behind a native disclosure); per-card drift chips
   (latest event, "No automated watch", "Rate unpublished"). Live path:
   `/api/models-changes` + `/api/models-status`; fallback path recomputes
   the identical shapes from the four static files — no error states,
   honest badges throughout.
5. **Two real bugs found and fixed.** (a) `/api/health` has loaded its
   data files from `./v1/…` since Wave A — a path that resolves nowhere —
   so health reported `degraded` with null freshness for its entire
   life. Paths corrected to `../data/v1/…`; a regression check in
   `api.test.sh` now asserts freshness actually resolves. (b) The check
   feed's header summary claims 0 errors while its own per-model records
   show Wan 3.0 and Grok Imagine 1.5 with a failed source each
   (`source_status: "partial"`), plus DoP and Marketing Studio with no
   sources at all. Drift reads the records, not the header: the true
   picture is 2 alerts and 11 unwatched (not 9), and AGENT.md's workflow
   3 now warns agents about the discrepancy.
6. **Completeness audit (the pricing table).** Two conspicuous gaps:
   **PixVerse V6** — added to the guide in wave 39 — had no pricing
   record at all (30 of 31 covered); **FLUX 3 Video**'s QHD ($0.40/s),
   UHD ($0.80/s), and video-to-video ($0.65/$0.95) tiers were documented
   in its model record since the Sept 10 BFL listing but never reached
   the table the budget tools read. Both fixed from the records' own
   sourced figures (PixVerse: gateway-reported ~$0.09/s 720p,
   $0.18–0.23/s 1080p, third-party-estimate confidence). Coverage is now
   31 of 31, and the baseline diff shows exactly these 5 changes —
   which is the detection working, on its first day, on its own wave.
7. **Docs:** API.md + `api.html` (new endpoint, counts 30→31, manifest
   11→12 endpoints), AGENT.md (endpoint row + workflow 3 rewritten for
   2.0, stale review-queue count corrected 0→5), `build_llms.py` tool
   blurb + data list, search-index entry.

**Validation:** `scripts/watchtower.test.js` **15/15** (real-data diff ==
the 5 coverage changes; pct math; events windows; drift severities incl.
the doctored-check alert case; server/browser mirror equivalence).
`tests/api.test.sh` **55/55** (was 42/42 in Wave B; adds the
models-changes section, the health-freshness regression check, and a
corrected §9 — the old assertion demanded a `nodejs22.x` runtime pin
that the standing Vercel rule forbids and the current `vercel.json`
never had). `bash scripts/validate.sh` → 17 passed, 1 failed pre-commit —
the stage-6 llms zero-diff check, the expected uncommitted state (the
regenerated llms files carry this wave's entries; green on commit, per
the standing pattern). Playwright suites: **21/21 live** (functions
proxied to the real harness) and **20/20 static** (functions down:
cached badges, panels recomputed locally, zero page errors) — first
visit, returning visit (Sep 20 baseline names the date, shows the 8 most
recent), baseline reset, status filter, mobile 390px no overflow,
reduced-motion full content. Screenshots inspected: hero, since panel,
drift board, pricing table, PixVerse card with chips, mobile. Note: both
live badges correctly read `cached` today — the envelopes are honestly
degraded (2 failed sources; the check feed is past its 24h SLA), which
is the contract working, not a fault.

**Bugs caught in testing:** (1) the since-panel JS set `textContent` on
the heading that contained its own API badge — first render deleted the
badge from the DOM (fixed: badge moved outside the re-rendered span);
(2) two of my own api.test.sh assertions were wrong, not the endpoint
(the October window holds exactly 9 events, and the `?model_id=` check
needed an explicit `since` — the default window is the baseline date,
by design); (3) a model-added diff row rendered its "now" as a dash —
it now carries the new record's full rate span ($0.09–$0.23 for
PixVerse).

**HUMAN-MADE self-check:** the copy argues from specifics ("a
confirmation is recorded as an event because budgets were built on
these numbers; if they move, this is the baseline they move from"),
the layouts are watch-specific (kind chips, severity board, TC stamps),
and the page's best moment is a quiet one: come back tomorrow and the
first panel already knows what you missed. AI-ism scan on all new copy:
clean. No TODOs, no dead code.

**Commit:** local `be18816` (44 files) → pushed 2026-10-12 as remote commit
`15a2935617fe08fa98a492a1a44b346731ea45ba`; remote `main` HEAD matched the
pushed SHA; GitHub Trees API verified: 653 entries, not truncated, all 13
key wave files present, local HEAD tree == remote tree (`edbaa02c`). Push
succeeded on the first attempt — no 400s this wave. Remote track verified
pre-push: `astercast/ai-film-master-guide` (working repo, not `-live`).
Post-commit `validate.sh`: **18/18, ALL STAGES PASS**.

## WOW wave 2 — "The Green Light": a studio meeting, playable (2026-10-12)

**Assignment:** the ambition mandate's #1 flagship — the STUDIO. The Studio
(3.0) already plans films; this wave builds the experience the mandate
asked for: input a film concept → a complete production plan from the
site's REAL data, staged as a studio green-light meeting you can play.
Plus the episode-pipeline revisit (#7) the mandate folded in.

**Shipped** (new page `greenlight.html`, in nav Index drawer + footer +
search index + llms tools list):

1. **`assets/js/greenlight.js`** (new, ~950 lines) — the whole meeting:
   - **The read**: six-layer cold read (someone to watch, something
     happening, a camera decision, light, place and time, a feeling),
     0–100 from keyword presence, named-subject detection via
     capitalization. Honest edge cases: empty/keysmash/sub-2-word →
     NO-FOOTAGE slate; non-English flagged, not rejected.
   - **The money rule**: festival ambition unlocks flagship pricing only
     when the read clears 55/100 — a cold read gets draft money no
     matter what was asked for, stated on the record, never silent.
   - **Real cost math from `data/v1/pricing.json`** (not the Studio's
     credit estimates): per-shot model resolution with exact-match-first
     pricing lookup (so "Veo 3.1" never resolves to the "Veo 3.1 Fast"
     entry — a real bug caught in testing), festival picks the
     `standard` tier at the requested resolution, draft picks the
     cheapest usable tier, 1080p→720p→first fallback ladder; cost =
     usd_low/high × seconds × takes, arithmetic shown per shot.
     Verified figures: Veo 3.1 standard-1080p $0.40/s → $3.20/8s;
     Kling 3.0 720p $0.084/s → $0.84/10s.
   - **Hype hygiene**: Veo 4 → "doesn't exist, SEO bait, verified Oct
     2026"; Kling 4.0 → "announced, not shipped"; Sora → discontinued.
     Named and corrected, never priced.
   - **The board / money / schedule / verdict**: shot list from the real
     47-template library via the Studio engine (`window.StudioEngine`,
     newly exposed), per-model budget table with low/high ranges +
     5×/20× envelopes, day-by-day schedule, verdict stamp (GREEN LIGHT /
     CONDITIONAL / BACK TO THE ROOM) with conditions and markdown
     export (copy/download/print).
   - **Watch the plan improve**: punch-up buttons append deterministic
     craft clauses per missing layer (camera, light, place/time, mood,
     action — the room adds craft, never story; no clause for a missing
     subject) and re-run the meeting; scores, model picks, and the
     budget visibly move.
   - Pricing loads live-first via the Watchtower (`/api/models-pricing`)
     with the honest live/cached badge, static `data/v1/pricing.json`
     fallback per the data/v1/ rule.
2. **Cutting Room → Green Light bridge** (wow wave 1's candidate,
   delivered): every take in the take log gets a "Green light →"
   button — the take's final prompt + grade walk into the Green Light
   pre-filled, with a banner. Same `afg-studio-bridge` key, `greenlight`
   kind tag; the Studio's consumers ignore it.
3. **`scripts/greenlight.test.js`** — 29 node unit tests against the REAL
   data (read scoring, punch-up determinism, tier selection, the $3.20/8s
   and $0.84/10s figures, money rule, budget reconciliation, verdicts);
   **29/29 pass**. validate.sh stage 7 extended (greenlight tests, file
   presence, `window.StudioEngine` exposure, bridge wiring).
4. **Episode-pipeline revisit #7** (standing workstream, folded in per the
   mandate): second worked example in `craft/episodic-shortform.md` —
   "The Wrong Heir", a revenge-arc volume-format episode end to end
   (planner block → 11-line TTS script → keyframe/animation prompts →
   real `pricing.json` budget: $1.64 clean / $8.20 at 5× = 15% of the
   $50/min benchmark → caption → gate walk), with the cycle's verified
   economics (ByteDance Dramagic Sept 21 2026; China Q1 2026 ~128K short
   dramas, 95% AI; $90–120/min; contract prices → 200 yuan/min; US $3B
   +115% YoY; Ironblood ≤$60K/3–4 weeks). Honesty line kept: no new
   verified episode formats this cycle. Sources in
   `sources/source-index.md`.
5. **AGENT.md workflow 6** — the green-light read as an agent recipe with
   worked numbers, plus executable proof in
   `scripts/agent-workflows.test.js` (workflow 7 block: strong $66.96
   green / weak $15.15 pass — money rule); 74 → 88 assertions, all pass.

**Bugs caught in testing:** (1) `matchEntry` longest-substring matching
resolved "Veo 3.1" to the "Veo 3.1 Fast / Veo 3" entry — fixed with
exact-match-first + longest-prefix fallback (mirrors the Studio's own
`resolveModel`); (2) the money table was cramped — wrapped in the site's
`.table-scroll` pattern with right-aligned tabular numbers; (3) the
ambition radio pills borrowed `.radio-pill`/`.st-hint` classes that only
exist on studio.html — defined page-local styles; (4) a floating-point
strict-equal in my own test (9.600000000000001); (5) clipboard denial in
headless left the copy button dead — now falls back to "use Download
.md". Pre-existing site quirk noted: docs.js-appended TC stamps jam
against tool-page h2 text (no margin) — the new page hardcodes its own
stamps with spaces instead; global fix deferred.

**Validation:** `bash scripts/validate.sh` → 15 passed, 1 failed — the
failure is the stage-6 llms zero-diff check, which is the expected
pre-commit state (regenerated `llms.txt`/`llms-full.txt` carry the new
greenlight entry; goes green on commit, per the wow-wave-1 pattern).
Playwright functional suite **30/30**: weak auto-pitch (stone cold,
punch-ups, board/money/schedule/verdict, draft-money note), punch-up
loop raises the score, strong + festival (GREEN LIGHT stamp, Veo 3.1
standard-1080p), copy/download feedback, empty/gibberish NO-FOOTAGE,
Veo-4 hype correction, Ctrl+Enter, reduced-motion full content, mobile
390px zero overflow, bridge take → prefilled pitch + banner, zero
non-environmental console errors. Headless-Chromium screenshots
inspected: hero deck, pitch form, read (weak/strong), board cards,
money table, schedule, verdict stamp, chapter worked example, mobile.
Cutting Room identity intact (deck heroes, TC chrome, NO-FOOTAGE
slates, tail-pop colophon untouched).

**HUMAN-MADE self-check:** the copy has a voice ("the room adds craft,
never story", "ranges, not promises", "one day to stop touching it")
and the layouts are meeting-specific (temperature meter, verdict
stamp, day-by-day schedule), not SaaS-generic. The easter egg: the
schedule's last day is always "Lock the cut — one day to stop touching
it."

**Commit:** local `f74c2bf` (117 files: 2 new + WAVELOG + 114 rebuilt
site/) → pushed 2026-10-12 as remote commit
`7efbf6f460e0a62fffc1ef8e78446413b14f4ade`; remote `main` HEAD matched the
pushed SHA; GitHub Trees API verified: 642 entries, not truncated, all 10
key wave files present, local HEAD tree == remote tree (`fe30fa22`). Push
succeeded on the first attempt — no 400s this wave. Remote track verified
pre-push: `astercast/ai-film-master-guide` (working repo, not `-live`).

## Wave 39 — addendum: Vercel data-dir fix (2026-10-12, same day)

Critical production blocker fixed in the working repo (pushed as `ebe0ff8`,
remote `679a6276957c0dee533408c23e225119868cf7bd`, trees match):
Vercel never serves static files from under `api/`, so every frontend fetch
of `api/v1/*.json` 404s in production. Fix: `git mv api/v1 data/v1`
(25 files); generators retargeted (`build_api.py` root + manifest paths,
`build_site.py` reads + `site/data/` copy, `build_skills.py`,
`build_llms.py`, `check_models.py`); frontend `fetchWithFallback` static
paths → `data/v1/` (live `/api/*` function routes untouched);
`server/api/*.js` data requires → `../data/v1/` (cron: `../../`),
Vercel file tracing bundles them; `tests/local-server.js` + `tests/api.test.sh`
retargeted; docs swept (`api.html`, `API.md`, `AGENT.md`, `README.md`,
`GO_LIVE.md`, chapter sources, envelope `$id`); `LIVE_CHECKLIST.md` now
carries the standing rule. Verified: all `/data/v1/*` fetch 200, old
`/api/v1/*` 404s, functions serve real data via the harness,
`validate.sh` 13/13. Note for the next "-live" sync: this is exactly the
layout the -live fix expects, so a future sync can't regress it.

## Wave 39 — EXTREME MAKEOVER: the landing cut (2026-10-12)

**Assignment:** the user's verdict on the live sites — "a lot at once when someone
first visits." First impression must be SLEEK. Bar: the best sites on the
internet, not "alright." Keep everything, present it dramatically better. Plus
the new HUMAN-MADE hard rule: no AI-isms, no generic layouts, real editorial
voice, easter eggs, clean code.

**1. Homepage rebuilt as a cut, not a catalog.** The old homepage showed its
whole hand at once: an 18-link two-row nav, a 4-button hero, 7 stat cards, 6
path cards, 30 chapter cards, 3 promo cards, an API card. The new homepage:
- **Nav (all pages):** 18 flat links → 6 top-level (Guide, Cutting room,
  Teardowns, Workshop, Models, Compare) + an "Index" drawer grouping the other
  19 pages (On the bench / Study / For agents). CSS-only `<details>`,
  keyboard-accessible, `aria-current` preserved. Every page on the site got the
  slimmer header for free since `nav_html()` is shared.
- **Hero:** one primary action ("Make your first short" → the 7-day
  first-short guide) + one quiet alternative link ("or watch a scene get built
  in the cutting room"). The 4-button row and 7 stat cards are gone from the
  hero; stats became a slim mono "reel-stats" strip below it.
- **Lede rewritten with a human voice:** "Typing a sentence gets you a clip.
  Getting twelve clips to feel like one film — same faces, same world, a story
  worth the runtime — that's a craft." (Old lede was an inventory list.)
- **Learning paths:** 6-card wall → accordion rows (first-short open by
  default, with an "M1 · START HERE" grease-pencil flag). Checkboxes/progress
  JS untouched — `paths.js` still binds `.path-card[data-path]`.
- **Chapters:** 30 cards → 10 "BIN" rows (`Bin 01 — State of the Field ·
  1 chapter · 15 min · 00:00:00:00`), first open. The bin/sequence-panel idea
  comes straight from the web-craft research (site-mapped for Film).
- **Promos:** three repetitive promo cards + API card → one "Workbench"
  section with four compact tiles (Budget calculator, Prompt workshop, Prompt
  library, For agents), each with a one-line human description.
- **New: "From the cutting room"** — a signed curator's note with a genuine
  opinion ("The model is never the reason the film is bad; the cut is."),
  Newsreader serif with an Anton drop cap and an "M1 · GOOD TAKE" marker flag.
- **Waveform dividers** between sections (deterministic seeded random-walk,
  pure markup — another web-craft research steal), slate cues
  (`00:02:00:00 · SCENE 02 · SHORTEST HONEST ROUTES`) above each section.
- **Easter egg:** clicking the leader-frame countdown rolls 3-2-1 again
  (`identity.js`, click-only on the decorative `aria-hidden` deck, reduced-motion
  safe). 404 got a human touch: "even the best editors lose a reel."

**2. HUMAN-MADE audit.** Scanned homepage copy for AI-isms — none found in the
new copy (no "unlock", "delve", "game-changer", "elevate", "whether you're a
beginner or a pro"). Fixed one stale copy bug found along the way: the paths
lede said "twenty-six chapters" — it's thirty. Killed dead CSS left over from
the old layout (`.stat-strip`, `.path-grid`, `.path-card h3`, `.section-h`,
global `details` rule scoped off the nav drawer, `.stat` in the
reduced-motion list). No commented-out blocks, no TODOs. Counts are computed,
not hardcoded: `{model_count}` (31), `{chapter_count}` (30), `{skill_count}`
(233) — the strip can never drift again. vercel.json unchanged (already
compliant: explicit function paths, `maxDuration: 10`, no `runtime` key).

**3. Completeness audit.** Models: checked the field against Oct 2026 coverage —
one conspicuous gap found: **PixVerse V6** (launched Mar 30, 2026, native
audio, 15s, 1080p, 20+ camera controls; strong independent benchmark showings)
was completely uncovered. Added properly through the generator chain: research
artifact → `build_api.py` (assert 30→31) → `build_skills.py` (auto-created
`skills/models/direct-pixverse-v6.md`) → `build_site.py` (new
`site/models/pixverse-v6.html`) → `build_llms.py`. Sora's discontinuation was
already correctly tracked (status: discontinued, verified 2026-10-11).
Production stages and skill levels: covered by the pipeline docs + 7 learning
paths — no gaps found. Also fixed a latent doc bug in GO_LIVE.md: it told
editors to hand-edit `data/v1/models.json`, which `build_api.py` regenerates
from the artifact (the edit would be silently wiped). Corrected to
artifact-first.

**4. Validation:** `validate.sh` 13/13 after commit (the two generator-freshness
checks diff against git HEAD, so they pass once the regenerated
`skills/index.json`, `llms.txt`, `llms-full.txt` are committed — by design).
0 broken relative links (stage 4). 0 console errors on homepage and
cutting-room (headless Chromium). All API JSON parses. `api/` has no static
`.js` data files (json/md only). Git identity: local override removed (falls
through to the correct global `astercast` noreply identity).

**Screenshots (before/after, inspected with fresh eyes):** BEFORE
(`/tmp/fg-before-home.png`) — 18-link nav, 4 competing CTAs, stat-card wall.
AFTER (`/tmp/fg-after-home.png`, `/tmp/fg-s2-crop.png`, `/tmp/fg-wb.png`,
`/tmp/fg-after-cr.png`, `/tmp/fg-pxv.png`, `/tmp/fg-404.png`,
`/tmp/fg-mobile.png` 390px) — focused hero, one action, bins, waveform
dividers, curator's note. "Would I put this in a portfolio?" — the bins and
waveform dividers are the kind of specific, identity-bound craft I'd defend;
the curator's note is the human signal. Honest caveat: the hero timeline deck
is still information-dense at 1600px (it's the site's signature motif, kept
deliberately), and the mobile deck is cramped (pre-existing behavior).

**HUMAN-MADE self-check:** "would anyone guess a machine made this?" — the
copy has opinions and the layouts are cutting-room-specific (bins, slates,
waveforms, marker flags), not SaaS-generic. The one thing I'd still push
further in a future wave: a real before/after A/B wipe slider on a teardown
page (researched, not yet built).

**Push record:** local commit `2a0ec6e` → remote `eb0e77eb0e302756b0f7f6cc7cee1052cbb4980b`
(Trees-API verified: remote tree `2097db8c…` == local HEAD tree). Follow-up
commit `WAVELOG` hash record + changelog refresh pushed separately.

## Wave 38 — identity hardening: self-hosted fonts + Archivo conflict resolved (2026-10-12)

**Assignment:** verification + fixes, zero content changes. (1) Verify font
self-hosting is real — audit every built page for remote font requests.
(2) Resolve the Archivo-family conflict with activity-vault. (3) Re-run the
identity audit (typography pairing, custom details, reduced-motion, contrast)
with headless-Chromium screenshots, actually inspected.

**1. Font self-hosting — was NOT real, now is.** The audit found every page
loading all four families remote: `scripts/build_site.py`'s shared head
fragment (`font_links`) plus the two hand-maintained root pages (`api.html`,
`craft-not-buttons.html`) all pulled `fonts.googleapis.com/css2?...` (the
wave-37 "blocked Google-Fonts fetch" console error was exactly this). Zero
`.woff*` files existed anywhere in the repo.
**Fixed:** 5 OFL woff2 files (latin subsets) into the new `assets/fonts/`
(copied to `site/assets/fonts/` by the build, which copies `assets/`
wholesale): Anton 400 (display), Newsreader variable 200–800 upright+italic
(prose), Inter variable 100–900 (UI body), JetBrains Mono variable 100–800
(timecode). New `assets/css/fonts.css` with `@font-face` rules
(`font-display: swap`); the shared head fragment now emits a font `preload` +
the local `fonts.css` link instead of the three Google tags (depth-`../`
rewriting automatic via the existing `css_links.replace`). Provenance +
re-download recipe in `assets/fonts/FONTS.md`. Post-rebuild grep: **zero**
`fonts.googleapis` / `fonts.gstatic` / font `@import` in built HTML/CSS/JS
(the only repo hit is the FONTS.md doc URL, not a page request). Server logs
show all woff2 200s; `document.fonts` in headless Chromium: Anton / Inter /
JetBrains Mono `loaded` on the homepage (Newsreader correctly `unloaded` —
no `.prose` there); computed `h1` font-family starts with Anton — no fallback
in play. Dedupe note: Google's css2 API now serves Inter/JetBrains Mono as a
single variable file per subset even for discrete-weight requests — one file
each shipped (7 identical duplicate downloads deleted).

**2. Archivo conflict — resolved by changing FILM.** Evidence: activity-vault
uses **Archivo Black** (`--font-stamp`, stamp labels across the site, paired
with Caveat/Fraunces/Courier Prime — read-only check, repo untouched); film
used **Archivo variable** (wdth 62–125, wght 100–900) as its entire display
system. Separate families, same name + grotesque DNA, and the identity
brief's rule is "no same-font-family-everywhere" — overlap not acceptable.
Film's display face is now **Anton** (OFL, single-weight heavy condensed):
narrow where Archivo Black is wide — opposite ends of the width spectrum,
maximally distinct — while keeping the cutting-room "condensed industrial
leader" character (film leaders set heavy condensed caps). Only `tokens.css`'s
`--font-display` changed; Anton's `@font-face` is declared over weight
400–800 / stretch 50–100% so the existing `font-weight:800` /
`font-stretch:62%` display declarations bind to it with zero synthesis and
zero layout shift. Newsreader / Inter / JetBrains Mono untouched (no conflicts
with activity-vault's stack). Note: the wave brief said "Anton + IBM Plex
Mono" — that described an older identity draft; the implemented system
(waves 36/37) is Anton/Newsreader/Inter/JetBrains Mono, and self-hosting
covers what's actually used. No "Archivo" remains in sources outside
history/comments.

**3. Identity audit re-run (all verified, screenshots inspected):**
typography pairing — Anton display heroes, Newsreader prose with Anton drop
cap, Inter UI, JetBrains Mono timecode (home, chapter, cutting-room, budget,
model-watch pages); selection REC red `#c81e23`, sprocket scrollbars, 2px
tungsten `:focus-visible` (computed on focused skip-link:
`rgb(245,179,1) 2px solid`); NO-FOOTAGE `.empty-state` / `.es-slate` slates
present; tail-pop colophon on 99/99 pages; 404 upside-down slate intact;
reduced-motion: leader rests on static READY, playhead static
(forced-reduced-motion screenshot); mobile 390px clean, no overflow;
contrast recomputed: 5.73–18.22:1 (muted 7.56:1, selection 5.73:1 — all AA);
zero page errors in headless Chromium. `bash scripts/validate.sh` → **13/13
green, ALL STAGES PASS**. llms.txt untouched (no content changes; generator
zero-diff check passes). Harness notes: /tmp was 94% full from stale
chrome/puppeteer profiles → renderer crashes; freed ~110M of dead profiles
(other agents' wave scratch left alone); `--disable-dev-shm-usage` +
chrome-headless-shell for screenshots (no virtual-time-budget per the
scroll-animation hang lesson).

**Also folded in (deploy lesson, 2026-10-12 — corrected twice same night):**
first attempt set the `functions` runtime to `nodejs20.x` (Vercel had
rejected `nodejs22.x`); correction 1: ANY `runtime` value fails validation
for Node — `runtime` is only for community/unsupported runtimes (npm package
name like `vercel-php@0.5.2`); correction 2: empty `{}` ALSO fails ("Function
must contain at least one property"). Final state: `functions` lists the 5
routes as explicit paths (never broad globs — keeps static files under
`api/` like `api/v1/trends.flat.js` from deploying as functions), each with
`{"maxDuration": 10}` (matches the 10s Hobby execution limit), no `runtime`
key anywhere. `LIVE_CHECKLIST.md` carries the exact rule. Git identity:
repo-local `mikey@hatch.local` override removed per the 2026-10-12 hard rule
— commits now use the global `astercast` / noreply address.

**Commit:** local `36d148b` (121 files) → pushed 2026-10-12 as remote commit
`234a62f1c4a4c4221c68043cd2def605ba929a0d`; remote `main` HEAD matched the
pushed SHA; GitHub Trees API verified: 631 entries, not truncated, all 12 key
wave files present, local HEAD tree == remote tree (`c002871f`), fonts.css
blob SHA matches. Push succeeded on the first attempt — no 400s this wave.
Remote track verified pre-push: `astercast/ai-film-master-guide` (working
repo, not `-live`).
**Follow-up correction commit** (vercel.json maxDuration pattern): local
`a8e44e3` (3 files: vercel.json, LIVE_CHECKLIST.md, WAVELOG.md) → pushed
2026-10-12 as remote commit `7155200be0bb18666018471e5a925b98d62f45cc`;
Trees API verified: 631 entries, not truncated, key files present, local
HEAD tree == remote tree (`3852eccb`). No 400s on either push this wave.

## WOW wave 1 — "The Cutting Room, playable" (2026-10-12)

**Assignment:** the first wow-moment wave — a scroll-driven cinematic sequence
that teaches prompting BY DOING. Type a weak prompt, roll the camera, watch
the scene get built shot by shot from the guide's real prompt library; improve
the prompt via guided fix-bay techniques and watch the cut improve take by
take. Complete and working in wave 1 (no stubs); later waves layer on.

**Shipped** (new page `cutting-room.html`, in nav + footer + search index +
llms tools list):

1. **`assets/js/cutting-room.js`** (new, ~800 lines) — the whole experience:
   real ten-layer prompt analysis (the guide's anatomy keyword tables, same
   scoring formula as the linter — heuristic, honest about it); shot-by-shot
   shoot built from the REAL 47-template `prompt-templates.json` (coverage
   roles: establishing/action/insert/close-up/payoff/alt, relevance-ranked,
   deterministic; template placeholders filled with the user's own detected
   terms first, real library `[HINT: …]` examples second, honest
   `[PLACEHOLDER]` flags last); per-shot model picks from each template's
   shortlist resolved against the REAL pricing table; real cost math
   (per-second × seconds, × takes-per-keeper envelope); the fix bay —
   every missing layer gets a REAL quoted technique from a real template
   (cited by id, e.g. t1's "golden hour backlight", f5's "dawning concern",
   the library's style-lock rule), one click applies it and re-shoots as a
   new take; take log with best-take marker; weak prompts shoot on the
   cheapest video tier ("draft discipline"), strong prompts earn flagship
   picks — cost moves honestly between takes. Edge cases: empty → NO-FOOTAGE
   slate; keysmash → honest "can't shoot randomness"; non-English →
   detected (non-Latin script + ES/FR/DE/PT/IT stopwords) with an honest
   thin-analysis note.
2. **Pricing via the Watchtower contract**: `ApiClient.fetchWithFallback(
   "/api/models-pricing", "api/v1/pricing.json")` with the honest badge
   (live / cached · updated … / none) and provenance line, mirroring
   budget.js; built-in estimates last resort, always labeled.
3. **Scroll-driven cinematic framing**: hero leader countdown (identity
   system), six "Take" slates with TC stamps, gold scroll-progress hairline
   (CSS `animation-timeline: scroll()` under `@supports`, decorative +
   `aria-hidden`, `display:none` under reduced motion — the wave-34 pattern),
   IntersectionObserver reveals (JS adds the hiding class only when motion
   is safe — no-JS/reduced-motion users get full content), shot cards enter
   with 90ms stagger, sticky timeline rail that fills shot-by-shot
   (transform/opacity only, scaleX fill).
4. **Cutting Room identity intact**: `hero_cutroom` hero, take-slate headers,
   TC chrome, tail-pop colophon, NO-FOOTAGE slates for empty states, site
   tokens only; mobile 390px tuned (no overflow, timeline scrolls
   horizontally); all new text colors contrast-checked 7.56–18.22:1.
5. **Generator discipline**: template lives in `scripts/build_site.py`
   (`CUTTINGROOM_TMPL`), JS/CSS in root `assets/` (copied by the build),
   `build_llms.py` TOOLS entry added; `site/` rebuilt by the generator.

**Bugs caught in testing:** (1) `templateRelevance` called `.forEach` on a
plain-object keyword set — crashed the opening take (fixed: `Object.keys`);
(2) the weak sample "a dog in a city, cinematic" scored 35 → 2 shots —
weakened the sample to "a dog in a city" (25, Bare, 1 shot: one idea, one
shot); (3) model note compared display strings, not normalized names —
"Hailuo 02/2.3" vs "Hailuo 02 / 2.3" falsely reported "not in the pricing
table" (fixed: compare `normName`).

**Validation:** `bash scripts/validate.sh` → **13/13 green** (the stage-6
llms diff pre-commit is the expected uncommitted state — goes green on
commit). Playwright functional suite: **21/21** (weak auto-roll: Bare grade,
1 shot, 1 timeline marker, honest cached-pricing provenance; apply-technique
→ take 2 with grown prompt; strong sample: 6 shots, Excellent 96, continuity
lock, cost envelope with take-to-take delta; empty/gibberish/non-English
edge cases; Ctrl+Enter keyboard roll; reduced-motion static full content;
mobile 390px zero overflow) + **11/11 a11y** (copy-to-clipboard of final
prompt, badge `role=status`+focusable, aria-live grade/cost, labeled timeline
region, `role=alert` error, skip link, keyboard-focusable apply buttons).
Headless-Chromium screenshots inspected: hero (leader ROLLING, deck, nav
highlight), weak state, improved fix-bay (real library quotes cited),
strong state (96/100, cached badge), shoot + sticky timeline, mobile.
Console: zero non-environmental errors. Two "Target crashed" events during
testing were sandbox OOM flakiness (8GB box at 95%+) — the identical clicks
pass in isolation; not a page bug.

**Wave 2 candidates:** multilingual detectors, take A/B comparison view,
"send this take to the Studio" bridge, per-shot regeneration.

**Commit:** local `1068f01b` (107 files: 3 new + WAVELOG + 103 rebuilt
site/) → pushed 2026-10-12 as remote commit
`5a3d785a0553bf2cafa204590ab0b03d15a29e93`; remote `main` HEAD matched the
pushed SHA; GitHub Trees API verified: 615 entries, not truncated, all 9 key
wave files present, local HEAD tree == remote tree (546/546 blobs, zero
diffs). Push succeeded on the first attempt — no 400s this wave. Remote
track verified pre-push: `astercast/ai-film-master-guide` (working repo,
not `-live`).

## Standing items (permanent workstreams)

- **Episode pipeline workstream (permanent, from wave 14):** revisit every ~3 waves — new episode formats from what's working, new tools, tighter procedures, worked examples. Goal: best agent-run episode-production system anywhere. (WAVELOG entry each revisit; the research artifact lives at `~/workspace/tiktok-episode-pipeline/PIPELINE.md`.) **Last revisited: wave 38 (2026-10-11) — Adobe in-Premiere multi-model workbench (Stage 6 procedure fork), funnel price tag + Appfigures/MPA reconciliation, voice-consent production gate, "brief to the row" rule, Wan 3.0/Omni Flash/FLUX 3 tiers, planner one-emotion gate + cliffhanger templates + caption draft, hook-gen 6th vote-hook variant, "The Seventh Floor" worked example with real model-cost math. Next revisit ~wave 41.**

## Vercel Wave B — The Watchtower integration (2026-10-12)

**Commit:** local `90b87fb` (31 files, +3262/−231) → pushed 2026-10-12 as remote
commit `5ab10e9a5ec162f70b003bf0429b25121c984f5e`; remote `main` HEAD matched
the pushed SHA; all 15 key Wave B files verified present in the remote tree
via GitHub Trees API (542 blobs, not truncated; local HEAD blob SHAs match
remote exactly). Push succeeded on the first attempt — no 400s this wave.

**Frontend fallback wiring + GO_LIVE.md** (server-program ARCHITECTURE.md §3/§11/§13, followed exactly). The site now calls `/api/*` first and falls back to the static `api/v1/` JSON with honest badges — and it can never look broken when the functions are down.

**Shipped:**

1. `assets/js/api-client.js` — the §3.2 `fetchWithFallback` reference implementation, copied verbatim (7s timeout; live/waking/cached/none states; honest "cached · updated HH:MM" badge; never rejects). Accessibility lives in markup/CSS so the seven cross-site copies stay byte-identical: badge spans carry `role="status"` + `tabindex="0"` (screen-reader announced, keyboard-focusable).
2. `assets/js/model-watch.js` — the model-watch freshness layer. Pre-rendered cards + freshness panel (works with JS disabled); on load it live-updates from `/api/models-status`, falling back to `api/v1/model-checks.json`. Normalizes both shapes; renders per-card ⚑/⚠ flags for changed/error models; the panel line names the degraded state honestly ("Watchtower · degraded — …") when the envelope is degraded.
3. `assets/js/budget.js` — rewritten as the pricing-driven calculator. Rate table loads from `/api/models-pricing` (live) → `api/v1/pricing.json` (cached) → built-in estimates (last resort, never blank). Representative tier = 1080p → 720p → first usable; per-clip = per-second rate × current shot length, recomputed live as the slider moves; every option's `title` names its tier + basis; the provenance line always says where the numbers came from ("Rates: Watchtower live API · …" / "cached pricing.json · updated …" / "built-in estimates"). Handles the live envelope's `data.models` vs the static file's `data.entries` shape difference. Verified math: Kling 3.0 1080p $0.14/s × 4s = $0.56/clip × 300 gens = $168.
4. Badge CSS in `assets/css/components.css` — `.api-badge` four states (green live / amber cached / muted waking pulse / hidden none), contrast-checked (12.72 / 11.30 / 7.56 :1 on `--bg`), `prefers-reduced-motion` respected, `:focus-visible` ring, mobile stacking. Plus `.mw-freshness` panel + `.mw-flag` styles. The docs.js timecode stamp (`00:00:45:00`) on the freshness h2 is the pre-existing cutting-room signature, not a bug.
5. Generator wiring (`scripts/build_site.py`): `MODEL_WATCH_TMPL` gained the freshness panel (badge + pre-rendered line from `model-checks.json` at build time) and the api-client/model-watch script tags; `BUDGET_TMPL` gained the badge, the `#b-provenance` line, and the api-client script tag; `main()` now copies repo-root `server/api/` + `server/lib/` into `site/` — **Wave A had placed the function sources only under `site/`, and the first Wave B rebuild wiped them** (`build_site.py` starts with `shutil.rmtree(SITE)`). Function sources now live at `server/` (moved, git-tracked); a rebuild can never orphan them again.
6. `api/v1/pricing.json` + `api/v1/schema/envelope.json` moved from `site/api/v1/` (orphans) to repo-root `api/v1/` and registered in `build_api.py`'s preserve list — they are hand-maintained, so the next `build_api.py` run no longer deletes them.
7. `GO_LIVE.md` rewritten to the §11 template (11 sections): status banner, what deploys, prerequisites, exact-click hookup steps, env var table (incl. the pending GITHUB_REPO_TOKEN §14.1 decision), Hobby limits table, cold-start behavior, cron behavior, custom domain notes, rollback, cost rules with the **Standard build machine, never Turbo** rule ($38.64 invoice 1ZU1WJJS-0012). Pipeline knowledge preserved in Appendix A. NOT deployed — no Vercel project exists.
8. `API.md` + `api.html`: new "Live functions — The Watchtower" sections documenting all five `/api/*` functions, the envelope, error codes, and the fallback contract; added the previously undocumented `pricing.json` static endpoint.

**Verification:**

- `scripts/validate.sh` → **13/13 green** (incl. the api/v1 preserve-list audit covering the two moved files).
- `tests/api.test.sh` → **42/42 green** (recovered from 4/42 after the rebuild-wipe incident above; the `server/` move fixed it permanently — rebuild + retest confirmed).
- Cold-start timing (§12.4): first-hit 18ms / warm-hit 2.3ms on `/api/health`, 7.5ms warm on `/api/models-pricing` (local harness — true Vercel cold start only measurable on a preview deploy; all far under the 7s client timeout).
- Functions-disabled pass (§12.3): harness killed → `/api/models-status` 404s while `/api/v1/*.json` + both pages serve 200 with pre-rendered content; browser pass (file:// + stubbed transport, real Chromium 152) confirmed `cached` badges with honest timestamps, full renders, zero page errors.
- Headless-Chromium screenshots (real page JS/CSS, stubbed network seam — this Chromium build hard-blocks local-network navigations, so pages loaded via file:// with an in-page fetch stub): live badge (green), honest-degraded live (amber `cached · updated 22:23 UTC` + degraded panel line, 2 error flags on Wan 3.0 / Grok Imagine cards), waking state (`waking server…`, page fully readable), cached state, none state (badge hidden, content intact), budget calculator live + cached + 390px mobile. Console: zero page errors; only sandbox-egress-proxy SSL noise on Google Fonts (environment artifact).
- Accessibility: badge `role="status"` announces state changes; `tabindex="0"` makes it keyboard-focusable with a visible focus ring; text contrast 7.56–12.72:1 (AA).
- Manual cron trigger with secret: 401 without, `ok:true` with secret, `[cron]` log lines (`start`/`done changed=true committed=false sources_ok=5/5`), `committed:false` = the no-`GITHUB_REPO_TOKEN` read-only path working as designed.

**Deliberate spec notes:** `api-client.js` logic is byte-identical to §3.2 (accessibility in markup/CSS only); `GITHUB_REPO_TOKEN` still pending the user's §14.1 decision — cron verified in read-only mode; `models-status` live envelope is currently `degraded:true` (2 models' last checks failed) and the UI renders that honestly per §6.

## Vercel Wave A — The Watchtower (2026-10-11)

**First Vercel build wave** (server-program ARCHITECTURE.md, followed exactly): the film site's genius server system — "The Watchtower" — 5 serverless functions under `site/api/`, 5 shared `site/lib/` helpers, `vercel.json`, the §1.10 envelope schema, a real curated pricing table, and `tests/api.test.sh` (42 checks, all green). NOT deployed (user hasn't approved); no GO_LIVE.md yet (Wave B). Zero npm dependencies; `nodejs22.x`; envelope-only responses.

**Shipped:**

1. `site/lib/` — the five §1.11 helpers, logic identical per spec: `envelope.js` (ok/err/newRequestId/nowIso; Cache-Control per §1.6 + a `cacheControl` override so `/api/health` gets its spec'd s-maxage=60), `fetchx.js` (AbortController timeout, default 4000ms, service User-Agent), `ratelimit.js` (per-instance token bucket: 60/min public, 20/min compute; x-forwarded-for keying; hashed-IP logging), `cronauth.js` (Bearer CRON_SECRET compare, fail closed), `github.js` (Contents API readJson/writeJsonIfChanged with canonical-JSON change detection and one SHA-conflict retry).
2. `site/api/health.js` — §1.4 shape: `functions` list (asserted == the §7.1 roster), per-instance uptime, `data_freshness` for model-checks.json + pricing.json (24h SLA) + models.json (7d SLA — it's a wave-engine research artifact, not a daily refresh), `checks` booleans only. Never 5xx.
3. `site/api/models-status.js` — GET. Joins `model-checks.json` (22 models) with `pricing.json` model_ids. Statuses stable/changed/error/unwatched; the 2 models whose last repo-side check failed surface as `error` with the envelope honestly degraded (`meta.upstream` carries the failure, `stale_since` set).
4. `site/api/models-pricing.js` — GET. Serves `site/api/v1/pricing.json`: 30/30 models curated from models.json's verified cost_basis (re-verified 2026-10-11) — 23 live, 6 unpublished, 1 discontinued. Every tier carries `basis` + `confidence` (official / vendor-confirmed / third-party-mirror / reported-benchmark / credit-derived / third-party-estimate). Credit-derived tiers do arithmetic on declared inputs only (Plus plan $47/1200cr = $0.0392/credit). `?model_id=` filter; unknown id → 404 NOT_FOUND.
5. `site/api/calc-cost.js` — POST `{model_id, seconds, resolution_tier, clips=1}` → `{cost_low, cost_high, currency:'USD', breakdown[], pricing_as_of, note}`. Full validation: 400 BAD_INPUT with `details.fields` for bad body/seconds/clips/unknown tier (lists available tiers); 404 for unknown model; human-readable 400s for image models ("priced per image, not per second"), per-clip models, and discontinued models; free local engine (Mirage Tesseract) honestly computes $0. Confidence caveat in every note. Compute bucket (20/min), no-store.
6. `site/api/cron/watchtower.js` — GET `/api/cron/watchtower`, daily `0 14 * * *` UTC. CRON_SECRET bearer, fail closed; 60s duplicate-delivery cooldown. Bounded incremental refresh for the 10s budget: day-keyed rotation over the models' check URLs (max 8/run, 4s per-source timeout, ≤1 request/5s per provider domain, sequential for HTML), signature-change detection via the repo's own clean-text+sha256 technique. On a moved signature it flags the model and appends a review-queue item (pricing-page URLs get `flag:"pricing-check"`) — it NEVER auto-edits models.json/pricing.json (repo promotion rule: fetched pages are unreliable signals; a human or the wave engine verifies and promotes). `writeJsonIfChanged` commits only on change. Every touched source lands in `meta.upstream`, failures included.
7. `site/api/v1/pricing.json` (new static file = the structured "pricing section" models.json never had in machine form; also the function's static fallback) and `site/api/v1/schema/envelope.json` (§1.10; `$id` uses the planned `ai-film-master-guide.vercel.app` hostname — sweep when a real domain is assigned, spec §14.4).
8. `vercel.json` — buildCommand `python3 scripts/build_site.py` (timed **1.3s**, <60s gate), outputDirectory `site`, installCommand `echo 'no dependencies'`, `api/**/*.js` → `nodejs22.x`, one cron `/api/cron/watchtower` @ `0 14 * * *`, spec headers, cleanUrls, trailingSlash false.
9. `tests/` — `api.test.sh` (42 checks: envelope ok:true per roster endpoint, §1.10 schema validation on health/models-status/models-pricing/calc-cost/cron, 401 gates ×3, 400/404 gates ×6, static fallback ×4, cache headers ×5, rate-limit trip with Retry-After, cron-daily lint, runtime pin), `validate_envelope.py` (stdlib-only §1.10 validator — the coordinator's shared one ships in a later wave), `local-server.js` (local function-runtime harness: `vercel dev` isn't available in this sandbox, so it executes the real function files with a faithful Vercel req/res emulation; `BASE=` mode still targets a preview URL).

**Validation:** `./tests/api.test.sh` → **pass=42 fail=0**. Curl outputs inspected by hand (health freshness/degraded, models-status status counter 18 stable/2 error/2 unwatched, pricing spot-checks, calc-cost math: hailuo-2-3 1080p 6s×2 clips = $0.9804). The authorized cron run executed for real: 2 URLs checked in the 7s budget slice (both timed out from this sandbox — reported honestly as `ok:false` with `sources_ok:"0/2"`, envelope degraded, no commit attempted beyond the no-token path).

**Deliberate spec deviations (documented, all in code comments):** (a) §7.1's "update pricing fields in models.json" is overridden by the repo's own promotion rule — the cron flags, never invents prices (spec §6 outranks it). (b) GITHUB_REPO_TOKEN is still pending the user's decision (spec §14.1) — `github.js` degrades gracefully to read-only (`{committed:false, reason:'no-token'}` + plain-words note in the cron envelope); static JSON stays fresh via wave-engine pushes; zero code change needed once the PAT exists. (c) models.json freshness SLA is 7d in `/api/health` (research artifact, weekly wave cadence).

**Commit:** local `df8c246` (17 files, +2468/−1) → pushed 2026-10-11 as remote commit `ee3f71b0733c6296fa4941b66083a3c1b234d742`; remote `main` HEAD matched the pushed SHA; all 17 key Wave A files verified present in the remote tree via GitHub Trees API (591 entries, not truncated; blob SHAs match local exactly). Push succeeded on the first attempt — no 400s this wave (the in-tool 400-retry held).

**Scope note:** the wave-33 bar stands — a teardown ships with a second substantial piece. Wave 39 ships teardown #10 AND a deep new craft chapter (with a new HAND skill) on the architecture teardown #10 documents.

**Topic choice.** Surveyed the rejected pile first: AAIFF 2026 non-Grand-Prix winners (still thin — "The Last Span" has only the Seedance 2.5 + 1.5-months-script line), Reply 2026 non-top winners ("The Child of the Sea" — one PR sentence), the Higgsfield Academy loop (vendor experiment, too thin), vivago R1 (launch coverage only), Çukur: Vartolu (Prime Video acquisition is real but the workflow is PR-level — actors perform, AI builds characters over them, AYDNA 1.0 model; no per-stage documentation yet), Dor Awards' 'PerfectMan' (single-source), Austin AIFF + Higgsfield $1M winners (both pending — awards Oct 17 / late Oct). **Picked: Svedka's "Shake Your Bots Off"** — the first primarily AI-generated Super Bowl commercial (Super Bowl LX, Feb 8, 2026), with a PUBLISHED workflow account (ComfyUI case study: component-based workflows, progressive-change engineering, final hallucination-cleanup pass), independent press corroboration (ADWEEK ×2, TechCrunch, Fast Company), a real timeline (~4-month character rebuild + sub-one-month production), real costs-adjacent numbers ($10,000 TikTok dance prize), and a real backlash (ADWEEK's "Creatives React") for the what-broke shot. Wave 35 used the spot as a worked example in documentary-ethics (synthetic-person case); this is the first full production teardown — different in kind, no content repeated.

**Research** (comfy.org case study fetch + 3 search batches, all 2026-10-11): Svedka/Silverside facts above; Sazerac PR Newswire (first-ever Sazerac SB commercial, first vodka-only Big Game spot in 30+ years, :30 placement after halftime, $10,000 contest with Victoria Justice — confirms the prize figure); Parade (contest Dec 3–14); Mix 92.9 Nashville (winner Jessica Rizzardi, 23, learned of the contest on TikTok); Fast Company (Silverside's 2024 Coca-Cola AI holiday ads: three studios, Leonardo/Luma/Runway, "too fake" backlash); Breaking & Entering podcast #533 (PJ Pereira on taking the AI backlash). **Record fixes:** (1) Sazerac's Svedka acquisition dated 2024 by ADWEEK + TechCrunch; a Just Jared item says "earlier this year" — 2024 stands (two outlets), flagged in the sourcing note. (2) The timeline is two phases, not a contradiction: WSJ's ~4 months (via TechCrunch) = character-rebuild R&D; the case study's "under one month of production" = spot production vs. a half-year benchmark.

**Watch desk (folded in what's verified):** Kling 4.0 still not GA as of Oct 11 (late-night re-verify: convly.ai + apimart.ai, API still 3.0-only — no date/pricing/API/benchmarks); Higgsfield $1M winners NOT announced (first-party site "end week of October 2026 (exact date TBC)", Oct 12–18 window live); no generation-model releases in 72h (EvalMap corroborates); Sora Azure retirement Oct 15 on schedule; Austin AIFF awards Oct 17; new festival calls (African AI Film Festival via FilmFreeway through Oct 20; AFRO TV Cue Film Fest Oct 5–Nov 20). Landed as a "Wave 39 watch desk" section in `api/v1/model-updates.md` — no model-record changes (all 30 re-verified).

**Shipped:**

1. **Teardown #10 `svedka-lost-fembot`** in `api/v1/teardowns.json` (7 shots, 9 sources): (1) headline numbers — :30, Super Bowl LX Feb 8 2026, three firsts (per ADWEEK / Sazerac announcement), 12 robot actions in the first 10 seconds; (2) the problem — Sazerac's 2024 acquisition, decade-neglected brand, Fembot's CGI files gone, slot bought before the brand was picked; (3) the rebuild in parallel — paper/pencil/industrial design first, then three parallel tracks (character models / world models / candidate stories), prototypes within days, timeline reconciliation; (4) component-based ComfyUI workflows — characters/world/choreography as separately controllable elements, progressive-change engineering, dedicated final hallucination-cleanup pass, the single-prompt failure read, spend unpublished (self-built infra, not a priced API — stated, not worked around); (5) nothing is locked, ever — 2 AM texted cuts, changes a week before air, and the discipline tax (tight team, trust, Heidel's clarity-of-intent doctrine); (6) the dance came from the crowd — open call, Victoria Justice, Dec 3–14, $10,000 prize, Jessica Rizzardi, integrated in hours / Fembot's moves in minutes; (7) the verdict — steal the architecture (component separation, progressive-change design, rebuild-then-generate, own-your-likeness training, human gates, final cleanup pass), skip the novelty play (backlash verdict: "first AI-generated X" is a headline, not a concept) and the effort fantasy (the team spent MORE time with creatives). Zero direct quotes; prompt_reconstruction null throughout (no prompts published). Sourcing note flags the vendor-hosted case study, the ADWEEK/TechCrunch corroboration, and both record fixes.
2. **New craft chapter `craft/component-based-generation.md`** — "Component-Based Generation: Characters, World, and Action as Separate Controls" (15th craft chapter, REEL 16): the Svedka/Silverside worked example, the single-prompt failure argument, the identity/world/action split, progressive-change workflow design, the nothing-locked contract + Heidel's doctrine, the dedicated final cleanup pass, the human gates (story, choreography, design, QC), honest limits (n=1, vendor-hosted, 30s ≠ feature), cross-links, sources & confidence.
3. **New HAND skill `workflow-component-separation`** (cat workflow; skills 231 → 232): the genuinely-new-procedural pattern — three-component split, paper-first design lock, own-or-clear training, progressive-change engineering with independent checkpoints, nothing-locked review contract, dedicated cleanup pass, explicit human gates. Nothing in the library covers component architecture (identity-block/motion-block/style-bible are single blocks).
4. **Prompt-library cross-links:** `prompts-facets.json` links `svedka-lost-fembot` on a1 (kinetic stylized action — the 12-actions-in-10-seconds choreography) and l2 (character re-entry — the Fembot rebuild); byte-surgical, single-line/no-trailing-newline format preserved (verified: only the two intended list changes).
5. **Count updates:** AGENT.md / API.md / api.html 9 → 10 teardowns; build_site.py "all nine films" → "all ten", "all nine teardowns" → "all ten" (404), reel-head "of 29" → "of 30", homepage stat 29 → 30 chapters, lede "Twenty-nine chapters…231 task skills" → "Thirty chapters…232 task skills", stat + deck clips 231 → 232 skills; TEARDOWN_TITLES gains the Svedka entry; teardown.html llms blurb names the new teardown.
6. **Sources:** wave-39 research section in `sources/source-index.md` (10 entries + watch-desk notes).
7. **Regenerated:** `api/v1/` (re-stamped), `site/` (30 chapters), `llms.txt`/`llms-full.txt` (new teardown + chapter; zero-diff clean after staging).

**Validation:** `bash scripts/validate.sh` → **13/13 green, ALL STAGES PASS** (48 JS parse; 56 JSON parse; 11/11 schemas; 7,568 links, 0 broken; skills 232 byte-identical; prompt-templates == parser; llms.txt zero-diff; studio 70/70; agent-workflows 74/74). Two real failures caught and fixed during the wave: (1) schema — my first draft set `"breaks": null`; the teardown schema requires breaks as a string, so all 7 shots got real what-broke analysis instead; (2) the new chapter's cross-links used `.md` — the site convention is `.html` (6 broken links, fixed). A third finding from screenshots: hardcoded "chapter 16 of 29" + "29 chapters" stat + "231 skills" strings — all updated to 30/232. Headless-Chromium (Playwright, ThreadingHTTPServer): teardown viewer — 10 tabs, Svedka tab renders 7 shots, shot stepper Next advances, prev/next teardown nav wraps correctly (← The Production Office / Passport Rush →), tab ARIA roles correct; chapter page — REEL 16, "chapter 16 of 30", TOC sidebar, drop cap; mobile 390px teardown — tabs stack, Svedka content clean. Zero non-environmental console errors (only the sandbox's blocked Google-Fonts fetch). Cutting Room identity intact on all.

**Commit:** local `e5db368` (61 files) → pushed 2026-10-11 as remote commit `f4e4bb66e638d6422c9082efc9330dcf231cd08e`; remote `main` HEAD matched the pushed SHA; all 14 key wave-39 files verified present in the remote tree via GitHub Trees API (510 entries, not truncated; blob SHAs match local exactly). Push succeeded on the first attempt — no 400s this wave (the in-tool 400-retry from the morning's skill fix held). A follow-up WAVELOG-only amend (this commit line) was re-pushed and re-verified the same way — remote HEAD match + 14/14 blob SHAs identical.

## Wave 38 — EPISODE PIPELINE revisit #6 (2026-10-11)

**Standing workstream:** sixth scheduled revisit (w17 = #1, w20 = #2, w23 check pass, w26 = #3, w29 = #4, w32 = #5). Due ~wave 37, carried by the Cutting Room identity wave 2 instead — landed one wave late. Genuinely new this cycle: the NLE-integration workflow shift (Adobe's multi-model Premiere workbench), the funnel's public price tag, a consent gate for voice production, and the "brief to the row" editorial rule. **No new verified episode formats** — stated explicitly in the chapter's honesty note (ReelShort economics are monetization data, Vidu S2 is real-time avatar tech, DRAMAGO/comment-polls stand from wave 32).

**Research** (creator-economy r9 + ai-video-models r9 + wave-fuel model survey, all 2026-10-11): ReelShort/DramaBox user economics — $10–20 to finish a series, heavy users up to $80/month (creator video, single-source); Appfigures $1.2B vs MPA $1.05B denominator reconciliation (gross in-app spending vs estimated revenue — not competing facts); Spotify Partner Program 37-country expansion (Sept 17 announcement, Oct 20 opening; multi-outlet verified); Adobe in-Premiere multi-model workbench (Sept 8, IBC — TechTimes); Mirage Tesseract (Sept 22, EZ Newswire); Vidu S2 real-time (Sept 15, PR Newswire); Wan 3.0 formal (Aug 24, $0.05/s 480p provider-list); Gemini Omni Flash (~$0.03/s 360p draft); FLUX 3 Video ($0.06/s 720p draft); versely's "brief to the row" rule; Veo 4 non-existence (verified ×3); Royal Mail/ElevenLabs + Save Our Voices Now (Pinsent Mason); SynthID Detector public launch (Oct 7, ×6 sources).

**What shipped:**

1. **`craft/episodic-shortform.md`** — boom refresh (wave 38): funnel price tag + Appfigures/MPA reconciliation + Spotify Partner lane; Stage 3 consent-is-a-production-gate line (Royal Mail/ElevenLabs + 80+ performer petition → rights column in the bible); Stage 5 tooling note: Wan 3.0 cost floor, Gemini Omni Flash draft tier, FLUX 3 Video mid-tier, "brief to the row" rule (+ G5 sub-check), Veo-4-doesn't-exist hype hygiene, Vidu S2 honest mapping (real-time class, not a Stage 5 render); Stage 6 procedure fork — build-cut.sh (reference) vs in-timeline (Adobe workbench) — plus Mirage Tesseract in Stages 6–7 (motion graphics, not generation); Stage 8 SynthID Detector side-note (manual, no batch, negative ≠ authentic); new **"Worked example: one episode end to end — the interactive format"** section ("The Seventh Floor" Ep 1: concept → planner block → 12-line TTS script, 155 words / 790 chars / ≈60–75s → keyframe + animation prompts with verbatim anchor and DNA block → budget from `models.json`: voice $0.024, keyframes $0.019, animation $1.68 Vidu Q4 I2V path / $1.00 Wan 3.0 path; **$1.72 clean / $8.61 at 5× = 17% of the $50/min benchmark** → G0–G9 walk); companion-tools line + revisit-#6 honesty line; 4 new source entries.
2. **`assets/js/episode-planner.js`** — 12-emotion datalist; **two-emotion save gate** (scans stake/hook/beats/turn/cliffhanger for a second emotion word, refuses the save naming the word and field; declared-emotion self-matches excluded); 12 per-format **cliffhanger templates** with `{name}` filled from the cast ("the lead" fallback); **caption draft from block** (observed hook formula + emoji table + copy-to-clipboard).
3. **`assets/js/hook-gen.js`** — stake sanitizer (strips pasted "Episode N —" prefix, collapses whitespace, drops trailing punctuation); character-name de-duplication (real bug caught in testing: preset stakes already include the name → "Lena lena finds"); **6th variant — the vote hook** (interactive read; always carries the poll CTA); 14-word length advisory; 🚪 emoji rule for door/room/hallway stakes.
4. **`scripts/build_site.py`** — planner template gains the datalist, template select, and caption-draft UI (Cutting Room classes only — identity untouched); hook-generator five→six copy (h2, meta description, hero deck clips, search headings + blurbs); planner search blurb updated.
5. **`sources/source-index.md`** — wave-38 research section (8 entries). **`api/v1/model-updates.md`** — wave-38 tooling-field watch notes (no model-record changes). Regenerated: `site/`, `llms.txt`, `llms-full.txt`.

**Validation:** Playwright functional suite, all pass — datalist 12 options, template options contextual per format (5 = placeholder + 2 format + 2 any), `{name}` slot fill ("Freeze on Lena's face"), verbatim slot-less templates, two-emotion refusal ("triumph" in beats beside "suspense"), clean saves for all 5 presets with zero false positives, caption draft from block, 6 hook variants with sanitize + length advisory, zero non-environmental console errors (the 3 ERR_TUNNEL_CONNECTION_FAILED are the sandbox's blocked Google-Fonts fetch, same as wave 37). Headless screenshots inspected: planner (desktop + mobile 390px — controls stack clean), hook-generator, chapter worked-example section — Cutting Room identity intact on all. `bash scripts/validate.sh` → ALL STAGES PASS, 0 broken links.

**Commit:** local `2bbd4514d1c5806dfd5b5a0e1f7f83b2481db97` (18 files) → pushed 2026-10-11 as remote commit `e22ddb42173e5a6e3979665edfa6662631a1c2a0`; remote `main` HEAD matches the pushed SHA; all 11 key files verified present in the remote tree via GitHub Trees API (568 entries, not truncated; blob SHAs match local exactly). Push succeeded on the first attempt — no 400s this wave.

**Next episode-pipeline revisit:** ~wave 41.

## Wave 37 — "The Cutting Room" identity wave 2: every page recognizable blind (2026-10-11)

**Assignment:** extend the wave-36 identity system to the remaining page types —
tools (episode planner, hook generator, doctor, optimizer, budget, linter, shots,
prompts, workshop, quiz, anatomy, gallery, skills, recipes, style-bible), data
views (model tables, cost tables, model-watch), docs (API docs, skill spec,
manifesto, field guides, craft-not-buttons, knowledge checks) — plus a full
consistency audit (selection, scrollbars, focus rings, empty states, footers,
404). Identity only: content, tools, data, and API surfaces untouched.
Generator-owns-output split respected: all template work in `scripts/build_site.py`,
all CSS/JS in root `assets/`; `site/` rebuilt by the generator; the two
hand-maintained root pages (`api.html`, `craft-not-buttons.html`) edited at the
root (they are their own source, copied to `site/` by the build).

**Research applied** (`~/workspace/research_notes/RESEARCH_LOG.md` checked at wave
start; web-identity round 4's cutting-room deep dive
`web-identity-20261011-2135/notes/05a-cutting-room.md` — landed 21:41 PDT — was
the primary input, applied as techniques not copy):
- **2-pop sync markers** (verified craft: 1kHz, one frame, 2s before FFOA,
  01:00:06:00 film convention): head-pop chrome in every timeline deck's
  control row (`2-POP 01:00:06:00 · ∿1kHz`), tail pop in every footer colophon
  (97/97 pages). Aria-hidden decoration.
- **Upside-down end slate for missing content**: the 404 now carries an
  upside-down slate ("SLATED AT TAIL — FOOTAGE PENDING") under the missing-reel
  copy — the craft's native mark for footage that never arrived.
- **WORKPRINT vs ANSWER PRINT maturity**: model-watch cards and per-model hero
  badges now carry print tags — `reported` (unconfirmed) records are WORKPRINT,
  verified/active/discontinued records are ANSWER PRINT; field guides (print-ready
  by design) are tagged ANSWER PRINT.
- **Field guides** (print-first, no hero by design): screen-only slate masthead
  (`no-print`) with REC + 2-pop chrome instead of a timeline deck.
- Deliberately NOT applied (restraint is a valid path): EDL index tables
  (would restructure data views — content-adjacent, deferred), splice-tape
  frames (zero `<img>`/`<figure>` on the site — no surface), MOS markers (no
  silent media to tag), J-cut/L-cut section flows (layout choreography risk).

**What shipped:**
1. **`hero_cutroom()` generator helper** (`scripts/build_site.py`): the canonical
   Cutting Room hero — REC + live TC + 2-pop chrome, timecode ruler, three
   clip-block tracks (V2/V1/A1), sweeping playhead, leader-countdown frame,
   kicker/title/lede. Clip blocks auto-laid-out; every page gets its own deck
   labels (e.g. episode planner: BIBLE LOCK / EPISODE BLOCKS / ARC LOG;
   model-watch: WHAT IT IS / WHAT IT COSTS / WHAT CHANGED). All 25 convertible
   templates moved off the legacy `hero-film` hero; hero copy was
   *extracted* from the existing templates (never retyped) and passed through
   the outer `.format()` — except MODEL/CHECK/CHECKS_INDEX, whose hero
   fragments are pre-substituted at the call site (a value's placeholders don't
   get a second format pass — caught by the link checker, fixed same wave).
2. **2-pop head marker** added to the 3 wave-36 inline decks (index, Studio,
   teardown) — verified the teardown deck still lays out clean.
3. **Tail pop** in all 31 footer colophons (builds to 97/97 pages).
4. **`docs.js` + `identity.js` on every tool/data/docs page** (25 templates):
   leader countdowns tick everywhere, header TC tickers run, TC stamps now hit
   tool-page section h2s (45s marks, same reel), card reveal choreography, and
   previously-dead back-to-top buttons are wired.
5. **NO-FOOTAGE slates** on all true empty states (5 template slots + quiz.js +
   gallery.js); error slots deliberately left as errors, not empties.
6. **`api.html` + `craft-not-buttons.html`** (hand-maintained): full identity —
   fonts, motifs.css, deck heroes (API_V1 — DOCS / CRAFT_NOT_BUTTONS — DOC_01),
   2-pop, leader frames, TC-stamped h2s, hdr-tc ticker, palette search,
   back-to-top, tail-pop colophons.
7. **Retired** the legacy `.hero-film` / `.leader-ring` CSS (zero references
   remain) and fixed a real 404 bug found in screenshots (leader-frame
   crosshair pseudos escaped the circle — `position: static` broke their
   containing block; now `relative` with offsets reset).

**Consistency audit (all verified):** selection = REC red #c81e23 (5.73:1) global;
sprocket-dotted scrollbar thumbs global; tungsten `:focus-visible` ring global;
footers carry the tail-leader colophon on 97/97 pages; 404 holds the identity;
empty states are NO-FOOTAGE slates; `hero-film`/`leader-ring` = 0 references
anywhere. Reduced-motion: leader frames rest on static READY, playhead/deck
motion fully gated (verified in headless Chromium with reduced-motion
emulation). Mobile-first untouched (leader frame hides ≤900px as in wave 36).

**Validation:** `bash scripts/validate.sh` → **13/13 green, ALL STAGES PASS**
(7,426 links, 0 broken; node --check clean; 56 JSON parse; 11/11 schemas;
skills byte-identical; prompt-templates == parser; llms.txt zero-diff;
studio 70/70; agent-workflows 74/74). Headless Chromium screenshots: tool page
(episode-planner), data view (model-watch), docs pages (api.html,
craft-not-buttons.html), 404, teardown deck — identity renders, no page errors
(one console error per page is the sandbox's blocked Google-Fonts fetch,
environmental; system-font fallbacks hold the layout).

**Commit:** local wave-37 commit (111 files: 9 source + WAVELOG + 102 rebuilt
site/) → pushed 2026-10-11 as remote commit
`047faf7ffbdc215ff53a0a1df247b1e8077b2f6d`; remote `main` HEAD matches the
pushed SHA; all 18 key wave-37 files verified present in the remote tree via
GitHub Trees API (568 entries, not truncated; blob SHAs match local exactly;
remote `build_site.py` contains `hero_cutroom`, zero `hero-film` references).
Push needed 3 attempts — the first two died on intermittent per-request 400s
("malformed request") from the blob API at ~20–30 uploads, different file each
time (flaky, not content-related); third attempt clean.

**Standing workstream note:** the episode-pipeline revisit (#6) was due ~wave 37
but wave 37 carried the identity wave 2 instead — revisit still pending for a
subsequent wave.

## Wave 36 — "The Cutting Room" visual identity rework (wave 1) (2026-10-11)

**Assignment:** the user's top-priority directive — a massive visual-identity overhaul
at award-winning standard ("this could win Site of the Day"), per
`~/workspace/design-identity-brief.md`. Scope: the core design system — typography,
color/texture, motifs, motion language — applied to the homepage + chapter template +
Studio + teardown viewer (the highest-traffic page types). Content, tools, data, and
API surfaces untouched. Generator-owns-output split respected throughout: all CSS
work in root `assets/` (the source), templates in `scripts/build_site.py`, `site/`
rebuilt by the generator; wave-33 lesson honored (never edited `site/assets/*`
directly). Techniques borrowed from the `web-craft` research reports
(view-timeline-free CSS playhead, motion-token system, variable-font width axes,
scroll-driven progress, static-first reduced-motion variants) as *techniques* —
the identity is original, not a copy.

**Typography (the biggest single change).**
- Display: **Archivo variable** (wdth 62–125, wght 100–900) replaces Oswald —
  condensed industrial leader typography; heroes and headings set at
  `font-stretch: 62%`, weight 800, uppercase. Distinctive, not the safe choice.
- Long craft chapters: **Newsreader variable** (optical sizing) — warm readable
  serif for `.prose` (body stays Inter for tool UI; JetBrains Mono stays for
  timecode). Drop cap now sets in Archivo condensed.
- Fluid display scale on a 1.333 ratio; `text-wrap: balance` on headlines
  (Baseline), `pretty` on prose (progressive enhancement).

**Color/texture.** Deepened blacks (`--bg #090807`), tungsten + REC-red accents
kept, ember-deep added for AA-safe text-on-red. Grain kept at whisper level;
sprocket-strip token (`--sprocket`) tuned once and reused for every film edge.
Selection is now REC red (`#c81e23`, white text, 5.73:1 — AA). Scrollbars carry a
sprocket-dotted thumb. Focus ring sharpened (2px tungsten + halo).

**Signature motifs (shipped).**
- **Editing-timeline heroes** (homepage, Studio, teardown viewer): a real
  cutting-room deck — REC indicator, live timecode readout, timecode ruler,
  three clip-block tracks (V2/V1/A1), and a playhead that sweeps the deck
  (pure CSS, 16s loop; reduced-motion: static frame).
- **Leader-countdown frame**: a 3→2→1 leader circle in every new hero that ticks
  once on load with frame-advance steps, then rests on "ROLLING" (reduced-motion:
  static "READY"). New `assets/js/identity.js` drives it plus the header
  timecode ticker and hero TC readout.
- **Sprocket-hole page edges** on ≥1440px viewports; sprocket dividers top/bottom
  of heroes and above the footer; a `.sprocket-strip` divider component.
- **Timecode-stamped section headers**: every chapter `h2` gets a TC stamp
  (docs.js, 45s apart along the reel, aria-hidden); homepage section headers
  carry reel TCs; stat cards are slate cards with ruler ticks.
- **REEL framing for chapters**: new `.reel-head` slate on every chapter page —
  REEL number (01–29 across the flat chapter order), breadcrumb, read-time and
  word count as TC-styled metadata; reading progress bar gained a live
  playhead-timecode readout.
- **Teardown viewer as a timeline**: clip-strip of per-shot clip buttons with TC
  labels above the stepper (click/keyboard-jumpable), and each shot card opens
  with a viewer head (REC dot, shot n/N, TC, film title).
- **Custom details**: brand mark rebuilt as a 35mm film frame (sprockets +
  "AF" in the gate); footer tail-leader sprocket strip + timecode colophon;
  empty states restyled as "NO FOOTAGE" slates; new **404 page** ("That reel is
  missing") with leader frame and sprocket strips.

**Motion language.** Playhead sweeps, leader-countdown ticks, frame-advance
`steps()`; entrances decelerate with 55ms sibling stagger; every motion element
reduced-motion-gated to a real static final state (not just killed).
Mobile-first; contrast re-verified on every new texture (muted 7.47:1,
selection 5.73:1).

**Also fixed (stale homepage stats, same diff):** 23→29 chapters, 192→231 skills,
"Twenty-three chapters" lede. Teach-craft framing untouched.

**Validation:** `bash scripts/validate.sh` → **13/13 green, ALL STAGES PASS**;
0 broken relative links across 7,324 checked; studio.test.js 70 pass;
agent-workflows 74 pass; generator-owns-output audits clean (skills byte-identical,
llms.txt zero-diff).

**Wave 2 (later):** extend the identity to remaining page types (tools, data
views, docs), full custom-details audit — per the brief's sequencing.

## Wave 35 — New deep craft chapter: "Documentary Ethics for AI Footage" (2026-10-11)

**Assignment:** parallel lane — waves 33 (teardown #9: Tim Simmons' Dragon Blue) and 34
(Studio expansion: agentic-production-office chapter) run concurrently. Wave 35 touched
none of their files: only NEW files were written; every shared-file edit is staged in
`MERGE-fragment-w35-sources.md` for the merge worker.

**Topic choice.** The candidate directions were AI-native sound/voice craft, directing
synthetic performers, and documentary-ethics craft. The first two are already deep
chapters (`craft/sound-music-audio.md`, 85 lines with two-pass voice, TTS direction,
rights gap; `craft/directing-performance.md`, 180 lines) — a new chapter there would
duplicate. Documentary ethics had no chapter and genuine fresh material: the *Dreams
of Violets* collision at Tribeca (wave 23's "plan for the ethics question" takeaway was
still unexpanded), a current six-step disclosure workflow (magichour, Oct 2026), and
2026 platform disclosure rules with real exemption detail.

**Research** (3 fresh search batches on 2026-10-11 + the Cycle-1 scout notes +
`~/workspace/research_notes/ai-film-deep-2026-20261011-2154/report.md`):

1. *Dreams of Violets* — corroborated across outlets: 75-min docudrama, Tribeca
   Festival June 10, 2026 (first fully AI-generated live-action film at a major
   festival), dir. Ash Koosha, Fountain 0, ~$2K, ~3 months, Kling AI + Claude +
   Gemini + Nano Banana, built from journalistic reports/photographs/eyewitness
   accounts; January 2026 Tehran protests, five Iranians, Amir (10, cerebral palsy).
   Reception split: Jane Rosenthal's defense (Variety) vs. the A.V. Club's hostile
   review; Guardian framing piece (June 3, 2026); THR on the distributor/festival-rep
   walkout. All paraphrased, zero direct quotes.
2. Disclosure mechanics — YouTube/TikTok/Meta trigger and exemption detail
   (builtbyfoundry.io, ~Sept 2026): realism as trigger; YouTube's exemption list
   (filters, color, upscaling, audio repair, own-voice cloning) and no-penalty-for-
   disclosing line; TikTok's permanent auto-label from Content Credentials; banned-
   even-with-label categories. magichour.ai's six-step disclosure workflow (Oct 2026):
   describe what changed → classify realism/risk → clear inputs/claims → select
   platform control → add human-readable context → verify the published result.
   everymoviehasalesson.com (Oct 2026): sort assets by the claim they make; a label
   is not proof. EU AI Act Art 50 (applies Aug 2, 2026; grace to Dec 2026 —
   single secondary, flagged).
3. Svedka "Shake Your Bots Off" (verified, multiple outlets + ComfyUI case study):
   Super Bowl LX, Feb 8, 2026; first primarily AI-generated Super Bowl spot (per
   ADWEEK); Silverside AI; ~4 months rebuilding the lost Fembot CGI assets; humans
   on storyline; TikTok choreography call won by Jessica Rizzardi ($10,000 prize).
   Used as the clean synthetic-person case: own the likeness, credit and pay the
   human in the loop.
4. filmustage.com (Sept 2026): Human Provenance in Film framework (No AI Used /
   Assistive AI / Generative AI) + audience data (~two-thirds reject an AI lead,
   ~three-quarters want disclosure; Academy + guilds wrote "human" into rules).
5. Checked, no chapter change: Cycle-1 notes 03 (radio-edit/audio-first, AutoMV, DIY
   AWS pipeline) and 05 (Aleph 2.0, Topaz Astra) — informed the tool-mapping table;
   07 (Sora discontinued — already in field/2026-developments.md via wave 30).

**Shipped (new files only):**

1. **`craft/documentary-ethics.md`** (~23.4 KB; converts clean through md2html: 21
   headings, 11 sections, 3 comparison tables, 10-item pre-flight checklist, 3
   pull-quote blockquotes): the disclosure stack (5 layers), platform rules table
   (YouTube/TikTok/Meta), the six-step disclosure workflow, reconstruction
   discipline (source it / label it in the cut / never invent the unknowable), the
   archival-trap warning, synthetic persons (own-or-clear; USCO Part 2 Jan 2025;
   Val Kilmer/AB 1836; Svedka worked example), verification discipline (receipts,
   source dossier, AI-touch map), the pre-premiere ethics brief (4 parts), the
   *Dreams of Violets* worked example, eligibility mapping (Cannes line, HK AI IFF
   2027 redesign — flagged, Human Provenance tiers), an 8-row tool-mapping table
   against real model/platform records (C2PA, Aleph 2.0, Topaz Astra, HeyGen
   explicit-consent clone, likeness-refusal guards), a pre-flight checklist, a
   "Where this connects" cross-link block, and a Sources & confidence section with
   flag discipline.
2. **`MERGE-fragment-w35-sources.md`** — staged shared-file edits (verbatim copy):
   the one-line `CHAPTER_ORDER` addition in `scripts/build_site.py`
   ("documentary-ethics" after "episodic-shortform" — prev/next nav, TOC, search
   index, chapter grid, llms.txt craft list all derive automatically); the wave-35
   research section for `sources/source-index.md`; optional `build_llms.py`
   SECTION_NOTES entry; rebuild + validate instructions (run after waves 33/34
   land); the no-skill rationale; and the standing-workstream note below.
3. **`WAVELOG-fragment-w35.md`** (this file) — do NOT edit `WAVELOG.md`; merge
   worker folds this in.

**Web design & craftsmanship (mandatory input, wave 35).** The research coordinator's
next-level web-design domain report had NOT landed by push time
(`~/workspace/research_notes/web-craft-20261011-2014/notes/` empty; RESEARCH_LOG
says "scout still in flight"). Applied instead the site's own established design
systems, unchanged: semantic heading hierarchy (auto-generated TOC), blockquote
pull-quotes, comparison tables, task checklist, "Where this connects" cross-link
navigation, automatic prev/next chapter nav — all reduced-motion safe by default,
mobile-first by the existing CSS. Revisit against the web-craft findings when they
land (noted in the MERGE fragment §5).

**Deliberately left alone:**

- `site/` NOT rebuilt (shared state with waves 33/34 — the built page lands via the
  merge worker's `build_site.py` run).
- `sources/source-index.md`, `scripts/build_site.py`, `scripts/build_llms.py` —
  untouched; edits staged in the MERGE fragment.
- No HAND skill (waves 22/27/30/31/32 pattern: the disclosure procedure is a
  release checklist inside the chapter, not a reusable agent workflow; and
  `scripts/build_skills.py` is wave 33's lane this cycle).
- `AGENT.md`/`API.md`/`api/v1/`/`skills/` — no count or workflow changes this wave.

**Standing workstream note:** WAVELOG's standing items scheduled the EPISODE PIPELINE
revisit #6 ~wave 35 (last revisited wave 32). Wave 35 was assigned the deep craft
chapter instead — the revisit is still pending for a subsequent wave.

**Validation (honest):** full `bash scripts/validate.sh` deliberately NOT run — waves
33/34 have mid-edit shared state (teardowns.json, build_skills.py, build_site.py,
sources/source-index.md, site/), and stage 5a regenerates `skills/` from wave 33's
HAND list; running it from this lane risks dirtying their files. What was verified:
the chapter converts cleanly through the site's `md2html` (no unclosed tags, tables
render, checklist inputs emit, 21 headings for the TOC); every relative link in the
chapter resolves to an existing file
(`../legal/rights-and-disclosure.html`, `../distribution/festival-landscape-2026.html`,
`../teardown.html`, `../field/2026-developments.html`, `editing-ai-footage.md`,
`directing-performance.md`, `sound-music-audio.md`); the file is new so no generator
owns it. Merge worker runs the full suite after folding the fragment.

**Commit:** local `bfc11c285c6ec2226f47f38b7667027c0ddd0e6b` (3 files:
craft/documentary-ethics.md, MERGE-fragment-w35-sources.md, WAVELOG-fragment-w35.md)
→ pushed 2026-10-11 as remote commit `0d0fb532e9fddf47a295b1d0dae1bed67c92c927`;
remote `main` HEAD matches the pushed SHA; all 3 files verified present in the
remote tree via GitHub Trees API (561 entries, not truncated; blob SHAs match local,
content byte-identical). CORRECTION to the lane rule: `git add` was scoped to wave-35
files for the local commit, but gh-push.py pushes the WORKING TREE's tracked files
(per its docstring), so remote commit 0d0fb53 also carries waves 33/34's in-progress
working-tree files (teardowns.json, agentic-production-office.md, their build_script
and css edits). This is the tool's designed behavior in a parallel-wave environment —
their files stay owned by their lanes; they push their own finishing commits.

## Wave 34 — Studio 3.0: the Shot Refinery + plan sharing (2026-10-11)

**Lane:** parallel with wave 33 (teardown #9). Wave 33 had uncommitted work in the
shared tree throughout (teardowns.json, craft/*, prompts-facets.json, build_site.py,
build_llms.py, build_skills.py, AGENT.md/API.md/api.html, sources/source-index.md).
This wave touched ONLY: `assets/js/studio.js`, `site/assets/js/studio.js`
(byte-identical copy), `scripts/studio.test.js`, and this fragment. No HAND skill
was added — `scripts/build_skills.py` is wave 33's dirty file; adding to the HAND
list would have conflicted with their uncommitted edit. No `site/studio.html`
edits — it is generated by `STUDIO_TMPL` in wave 33's dirty `build_site.py`;
all new UI is injected from studio.js (namespaced `.st3-*`, site tokens only).

**Research integrated (genuinely, not decoratively):**
- Wave-31 teardown's documented five-field shot spec (Gaudette build: character
  design, camera movement, colour palette, emotional register, visual grammar)
  is the Refinery's field structure — credited in-dialog with a Teardowns link.
- 2026-10-11 AI-video-models mission finding ("Turbo for drafts, flagship for
  finals" — flagged the single most valuable budget-calculator content) is now
  the optimizer's 4th mode: **Draft cheap, finish flagship**.
- `~/workspace/research_notes/RESEARCH_LOG.md` checked 2026-10-11 ~20:15 PDT.
- Web design & craftsmanship domain: round-1 report `web-craft-20261011-2014/`
  landed 20:17 PDT (was an empty dir when work started); round-2 follow-up
  `web-craft-20261011-2025/` landed 20:30 PDT. Both read in full before finalizing;
  findings below are applied to the Studio expansion. No generic redesign; the
  site's cinematic-craft identity is untouched.

**Design findings applied (from the landed reports):**
1. Wayfinding (parent brief) — sticky packet section nav injected per render,
   built from the rendered h3s, IntersectionObserver scroll-spy
   (`aria-current`). Into-Studio wayfinding from other guide pages lives in
   `build_site.py` nav templates — wave 33's lane; untouched.
2. Typography/spacing (parent brief) — dialog + injected UI use only the site's
   existing token variables and type scale; `text-wrap: balance` on the dialog
   headline (Baseline 2024, cheap). No new visual language.
3. Scroll-driven animation (parent brief) — gold scroll-progress hairline via
   `animation-timeline: scroll()` under `@supports`, `display:none` under
   `prefers-reduced-motion`. Failure-mode rule honored (round-2 Angle 1): the
   bar is decorative + `aria-hidden`, so no-support browsers get "no hairline",
   never invisible content. ~83% support → enhancement-only posture kept.
4. View transitions (parent brief) — refinement write-back updates the shot card
   surgically (no full re-render, no scroll jump) inside
   `document.startViewTransition()` — Baseline since Oct 2025 (round-1), so it
   ships with only a feature check; the reduced-motion guard stays as the
   user's preference, not a support question.
5. Container queries (parent brief) — `.st3-shots` gets `container-type:
   inline-size`; 2-column shot cards at ≥58rem container width, mobile-first
   single column.
6. Studio page architecture (parent brief) — kept (form → packet → saved
   plans); Refine buttons on shot cards, Share buttons on saved plans.
7. Motion tokens (round-1 §3, verified) — `--st3-dur-fast/base/slow` (120/200/
   480ms) + `--st3-ease-standard/out` as custom properties; dialog entry =
   opacity + 10px rise, decelerating ease-out, 200ms (entrances decelerate,
   transform + opacity only); reduced-motion variant kills the travel.
   Button/nav hover = 120ms ease-out lift (tactile feedback, <100ms feel).
8. Native `<dialog>` discipline (round-2 Angle 4) — removed my own manual
   focus-return on close (redundant; `close()` restores the trigger natively,
   Baseline ~Mar 2022). Native `showModal()` trap + Escape kept.
9. No-ARIA-better-than-bad-ARIA (round-1 §5, WebAIM 2026) — removed
   `aria-live="polite"` from the live-typing preview `<pre>` (announcement
   spam on every keystroke); SR users get the Preview button + the focusable
   pre on demand; discrete actions still announce via the existing
   `role=status` announcer; import errors use `role=alert`.
10. `field-sizing: content` (Baseline Jun 2026, round-2) — refinery textareas
    auto-grow, no JS; scoped to the refinery dialog (share JSON textareas keep
    fixed heights).
11. `content-visibility: auto` + `contain-intrinsic-size` (round-1 §6) on shot
    cards — 150-card festival packets stay fast without virtualization.
12. `:focus-visible` gold outlines on the new nav pills + refine buttons;
    visible-text = accessible name everywhere (WCAG 2.5.3 label-in-name).
13. TetraLogical anxiety principles ("ensure people are in control") — the loop
    is preview-before-commit with restore-original + full round history; the
    packet nav is accessible wayfinding.
14. Deliberately NOT applied (restraint is a valid path — Fluid Glass
    precedent): blur-reveal signature effects, kinetic typography,
    anchor-positioned tooltips (inline help text beats tooltips in a form),
    cross-document view transitions (site-nav level, build_site.py lane),
    sensory-envelope toggle (site-level setting, needs studio.html — wave 33's
    lane; flagged as follow-up).
15. Jury-pillar self-review: one point of view (the packet is a planning tool,
    motion serves it); choreographed-not-decorative (one entry animation, one
    crossfade, one progress hairline); performance (lean vanilla JS,
    content-visibility, no libraries, no rAF loops).

**What shipped (Studio 3.0):**

1. **Shot Refinery — per-shot prompt refinement loop** (film + series plans):
   - Engine (pure, exported): `slotFills` (extracted from `fillPrompt`, which now
     takes slot overrides), `REFINERY_FIELDS`, `refineryInit` (character/palette
     seeded from the engine's actual slot values), `validateRefineryFields`
     (camera id checked against the guide's 22-move lexicon), `buildRefinedPrompt`
     (deterministic: template re-filled with overrides + five-field direction
     block appended; empty fields skipped), `findRefinedShots`,
     `refineShotInPlan` (write-back + round history; generated prompt kept once
     as `shot.originalPrompt`), `revertRefinement`, `planRefinements`,
     `refinementsToMarkdown` / `refinementsToHtml`, `shotRefAttrs`,
     `refineButtonHtml`.
   - UI: per-shot "Refine shot" button → native `<dialog>` (five fields; camera
     is a lexicon select once `camera-movements.json` loads, text fallback
     before), live preview, "Use this version" (dialog stays open — it is a
     loop), per-round history, "Restore original". Refining changes WORDS ONLY —
     budget/schedule byte-identical (asserted). `aria-live` announcements, focus
     in/out management, Esc native, reduced-motion respected.
   - Exports: film markdown, series markdown, and self-contained series HTML
     gain a "Shot refinements" section (rounds, five-field specs, final prompts);
     refined shots get `refined ×N` badges in the packet. Series HTML packet now
     says "Planned by Studio 3.0".
2. **Plan sharing — export/import** (film, series, microdrama):
   - Engine: `exportPlanData` (`{format:"afg-studio-plan", v:1, …}`) /
     `importPlanData` (rejects bad JSON, wrong format tag, future versions,
     unknown kinds, missing input/plan/shots/episodes/budget — each with a
     named error).
   - UI: per-plan "Share" button → dialog with readonly JSON, Download .json,
     Copy JSON, and Import (file picker + paste → validates → adds to saved
     plans → loads). Nothing uploaded anywhere; the file is the share mechanism.
3. **Cost optimizer — 4th mode "Draft cheap, finish flagship"**: takes 1..n−1 at
   the cheapest viable rate, the keeper take at the best-rated model
   (takes=1 → best-rated). Engine `modes.draftfinal` + per-episode rollup; mode
   table, markdown, HTML, and panel renderers all carry four modes ("Three
   budget modes" → "Four budget modes" in all four sites + comment).
4. **Tests:** `scripts/studio.test.js` 50 → **70** (20 new: 14 refinery, 3 sharing,
   3 optimizer; 1 existing assertion updated three→four modes).

**Validation:** `bash scripts/validate.sh` → **ALL STAGES PASS (13/13)** —
46 JS `node --check` clean; 56 JSON parse; 11/11 schemas; 7,023 links, 0 broken;
skills/ 231 files byte-identical (no hand edits; count includes wave 33's new
skill); prompt-templates == parser; api/v1 preserve-list clean; prompts-facets
in sync; llms.txt zero-diff; studio.test.js 70/70; agent-workflows 74/74.

**Commits:** local `6b342d1` → pushed 2026-10-11 as remote commit
`14d8e04a196294466f6e672831d03f430c57c623`; remote `main` HEAD matches the
pushed SHA; all 4 wave-34 files verified present in the remote tree via GitHub
API (503 tree entries, 0 missing, not truncated; remote `assets/js/studio.js`
blob sha256-identical to local and contains all wave-34 markers: refinery
engine, draftfinal mode, st3 design CSS).

**Needs merge attention:**
- Injected `.st3-*` styles in studio.js are a candidate for `STUDIO_TMPL`'s
  `<style>` on the final rebuild (noted in-code).
- `AGENT.md` / `API.md` optimizer copy may still say "three budget modes" —
  wave 33 owns those files; flag it to them.
- No llms.txt/skill changes from this wave; stage 6 passed with wave 33's
  uncommitted work in-tree (their current changes don't move llms output —
  recheck after they commit).
- This wave deliberately did NOT run `git add -A` (would have swept wave 33's
  uncommitted files); only the four wave-34 files were staged.

## Wave 33 — 9th teardown: "The Production Office" + new craft chapter (2026-10-11)

**Scope note:** standing bar raised mid-wave — one teardown alone no longer counts as a wave. Wave 33 ships teardown #9 AND a second substantial piece: a deep new craft chapter (with a new HAND skill) on the pattern teardown #9 documents.

**Research** (5 search batches + 2 page fetches): surveyed AAIFF 2026 non-Grand-Prix winners (Kazinform winners piece — Best Story "The Last Span" by 2xLabs has only "Seedance 2.5 + another exclusive tool, 1.5 months refining the script"; Best Character/Visual/Direction/Concept winners have no published pipelines), Reply AI Film Festival 2026 non-top winners ("The Child of the Sea" by Ibai Abad — Magnific + human-led editing, one PR sentence only; "Le Drip," "Website," "Centenarian Kindergarten" — no breakdowns), the Higgsfield Academy four-step-loop experiment (documented, but a vendor's single-page experiment — too thin for a teardown), and vivago R1 (still launch coverage only — no independent case study as of Oct 11, 2026). **Picked: Tim Simmons' (Theoretically Media) "Dragon Blue"** — a hyper-stylized AI action short about vengeance and katanas, made solo in two days with Claude Cowork as the "production office" and a PUBLISHED file-driven pipeline skill (v3): SKILL.md two-stage workflow (stills: character reference grids + scene grids; video second), references/ (prompt templates, filter-safety memory, style lock, story notes), tracking/ (production tracker), Nano Banana Pro stills, Luma Agent Board scene boards with "spray and select," Seedance 2.0 via Dreamina, Suno score, Adobe Podcast Enhance Speech, Topaz upscale. The creator's newsletter documents the skill's contents; the YouTube masterclass description lists every tool, technique, and the chapter structure. Sources: newsletter, masterclass description, creator about page (17 yrs professional experience; cited by Forbes/Decrypt/ICG/TV Tech/CineD), film listing, plus the disclosed-sponsored Martini.film follow-up used only for the sourcing note.

**Research-coordinator check:** RESEARCH_LOG.md has no new film-guide entries since the wave started (newest film-relevant dir predates wave 33). The web-craft design scout's round-1 angle notes (design trends, new CSS, motion, typography) landed mid-wave and were applied — see design section below.

**Shipped:**

1. **Teardown #9 `dragon-blue-production-office`** in `api/v1/teardowns.json` (7 shots, 5 sources): (1) headline numbers — solo, two days, ~4-min action short, Claude Cowork production office; illustrative bounding math (Seedance 2.0 BytePlus estimate ~$0.37/s 1080p → 240s clean ≈ $89; Dreamina spend unpublished — the envelope, not the audit); (2) SKILL.md — the agent reads the pipeline, not your chat history; (3) the references folder — templates, filter-safety memory (blocked keywords fought once, never again), style lock, story notes; (4) Nano Banana Pro over NB2 (cinematic framing, less "sheen") + Luma Agent Board spray-and-select; (5) Seedance 2.0 via Dreamina + the BTS tool-bias read (Seedance BTS leans pro-EPK, "No Interviews" fix; Veo 3 leans run-and-gun — cast the model to its bias); (6) token discipline — ~4.7k-token footprint, Opus-class for judgment / Sonnet/Haiku for filing, handoff-prompt discipline, the file-rename warning; (7) the verdict — steal the office, not the sprint (17 yrs craft made two days possible; v4 within weeks). Zero direct quotes; prompt_reconstruction null throughout (the published procedure IS the documentation). Sourcing note flags self-reported n=1, the published skill as checkable artifact, and the sponsored-content exclusion.
2. **New craft chapter `craft/agentic-production-office.md`** — "The Agentic Production Office: Running a Solo Film With a File-Driven Agent Crew" (13th craft chapter): the file contract (SKILL.md / references/ / tracking/), stills-before-video two-stage, the safety memory, token budget + model role-split, handoff discipline, honest limits (n=1, agent doesn't verify, tool stack perishable), sourced from Simmons + vivago R1 (EZ Newswire) + Higgsfield Academy loop + the Martini.film sponsored flag. Cross-linked from `craft/longform-pipelines.md` (third architecture) and `craft/character-consistency.md` (second documented build).
3. **New HAND skill `workflow-production-office`** (cat workflow; skills 230 → 231): "Run a file-driven production office" — the genuinely-new-procedural pattern (file contract, two-stage, safety memory, token role-split, handoff discipline, version-per-film). Nothing in the existing skill library covers agent-orchestrated pipelines.
4. **Prompt-library cross-links:** `prompts-facets.json` links `dragon-blue-production-office` on a1 (kinetic stylized action), l2 (character re-entry — reference grids), s3 (dramatic audio — Suno score); byte-surgical, single-line/no-trailing-newline format preserved.
5. **Count updates:** AGENT.md / API.md / api.html 8 → 9 teardowns; build_site.py "all eight films" → "all nine"; search-index + llms blurbs name the new teardown; TEARDOWN_TITLES gains the entry (fixed a double-paren render bug during the wave).
6. **Design findings applied** (web-craft scout round-1 notes — design-trends, new-css, motion, typography): `text-wrap: balance` on all headings + `.prose h2/h3` (Baseline 2024, cheap); `text-wrap: pretty` on chapter paragraphs (progressive enhancement); shot-card entrance on the teardown viewer (decelerate, transform + opacity only, 220ms — one animation, one job: shot-to-shot continuity; reduced-motion → opacity-only via the existing contract); **prev/next teardown navigation** in the viewer (cross-linking between teardowns — tabs + arrow keys existed, visible cross-nav didn't); fixed the stale teardown lede ("Four documented AI-film sequences" → "Nine documented AI-film productions"). No identity change, mobile-first untouched, no new motion mechanism beyond the one entrance.
7. **Infra lesson re-learned:** `site/assets/*` is GENERATED — `build_site.py` copytrees root `assets/` over it on every build. First design pass edited the generated copies and was wiped on rebuild; all edits moved to root `assets/css|js/`. (Same family as the api/v1 preserve-list lesson.)

**Validation:** (post-commit) `bash scripts/validate.sh` → ALL STAGES PASS (13/13); link check 0 broken; node --check clean (teardown.js re-verified after the nav edit); studio.test.js 50/50; agent-workflows.test.js 74/74; generator audits clean (skills byte-identical incl. new HAND skill, prompt-templates.json == artifact parser, llms.txt zero-diff). Teardown viewer smoke-tested in node with a DOM shim: 9 tabs, Dragon Blue tab present, films-nav renders, shot card + sources intact.

**Commit:** local `e4f16d2` (65 files) → pushed 2026-10-11 as remote commit `15b174e18ea37b158f2e5d90fbcb0018f69f6550`; remote `main` HEAD matches the pushed SHA; key files verified present in the remote tree via GitHub API.

**Next episode-pipeline revisit:** ~wave 35.

## Wave 32 — EPISODE PIPELINE revisit #5 (2026-10-11)

**Standing workstream:** fifth scheduled revisit (w17 = #1, w20 = #2, w23 check pass, w26 = #3, w29 = #4). Genuinely new material this cycle: a top-ranked TTS engine with real pricing, YouTube's monetization-threshold change, institutional series-development discipline going mainstream, and a new distribution mechanic from an AI-native platform.

**Research** (7 search batches): TikTok mini-drama / serialized AI drama space (Oct 2026); Kling 4.0 GA status; Vidu Q4 GA status; new TTS tools; YouTube Shorts policy/monetization updates; TikTok AI-labeling enforcement detail.

**What changed in `craft/episodic-shortform.md` (all sourced, no invented productions):**

1. **Stage 4 voice tooling note — HeyGen Voice** (Oct 9, 2026): debuted at #1 on Artificial Analysis' independent TTS leaderboard (Elo 1,201, blind human tests); API $30/million characters list, $15/million launch price through Oct 31 (vibeleaderboard.ai — verify live); ~40 chars/sec — slow for realtime, fine for the pipeline's batch per-line synthesis. The pipeline's voice contract doesn't change: same voice ID per character, locked in the bible, verified by the duration concat. Lock the engine once; never swap mid-series — G9 discipline beats a better Elo. (Revises wave 29's "no chapter change" call — pricing + API detail now make it a documented engine option.)
2. **YouTube's Feb 2027 monetization threshold — the other shoe of the Oct 1 originality update:** Partner Program changes (announced Aug 2026, effective Feb 1, 2027) require 10M qualified Shorts views/rolling 90 days to keep Shorts Creator Pool earnings; new applicants need 1,000 subscribers + 8,000 qualified watch hours/365 days or 20M Shorts views/90 days (billo.app, gizbot.com). Three rules are separate — (1) recommendation ranking (Oct 1 change), (2) reused-content monetization policy (unchanged), (3) Creator Pool split (unchanged) — so a channel can keep monetization and still lose its audience (readus247.com). No start date was given for the reach cut; channels switching to original get reach re-evaluated (Ritchie via marketingnewsroom.com). Pipeline position: original footage from day one, nothing to retrofit.
3. **Institutional tier — series-development discipline going mainstream:** Sundance Collab + TikTok's Micro-Series Challenge (deadline Sept 9, 2026) asked for a logline, character bios, full synopsis, scripts for the first 30 episodes, and a 1–3 page series bible — this chapter's G0 artifacts as a submission form (creator post, LinkedIn — single-source, flagged). Caveats noted: AI was barred from the *submissions* (craft validation, not tool endorsement) and the deadline passed. Plus TikTok itself becoming a producer: casting soap-opera-style micro-dramas, "TikTok Drama" US trademark, ~$1.4B US market estimate (Business Insider March 24, 2026, via newsmissinglinkhub.com — chain flagged); TikTok-reported 2.26B short-drama downloads in 2025, +140% YoY Q1 2026 (alvinology.com).
4. **New distribution mechanic — Shortical's "off-screen lives":** *Bound by Fire* (Oct 2026), Shortical's first fully AI-generated original micro-drama, ships AI cast members that keep living on social media between episodes (PR Newswire — company-claimed). The craft read: not a new format — the day-in-the-life format pointed at a drama's cast, keeping the audience inside the world between cliffhangers. File it as a technique to steal, not a lane to add.
5. **AI-label scope detail:** TikTok's labeling requirement targets realistic-looking people/scenes — generic TTS narration and anime-style art are exempt; auto-labeling runs at scale via C2PA Content Credentials (usefastlane.ai, storrito.com — secondary policy summaries, not the guidelines text). Voice-led mini-dramas still turn the label on — the realistic-people trigger fires on the visuals. Plus the EU AI Act Article 50 transparency duties (apply from Aug 2, 2026; marking grace period to Dec 2026 — digitalapplied.com, single secondary, flagged).
6. **Sources:** new wave-32 research section in `sources/source-index.md` (13 entries).

**Deliberately left alone (the revisit log):**

- **Kling 4.0** — full model still not GA as of Oct 11, 2026 ("coming this October" is a month, not a date — wavespeed Oct-11 evidence review, rctv.com); Flash early access only. Chapter's "announced, not GA" line and record status both still correct.
- **Vidu Q4** — still in public preview (Oct 7, 2026 launch); third-party platforms (SelfyzAI, Enkio) announcing beta-test completion is company PR, not GA. Record unchanged, no chapter edit.
- **No new format presets** — Sundance challenge = competition, not a format; Shortical's off-screen lives = technique, not a lane; TikTok self-production = platform news. The four formats + the honesty note stand.
- **No new worked examples** — nothing new documents a production at rebuildable detail; the Night Bus + StoReel/Qidian builds stand.
- **No new verified hook patterns** — the five hook formulas stand; the Hook-title generator code is untouched.
- **Episode planner code** — untouched (no new format presets, no new runtime bands justified this cycle; the bridge and estimator stay as-is).
- **No HAND skill** — HeyGen Voice is an engine option inside the existing Stage 3 procedure, not a new procedure; the platform-rule additions are compliance lines, not workflows.
- **AGENT.md / API.md / models.json** — untouched (no workflow change, no endpoint change, no model-record change this wave).

**Validation:** (post-commit) `bash scripts/validate.sh` → ALL STAGES PASS (13/13); link check 0 broken; studio.test.js 50/50; agent-workflows.test.js 74/74; generator audits clean (skills byte-identical, prompt-templates.json == artifact parser, llms.txt zero-diff).

**Commit:** local `784c9ec` (9 files) → pushed 2026-10-11 as remote commit `30e3d08bc4cce693fbbd51d6e72085b4de107c61`; remote `main` HEAD matches the pushed SHA; all 6 key files verified present in the remote tree via GitHub API (558 tree entries, 0 missing, not truncated; remote `site/craft/episodic-shortform.html` blob confirmed to contain the new HeyGen Voice note and wave-32 sourcing).

**Next episode-pipeline revisit:** ~wave 35.

## Wave 31 — 8th teardown: "The Character Sheets Came First" (2026-10-11)

**Research** (5 search batches + page fetch): Robert Gaudette's "A Face Only a Mother Could Love" — the 8-minute solo AI short that took the $50,000 Grand Prix at the 2026 Runway AI Film Festival and then won the Reply AI Film Festival 2026 in Venice. Picked for the most rebuildable documented pipeline of the candidates surveyed: Kling 4.0-early-access productions had no published breakdowns, the AAIFF 2026 non-Grand-Prix winners (Best Story, Best Visual, etc.) had thin pipeline detail in the Kazinform winners piece, and no vivago R1 case study exists yet (launched Oct 9). Sources: the Reply press release (Business Wire, Sept 7, 2026), the film's own escape.ai page + YouTube description (the creator's pipeline account — first-hand, self-reported), Animation World Network + broadcastdialogue (Nolia Studios launch, awards record), the AI Cafe interview description (recorded June 23, 2026), Jon Flynn's "Brag or Bury" essay, and hollywoodcgfx's roundup (niche blog — production facts corroborated by the AI Cafe description).

**Shipped:**

1. **New teardown `gaudette-mother-could-love`** in `api/v1/teardowns.json` (7 shots, 8 sources): (1) headline numbers — 8 min, ~238 hours (2 weeks × 17-hour days), solo, no cast/crew; $50K Runway Grand Prix + Reply win; no published budget; illustrative bounding math (Seedance 2.5 1080p list $0.5686/s → 480 finished seconds ≈ $273, explicitly illustrative, generation is a hundreds-of-dollars line item); (2) the drawer scripts — ~30 scripts filed away, film from a story written some time ago, AI removed the funding gate not the writing; (3) character sheets first — continuity as asset pipeline, Marcel's disfigurement made lockable; tool identity varies across sources (Grok/Nano Banana/Seedance in the PR vs. CapCut/Dreamina/Gemini AI/Runway ML in the creator's tags — reported, not audited); (4) the five-field shot spec (character design, camera movement, colour palette, emotional register, visual grammar) + the ONE labeled analytical prompt reconstruction (Marcel dancing alone); (5) two-pass voice — lip-sync in the prompt, redub for voice consistency (11Labs), narration tuned for deadpan warmth; (6) worn-in Suno score + one ambience bed per world (Halloween night / apartment / park at dusk), CapCut edit — audiences forgot it was synthetic; (7) the verdict — steal the craft (sheets first, five-field prompts, two-pass voice, worn-in score, script drawer, sound does the realness), skip the sprint (238 hrs / 14 days = burnout, not a schedule), skip the tag-cloud stack, skip the poetry. All facts paraphrased, zero direct quotes; sourcing note flags the self-reported pipeline, the corroborated envelope, and the niche-blog source.
2. **Prompt library:** `prompts-facets.json` links `gaudette-mother-could-love` on l2 (character re-entry — sheets as continuity engine), f2 (intimate close-up — five-field spec), s2 (audio, intimate — two-pass voice + worn-in score), t2 (dialogue two-shot — lip-sync-in-prompt + redub); byte-surgical edits preserving the file's single-line/no-trailing-newline format.
3. **Craft chapters:** `craft/character-consistency.md` gains an "A documented build" paragraph (character-sheets-first; the disfigurement as the lockable trait); `craft/sound-music-audio.md` gains a two-pass-voice paragraph, a "brief by emotional function" music bullet, and a Sources-confidence line.
4. **Count updates:** AGENT.md, API.md, root `api.html` 7→8; `build_site.py` learning-path "all eight films" + search-index headings/text; `build_llms.py` teardown blurb + `TEARDOWN_TITLES` entry.
5. **No HAND skill:** same rationale as waves 22/27/30 — nothing new procedural; the patterns are already proceduralized (`craft-character-sheets`, `audio-lip-sync-route`, `audio-direct-voiceover`, `audio-music-brief`, `audio-sfx-bed`). Skills 230, regenerated byte-identical.
6. **Regenerated:** `api/v1/` (re-stamped; manifest n_teardowns=8), `site/` (27 chapters, search index, teardowns.json copy), `llms.txt`/`llms-full.txt` (new teardown in blurb + names list; zero-diff clean after commit).

**Validation:** (post-commit) `bash scripts/validate.sh` → ALL STAGES PASS (13/13); link check 0 broken (6,897 links); node --check clean (46 JS files); studio.test.js 50/50; agent-workflows.test.js 74/74; generator audits clean (skills byte-identical, prompt-templates.json == artifact parser, llms.txt zero-diff).

**Commit:** local `aa83456` (27 files) → pushed 2026-10-11 as remote commit `c5e8ac85c26d30e048eeb310c4999db7fdc4c85b`; remote `main` HEAD matches the pushed SHA; all 15 key files verified present in the remote tree via GitHub API (558 tree entries, 0 missing, not truncated; remote `api/v1/teardowns.json` blob confirmed to contain `gaudette-mother-could-love`).

**Next episode-pipeline revisit:** ~wave 32.

## Wave 30 — Late-Q4 model field sweep (2026-10-11)

**Research** (8 search batches): re-verified all 29 model records against Oct 2026 coverage — Kling 4.0 GA status, Vidu Q4 Preview pricing/specs, Veo 3.1 ladder, Seedance 2.5/2.0, MiniMax H3, Wan 3.0, LTX-2.5, FLUX 3 T2V, Grok Imagine 1.5 Lite, Mirage Tesseract, Vidu S2 real-time, Seedance 3.0 / Veo 4 non-existence, Sora 2 death, plus a new-model scan.

**Headline correction — Vidu Q4 Preview pricing was wrong.** The guide carried the $0.014/s launch headline as the rate; it was a promotional off-peak floor, not a list rate. The official Oct 7, 2026 rate card (GlobeNewswire): $0.045/s at 540p, $0.12/s at 1080p, $0.39/s at 4K; I2V + reference-to-video 30% off through Nov 30; off-peak half (sloptvnews). The record's cost string now carries the list rates bound to their resolutions; the $0.014 headline is deliberately written non-parseable ("per second", no /s) so it can never win the Studio's cost floor. The Studio's pinned rate for Vidu Q4 at 1080p moved $0.014 → $0.12/s; the microdrama planner's reference line and both `studio.test.js` assertions updated. Also corrected in the episode-pipeline chapter's Stage 5 tooling note (×2), `api/v1/model-updates.md`, and the model-checker's watch note.

**Record changes (all sourced, no invented specs):**

1. **Kling 4.0** — still not GA as of Oct 11 ("coming this October" is a month, not a date — wavespeed Oct-1 evidence review, orcarouter). Status stays `announced`. Enriched with announced-not-confirmed specs: 3–30s, 720p/1080p/4K, 21:9, up to 15 combined multimodal refs (10 images, 5 videos ≤30s, 7 subjects), 10 keyframes; no price, no API model ID (APIMart).
2. **Vidu S2** — official Sept 15, 2026 details confirmed (PR Newswire): S2-Avatar real-time 720p (up from S1's 540p), mid-session reference-image swaps, S2-Editing on live streams; noted as a different product class from rendered clips for budgeting.
3. **Mirage Tesseract** — Sept 22, 2026 launch (EZ Newswire) confirmed as an agent-driven editing/motion-graphics suite, not a generation model; free local engine. Stays in the edit/post lane.
4. **Grok Imagine Video 1.5** — Lite-tier pricing confirmed against xAI's own API docs (via sloptvnews): $0.02/s 480p, $0.03/s 720p, $0.14/s 1080p + $0.01/image; flagship 1.5: $0.08/$0.14/$0.25; Venice listed Lite Sept 30.
5. **Seedance 3.0** — still unannounced by any vendor as of Oct 1 (versely.studio). Status stays `reported`; ByteDance's real-time world-model project is a separate product.
6. **Veo 3.1** — API ladder added (third-party mirror of Google docs, verify live): Standard $0.40/s, $0.60/s 4K; Fast $0.15/s, $0.35/s 4K; Lite $0.05/s 720p, $0.08/s 1080p. 4/6/8s clips; Vertex us-central1 only; server deletes generations after 2 days; Veo 2 shut down June 2026.
7. **Seedance 2.5** — official BytePlus rates re-read Oct 6, 2026: $0.1028/$0.2311/$0.5686 per s (480/720/1080p); 4–30s; up to 50 refs; timestamp edits; US unavailable. Parser check caught the Dreamina first-month promo (~$0.035/s) binding to 1080p and winning the floor — reworded to "about $0.035 per second" (non-parseable) so a promo can never become the budget rate.
8. **Seedance 2.0** — 15 refs (9/3/3), 4–15s, edit + extend (BytePlus docs).
9. **Wan 3.0 / 3.0 Prime** — formally released Aug 24 (beta Aug 6); native 30s at 30fps; 10/5/5 refs; document mode; Model Studio $0.05/$0.10/$0.20.
10. **MiniMax H3** — H3 Max native 1080p + Turbo tier per Krea's Sept 9 changelog (single secondary source — guide figures unchanged pending confirmation); open-weights availability still verify-live.
11. **LTX-2.5** — Community License (free commercial <$10M ARR), Fast = distilled 8-step vs Pro fidelity, automatic duration, audio-to-video limits; stays unpriced in the Studio's honest floor.
12. **FLUX 3 Video** — GA since Aug 2026; QHD $0.40/s and UHD $0.80/s since Sept 10 (v2v $0.65/$0.95); FLUX Video Upscale shipped Aug 20; Elo claims still vendor-run.
13. **Sora 2 / Pro / Max** — the Sora API is gone (410s — versely.studio, Oct 2026). Status stays `discontinued`.
14. **Runway Gen-4.5** — still the latest; no new model in 2026 (Sept news was distribution/MCP).
15. **NEW: vivago R1** (HiDream.ai) — global availability Oct 9, 2026 (EZ Newswire syndicate — single-source, verify live). Agent workflow product (script → storyboard → generation → edit in one conversational workflow; up to 5-minute videos; CLI for developers/agents). Type `suite` — excluded from the Studio's generation pool by design; auto-generated model skill follows the generator's pattern. 29 → **30 models**.
16. **"Veo 4"** — re-verified as SEO bait (mer.vin, queststudio.io, independent coverage memo: no announcement, no model card, no API ID). The standing correction in `field/2026-developments.md` now carries the re-verification.

**Propagation:** artifact → `api/v1/models.json` (30 models, build_api assert 29→30) → `site/` (27 chapters, model pages incl. new vivago-r1 page, search index), `skills/` (230 — auto-generated `direct-vivago-r1`; no HAND skill: no genuine procedural gap), `llms.txt`/`llms-full.txt`; `AGENT.md`/`API.md` 29→30; `craft/episodic-shortform.md` Stage 5 pricing correction (×2); `field/2026-developments.md` Veo 4 re-verification + new sources; `api/v1/model-updates.md` wave-30 section; `sources/source-index.md` wave-30 research section; model-checker watch note updated.

**Validation:** (post-commit) `bash scripts/validate.sh` → ALL STAGES PASS (13/13); link check 0 broken; `node --check` clean on changed JS; studio.test.js 50/50 (Vidu Q4 rate assertion $0.014→$0.12/s, viduRef assertion updated); agent-workflows.test.js ALL PASS; generator audits clean (skills byte-identical, prompt-templates.json == artifact parser, llms.txt zero-diff).

**Commit:** local `55fb868` (52 files) → pushed 2026-10-11 as remote commit `152ba12222f40db076921ec2a0a0346f6fdf442b`; remote `main` HEAD matches the pushed SHA; all 12 key files verified present in the remote tree via GitHub API (495 tree entries, 0 missing, not truncated; `site/models/vivago-r1.html` + `skills/models/direct-vivago-r1.md` confirmed in-tree).

**Next episode-pipeline revisit:** ~wave 32.

## Wave 29 — EPISODE PIPELINE revisit #4 (2026-10-11)

**Standing workstream:** fourth scheduled revisit (w17 = #1, w20 = #2, w23 check pass, w26 = #3). New material is genuinely thin (only hours since #3) — but three real developments landed: an institutional microdrama training programme with an AI track, Douyin oversupply economics at hit-rate granularity, and TikTok's AI-label enforcement numbers.

**Research** (6 search batches + Grok Lite/Next Episode/Drama Center verification): AI microdrama market + TikTok drama rails; "The Next Episode" program; TikTok algorithm/AI-policy updates Oct 2026; new AI video model launches; IMDA+TikTok programme corroboration (7 outlets); DataEye oversupply sourcing (4 outlets).

**What changed (all sourced, no invented productions):**

1. **Platform rails — institutional tier** (`craft/episodic-shortform.md`, sources): IMDA + TikTok Singapore launched a Microdrama Programme Oct 1, 2026 — 20 accredited companies, 50–100 episodes × 1–3 min over 6–9 months, live-action + dedicated AI-enabled animation track (prompt engineering, character consistency planning, VFX quality review, ByteDance's Seedance 2.5) plus paywall/monetization training (Xinhua via peoplesdaily.pdnews.cn + 6 corroborating outlets). Sits next to the Drama Center / Next Episode bullet; chapter frames it as the locked-bible discipline becoming industry curriculum.
2. **Boom section — oversupply economics counterweight** (`craft/episodic-shortform.md`): DataEye H1 2026 — 221,900 new AI/animated dramas on Douyin, only 1,055 cleared 100M views (0.48% hit rate); The Paper (Sept 1) — 98.7% failed to break even (~50M-view line); CCTV — cost fell from ~5,000 yuan/min early 2026 to a few hundred (sourcing chain flagged). DataEye VP Lin Qiwen's read paraphrased: AI lowers the threshold for losing money more than it lowers costs.
3. **Compliance tightening** (chapter compliance paragraph + Stage 8 caption package): TikTok Newsroom Oct 1 — 3B+ videos labeled AI-generated; TikTok's AI-content page says the AIGC setting does not affect distribution when guidelines-compliant (reported via blog.evolvedlotus.com, Oct 8, 2026 — single-source). New Stage 8 posting-discipline line: turn on the AIGC label for AI episodes; skipping the label is the risk, not the label itself.
4. **New craft judgment — "The oversupply discipline"**: the 0.48% hit rate is the argument for running all nine gates per episode — in a market where footage is nearly free, the scarce inputs are the ones the pipeline makes expensive (locked bible, read-aloud script, verified voice track, dedicated turn shot).
5. **Sourcing upgrade**: "The Next Episode" line now corroborated by the official TikTok Newsroom announcement (newsroom.tiktok.com) alongside Metricool.
6. **Agentic surface:** `sources/source-index.md` gains a wave-29 research section; regenerated `site/` (27 chapters, search index, changelog), `api/v1/` (re-stamped, endpoints unchanged at 11, schema-clean), `skills/` (229 — no HAND skill added: no genuine procedural gap; AI-label = one posting rule, oversupply = craft judgment, IMDA = institutional news), `llms.txt`/`llms-full.txt`.

**Deliberately left alone (the revisit log):**

- **Grok Imagine Video 1.5 Lite** (Oct 8, 2026) — already recorded in `models.json` (what_changed covers the Lite tier, pricing, ComfyUI nodes); no record edit needed.
- **Vidu Q4 Preview** — record current (active, $0.014/s launch pricing, last_verified 2026-10-11); no change.
- **Kling 4.0** — full model still not GA (Flash early access only); "announced, not GA" record still correct.
- **HeyGen Voice** (Oct 9 — #1 on Artificial Analysis leaderboard) — a voice model, not a verified episode-pipeline tool; no chapter or skill change.
- **Cloudflare Clef-omni / Reka Edge / other Oct LLM drops** — not video-generation tools; no chapter change.
- **Even Realities "Exposed"** (8-episode TikTok micro-drama, Oct 8, Muse by Clios) — documented but live-action brand content with no episode-level craft detail; not a worked example.
- **naoo AG microdrama rollout** — platform announcement, no procedural content.
- **No new worked examples** — nothing new documents a production at rebuildable detail; the StoReel/Qidian builds (w27) stand as the documented builds.
- **No new verified hook patterns** — the cycle's corpus produced no new observed caption patterns; the five hook formulas stand.
- **Episode planner / hook generator code** — untouched (no new format presets, no new CTA styles justified this cycle).
- **AGENT.md** — untouched (no new workflow; the AI-label rule is a posting-discipline line, not a workflow).
- **Verticals For Good micro-drama challenge (deadline Oct 30)** — still a competition, not a format; not integrated (festival-is-not-the-subject rule).

**Validation:** (post-commit) `bash scripts/validate.sh` → ALL STAGES PASS (13/13); link check 0 broken; studio.test.js 50/50; agent-workflows.test.js 74/74; generator audits clean (skills byte-identical, prompt-templates.json == artifact parser, llms.txt zero-diff).

**Commit:** local `fe3acc3` → pushed 2026-10-11 as remote commit `dbf6e825dea9fdc316d423057932be1647f3ff77`; remote `main` HEAD matches the pushed SHA; all 12 key files verified present in the remote tree via GitHub API (554 tree entries, 0 missing).

**Next episode-pipeline revisit:** ~wave 32.

## Wave 28 — Studio 2.5: microdrama mode (2026-10-11)

**Build:** the Studio's microdrama production planner — an economics planner (not a shot packet) for serialized AI-microdrama runs, built entirely on the wave-27 teardown's documented figures (`api/v1/teardowns.json`, id `storeel-off-campus`; TheWrap + Sixth Tone, June 2026). No new research, no new external sources: every claim traces to the three documented outlets or to `api/v1/models.json`; ranges, not promises.

**Shipped:**

1. **Microdrama production planner** (`assets/js/studio.js`, new project kind `microdrama` alongside film + 5 series formats): inputs = episodes (1–40), minutes per episode (0.5–3), quality tier, character-regens per episode (the filmmaker's budget guess). Outputs: **clip budget** (10–15s clip unit → 4–6 clips per 1-minute episode, run totals; StoReel's actual 146 clips / 30 storyboarded episodes ≈ 4.9/ep sits inside the range, shown as a cross-check); **run budget** — the $50/min documented benchmark ($200 for a 4×1-min run), generation cost at the cheapest priced video model's rate (the floor, verify-live) × the tier's retake factor (draft = 3×, festival = 5× — the two ends of Qidian's documented 3–5 "drawing cards" range), a **character-regen reserve** (paid regens were a real StoReel cost; count is labeled "your budget guess", priced at the cheapest image-model rate), plan total vs benchmark per-episode/per-minute, plus live-action ($2,000/min) and PUGC ($150/min) context rows — both labeled as reported figures, not quotes or guarantees; **timeline** from the documented 4-days-for-4-episodes pace (1 day/ep, ≈7 eps/week), with the honest caveats (free reporter labor, scripting uncounted, no documented festival pace); reference pricing line for Vidu Q4 Preview's launch $0.014/s (raw published claim, verify live — never used in the math). Every budget line carries a "Documented basis" column; markdown export (`microdramaToMarkdown`) and in-page HTML both carry the "Documented production economics (benchmarks, not predictions)" block. Saved plans round-trip (meta, load, duplicate/delete) like film/series; the cost-optimizer panel stays hidden for runs (no shots to optimize).
2. **Episode-pipeline handoff:** "Send run to Studio →" button in the episode planner (next to "Send series to Studio →") stages `{v:1, kind:"microdrama", episodes, minPerEpisode}` (median block runtime snapped to 0.5–3 min) into the same `afg-studio-bridge` key; the Studio's series consumer ignores non-`"series"` payloads, so the two bridges coexist. Studio also honors `?mode=microdrama`.
3. **Cross-links:** the $150 Microdrama teardown viewer renders a "Plan a microdrama run →" card (`studio.html?mode=microdrama`) for `storeel-off-campus`; the episode-pipeline chapter's Studio 2.0 section gained the Microdrama-mode bullet + the documented-build pointer; the studio lede/meta/tier-notes/search-index entry all name the mode; the prompt-library's t2/f2/l2 teardown links (wave 27) already route here.
4. **Agentic surface:** NEW HAND skill `studio-microdrama-plan` (cat `studio`) — the genuine procedural gap (the retake-envelope budgeting procedure exists nowhere else; waves 22/27's no-skill rationale doesn't apply), and the `episode-studio-bridge` HAND skill now documents both buttons (229 skills, regenerated byte-clean). `AGENT.md` gains "Example workflow 5 — plan a microdrama run's economics (Studio 2.5)" with the worked fixture, pinned by `agent-workflows.test.js` workflow 6; the "four end-to-end workflows" count updated to five in `AGENT.md`'s neighbors (`API.md`, `build_llms.py` line). API endpoints unchanged (11, schema-clean — microdrama is client-side, no new endpoint).
5. **Regenerated:** `api/v1/` (re-stamped), `site/` (27 chapters, studio + planner pages, search index, changelog catch-up), `skills/` (229), `llms.txt`/`llms-full.txt` (generator-owned, zero-diff after commit).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (13/13, run post-commit); link check 0 broken; `node --check` clean on all changed JS; studio.test.js 50/50 (7 new microdrama assertions with pinned fixtures: documented constants, clip math + StoReel cross-check, benchmark arithmetic, model-rate relationships derived from models.json, festival retake end, determinism + validation errors, markdown honesty framing); agent-workflows.test.js 74/74 (new workflow 6 asserts the AGENT.md worked example); generator audits clean (skills byte-identical, prompt-templates.json == artifact parser, llms.txt zero-diff).

**Commit:** local `1a0b8bf` (27 files) + `e9b6aa1` (WAVELOG entry) — pushed 2026-10-11 as remote commit `8d8c4ce2d2dd74ad114e4d3ff08b827f87a50897`; remote `main` HEAD matches the pushed SHA; all 9 key files verified present in the remote tree via GitHub API (554 tree entries, 0 missing; `skills/studio/studio-microdrama-plan.md` confirmed in-tree).

**Next episode-pipeline revisit:** ~wave 29.

## Wave 27 — 7th teardown: The $150 Microdrama (2026-10-11)

**Research:** StoReel's "Off Campus" AI microdrama experiment (TheWrap, June 2026) — the most honestly documented serialized AI-drama build of 2026: a reporter built 4 one-minute episodes in 4 days for ~$150 (11,000+ StoReel credits), writing down every step including the failures. Corroborating production: Qidian Interactive's AI-video studio in Wuxi (Sixth Tone, June 2026 visit) — in-house Yudian system, three-group production flow, and a shelved 8–10M-yuan, 3-year project finished with AI in 2 months for ~1M yuan. Supporting: TheWrap's industry survey (page-of-dialogue = one minute = one episode; engines compatible with Seedance 2.0). All facts paraphrased from the three outlets; zero direct quotes. Sourcing note inside the entry flags the StoReel engine identity (TheWrap's reporting vs. a TikTok creator promo) and Qidian's figures (company statements, not audited books).

**Shipped:**

1. **New teardown `storeel-off-campus`** in `api/v1/teardowns.json` (7 shots): (1) headline numbers — ~$150, 4 episodes, 4 days; $50/min AI vs $2,000/min live-action; guide-model sanity math from the 29-model DB (60s episode, draft tier, Seedance 2.0 ~$0.37/s verify-live → ~$66.60, explicitly illustrative and flagged as a different credit system); (2) script in 5 minutes, one-click breakdown — Claude's 50-page script, Canvas decomposition into 146 clips, one-page-of-dialogue = one episode; (3) the character library — editable cast assets, paid regenerations, likeness-refusal guard; Qidian's digital prop room as the professional version; (4) the 300–400-word stage direction — one prompt per clip (actor movement + camera + lines), the ONE labeled prompt reconstruction of the wave (hockey ruminating scene, analytical); (5) "drawing cards" — 3–5 retakes per usable shot, reference images for continuity, Ma Shuan's "every result a gamble" (paraphrased); (6) PUGC business — ~$150/min creator payouts, 100 shows/month goal, Day-7 retention +22% vs live action, CPI $4.63 vs $8–10; (7) the verdict — steal the pipeline (script → character library → stage directions → retake discipline → gates), skip the fantasy (unedited directions, unverified proper nouns, "AI-directed" thinking). Sources: 3 real outlets (TheWrap ×2, Sixth Tone).
2. **Episode-pipeline chapter tie-in** (`craft/episodic-shortform.md`): new "A documented build" paragraph after the reference implementation (StoReel experiment + Qidian professional version + pointer to teardown.html), 2 new source bullets in the Sources section.
3. **Studio (series mode):** new "Documented production economics" block in the series packet — Markdown and HTML renderers (both carry the StoReel $50/min benchmark, the PUGC $150/min rate, the "drawing cards" retake range, the Qidian rebuild figure); 4 new assertions in `scripts/studio.test.js` pinning it (benchmark block present, $50/min named, teardown id referenced, HTML parity).
4. **Prompt library:** `prompts-facets.json` links `storeel-off-campus` on t2 (dialogue two-shot — lines fit between action in per-clip prompts), f3 (tactics-driven dialogue beat — stage directions for AI actors), l2 (character re-entry — character library as continuity engine); surgical byte-level edits preserving the file's single-line/no-trailing-newline format.
5. **Count updates:** AGENT.md, API.md, root `api.html` 6→7; `build_site.py` learning-path "all seven films" + search-index headings/text; `build_llms.py` teardown viewer blurb; new wave-27 section in `sources/source-index.md`.
6. **No HAND skill:** same rationale as wave 22 — nothing new procedural; the mini-drama pipeline is already covered by the chapter, episode planner, Studio series mode, and existing skills (228 unchanged, regenerated byte-identical).
7. **Regenerated:** `api/v1/` (re-stamped; manifest n_teardowns=7), `site/` (27 chapters, search index, teardowns.json copy, studio.js copy), `llms.txt`/`llms-full.txt` (teardown names dynamic; zero-diff clean after commit).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (13/13, run post-commit); link check 0 broken; studio.test.js 43/43 (4 new assertions inside the series-packet optimizer test); agent-workflows.test.js 60/60; generator audits clean (skills byte-identical, prompt-templates.json == artifact parser, llms.txt zero-diff).

**Commit:** local `33e6d1b` → pushed 2026-10-11 as remote commit `3c6b00d1abc106b5837f9a5633680d900ac39b73`; 27 files; all 15 key files verified present in the remote tree via GitHub API (553 tree entries, 0 missing; remote `api/v1/teardowns.json` blob confirmed to contain `storeel-off-campus`).

**Next episode-pipeline revisit:** ~wave 29.

## Wave 26 — EPISODE PIPELINE revisit #3 (2026-10-11)

**Standing workstream:** third scheduled revisit (wave 17 was #1, wave 20 was #2, wave 23 a check pass). One real procedure tightening (the interactive format's vote mechanic is now platform-native), a data refresh of the boom section, one craft-judgment addition, one tooling note, and two interactive-tool upgrades.

**Research** (4 search batches + 1 price check against models.json): AI mini-drama/short-drama trends Oct 2026; TikTok comment/interaction features; new AI video model releases; Kling 4.0 GA status.

**What changed (all sourced, no invented productions):**

1. **Interactive format — vote mechanic is now platform-native** (`craft/episodic-shortform.md`, planner preset, hook generator, HAND skill): TikTok's comment polls rolled out globally Sept 3, 2026 — up to 5 options, creator-set timeframe, real-time results in the comment thread (TechCrunch / USA Today). The chapter's interactive-format rules now read: the native comment poll does the asking (never burn it into the video); the poll's built-in timeframe *is* the deadline rule; harvest reads the in-thread tally; the Sept 2026 comment overhaul also brought voice comments (60s, 18+) — transcribe audio theories before harvesting. One decision per episode stays.
2. **Episode planner:** the interactive `FORMAT_PRESETS` block skeleton now names the native comment poll (up to 5 options) in the decision beat and the poll deadline in the cliffhanger; radio hint "Comment-poll-driven".
3. **Hook-title generator:** new 4th CTA style — "Interactive — vote CTA (comment poll)": *"vote in the comments — the winning choice plays out tomorrow 🗳️"* (template select in `build_site.py` + `hook-gen.js` `CTAS`/`CTA_LABEL`).
4. **HAND skill `episode-interactive-format`:** vote-mechanic steps + pitfalls rewritten around native comment polls (steps 1–4, 2 pitfalls); `skills/` regenerated — generator owns output, no standalone edits.
5. **Boom section refresh:** Omdia via Oct 2026 EIN release — $11B global 2025 → $14B projected end of 2026 (US $1.5B of it; single-source) replaces the DoubleVerify-only revenue line; China — 120,000+ microdramas released Jan–Mar 2026, 95% AI-generated (PhilSTAR Life citing Chinese state media and CNN — sourcing chain flagged), consistent with the earlier ~90% Kuhn figure; new platform-rails line — TikTok Drama Center (June 2026 Apps Summit: series management, multilingual translation, revenue sharing; Technode) + TikTok/Amplify "The Next Episode" series-funding program (Metricool 2026 timeline).
6. **Craft judgment — "The one-prompt temptation"** (new bullet): TikTok Symphony Agent (Seedance 2.0 campaign generation) and CapCut Video Studio (type-an-idea → multi-scene mini-dramas) now exist — useful for drafting beats, but they skip the locked bible, the voice-first cut, and the continuity log. Draft with them; ship from the pipeline.
7. **Keyframe tooling note (Stage 5):** multi-reference models accept the bible's locked anchor plates directly — Vidu Q4 Preview (launched Oct 7, 2026: up to 15 image refs, 3 audio refs, launch pricing from $0.014/s — PR Newswire, preview pricing, verify live). Kling 4.0's announced Omni Reference works the same way, but the full model is still not GA.
8. **Agentic surface:** regenerated `skills/` (228, index count unchanged), `api/v1/` (re-stamped), `site/` (27 chapters, planner + hook-generator pages, search index), `llms.txt`/`llms-full.txt` (generator-owned, via `build_llms.py`). Sources section of the chapter carries the 4 new source groups.

**Deliberately left alone (the revisit log):**

- **Kling 4.0** — full model still NOT GA as of Oct 11, 2026 (Flash early access for Ultra Yearly subscribers only; "October 2026" is a target window, not a date — wavespeed.ai, pakera.pk). No model-record change; the guide's "announced, not GA" record is still correct.
- **No new worked examples** — nothing new this cycle documents a production at rebuildable detail (SelfyzAI's Vidu Q4 beta tests name scenarios — AI short drama, film-style — not a production; no new verified serialized accounts with episode-level data).
- **No new verified hook patterns** — the cycle's corpus (booms, polls, rails) produced no new observed caption patterns; the hook generator's five formula variants stand.
- **Oct 1, 2026 Shorts originality update** — no new developments found; the chapter's compliance reading stands.
- **Vidu Q4 Preview record** — already in `models.json` (active, $0.014/s launch pricing, last_verified 2026-10-11); no record edit needed.
- **The "ask the AI character" Q&A verdict** (wave 20) — unchanged; no new serialized traction found.
- **Verticals For Good micro-drama challenge (deadline Oct 30)** — a competition, not a format; not integrated (festival-is-not-the-subject rule).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (13/13, run post-commit); 6,783 relative links, 0 broken; studio.test.js 43/43; agent-workflows.test.js 60/60; generator audits clean (skills byte-identical, prompt-templates.json == artifact parser, llms.txt zero-diff).

**Commit:** `3384b5e531246297e2ceca80ace3ede284a2a6f4` ([view](https://github.com/astercast/ai-film-master-guide/commit/2b4db53fd7cda5a5dfd70e4b171600279b4734dc)) — 18 files, pushed 2026-10-11 as remote commit `2b4db53fd7cda5a5dfd70e4b171600279b4734dc`; all 8 new/changed key files verified present in the remote tree via GitHub API (490 tree entries, 0 missing; blob SHAs match local).

**Next revisit:** ~wave 29.

## Wave 25 — Prompt library explorer (2026-10-11)

**Built:** a first-class browser for the 47 guide prompt templates — new `site/prompts.html` (built from `PROMPTS_TMPL` in `scripts/build_site.py`), a "Send to Studio" bridge, and a Remix helper. Generator-owns-output contract kept: the page reads `prompt-templates.json` live (asserts the rendered count matches the artifact data); the browsable facets are a HAND annotation file, not a fork.

**Shipped:**

1. **`prompts-facets.json` (repo root, HAND, wave 25):** per-template annotations keyed by template id — `shot_type` (16-value vocab), `movement` (the guide's own 22-move `camera-movements.json` ids + `varies`/`none`), `lighting` (12-value vocab), `mood` (21-value vocab), `layers` (which of the nine anatomy layers + exclusion block each template demonstrates, derived from the template's own prompt text — e.g. `a1` deliberately demonstrates NO camera layer, per its "NO lens or DOF language" anatomy note), and `teardowns` (cross-links grounded in documented teardown workflows: t2/f2/l2↔oneiric, t5/f1/l1↔passport-rush, t1/f4↔dreams-of-violets). Copied to `site/prompts-facets.json` at build time.
2. **`prompts.html`:** full-text search (title + prompt + use + anatomy + models) plus five filters (track, shot type, movement with the lexicon's display names from `camera-movements.json`, lighting, mood) with a clear-filters button. Each card shows the template id/title/track, the prompt with `[BRACKET]` slots highlighted, anatomy-layer chips (each linking to `anatomy.html`), facet chips, the "why it works" note, shortlisted models, and matching teardown links. One-click **Copy**, **Send to Studio**, **Remix**, and a "Fill in workshop →" link. Results count is `aria-live`; cards render as articles; native `<dialog>` for Remix (focus to the subject field on open); reduced-motion honored; mobile-first single column → 2-column at 1100px.
3. **"Send to Studio":** one click stages `{v:1, kind:"prompt", templateId, title, prompt, anatomy, layers}` in the same `afg-studio-bridge` localStorage key the episode planner uses. The Studio now consumes both payload kinds: `consumeBridge` no longer deletes non-series payloads (it previously removed the key before checking kind, which would have eaten a prompt payload), new `consumePromptBridge`/`applyPromptBridge` show a dismissible banner above the concept form with the template text, its anatomy layers, Copy and Dismiss buttons — it never overwrites the user's title/logline. `?from=prompts` fallback message mirrors the planner's.
4. **Remix helper:** structured subject / setting / lighting inputs → client-side slot assembly against the real slot names in the 47 templates (SUBJECT/CHARACTER/PRODUCT/DISH/MODEL/CAR, ENV/LOCATION/CITY/CORRIDOR/LANDSCAPE/ROAD/SCENE, LIGHT; two-subject templates split "Mara and Jun" into A/B — documented in the dialog). Output is explicitly labeled "Remix of tN — title … this is a remix, not a guide template"; unfilled slots stay bracketed.
5. **Cross-links:** new "Prompts" entries in the site nav + footer, a "Browse all 47 templates" promo card on `index.html`, a search-index entry, and a build-time copy of `camera-movements.json` into `site/` (the explorer fetches it for movement display names — previously only in `api/v1/`).
6. **New validate.sh stage-5e:** `prompts-facets.json` ids must exactly match `prompt-templates.json` ids (47/47), every facet value in vocab, movements in the guide's lexicon, teardown ids real; stage 7's data-file check now also requires `site/camera-movements.json` + `site/prompts-facets.json`.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (13/13); link check 6,783 links, 0 broken; studio engine 43/43, agent workflows 60/60; generator audits clean (228 skills byte-identical, prompt-templates.json == artifact parser, llms.txt zero-diff). Functional smoke tests: 47 cards render, filters compose (orbit→2, macro→3, macro+orbit→1, audio→4), remix slot-fills verified for t4/t2/a1/s1 incl. the A/B split, Studio bridge functions verified (prompt payload preserved past consumeBridge, single-consume, series path unaffected, banner/copy/dismiss/announce all fire).

## Wave 24 — Studio cost optimizer (2026-10-11)

**Built:** the Studio's "Optimize cost" panel — given a Studio plan (film or series), find the cheapest way to make it. All numbers from `api/v1/models.json`; no invented prices.

**Shipped:**

1. **Model substitution engine** (`assets/js/studio.js`, pure engine, exported for tests): `modelRateOptions` parses every (resolution, rate) pair in each model's `est_cost_credits` — credit `N/Ms` rates win when present (the Studio's own convention), USD `$/s` rates otherwise; clause-aware res binding (`$0.13/s 2K, $0.08/s 768p` no longer cross-binds). `optimizePlan(data, plan, opts)` computes per-shot cheaper alternatives that must clear the shot's requirements: documented resolution at/above the bar (default 720p draft / 1080p festival, user-overridable), native audio when the shot needs dialogue (share slider, spread evenly and deterministically), documented max clip ≥ shot duration. **Honest floor:** models with no documented resolution (LTX-2.5, Marketing Studio video) and models below the bar (DoP, Luma, Runway at 1080p) are listed as ineligible, never assumed; inferred-resolution rates are flagged in the output.
2. **Three budget modes** — Cheapest viable (floor), Balanced (the plan's own picks re-priced at the bar), Best rated (top documented arena/leaderboard models: Gemini Omni → FLUX 3 → MiniMax H3 → Seedance 2.5 → Grok Imagine → Kling 3.0, each with its rank note and the cross-board caveat). Side-by-side table with deltas in dollars + percent and capability notes (what you give up: res-tier drops, lost audio flags, platform changes).
3. **"Where the money goes"** — cost by model, by episode (series), and by take-count (per-take leverage table); the single biggest decision is called out with its cheaper alternative (e.g. festival 2-min drama: Shot 3 on Seedance 2.0 at $8.47 → Vidu Q4 Preview saves $8.13 on that shot alone).
4. **Verify-live handling** — every USD/API-billed pick gets an explicit "price may move" badge (Vidu Q4 Preview, MiniMax H3, FLUX 3 drafts, Grok, Gemini Omni) in the panel and the packet export.
5. **Wired in** — new "Optimize cost" panel in `site/studio.html` (template lives in `scripts/build_site.py` `STUDIO_TMPL`; panel hidden from print, results are `aria-live`); results stored on the plan so the packet exports carry them: film markdown, series markdown, and the self-contained series HTML all gain a Cost optimizer section (mode table, breakdowns, biggest decision, per-shot substitution table with the explicit requirement match per shot).
6. **11 new workflow tests** (`scripts/studio.test.js`, now 43 total): USD-rate parsing against real models.json, unpriced-model exclusion, floor honesty (nothing below the bar substitutes; undocumented-resolution models ineligible), per-shot requirement checks incl. a 30%-dialogue run, mode-math reconciliation (cheapest ≤ balanced ≤ …; savings sum = mode delta; byModel/byEpisode/take-count reconcile), verify-live badge coverage, determinism, graceful unpriced-balanced handling, series flattening, packet-export inclusion.

**Worked numbers** (2-min drama, real data): festival — cheapest **$10.20** vs balanced **$169.95** vs best rated **$108.00** (floor = Vidu Q4 Preview preview pricing, badged); draft — cheapest **$5.00** vs balanced **$23.91** vs best rated **$36.00**.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (12/12); 43 studio engine tests green; 60/60 agent-workflow tests green; link check 6,540 links, 0 broken; generator audits clean (228 skills byte-identical, llms.txt zero-diff).

**Commit:** `7e52e95` → pushed 2026-10-11 as remote commit `b4532d858e90e4462be982ff28d2c54b5b1d20d9` ([view](https://github.com/astercast/ai-film-master-guide/commit/b4532d858e90e4462be982ff28d2c54b5b1d20d9)) — 7 files; all 7 new/changed key files verified present in the remote tree via GitHub API (546 tree entries, 0 missing; blob SHAs match local).

## Wave 23 — Festival landscape refresh: 2026 results (2026-10-11)

**Research** (10 search batches + 1 official page fetch): Astana outcomes confirmed across 5+ outlets; Reply's official winners page fetched directly; Cannes stance upgraded from rumor to Reuters; Tribeca/Dreams of Violets reception gathered from 4 review/outlet sources; Hong Kong AI IFF 2027 announcement found via press-release syndication.

**Key findings:**

1. **Astana** — winner names now documented: 2nd *SITARA* — Abhik Banerjee (India); 3rd *Looking For Perseida* — Ernest Desumbila (Spain) (qazinform). Cash awards funded by the Freedom Shapagat Corporate Foundation of Freedom Holding Corp (newsarchyuk citing Qazinform — flagged single-source). Tokayev opened the Oct 2 program (Aju Press/Akorda); organizers plan annual.
2. **Reply AIFF 2026** — full results from reply.com (official): 1st Robert Gaudette; 2nd Alex Naghavi & Ezra Li; 3rd 2xLabs; SDG award *Centenarian Kindergarten* (2xLabs); Reply AI Studios Grand Prix *Website* (Jiaze Li); Community Award (WeShort) *Website* (Jiaze Li); special mention *The Child of the Sea* (Ibai Abad). 2xLabs placed at two festivals in a month (also Astana Best Story $50K). Gaudette double-win (Runway) still single-source — flag kept.
3. **Cannes** — Reuters (May 15, 2026) replaces the single-source ban claim: no outright ban; films "primarily driven by generative AI" excluded from Palme d'Or competition. Frémaux's e-bike line, Academy "demonstrably performed by humans" rule, the Moore/Jackson/Favreau vs. Rogen split, del Toro's generative-vs-assistive distinction, Meta as official partner, Marché Innovation Village. WAIFF alongside (5,000 submissions — flagged single archived report).
4. **Tribeca** — *Dreams of Violets* reception mapped as the year's best reception dataset: warm room (~80% full, applause; THR), split critics (Variety: "dramatically numbing" as drama / "startling portent" as artifact; A.V. Club hostile; The Wrap: flawed but significant snapshot), and industry flinch (distributor + festival rep backed out on learning it was AI).
5. **2027** — Hong Kong AI International Film Festival 2027 announced (Sept 29, 2026): 19→7 redesigned awards, 51% AI threshold dropped for "substantive creative contribution," entries close Mar 1, 2027, $99/work (MarketersMedia PR — flagged). Astana plans annual → expect a 2027 second edition.

**Shipped:**

1. **`distribution/festival-landscape-2026.md`** rewritten around results: new "2026 scorecard" table (festival → winner → prize → craft takeaway); Astana section gains winner names, funder, annual plan; Reply section gains the full official results + the 2xLabs cross-festival placer note; Cannes section rewritten as "The Cannes line — clarified, not moved" (eligibility rule, not ban); new "Tribeca 2026 — the reception experiment" section (3 craft takeaways: the portent reading helps no one's career; the $2,000-cost story is a hook and a handicap; plan for the ethics question); new "2027 on the calendar" section (HK AI IFF + Astana annual; the "how much AI → what did you do with it" judging pattern); landscape-read section gains points 5–6; both teardowns cross-linked (`first-honest-day`, `dreams-of-violets`); 9 new sources with flag discipline kept.
2. **`field/2026-developments.md`** — Cannes bullet synced to the Reuters version.
3. **`sources/source-index.md`** — new "Festival results (wave 23)" subsection, 8 sources with pull-notes.
4. **No HAND skill, no competitions.json change** (its no-prizes craft-record scope doesn't fit a results refresh), no count changes (AGENT.md/API.md/api.html untouched).
5. **Episode pipeline revisit #3 (standing item, due):** check pass — one search batch; nothing genuinely new as a production format since wave 20 (TikTok Mini Dramas/Symphony–Seedance 2.0 integration is June 2026; IMDA–TikTok microdrama training programme (Oct 5) is institutional, not a format; aggregator tool lists add no format). Pipeline doc unchanged; next revisit ~wave 26.
6. **Regenerated:** `api/v1/` (re-stamped), `site/` (27 chapters + search index + changelog), `llms.txt`/`llms-full.txt`.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS post-commit; 6,540 links, 0 broken; generator audits clean.

**Commit:** `6856fb8b531b3849e7f50a78441d4eb28f914c59` ([view](https://github.com/astercast/ai-film-master-guide/commit/6856fb8b531b3849e7f50a78441d4eb28f914c59)) — 12 files, pushed 2026-10-11 as remote commit `8608974198637b4a2387f06b0b148329fc100e03`; all 8 new/changed key files verified present in the remote tree via GitHub API (484 tree entries, 0 missing; chapter blob SHA matches local).

## Wave 22 — 6th teardown: The First Honest Day (2026-10-11)

**Research:** *The First Honest Day* — Nikolay Shestak's $450,000 Grand Prix winner at the inaugural Astana AI Film Festival (Oct 1–3, 2026; 8,067 entries from 125 countries, 25 finalists, theme "The Future Worth Living In"). Documented facts: the premise (actions reflected in appearance — bad deeds uglify, good deeds beautify), the director's road (former actor → directing ~4 years → AI films ~2 years), the judging rubric (artistic vision, storytelling, coherence, how AI tools were used, organic integration of tech into concept), and the festival ecosystem (BytePlus tech partner, DRAMAGIC 60,000 credits per finalist, 80+ models in play incl. Suno/Kling/Wan 2.6/GPT Image 2/ElevenLabs/Seedance 2.5 — single-source state-portal account). **No outlet states what tools made the film** (verified: Temperature Zero Oct 9, 2026); runtime, team size, budget, shot count, and prompts are all undocumented; the organizers hold all 25 disclosed pipelines but haven't published them.

**Decision:** kept *The First Honest Day* as the teardown target rather than swapping to an alternative — the alternatives (SITARA, The Last Span) are equally undocumented on tools, and the thin documentation IS the teachable point. The teardown is honest about the gap by design: the context carries an explicit sourcing note, every shot's `prompt_reconstruction` is null (with the reason stated — reconstruction without a published stack would be invention), and the festival-ecosystem models are flagged as the competition's ecosystem, NOT the film's stack.

**Shipped:**

1. **New teardown `first-honest-day`** in `api/v1/teardowns.json` (6 shots): (1) the moral engine — one visual rule AI can execute, turning consistency drift into theme (ties craft/story-structure.md, craft/character-consistency.md); (2) the documented jury rubric — organic integration of tech into concept; (3) the director's road — two years of AI reps on four years of directing (craft/directing-performance.md); (4) the documented ecosystem with REAL cost math from the 29-model database (60s short, 10×6s shots, 3 takes = 180s: Kling 3.0 ≈ $15.12, Seedance 2.5 ≈ $41.58, Wan 2.6 ≈ $9.88 at the guide's reference $0.0392/credit — explicitly illustrative, not the film's bill); (5) the missing dataset — the organizers' unpublished 25 pipelines as the field's real bottleneck; (6) what a filmmaker can steal — enter competitions that fit work you're already making, reinvest prize money into the work. Sources: 5 real outlets (Qazinform ×2, Daily Guardian EU, Aju Press, Temperature Zero); one brief director quote (16 words, under the quote budget).
2. **Studio hook: skipped — the data doesn't support it.** No Studio preset or case reference was added because no model stack is documented for the film; a preset would require inventing model picks. Stated here and in the teardown's sourcing note rather than hidden.
3. **No HAND skill:** nothing new procedural — the teardown's lessons are chapter ties, not a new workflow.
4. **Count updates:** AGENT.md, API.md, api.html 5→6; `build_site.py` learning-path "all six films" + search-index headings/text; `build_llms.py` viewer blurb. No sitemap exists in this repo — nothing to regenerate (search-index.json is the discoverability layer, regenerated).
5. **Regenerated:** `api/v1/` (re-stamped; manifest counts n_teardowns=6 dynamically), `site/` (27 chapters, search index, site/teardowns.json copy), `llms.txt`/`llms-full.txt` (teardown names dynamic). `scripts/wave22_teardown_append.py` kept as the append recipe.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS; link check 0 broken; schema validates the new entry (null prompt_reconstructions permitted by schema).

## Wave 21 — Q4 2026 model data refresh (2026-10-11)

**Research:** all 27 model records re-verified against live Oct 2026 coverage (15 search batches). 27 → **29 models**; no status changes; pricing updates sourced or flagged verify-live; nothing invented.

**Shipped:**

1. **Two genuinely new models** (verified data, own records):
   - **Vidu Q4 Preview** (Vidu/Shengshu, launched Oct 7, 2026, GlobeNewswire): next-gen flagship — lifelike performances, cinematic 4K 10-bit, 15 image refs, 3 audio refs for voice consistency; launch pricing **$0.014/s**. Studio flags verify-live until the rate card stabilizes.
   - **FLUX 3 Video** (Black Forest Labs, announced July 23 / public Aug 4, 2026): up to 20s single take, native 1080p + multilingual audio/lip-sync, keyframes, multi-shot, draft mode **$0.06/s 720p draft, $0.17/s 720p, $0.29/s 1080p** (~$2.90/10s HD); Arena T2V #2 (1496 pts, vendor-run stats flagged as such).
2. **Pricing/capability updates with sources:** MiniMax H3 (published API card: $0.13/s 2K, $0.08/s 768p; H3 Max $0.08/$0.05; open weights still pending — **now USD-billed, no platform-credit rate, so the Studio budgets it as verify-live**); Kling 3.0 (full Kling API docs table; correction: 12th not 4th on Artificial Analysis T2V); Hailuo 2.3 (direct API rechecked Oct 10); Gemini Omni → **1.1 Flash GA** (Aug 27, 2026; preview 404'd Sept 30; resolution ladder $0.10/$0.03/$0.15/$0.30/s; free 1080p in Google Vids; replaces Veo 3.1 in the Gemini app); Grok 1.5 **Lite tier** (Oct 1–8, $0.02/s 480p → $0.14/s 1080p); Seedance 2.0/2.5 (BytePlus API estimates $0.37/$0.57/s 1080p); Runway Gen-4.5 (API $0.12/s, now a multi-model aggregator); Wan 3.0 Prime (Singapore list $0.068–0.28/s); Pika (routing-studio rebuild, API Club); Luma Ray 3.2 (legacy retired Oct 5); Soul Cinema (default image model in Cinema Studio 3.0/3.5); LTX-2.5 (open weights healthy).
3. **Status re-checks (no change):** Kling 4.0 STILL not GA (Flash only, "this October" no date) — status stays `announced`; Seedance 3.0 STILL unconfirmed (ByteDance's Oct real-time world model is a separate product) — status stays `reported`; Veo 4 still SEO bait; Sora still dead.
4. **"What changed" report:** new dated section in `api/v1/model-updates.md` (2026-10-11) listing every price/status change with sources.
5. **Night Bus re-versioned (the point of the workflow tests):** H3's USD-billing dropped it from the Studio's priced pool, so its 25 template slots fell through to Luma Ray 3.2 (0.09 cr/s). `agent-workflows.test.js` workflow 5 updated: clean **$20.64** (was $20.48), 5× $103.20, 20× $412.80, per-episode [3.81, 3.81, 3.53, 5.66, 3.81]; the pipeline `WORKED-EXAMPLE-5-EPISODE.md` doc re-versioned to the same numbers with the new model mix (Luma 28 / Kling 3.0 11 / Hailuo 8 / Wan 2.6 3).
6. **Model watch:** `model-check-config.json` gained the 2 new models; `model-review-queue.json` now has 5 pending watch items (Seedance 3.0, Kling 4.0 GA, Wan 2.7 gap — launched ~April 2026 and missing from the DB, H3 open weights, Soul Cinema pricing). `build_api.py` assert 27 → 29; AGENT.md/API.md/api.html "27 models" → 29.
7. **Regenerated:** `api/v1/` (re-stamped), `site/` (27 chapters), `skills/` (226 → **228**, auto-generated `direct-vidu-q4-preview` + `direct-flux-3-video`), `llms.txt`/`llms-full.txt`. No HAND skills added (the two new direct-* skills are generator-built); no AGENT.md endpoint changes (schema unchanged).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS post-commit; studio.test.js 32/32; agent-workflows.test.js 60/60 (workflow 5 asserts the new Night Bus numbers); 6,536 links, 0 broken; generator audits clean post-commit.

**Commit:** `41adf0f3dc5550f041fd48584f20dd931aff6692` ([view](https://github.com/astercast/ai-film-master-guide/commit/be3344ec0d3f7e4f2d8f5d3a1b3bddc98df324c0)) — 69 files, pushed 2026-10-11 as remote commit `be3344ec0d3f7e4f2d8f5d3a1b3bddc98df324c0`; all 9 new/changed key files verified present in the remote tree via GitHub API (545 tree entries, 0 missing).

## Wave 20 — EPISODE PIPELINE revisit #2 (2026-10-11)

**Standing workstream:** second scheduled revisit (wave 17 was #1). Studio 2.0 absorbed into the pipeline doc; one verified new format; the first full worked example with engine-asserted numbers.

**Shipped:**

1. **Pipeline doc sync** (`~/workspace/tiktok-episode-pipeline/PIPELINE.md`): new **Stage 0B — Studio 2.0 consistency** as the pipeline's official consistency stage (series bible + prompt-DNA block prepended verbatim to every shot prompt in every episode; locked anchor plates generated ONCE with stated reuse math `avoided = assets × (episodes−1) × still-rate`); the **episode-planner → Studio bridge** as the planning-to-production handoff (bridge input authoritative: project type = most common block format, episodes = block count 3–10, runtime = median beats×spb snapped in-band); **production-packet export** (Markdown + self-contained HTML) as the deliverable format. New **G9 — cross-episode consistency** gate (DNA byte-identical across all shots; anchors byte-identical to the bible; no new characters mid-episode). 8 gates → 9.
2. **One genuinely new format verified this cycle: interactive / comment-driven episodes.** Verified, not invented: DRAMAGO's AI-native interactive drama catalogue since April 2026 (14 AI-produced dramas, 10 interactive; Q4 2026 AI Story World beta — FinanceWire press release Sept 30, 2026, company-claimed); Sydney Robinson's (@thatgirlsydjo) five-part "Group Chat" TikTok series — 30M+ views, 20,000 comments (Dexerto); viewers roleplaying in comments, in-app discussion threads + polls, PineDrama app, "Minis" series-section experiment (vertical micro-drama survey paper, Zenodo, late 2025). Honest negatives noted in the chapter: multi-POV is a technique inside formats (not standalone); duet/stitch chains are 2020-era; "ask the AI character" Q&A shows no verified Oct-2026 serialized traction.
3. **Worked example — "The Night Bus"** (`~/workspace/tiktok-episode-pipeline/WORKED-EXAMPLE-5-EPISODE.md`): full 5-episode mini-drama through concept → five planner blocks → bridge → Studio series packet. Real engine numbers, seed `b272deb1`, USD $0.0392/credit: **50 shots** (10/ep, 6s draft, 3 takes), models MiniMax H3 (25) / Kling 3.0 (11) / Hailuo 02-2.3 (8) / Wan 2.6 (3) / Luma Ray 3.2 (3); budget **$20.48 clean, $102.40 at 5×, $409.60 at 20×** (per-episode $3.78/$3.77/$3.49/$5.64/$3.78; ep 4 is Kling-heavy); bible plates $0.02 (4 assets × 0.12 credits/image Soul 2.0); **reuse avoids 1.92 credits ($0.08)**; 26-day schedule; DNA identical on all 50 shots; bridge arcs attached (no skeletons); voice budget 60s = locked dialogue budget. New **workflow 5** in `scripts/agent-workflows.test.js` rebuilds the exact config and asserts every printed number — the example is versioned to the data, not floating.
4. **Chapter `craft/episodic-shortform.md`:** new format #4 (interactive/comment-driven — the format, the evidence, the pipeline rules, a fictional worked block), new "Studio 2.0 — the pipeline's production-planning end" section (series mode, bridge, packet, worked-example pointer), 8 → 9 gates with the G9 series gate, sources updated.
5. **Planner + Studio:** new **interactive format preset** everywhere — `FORMAT_PRESETS` (planner) + `SERIES_FORMATS` (Studio) with band [60,150]/spb 15, radios in both tools, "5 proven serialized formats" copy. Sync-test guard auto-covers the new key (32/32 studio tests). Format-preset gap found while doing the worked example: none — the worked example's 4×15s=60s blocks resolve to the bridge's honest median-beats×spb runtime (60s, in-band) rather than the Studio's 90s default; documented in the worked example.
6. **Skills 225 → 226 (HAND):** `episode-interactive-format` (episodes) — the comment-driven procedure: one decision/episode, decision-beat freeze frame, real vote deadline, harvest comments into the next block. `episode-format-pick` updated to five formats.
7. **Regenerated:** `site/` (27 chapters, interactive radios, new chapter text), `skills/`, `api/v1/` (re-stamped), `llms.txt`/`llms-full.txt`.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS; studio.test.js 32/32; agent-workflows.test.js 60/60 (new workflow 5: 10 Night Bus assertions); 6,296 links, 0 broken; generator audits clean post-commit.

**Commit:** `884b06471581efbe1f28d0f5f9596bdffd249077` ([view](https://github.com/astercast/ai-film-master-guide/commit/884b06471581efbe1f28d0f5f9596bdffd249077)) — 26 files, pushed 2026-10-11 as remote commit `394f64a460e5150dda5485107021820398e3bfe9`; all 12 new/changed key files verified present in the remote tree via GitHub API (540 tree entries, 0 missing).

## History

- **Waves 1–11:** content/tools build-out — prompt linter, model deep-dives, style-bible builder, style bible, learning paths, teardowns, prompt templates, camera lexicon, checklists, glossary, skills library (212), budget/optimizer/doctor/workshop tools, model-watch freshness pipeline; plus a design overhaul ("cinematic craft" visual system), all completed 2026-10-11.

## Wave 12 — 2026 research integration (2026-10-11)

**Source research:** `~/workspace/research_notes/ai-film-deep-2026-20261011-2154/` (report.md + notes/ai-films-01.md, ai-festivals-01.md, ai-models-01.md). Every claim carries its source or an explicit single-source flag.

**Shipped:**

1. **New section `field/` + chapter `2026-developments.md`** ("2026: The Year AI Film Went Long-Form") — Tribeca premiere of *Dreams of Violets* (75 min, ~$2,000, 3 months; Kling + Claude + Gemini/Nano Banana; businesswire/consequence May 27 2026); 2026 model field (Kling 3.0 GA; Kling 4.0 announced Sept 28, Flash early access, full model not GA; Veo 3.1 current, no Veo 4; Runway Gen-4.5, LTX-2.3 Apache 2.0, Wan 3.0, Seedance 2.5, MiniMax H3, FLUX 3 T2V, Gemini Omni; 10s HD $0.25–$5, entry ~$8/mo); Sora shutdown timeline (Mar 24 announced → Apr 26 app closed → Sept 24 API shut); documented long-form workflow (script → locked stills → shot-by-shot 5–30s I2V → NLE → layered audio → upscale; continuity is THE bottleneck; "fix everything at the still-image stage"; MakeMovie, LTX Director 2.0); India/Pakistan AI cinema (Sardar Sarvai Papanna, The Iskoon Bridge, Ainak Wala Jinn, The Next Salahuddin; Cully Hill Boys, NAGIN); Cannes ban flagged single-source.
2. **New chapter `distribution/festival-landscape-2026.md`** — 2026 festival/competition landscape: Astana AI Film Festival ($2M fund, $450K Grand Prix to *The First Honest Day*, $200K/$100K/$50K tiers, 8,067 entries/125 countries, annual plans) with Grand Prix economics (prizes vs. production cost); Reply AIFF Venice (3,000+ shorts, Salvatores jury, *A Face Only a Mother Could Love*); Runway AIFF 2026; AI Film Festival Tirana (8 category winners); MEGA 2026 (*The Tale of the Peony*); Shimla Best AI Film; Cannes-ban flag; what wins and why.
3. **Kling 4.0 reconciled** — web search (techtimes, Pandaily/aiaffairs, curatedai, rctv, wavespeed, apimart) confirms Kling 4.0 WAS announced Sept 28, 2026 (Kuaishou/@Kling_ai): Flash early access for Ultra Yearly subscribers, full model expected Oct 2026, not GA as of Oct 11. Wave 8's record was correct; versely.studio's "unannounced as of Oct 1" was stale/wrong — noted in the 2026 chapter and source index. Model record, `model-updates.md`, and `direct-kling-4-0` skill all already say "announced, not GA" — no correction needed beyond the reconcile note.
4. **Bug fixes:**
   - `scripts/build_api.py` rmtree preserve list now includes `model-checks.json`, `model-review-queue.json` (task items) **and** `diagnoses.json`, `schema/diagnosis.json` — the rmtree had also wiped these two hand-authored files with no generator to restore them (recovered from git).
   - Kling 4.0 moved INTO `artifact-3-model-comparison.json` as the 22nd model (generator-owns-output: the record was a hand-edit to `models.json` that any rebuild would have wiped); assert corrected 21 → 22; rebuild regenerates `models.json` byte-identical to the hand-maintained version plus the two research updates.
   - "twenty-three chapters" → "twenty-six chapters" (was already stale at 24).
5. **5th teardown: *Dreams of Violets*** — appended to `api/v1/teardowns.json` (6 shots: dawn establishing, the alley, the soldier, the discovery, Amir at the window, Amir acts), built ONLY from documented production coverage (businesswire/consequence/Wikipedia); prompt reconstructions labeled analytical, actual prompts undisclosed. Teardown descriptions updated from "four films" to "five films".
6. **Model record updates** (via artifact, with sources + last-verified 2026-10-11): Seedance 2.5 identity-hold ~30s note; Wan 3.0 budget/fast-drafting note; Kling 4.0 now a first-class generated record. Sora stays `discontinued` (confirmed). OBSERVED bumped to 2026-10-11.
7. **Source index** — new "2026 field developments" section (27 sources) in `sources/source-index.md`.

**Validation:** `node --check` all site/assets JS — pass; 23 JSON files parse — pass; JSON Schema (draft-07) validation for models/teardowns/templates/camera/competitions/diagnoses — pass; internal link check 5,359 links, 0 broken; full rebuilds (build_api, build_site → 26 chapters, build_skills).

**Commit:** `1f0c7804b4e869a41e9fc9e2cbf8a3579192e8d4` ([view](https://github.com/astercast/ai-film-master-guide/commit/1f0c7804b4e869a41e9fc9e2cbf8a3579192e8d4)) — 54 files, pushed 2026-10-11, verified on remote main.

## Wave 13 — validation/hardening (2026-10-11)

**Shipped:**

1. **`scripts/validate.sh`** — one-command validation pipeline (6 stages, non-zero exit on any failure; usage: `bash scripts/validate.sh`):
   - Stage 1: `node --check` every JS under `assets/js` + `site/assets/js` (38 files)
   - Stage 2: JSON parse of all 27 JSON files under `api/`, `site/`, `skills/`, `scripts/`
   - Stage 3: draft-07 schema validation — schemas self-checked via `Draft7Validator.check_schema`; per-record validation for models/templates/camera-movements; doc-level for competitions/teardowns/diagnoses
   - Stage 4: relative-link check over every HTML page (5,656 links, 0 broken; externals and fragments out of scope)
   - Stage 5: generator-owns-output audit — rebuild `skills/` + `git diff` clean (212 files, no hand edits); `prompt-templates.json` == artifact-1 parser output (47 templates); every `api/v1` file either generator-written (11) or in `build_api.py`'s preserve list (7), 0 unaccounted; every skill id generator-sourced and `skills/index.json` count matches files on disk
   - Stage 6: `llms.txt` chapter count (26) == `build_site.CHAPTER_ORDER` total; `llms-full.txt` carries all 26 `<!-- chapter: -->` markers
2. **Fixed 29 broken links** (the validator's first real catch): root `api.html` and `craft-not-buttons.html` were stale duplicates — sha256-identical to `site/api.html` and `site/craft-not-buttons.html`, last touched waves 4–6, referenced by no doc (README points at `site/api.html`), generated by no builder. Deleted via `git rm` (recoverable); the canonical copies at `site/` resolve all links.
3. **Model-watch integration check**: `scripts/refresh/check_models.py` ran clean (exit 0, ~3.7 min live fetch) — 22/22 models checked, 0 errors, 2 no-sources. The live web flagged 3 source-signature diffs (Kling 3.0, Midjourney V1 Video, Kling 4.0) — review signals under the promotion workflow, NOT committed: the run was read-only (pre-run backups of `model-checks.json`/`model-review-queue.json` restored byte-identically; repo keeps the committed changed=0 / empty-queue state). Flag for next wave: verify the 3 flagged sources and promote real changes (Kling 4.0 page movement is plausible — full model expected Oct 2026).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (9 passed, 0 failed), exit 0.

**Commit:** `d4d3f70ae2e83ac1a1f389aeaa03fcf56efe3948` ([view](https://github.com/astercast/ai-film-master-guide/commit/d4d3f70ae2e83ac1a1f389aeaa03fcf56efe3948))

## Wave 14 — EPISODE PIPELINE integration (2026-10-11)

**Source research:** `~/workspace/tiktok-episode-pipeline/PIPELINE.md` (493 lines, read in full) — analysis of TikTok creator @uq6ctqxxc8 / FutureGalaxyStories (358.8K followers, 6.3M likes): serialized AI emotional mini-dramas. Representative Episode 3 ("A 2-Year-Old Girl Took a Taxi Alone Just to Find Her Daddy"): 82s, 128K plays, 3,187 likes, 722 saves, 89 shares, 29 comments. 9 production stages, hard budgets, 8 quality gates — all adapted into guide craft voice. Observed-case figures cited as single-source flags; no invented platform facts.

**Shipped:**

1. **New chapter `craft/episodic-shortform.md`** ("Episodic Short-Form: The AI Mini-Drama Pipeline", 27th chapter) — teach-the-craft treatment: genre anatomy (numbered serialization as the follow mechanic, hook-title caption formula, 60–150s/one-emotion, voice-led, cliffhanger endings, funnel CTA), all 9 stages adapted (series setup → episode prep → script → voice FIRST → keyframes → animation → assembly → caption package → continuity log), the golden rule (picture cuts TO locked dialogue), hard budgets table, the 8 quality gates as a checklist, craft-judgment section (where pipelines break). Added to `CHAPTER_ORDER` after `longform-pipelines`.
2. **Two interactive tools** (vanilla JS, ARIA, keyboard, print styles, cinematic-craft design; functional smoke-tested):
   - `site/episode-planner.html` + `assets/js/episode-planner.js` — series setup (title/logline/hashtag, recurring cast with voice IDs + anchor paragraphs, G0 bible gate), episode-block planner (episode N, one-word emotion, stake, hook visual, 3–5 beats, emotional turn, cliffhanger, keyframe scenes — with gate validation before save), arc tracker (episode log with lessons-learned appends). Persists to localStorage `afg-episode-series`.
   - `site/hook-generator.html` + `assets/js/hook-gen.js` — builds hook-title captions from the observed formula `[Episode N] + [one-line emotional stake] + [CTA]`: 5 worked variants per input (direct stake / question hook / mid-action freeze / identity + ritual / address the viewer), each with a "why this hooks" craft note, emoji auto-pick, CTA styles (next-part tease / funnel / finale thesis), one-click copy.
   - Both added to build_site.py templates, search index (Tools), and llms.txt tool list.
3. **Model-watch follow-up** (wave 13's 3 flagged source-signature diffs, fresh web search): **no promotions** — Kling 4.0 still not GA as of Oct 11, 2026 (monolithdesign, glitterpixely skill, gemini-omni.dev, vibeframe provider notes all confirm: full model expected mid-to-late Oct, Flash early access only); Kling 3.0 unchanged (current GA, pricing confirmed per-second via magichour/shhots); Midjourney V1 Video still the current video model (no V2). All three records already carry `last_verified: 2026-10-11`; left untouched. Human-review-queue pattern kept honest.
4. **Bug fix (builder):** wave 13's `git rm` of root `api.html` + `craft-not-buttons.html` broke `build_site.py` (it copies them into `site/`; they were build *sources*, not stale duplicates — the wave 13 note "generated by no builder" was wrong). Restored from `8ea0d64^`. `validate.sh` stage 4 now skips those two root files explicitly (build sources, not published pages — their served copies at `site/` are still checked).
5. **llms freshness:** `llms.txt` (26 → 27 chapters, +2 tool entries) and `llms-full.txt` (+new chapter marker + full text, 27 markers) updated; the validator's stage-6 checks now hold against them.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (9 passed, 0 failed); 42 JS files `node --check` clean; 5,883 relative links, 0 broken; link IDs of both tools verified against their JS; both tools functionally smoke-tested (5 hook variants, planner gates/save/log).

**Commit:** `d9e78792600e6627c9d7b739d84fef29b293be2b` ([view](https://github.com/astercast/ai-film-master-guide/commit/d9e78792600e6627c9d7b739d84fef29b293be2b)) — 44 files, pushed 2026-10-11, remote confirmed via gh-push `pushed:true` response

## Wave 15 — FLAGSHIP: "Studio" + generator-owned llms (2026-10-11)

**Shipped:**

1. **Studio — "Plan my AI film"** (`site/studio.html` + `assets/js/studio.js`) — the flagship interactive production-packet simulator. Concept in (film title, logline, genre/mood select ×8, target runtime 30s/2min/5min/10min, draft/festival tier) → deterministic packet out:
   - **Shot list:** N shots from runtime (draft 1 shot/6s, festival 1 shot/4s — the stated tier assumptions); per-shot prompt BUILT from the 47-template library (genre→track map, seeded FNV-1a + mulberry32 template selection with genre-appropriate opener/payoff beats, [SUBJECT]/[ENV]/[LIGHT]/[STYLE] filled from genre defaults + tier, [LINE]/[AUDIO] honestly left for the filmmaker and listed as "fill before generating"); every shot carries its template id, track, duration, and anatomy coverage note (16 animated/photorealistic templates have no recorded anatomy — the packet says so and points at the anatomy chapter rather than inventing one).
   - **Model selection:** per-shot picks from the template's own suggested models via a normalized + longest-prefix resolver (handles "Veo 3.1 (ingredients)", "Seedance 2.0 multi-shot", "Kling 3.0 image-to-video", the "Veo 3.1)" typo) against `models.json` video models; draft = cheapest priced candidate, festival = quality-flagged (optimizer's convention) else priciest; unresolvable templates fall back to the global tier pick and are FLAGGED, never silent. WHY per pick from the model's own best-use/strength fields, with rate and last-verified date.
   - **Budget table:** every line shows its math — keyframe stills (cheapest priced image model: Soul 2.0 0.12/image; draft 1/shot, festival 2/shot), per-model generation rows (shots × takes × seconds × credits/s), post at $0 (human time, not modeled); clean total + 5×/20× envelopes from the long-form chapter; "verify live" for unpublished rates. USD at $0.0392/credit.
   - **Schedule:** ordered phases (stills → generation → assembly → audio → grade) with stated day-rates (draft 40 shots/day, festival 12; 1 day per finished minute of assembly, 1 day per 2 minutes of audio/grade) and total shooting days.
   - **Export:** one-click copy of the full packet as markdown; print stylesheet; plans save to localStorage (`afg-studio-plans`); every shot deep-links to `workshop.html?template=<id>` for refinement.
   - Pure engine exported for node; **19 unit tests** (`scripts/studio.test.js`) against the REAL data: shot counts per runtime×tier, determinism (byte-identical JSON), seed sensitivity, template/track validity, model resolution across all 8 genres, cost-parser conventions, budget sums (lines == clean, exact 5×/20×), traceable generation math (shots × takes), schedule invariants, markdown export contents, invalid-input throws.
2. **Generator-owned `llms.txt` / `llms-full.txt`** (`scripts/build_llms.py`, wave 14's noted hand-update debt resolved): both files now regenerate deterministically from `CHAPTER_ORDER` + `api/v1/*.json` + `skills/` + chapter sources + a TOOLS registry; remaining prose lives as constants in the script. **Re-baseline notes (deliberate, one-time):** `llms-full.txt` chapter order is now the canonical `SECTION_ORDER` (was a legacy hand order), chapter text refreshed to current sources (6 chapters had drifted), and the hand-appended "wave 9 / wave 11 additions" tools sections replaced by a generated tools appendix. Caught real drift the hand process had missed: the `craft/` chapter list was missing `episodic-shortform`. `validate.sh` stage 6 now regenerates and requires a zero git diff (was chapter-count/marker heuristics); now 7 stages.
3. Build wiring: `STUDIO_TMPL` + build step + search-index entry in `build_site.py`; `site/studio.html` listed in the generated `llms.txt` tool list.

**Design:** cinematic-craft language (hero kicker "Tools · Flagship", production-packet register); semantic HTML, fieldset/legend radios, skip link, aria-live results, role=alert errors, focus management, keyboard-operable pills, `prefers-reduced-motion` handling, mobile-first, print stylesheet that outputs the packet only.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (11 passed, 0 failed); 44 JS files `node --check` clean; 5,936 relative links, 0 broken; studio.test.js 19/19; all 8 genres × 2 tiers build and export clean; every studio.js-referenced element id verified present in studio.html.

**Commit:** `568066080fdd7c4609de2650c3cf55f7bd093f7d` ([view](https://github.com/astercast/ai-film-master-guide/commit/568066080fdd7c4609de2650c3cf55f7bd093f7d)) — 13 files, pushed 2026-10-11, all new files verified present in the remote tree via GitHub API.

## Wave 16 — RESEARCH-FUEL integration (AI video Q4 2026) (2026-10-11)

**Source research:** `~/workspace/research_notes/wave-fuel-2026-20261011-2355/report.md` + `notes/mission-b-models.md`, `notes/mission-b-pricing-open.md` (mission 2, read 2026-10-11, index-level reads). Every spec/price carries its source URL or an explicit "reported — verify live" flag; no invented specs.

**Shipped:**

1. **Model record refresh via the generator path** (never hand-edited `api/v1/models.json`): new script `scripts/wave16_artifact_refresh.py` edits `artifact-3-model-comparison.json`, then `scripts/build_api.py` regenerates `models.json` (assert updated 22 → 27 models). Five new records:
   - **Gemini Omni** (Google DeepMind, active) — Google's actual next play, unveiled at I/O 2026 (May 19–20); Omni Flash shipped day one in the Gemini app, YouTube Shorts, Google Flow; API since June 30, 2026 (~$0.10/s at 720p, token-billed, reported).
   - **Runway Gen-4.5** (Runway, active) — now a first-class record: no new model shipped in 2026 (Gen-4.5 still latest); Sept 2026 news was distribution (MCP) + Sept 30 Summit; $200M ARR → $350M projection (company-claimed); API benchmark $1.20/10s 720p (reported).
   - **LTX-2.5** (Lightricks, active) — Aug 11, 2026: Fast/Pro up to 4K, open weights 22B, multi-shot in one pass; trained on licensed Getty/Shutterstock data (commercial-legal safety; paid license above $10M revenue); API from ~$0.003/s (reported).
   - **Vidu S2** (Vidu, active) — Sept 15, 2026: real-time S2-Avatar (interactive character up to 720p) + S2-Editing (changes a live stream as it plays).
   - **Mirage Tesseract** (Mirage, formerly Captions, active, type `suite`) — Sept 22, 2026: agent-driven editing/motion-graphics suite, free local engine. Typed `suite` (not `video`) so the Studio never treats it as a per-shot generation model.
   - Refreshed: Wan 3.0 (formal release Aug 24, 2026; $0.05/s at 480p, 2–30s with native audio); MiniMax H3 (open weights Aug 3, 2026; optimized inference from $0.01/s); Kling 3.0, Seedance 2.5 (Turbo drafting tier), Luma (16-keyframe support), Veo 3.1 — all with the API benchmarks below.
2. **Pricing table** — API per 10s 720p (REPORTED benchmarks, Sept 2026, Higgsfield API comparison — third-party reported, not vendor-quoted; verify live): MiniMax H3 **$0.80**, Kling 3.0 **$0.84**, Luma Ray 3.2 **$0.90**, Runway Gen-4.5 **$1.20**, Seedance 2.5 **$2.31**, Veo 3.1 **$3.20** (per 8s). Landed in `cost_basis`, the 2026-developments chapter, and `model-updates.md`. Veo 3.1 is the premium API tier; open-model floors keep falling (LTX 2.5 Fast ~$0.003/s); drafting tiers (Seedance 2.5 Turbo, Gemini Omni Flash 360p) are now a workflow.
3. **Explicit corrections** (2026-developments chapter + model records + changelog):
   - **Veo 4 does not exist** — pages titled "Veo 4 release date" ranking on Google are SEO bait; no Google documentation names such a model (verified across three sources: lumeflow.ai, innfactory.ai). Google's actual play is Gemini Omni (I/O 2026).
   - **Kling 4.0 specs at leak-level** — the 30s claim is preview-leak level (GPTProto explicitly cautions unverified); flagged as "REPORTED, NOT CONFIRMED" in the record; Kling 4K is a 3.0 feature (added April 23, 2026), not a 4.0 feature — do not conflate.
4. **Chapter `field/2026-developments.md` additions:** native audio now standard across Kling 3.0 / Seedance 2.5 / MiniMax H3 / Wan 3.0 / Veo 3.1; Adobe's Sept 8 in-Premiere multi-model workbench (Firefly/Veo/Runway/Kling/Luma in the toolbar — the round-trip export loop is over); model-exclusivity is gone (fal, Replicate, Higgsfield, Protoface, Krea carry all frontier models); open-source notes (Wan 2.2 Apache = practical benchmark; HunyuanVideo consistency standout; LTX licensed-data legal safety; license traps: HunyuanVideo excludes EU/UK/SK + 100M MAU cap, CogVideoX 1M visits/mo cap, LTX paid license >$10M revenue); Google long-form research framework (research only, no product); "What to watch next" updated (Veo 4 line replaced by the correction).
5. **Regenerated:** `api/v1/models.json` (27 models), skills/ (5 new `direct-*` skills + 8 updated model skills, index 212 → 217), `llms.txt`/`llms-full.txt` (build_llms.py), `site/` — 5 new model deep-dive pages, search index, quiz copy 18 → 22 video models. Studio's model picks read `models.json` live — `studio.test.js` 19/19 against the refreshed data (model resolution, cheapest-draft invariant, budget sums all hold).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS; studio.test.js 19/19; node --check clean; 0 broken relative links.

**Commit:** `7a846607b769e54e7ddf74274b46fa35491b62dc` ([view](https://github.com/astercast/ai-film-master-guide/commit/7a846607b769e54e7ddf74274b46fa35491b62dc)) — 46 files, pushed 2026-10-11, all new files verified present in the remote tree via GitHub API (439 blobs, 0 missing).

## Wave 17 — EPISODE PIPELINE revisit #1 (2026-10-11)

**Standing workstream:** first scheduled revisit of the permanent episode-pipeline workstream (wave 14 was the integration). Source fuel: `~/workspace/research_notes/wave-fuel-2026-20261011-2355/report.md` mission 1 (short-form, late 2026).

**Shipped:**

1. **Mini-drama boom validation** in `craft/episodic-shortform.md` — new section "The mini-drama boom — why the format is winning (Oct 2026)": TikTok's episodic-series promotion since June 2026 (mini dramas = fastest-growing new category, single-source flag); the dedicated "TikTok Short Drama" search section (1–3 min vertical 9:16 episodes, series up to 455.7M views per series — single-source); ~90% of Chinese micro-drama releases now AI-generated (Kuhn reporting, single-source); Sensor Tower *State of Short Drama Apps 2026*: 850M+ downloads Q1 2026 (+140% YoY), 25 min/day viewing by April 2026; DoubleVerify: 1–2 min romance/revenge/cliffhanger episodes, $14B revenue expected 2026. Platform-mechanics reading: serialization is the follow mechanic under TikTok's interest-graph test-pool distribution; watch time + completion are the dominant signals (one emotion per episode IS a completion-rate design — the 60–150s genre band); cliffhangers are built for Reels' #1 signal, sends per reach (Mosseri); and the Oct 1, 2026 YouTube Shorts originality update REWARDS this exact format (original serialized content vs. channel-level reach cuts for aggregator re-uploads — announced by Creator Liaison Rene Ritchie).
2. **Three new serialized formats** — each entry: the format, why it works, a fictional worked episode-block example. Sourced, no invented accounts/numbers:
   - **POV micro-series** — "you" are the protagonist: @quiet.truths742 "Hallway series" Ep 1 — "POV: You insulted a stranger yesterday… and today he's your billionaire boss" (76.4K likes, 134 comments; TikTok, Oct 2026).
   - **"Day in the life" AI character vignettes** — recurring AI protagonist, 15–60s (autoweeb.com: serialized recurring-protagonist content outperforms one-offs in completion rate and subscriber conversion).
   - **Revenge / betrayal arcs** — the justice ladder (OutlierKit: betrayal & revenge storytelling 21x breakout, $20–$25 CPM, creator-reported ranges; ReelShort's *Your love is my poison* + Playlet's *Never Betray the Woman Who Built You* + the TikTok→drama-app funnel via md-eksperiment.org; DoubleVerify brand-suitability caution → the guide's lane stays non-graphic, feel-good vengeance).
3. **Episode planner tool upgrades** (`assets/js/episode-planner.js` + `EPISODEPLANNER_TMPL` in `scripts/build_site.py`, copytree'd to `site/`):
   - **Format picker** (mini-drama / POV series / day-in-the-life / revenge arc / custom) — "Apply format template" pre-fills the block skeleton (emotion, stake, hook, beats, turn, cliffhanger, keyframe scenes, seconds-per-beat); format + spb persist on saved blocks and restore on load.
   - **Runtime estimator** — beats × seconds-per-beat vs the format's runtime band (mini-drama 60–150s, POV 30–90s, day-in-life 15–60s); in-band verdicts state the dialogue-budget rule ("lock voice at ≈Ns ±10% before generating a frame"); too-short / too-long verdicts cite the one-emotion discipline (the two-emotions rule).
   - Accessibility: native radios (keyboard-operable), aria-live `role="status"` estimator readout, mobile-first grid, no motion. Functional smoke test (DOM-stubbed, 11 assertions) 11/11 — and it caught one real bug pre-ship (`currentFormat()` dropped "custom" → fell back to mini-drama; fixed, plus restore-on-load for saved custom blocks).
4. **Regenerated:** `site/` (27 chapters, episode-planner.html, copytree'd JS), `llms-full.txt` (+76 lines of new chapter text).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS; `node --check` clean; 0 broken relative links; planner smoke tests 11/11; studio.test.js 19/19.

**Commit:** `dd5a7574930c84fdaa440cf55d2520a9ee58740e` ([view](https://github.com/astercast/ai-film-master-guide/commit/dd5a7574930c84fdaa440cf55d2520a9ee58740e)) — 11 files, pushed 2026-10-11, all new files verified present in the remote tree via GitHub API (439 blobs, 0 missing).

## Wave 19 — Studio 2.0: series mode (2026-10-11)

**Shipped:**

1. **Studio series mode** — plan a mini-drama season (3–10 episodes) in one pass. `buildSeriesPlan()` (assets/js/studio.js, node-testable): each episode is a full deterministic `_buildPlan` (shot list, per-shot prompts, model picks from `models.json`, budget lines, schedule); the series wraps them in a generated **series bible** — locked cast anchors + locations, a prompt-DNA block prepended verbatim to EVERY shot prompt in EVERY episode (the consistency engine), and the six-rule series consistency checklist (golden rule, one emotion/episode, bible never changes mid-series — all from `craft/episodic-shortform.md`). Per-episode runtimes live inside the format's band; `buildPlan` keeps its strict runtime menu (unchanged behavior, existing tests untouched).
2. **Format presets as Studio project types** — the 4 serialized formats (mini-drama / POV micro-series / day-in-the-life / revenge arc) wired as first-class Studio presets alongside "Standalone film". Each pre-fills the runtime band, beats/episode, hook style, and the dialogue-budget rule (`beats × seconds-per-beat`, voice locked at ±10% before any frame — the golden rule). Bands/spb sync-guarded: a studio test asserts `SERIES_FORMATS` matches the episode planner's `FORMAT_PRESETS` (keeps the two files from drifting).
3. **Production packet export** — "Export my plan": copy/download the packet as Markdown (film + series); series also gets a **self-contained HTML packet** (`seriesToHtml` — inline CSS, zero external requests, print stylesheet) with the bible, per-episode arcs + shot prompts with locked DNA, model picks + cost math, budget (incl. "saved by the bible" reuse line), schedule, and the consistency checklist. Blob download, keyboard-accessible buttons.
4. **Save/load 2.0** — localStorage plans (`afg-studio-plans`) now carry a kind badge (film/series), names, **Duplicate** (deep copy + " (copy)"), **Delete**, and **"Continue planning"** (load restores the full form — including series cast/locations/format — and re-renders the packet). Old wave-15 entries load as films. All real buttons, focus moved to the packet heading, `role=status` announcements, reduced-motion respected.
5. **Episode planner ↔ Studio bridge** — one-click **"Send series to Studio →"** from the planner's new Saved-blocks list. Stages `{title, logline, cast anchors, every block's format/runtime/beats}` into `localStorage afg-studio-bridge`; the Studio consumes it once and pre-fills project type, episode count (block count, clamped 3–10), per-episode runtime (median beats×spb snapped in-band), cast rows, and attaches each block's emotion/beats/hook/turn/cliffhanger as the episode's arc (no skeletons when bridge arcs exist). Nothing leaves the browser.
6. **Asset-reuse math (stated, not invented):** locked anchor plates (cast + locations) costed ONCE at the cheapest priced image model's rate (from `models.json`, the asset-registry rule "face anchors never re-run"); the packet states `avoided = assets × (episodes−1) × still-rate` as the bible's stated saving. Series budget: per-episode subtotals + one bible-plates line, lines sum to clean, 5×/20× envelopes.
7. **Skills (222 → 225, all HAND):** `studio-series-plan`, `studio-packet-export` (new `studio` category), `episode-studio-bridge` (`episodes`). Regenerated `llms.txt`/`llms-full.txt` (Studio 2.0, series mode, packet export, bridge), `skills/`, `api/v1/` (unchanged payloads, re-stamped), `site/` (new studio.html + episode-planner.html, search index blurbs).

**Validation:** `bash scripts/validate.sh` → ALL 8 STAGES PASS (12 passed, 0 failed, run post-commit); node --check clean; 6,292 links, 0 broken; generator audits byte-identical; studio.test.js 32/32 (19 film + 13 new series: shot math, determinism, DNA-on-every-prompt, bible-plates line, reuse math, schedule sums, planner-band sync, skeleton vs bridge arcs, export contents, guard rails); agent-workflows.test.js 50/50 (new workflow 4: 5-episode mini-drama via the real engine — 75 shots, $38.38 clean, $191.90 at 5×, bible avoids 0.96 credits).

**Commit:** `f363022e81ea8af354bb9dd788e8f18d0ebfd571` ([view](https://github.com/astercast/ai-film-master-guide/commit/f363022e81ea8af354bb9dd788e8f18d0ebfd571)) — 24 files, pushed 2026-10-11 as remote commit `2a3b1cdc219e2a64d48d75ffe731042dda1e17df`; all new/changed files verified present in the remote tree via GitHub API (539 tree entries, 0 missing; remote `skills/index.json` count 225 with all 3 new skill ids; remote `site/assets/js/studio.js` contains `buildSeriesPlan`/`seriesToHtml`; remote `site/studio.html` contains the series panel).

## Wave 18 — Agent API excellence pass (2026-10-11)

**Shipped:**

1. **`api/v1/index.json` manifest v1.1.0 (additive):** every one of the 11 endpoints now carries `path`, `description`, `schema` URL, `updated` (ISO-8601 UTC), `records` count, and `notes` — including the Sora deprecation note (status=`discontinued`, Mar–Sep 2026 shutdown, excluded from Studio/compare pools, kept for the historical record). New `meta` block (`version`, `generated`, `base`, `auth: none`) and a `documents` map (`model-updates.md`). Generated by `scripts/build_api.py`; record counts computed from the real payloads.
2. **JSON Schema draft-07 for EVERY endpoint (11/11):** added `schema/checklist.json`, `schema/glossary.json`, `schema/index.json` (generated) and hand-authored `schema/model-checks.json`, `schema/model-review-queue.json` (loop-maintained, added to `build_api.py`'s preserve list). `validate.sh` stage 3 now validates all 11 endpoints.
3. **New `AGENT.md`:** operator's manual — base URL pattern (static, no auth/keys/rate limits), key-endpoint table with example requests, four end-to-end workflows (plan a 2-min AI horror short via the Studio recipe; lint a prompt against the linter's ten-layer data; track a model's price changes; lock a mini-drama series), rate/freshness/error notes, and the Studio + episode-planner input shapes.
4. **`scripts/agent-workflows.test.js`:** executes the three core AGENT.md workflows against the real local `api/v1` JSON — horror short: 20 shots × 6s, Kling 3.0 @ 1.4 cps → 504 credits = $19.76 clean, $98.80 at 5×, $395.20 at 20×; prompt lint 10/10 vs 0/10 on real layer data; Kling 3.0 price-track across models.json/model-checks.json/review-queue. 37 assertions, all pass; wired as new `validate.sh` stage 8.
5. **Shared conventions block in `API.md`:** the canonical seven-site block added verbatim; endpoint table refreshed (11 endpoints + 11 schemas, Sora note, 27 models/79 terms), skills count corrected 180 → 217, AGENT.md pointer added.
6. **Skills gap-fill (217 → 222):** 5 new HAND skills — `workflow-studio-plan`, `workflow-model-price-watch` (workflow), `episode-lock-series`, `episode-format-pick`, `episode-plan-block` (new `episodes` category, registered in `build_llms.py` CATEGORY_ORDER). Generator owns the files; no standalone edits.
7. **"Try the API" console on `api.html`:** endpoint picker (populated from the live manifest, built-in fallback list), fetch, syntax-highlighted pretty-printed JSON, aria-live status, graceful failures (file:// explained, serve-over-HTTP guidance). `site/api/v1/` now ships with the site (copytree in `build_site.py`), so the console works on any static host. Mobile-first, keyboard-native, no motion.
8. **Regenerated:** `llms.txt` + `llms-full.txt` (AGENT.md, console, new endpoints/schemas, 222 skills, episodes category), `skills/` (222), `api/v1/` (manifest v1.1.0, 3 new generated schemas).

**Validation:** `bash scripts/validate.sh` → ALL 8 STAGES PASS (10 passed, 0 failed post-commit); 44 JS parse; 54 JSON parse; all 11 endpoints validate; 6,292 links, 0 broken; generator audits clean; studio.test.js 19/19; agent-workflows.test.js 37/37.

**Commit:** `a68e106458b3d69ac26b7f6bcee59b1f440f1c30` ([view](https://github.com/astercast/ai-film-master-guide/commit/a68e106458b3d69ac26b7f6bcee59b1f440f1c30)) — 48 files, pushed 2026-10-11, all new/changed files verified present in the remote tree via GitHub API (474 blobs, 0 missing).
