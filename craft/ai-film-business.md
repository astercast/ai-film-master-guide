# The Business of AI Film

This chapter is about money: where it comes from, where it goes, and what the honest economics look like in October 2026. No get-rich framing. Every figure below is sourced; where the research found nothing verified, it says so.

**This chapter is not business, legal, or financial advice.** Prices, platform policies, and laws change fast, re-verify before spending or signing anything.

## Rule zero: know your cost floor

Before you quote a client, sell a license, or plan a release, compute what your film actually costs to make. The guide's budget optimizer (`optimizer.html`) does this from `models.json`: dialogue vs non-dialogue buckets, the cheapest model that satisfies your quality bar, 5× and 20× cost envelopes for the takes-and-iterates reality.

As of October 2026, rough per-finished-minute costs run from ~$1.90/min (Kling Turbo, clean single-take math) to ~$23.50/min (Veo 3.1), before the 5 to 20× overhead envelope that real productions hit. A 20-minute short can cost anywhere from a few hundred dollars to several thousand depending on the model mix. **Your cost floor is the single most important business number you have.** Every pricing decision below starts from it.

**Source:** `economics/credit-math.md`, `craft/longform-pipelines.md`, `data/v1/models.json` (cost basis: Higgsfield live pricing, Oct 10 2026; verify live).

## What actually pays (documented, Oct 2026)

### Distribution deals exist, but read the fine print

- **Escape.AI ("Neo Cinema")**, founded by Oscar-winning VFX pioneer John Gaeta, runs a curated AI-cinema streaming ecosystem distributing via Play.Works to Roku, Amazon Fire TV, LG and Samsung smart TVs (claimed 400M+ addressable CTV devices). Creators get a **50% net revenue split** on syndicated CTV content, plus tipping, channel subscriptions, and digital collectibles, while retaining **100% of underlying IP**. (verified, PR Newswire company release, Oct 2026)
- **AI Era Corp (OTC: AERA)** signed an **online broadcast-rights licensing agreement worth ~$1.26M** (Aug 28, 2026) for one package of AI-generated series, retaining AI training rights on every title. Management expects "several million dollars" per year from broadcast-rights licensing. (verified, GlobeNewswire, Aug 31 2026; figures are company-reported)
- **iQIYI's** AIGC series *The Ferry Man* passed **RMB 8 million in cumulative revenue-sharing** (Sept 23, 2026); the first two installments recovered production costs within their first week under a revenue-sharing model. (verified, PR Newswire via ad-hoc-news.de, Oct 5 2026; note: revenue-*sharing*, not gross revenue)

**The honest read:** real money is moving, but it is concentrated in a handful of early deals, mostly in China and mostly revenue-share rather than upfront acquisition. These are existence proofs, not a market.

### What does not (yet) exist

**No verified 2026 report was found of a major Western streamer (Netflix/Disney+/Max) acquiring an AI-generated feature outright.** Netflix reportedly used AI in 300 of 1,000 titles in 2026, streamers use AI in production but are not yet buying AI films *as* AI films. **Do not build a business plan around a streamer acquisition of your AI feature.** (research gap, documented Oct 2026)

### YouTube: the default self-release path

*The Cully Hill Boys* (110-min AI feature, $2M budget) premiered August 5, 2026 and streams **free on YouTube**, with all prompts and assets open-sourced, the current template for AI-feature release. YouTube monetization of AI content runs on two tracks: disclosure (transparency requirement, not a penalty) and the **mass-produced/repetitive content** rule, channels publishing many near-identical AI videos with weak variation can be treated as inauthentic. Channels using AI personas as fake experts on health/legal/finance/politics cannot monetize. (single-source, third-party explainers; **read YouTube's own Help pages before relying on this**)

**Source:** `~/workspace/research_notes/ai-film-round2-business/report.md` §1; companion: `distribution/release-paths.md`.

## Client work: the steadiest income

For most AI filmmakers in 2026, the money is not in features, it is in client work: ads, product spots, music videos, explainers, social content. AI's cost advantage is the entire pitch: what took a crew and a week now takes a workstation and a day. Here is how to structure it honestly.

### Positioning: sell the outcome, disclose the method

Position on what the client gets (a finished 30-second spot in 5 days for $X), not on the tool. But disclose AI use upfront, in the quote, in the contract, and on delivery. Reasons:

1. **Platform rules require it.** YouTube, TikTok, and Meta all have AI-content disclosure switches; realistic AI people trigger them. If your client's ad gets labeled or removed, that is your problem if you did not warn them. (verified, platform comparison, 2026)
2. **The law is moving.** New York's ad-disclosure law (GBL § 396-b(3)) requires conspicuous disclosure of synthetic performers in advertisements, **$1,000 first violation, $5,000 each subsequent** (signed Dec 2025; Amazon was requiring third-party sellers to label AI-generated people by July 2026). The EU AI Act's transparency duties for realistic synthetic media took effect August 2026. (verified, SAG-AFTRA AI policy timeline)
3. **It is a selling point, not a confession.** "We generate the product shots with AI and shoot the human talent for real" is a professional pipeline description. Clients respect craft transparency; they fire vendors who surprise them.

**Source:** `legal/rights-and-disclosure.md`; research report §2.

### Scoping: promise what the medium can do

Scope every job against the medium's documented limits, and put the limits in writing:

- **Consistency is the floor.** Multi-shot character continuity requires reference discipline (see `craft/character-consistency.md`). Promise a locked character bible, not "the same actor in every shot, guaranteed."
- **Subtle acting is the ceiling.** AI cannot do subtle character acting (see `craft/failure-gallery.md`, Failure 1). If the spot needs a face delivering a complicated emotion, budget for a human shoot + AI transformation (the hybrid answer), and price it accordingly.
- **Iterations are the product.** Quote in rounds, not in clips. A "30-second spot" is not one generation, it is dozens of generations, selects, and fixes. The optimizer's 5× envelope is your scoping friend: estimate the clean cost, multiply, then add your margin.

### Pricing: cost-plus is the honest model

There is no verified 2026 rate card for AI-film client work in the research, anyone quoting "industry standard AI video rates" is inventing them. Use cost-plus:

1. **Compute the generation cost** (optimizer.html: runtime × model mix × takes envelope).
2. **Add your labor**, prompting, selecting, editing, sound, revisions. This is most of the cost. Price your days, not your credits.
3. **Add margin for risk**, re-generations, model quirks, client revisions.
4. **Add the rights/delivery overhead**, music licensing (see below), disclosure handling, deliverable formats.

Never price at "credits × some multiple" alone, that races to zero as models get cheaper, and it prices out exactly the craft (direction, taste, selects) the client is actually buying.

### Rights and delivery for clients

Client deliverables need the same paperwork stack as a festival entry, because the client's legal team will ask (see `legal/rights-and-disclosure.md`):

- **Music:** a commercial platform license is a contractual right to *use* the output, it is not copyright ownership (US Copyright Office position: no copyright without human authorship). Distributors and insurers ask for chain of title, and an AI track produces a thin file. For client work, prefer royalty-free libraries (Soundraw), licensed-training-data tools (Stable Audio), or human composers, and document the cue sheet. (verified as a documented industry issue, hackernoon filmmaker account, promise.legal analysis)
- **Likeness:** never generate a recognizable real person, face or voice, without a signed likeness license. The Cully Hill Boys template: written license, defined inputs (photos/audio), talent script approval, data-deletion clause. Voice is separately protected (Tennessee ELVIS Act, effective July 2024). (verified, Reed Smith)
- **Deliverables:** masters, captions, key art, plus the AI-specific folder: likeness licenses, platform subscription records proving commercial-tier status *during* generation, music license file + cue sheet, disclosure log. Build this folder as you go, not after delivery.
- **E&O insurance:** distributors usually require it; confirm with a broker that the coverage maps to AI-generated material, which may not qualify for copyright protection.

**Source:** research report §§3 to 5; companion: `legal/rights-and-disclosure.md`.

## The honest economics, summarized

What pays in October 2026: client work (ads, spots, social), priced cost-plus with your craft as the product; early distribution deals (revenue-share heavy, concentrated, mostly China); YouTube self-release with real monetization rules. What does not pay yet: the mythical streamer acquisition; "AI film" as a speculative asset; underpricing to win work you cannot deliver within the medium's limits.

The filmmakers making money with AI film right now share one trait: they know their cost floor to the dollar, they disclose the method, they scope against the medium's real limits, and they sell direction, not generations.

## Sources

- `~/workspace/research_notes/ai-film-round2-business/report.md` (all figures; confidence flags in the original)
- `distribution/release-paths.md`, `legal/rights-and-disclosure.md` (companions)
- `economics/credit-math.md`, `craft/longform-pipelines.md` (cost structures)
- Escape.AI / AI Era Corp / iQIYI figures: PR Newswire, GlobeNewswire, ad-hoc-news.de (company-reported; read with that in mind)
- YouTube monetization: third-party explainers (techtrox.com, akool.com, reelnreel.com), verify against YouTube Help
- NY ad-disclosure law, EU AI Act, ELVIS Act: SAG-AFTRA AI policy timeline; Reed Smith entertainment/AI guide
