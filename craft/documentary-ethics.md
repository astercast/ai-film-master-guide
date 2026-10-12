# Documentary Ethics for AI Footage

A synthetic image of an event that never happened can be a film or a lie — the difference is craft. Documentary's whole contract with the audience is *this happened*. The moment your pixels are generated instead of recorded, that contract goes from automatic to something you have to build, shot by shot, label by label, receipt by receipt. This chapter teaches the ethics as production discipline: disclosure, reconstruction, likeness, verification, and the pre-premiere brief.

## 1. The new documentary problem

Camera documentary borrows its credibility from the machine: the lens was there, the light hit the sensor, so the audience grants you *this happened*. Generative video removes the *there*. Your footage is no longer evidence of an event; it's an illustration of an idea — and unless you rebuild the credibility deliberately, the audience will grant it the authority of evidence anyway. That gap is where every AI documentary lives or dies.

### A documented collision: "Dreams of Violets"

The film that walked straight into this problem is Fountain 0's *Dreams of Violets*, the 75-minute docudrama that premiered at the Tribeca Festival on June 10, 2026 — reported as the first fully AI-generated live-action film accepted by a major festival. The documented facts (Seeking Alpha/Market Chameleon, May 27, 2026; Wikipedia; trade coverage):

- Directed by Tehran-born Ash Koosha, produced by Fountain 0, co-produced by Pooya Koosha.
- A fictionalized dramatization of the January 2026 Tehran protests — five Iranians who meet in an alley, seen through Amir, a 10-year-old boy with cerebral palsy.
- Built from journalistic reports, photographs, and eyewitness accounts (Wikipedia) — a paper trail of real sources behind synthetic images.
- Roughly three months of work, about $2,000, made in spare time and weekends; Kling AI for video generation, Claude for language editing, Gemini and Nano Banana for research and imagery.

The reception was a clean split, and that split is the craft lesson. Tribeca co-founder Jane Rosenthal defended the premiere, saying what moved the programmers was the emotional immediacy and urgency of the story itself (Variety). The A.V. Club ran hostile — calling the film an AI-generated snuff film of people who don't exist being subjected to executions that didn't happen, built on footage and images of ones that did. The Guardian framed the whole question ten days before the premiere: slop or the future of filmmaking?

And then the market rendered its own verdict: a distributor and a festival rep backed out of the film once they learned it was AI-generated (The Hollywood Reporter, per this guide's festival-landscape research). Not because the craft failed — because the ethics question arrived unplanned-for.

> The lesson is not that AI documentary is indefensible. It's that the defense has to be built *in production* — sourced, labeled, and ready — not improvised after the premiere.

## 2. The disclosure stack

Disclosure is not one label. It's a stack of five layers, and a film that only turns on one of them is a film with a hole in its hull:

1. **The platform label** — the platform's own AI-content control (YouTube's altered-content question, TikTok's AI-generated setting, Meta's AI info option).
2. **The in-video or caption context** — human-readable words where confusion is likely.
3. **The credits** — the title card or end credits saying what was generated, plainly.
4. **The press kit and festival forms** — the written disclosure you submit with the film.
5. **The provenance** — machine-readable Content Credentials (C2PA) attached to the files.

### Platform rules, as they actually fire

Realism is the trigger, and the exempt list is longer than most filmmakers expect (builtbyfoundry.io, ~Sept 2026):

| Platform | What triggers disclosure | What does NOT | Consequence of skipping |
|---|---|---|---|
| YouTube | Realistic content that makes a real person appear to say or do something they didn't do; alters footage of a real event or place; generates a realistic scene that didn't occur | Beauty filters, color/lighting adjustment, background blur, captions, sharpening, upscaling, audio repair, idea generation, cloning your own voice for voiceovers/dubs | Repeated failures can bring a manually applied label, removal, or suspension from the Partner Program |
| TikTok | AI-generated or significantly edited content showing realistic-looking scenes or people | Generic TTS narration and anime-style art (exempt per policy summaries) | Unlabeled content may be removed, restricted, or auto-labeled by TikTok |
| Meta | Industry-standard indicators detected, or uploader self-discloses | Content only edited with AI tools shows the label in the post's menu rather than on the post (since Sept 2024) | — |

Three details change how you plan:

- **YouTube says disclosure does not limit audience or monetization eligibility.** The usual excuse — that the label kills reach — is answered in writing by the platform. Not disclosing is the thing with consequences.
- **TikTok's auto-label is permanent.** When TikTok detects Content Credentials attached by the tool that made the file, it applies an automatic label — and the creator cannot remove it. So provenance travels with the file whether you planned for it or not.
- **A label does not authorize banned content.** TikTok keeps some categories banned even with a label — including content that falsely shows a public figure making an endorsement.

Above the platforms sits the law. The EU AI Act's Article 50 transparency duties applied from August 2, 2026, with a marking grace period to December 2026 for systems already on the market (digitalapplied.com — single secondary source, flagged). If your film ships into Europe, disclosure is a compliance line, not just a craft line.

### The six-step disclosure workflow

A current disclosure guide (magichour.ai, updated October 2026) lays out the procedure as six steps — this is the practical shape of layer 1–2 and 5–6 of the stack:

1. **Describe what changed.** Write one sentence before exporting: the footage is real but the voice was synthetically changed, or the entire scene was generated and it did not happen. Name the alteration, not just the software.
2. **Classify realism and risk.** Review the final cut with the sound on and off. Could a reasonable viewer mistake the person, place, event, speech, or endorsement for a real recording? News, health, finance, and elections are high-stakes contexts — they get explicit context.
3. **Clear inputs and claims.** Record who owns the footage, music, image, voice, and likeness, and whether the people depicted agreed to this use. Verify statements separately. A conspicuous AI label cannot authorize an unlicensed asset or a fake testimonial.
4. **Select the platform control.** Answer YouTube's AI-use question; check TikTok's AI-generated setting; review Meta's disclosure option. Do it per destination — cross-posting does not carry the label over.
5. **Add human-readable context.** Say what changed in the caption or in-video text. "AI-generated visualization of a proposed store; not footage of a built location" is clearer than "Made with AI." Paid endorsements get addressed independently and prominently.
6. **Verify the published result.** Inspect the live post on a phone and in a logged-out view. Confirm the platform label, caption, and in-video disclosure survive cropping, description truncation, and reposting. Save the source, approved script, export, policy link, and a screenshot of the final post.

> The vague label is the most common failure. "Made with AI" tells the audience nothing about *what* was made — and in documentary contexts, a label that doesn't name the alteration reads as concealment with better manners.

## 3. Reconstruction discipline

AI documentary runs on reconstructions: events you could not film, rendered from sources. Three rules keep reconstructions honest.

### Rule 1 — Source the reconstruction

Every reconstruction starts from a dossier, not a prompt. *Dreams of Violets* built its docudrama from journalistic reports, photographs, and eyewitness accounts — the real-source paper trail that let the programmers and critics argue about craft instead of fabrication. Keep yours the same way: which report, which photograph, which account, and what you did not have. The dossier is what stands between your film and the A.V. Club's accusation.

### Rule 2 — Label the reconstruction in the cut

A synthetic recreation must never sit in the timeline like found footage. The standard craft: bumpers before reconstructed sequences, lower-thirds naming the reconstruction ("reconstruction — Tehran, January 2026"), a consistent graphic treatment that distinguishes generated material from anything real in the film. The audience should never have to guess which shots carry evidentiary weight.

### Rule 3 — Never invent the unknowable

The wave-27 teardown verdict applies with force here: never present unverified proper nouns, invented dialogue, or guessed details as sourced fact. If the report doesn't say what was said in the alley, your characters don't say it — or the film says, on screen, that the words are imagined. Reconstruction covers what the sources establish. Everything else is fiction, and fiction gets labeled fiction.

The most dangerous shot in AI documentary is the one that looks like found footage. Grain, shake, a degraded grade — these read as *evidence* to the audience's nervous system. If you dress generated footage in the clothes of archival material, you have manufactured evidence, and no label in the caption undoes the viewing experience.

A research synthesis on disclosure and trust (everymoviehasalesson.com, October 2026) gives the sorting rule:

| The asset claims to be… | What the audience is owed |
|---|---|
| Fictional artwork | Clear context that it's invented |
| A concept image | An accurate description of its status |
| A product image | Correspondence to the real product |
| A documentary image | Source, provenance, and evidence |

And the rule of thumb worth pinning above the edit suite: **the more an image's AI origin changes what the audience is likely to believe about its subject, origin, or meaning, the more important disclosure becomes.** A dragon needs context; a massacre needs a dossier.

## 4. Synthetic persons: likeness and consent

Documentary's hardest AI problem is the synthetic person. The axis is simple: *own or clear.*

### The baseline rights picture

A creator guide (cinemadrop.com, October 2026) lays out the three things every AI filmmaker should know — none of it legal advice, all of it hygiene:

- **Copyright needs a human author.** The U.S. Copyright Office's AI report (Part 2, January 2025): material generated purely by AI isn't protected; human creative contributions — your script, your selection and arrangement, your edit — can be. Keep your drafts and project files as the record of authorship.
- **Real people's likeness needs permission.** The feature *As Deep as the Grave* used Val Kilmer's AI likeness with his estate's and family's consent; California's AB 1836 protects performers' digital likeness after death. Don't put real actors, public figures, or private people into your film without permission — a paid plan's commercial-use license doesn't clear someone else's rights.
- **Platforms require disclosure.** YouTube's fake-trailer channels that mixed studio footage with AI lost their monetization in 2025. Original stories with original characters avoid both the rights problem and the disclosure problem.

### The clean case: rebuilding what you own

The documented clean case is commercial, not documentary — which is exactly why it's instructive. Svedka's "Shake Your Bots Off," the first primarily AI-generated Super Bowl commercial (Super Bowl LX, February 8, 2026, per ADWEEK), starred the brand's own robot mascot, the Fembot, revived after a 12-year hiatus. The production facts (ComfyUI case study; Adweek; TechCrunch; the dsh-directorx case file):

- After Sazerac acquired Svedka, the original CGI files for its most recognizable character were lost — the team no longer had them.
- Studio Silverside AI (the same team behind Coca-Cola's 2024/2025 AI holiday ads) spent roughly four months rebuilding the Fembot and training AI systems to replicate her expressions and body movement, on component-based ComfyUI workflows — characters, world, and choreography as separately controllable elements.
- The choreography came from an open TikTok call, won by 23-year-old Nashville dancer Jessica Rizzardi, with a $10,000 prize — the human contribution credited and paid.
- Humans handled the storyline. The brand's CMO positioned the AI as a narrative choice, not a cost play.

The polarizing reception ("got people talking," per press roundups) doesn't touch the rights craft, and the rights craft is the point: **the likeness was the brand's own IP, the human in the loop was credited and compensated, and the storytelling decisions stayed human.** That's the bar for synthetic persons. Everything else — real people, dead performers, public figures — is that bar plus permission.

### Guards as craft allies

Two tool-level facts belong in your planning:

- Engine-level **likeness-refusal guards** exist — the StoReel production documented one (wave 27) that blocks generating real people's likenesses. Treat refusal as a feature, not a bug: it's your first line of defense against an accidental synthetic person.
- Voice work follows the same rule. The documented professional lane is explicit consent — HeyGen's $99/month Professional Voice Clone tier ships with explicit consent (wave 32) — which maps directly onto disclosure step 3: the people depicted agreed to this use.

> Never use synthetic people as real customers, cast, or witnesses. That line — from the disclosure-trust research — is the whole subsection in one sentence.

## 5. Verification discipline

Receipts are a craft tool. The sound chapter's rights gap applies here too: keep your generation receipts — prompts, dates, tool, terms version — for everything AI in the film, especially music and voices. In documentary the receipts extend further:

- **The source dossier** (Section 3, Rule 1): which real-world source backs which reconstructed sequence.
- **The AI-touch map**: exactly where AI did and did not touch the work. A September 2026 filmmaker guide puts it as the positioning rule for the "human-made" moment — proving it starts with knowing precisely where AI entered the pipeline.
- **The honesty log**: what the tools couldn't do and how you worked around it. The wave-31 teardown's tag-cloud lesson applies — when tool identity is self-reported and un-audited, say so; "reported, not audited" is a sourcing status, and it belongs in your own dossier too.

## 6. The pre-premiere ethics brief

Go back to *Dreams of Violets*. The film had the paper trail (journalistic sources), the platform moment (Tribeca), and the defense (emotional urgency). What it didn't have, when the ethics question arrived, was a prepared brief — and the market's verdict (distributor and festival rep walking) landed harder for it. The wave-23 festival research distilled this as a craft takeaway: **plan for the ethics question.**

The brief has four parts, written before the premiere, not after the review:

1. **The press-kit paragraph** — one paragraph, plain language: what in the film is generated, what sources the reconstructions come from, what was invented. This ships with the film everywhere the film goes.
2. **The festival submission answers** — every festival form's AI question answered in the same words as the press kit. Festivals are judging "how much AI → what did you do with it" (wave 23); make their job easy.
3. **The title-card statement** — the on-screen "made with" line, in the film itself, in the first frames where it matters.
4. **The Q&A answer sheet** — the questions you will get (Is this real footage? Why generate suffering? Who consented?) and the answers you must have ready, in plain sentences, before a hostile reviewer asks them in public.

## 7. Eligibility mapping

This section is craft prep, not a competition calendar. The institutional landscape has moved, and it moves your production plan:

- **Cannes clarified, not moved** (Reuters, May 15, 2026): films primarily driven by generative AI are excluded from Palme d'Or competition. An eligibility rule, not a ban — but it names the line your film will be measured against.
- **The Academy's human-performance rule** and the guilds' "human" clauses (wave 23): the "demonstrably performed by humans" standard is where synthetic performance gets judged.
- **Hong Kong AI IFF 2027** (MarketersMedia PR — flagged): 19 redesigned awards, the 51% AI threshold dropped in favor of "substantive creative contribution," entries close March 1, 2027. The judging pattern keeps confirming wave 23's read: the question is *how much AI, and what you did with it* — not a percentage, but a craft account.

A September 2026 filmmaker guide gives this a name: the **Human Provenance in Film** framework — three tiers (No AI Used, Assistive AI, Generative AI), picked *before the shoot, not in the edit*, with records of where AI touched the project. The audience data behind it: September search data showed audiences actively looking for AI-free films, roughly two-thirds rejecting an AI lead, about three-quarters wanting disclosure — and the Academy plus all three major guilds writing "human" into their rules within a single year (filmustage.com). The craft read: your tier is a production decision with paperwork, decided at prep, carried through the cut.

## 8. Tool mapping to the model records

Every row below maps a disclosure-craft task to a real tool or platform behavior from the guide's records — verify live before planning around any of them.

| Craft task | Tool / record | How it maps |
|---|---|---|
| Attach machine-readable provenance | C2PA Content Credentials | Cryptographically signed creation/editing history on the file; TikTok auto-labels from it — provenance travels whether you planned it or not |
| Answer the platform's AI question | YouTube self-disclosure upload flow | The per-upload control; disclosing carries no reach/monetization penalty per YouTube |
| Label realistic generated scenes | TikTok AI-generated setting | Auto-label from Content Credentials is permanent — plan the label, don't fight it |
| Re-cut existing real footage instead of generating new "events" | Runway Aleph 2.0 (video editing model) | Re-spins filmed footage by prompt (angle, set, season) with no reshoot — keeps the footage's evidentiary status instead of manufacturing new events |
| Enhance rather than fabricate | Topaz Video AI (Astra model, tuned for AI-generated footage) | Upscaling/interpolation sit in the Assistive tier — disclosed, not hidden |
| Voiceover and narration consent | Explicit-consent voice clone tiers (e.g. HeyGen Professional Voice Clone, wave 32) | Maps to disclosure step 3: the depicted/agreed person agreed to this use |
| Prevent accidental synthetic persons | Engine-level likeness-refusal guards (documented in the StoReel production, wave 27) | Treat refusal as a craft ally, not an obstacle |
| Run the whole procedure | The six-step disclosure workflow (Section 2) | The per-release procedure: describe, classify, clear, select, contextualize, verify |

## The documentary-ethics pre-flight checklist

- [ ] Disclosure stack complete: platform label, in-video/caption context, credits, press kit, provenance
- [ ] Every reconstruction sourced in the dossier — report, photograph, or account named per sequence
- [ ] Reconstructions labeled in the cut (bumpers / lower-thirds / consistent graphic treatment)
- [ ] No invented dialogue, proper nouns, or details presented as sourced fact
- [ ] All synthetic persons owned or cleared — likeness permission documented
- [ ] Generation receipts saved (prompts, dates, tool, terms version) for all AI music and voices
- [ ] AI-touch map written: exactly where AI did and did not touch the work
- [ ] Pre-premiere brief ready: press-kit paragraph, festival answers, title-card statement, Q&A sheet
- [ ] Human Provenance tier chosen at prep, not in the edit
- [ ] Legal chapter reviewed before distribution ([rights and disclosure](../legal/rights-and-disclosure.html))

## Where this connects

- [Rights & disclosure](../legal/rights-and-disclosure.html) — the legal chapter this one's craft rests on; read it before distributing anything.
- [Festival landscape 2026](../distribution/festival-landscape-2026.html) — the results and eligibility rules: Cannes's line, the "plan for the ethics question" takeaway, the "how much AI → what did you do with it" judging pattern.
- [Editing AI footage](editing-ai-footage.md) — regenerate-vs-repair discipline and selects; the footage-reading craft that keeps reconstructions honest.
- [Directing performance](directing-performance.md) — synthetic performance direction; pairs with Section 4's likeness rules.
- [Sound, music & audio](sound-music-audio.md) — the rights gap and generation-receipts hygiene for AI music and voices.
- [Shot-by-shot teardowns](../teardown.html) — the *Dreams of Violets* teardown, broken into shots.
- [State of the field 2026](../field/2026-developments.md) — the model field and the institutional shifts this chapter's rules respond to.

## Sources & confidence

- *Dreams of Violets* production facts: Seeking Alpha/Market Chameleon (May 27, 2026), Wikipedia (journalistic-reports basis), trade coverage (Variety, THR, CNBC). Reception split: Variety (Rosenthal defense), A.V. Club (hostile review), The Guardian (June 3, 2026 framing piece). Distributor/festival-rep walkout: THR via this guide's wave-23 research.
- Platform disclosure rules: builtbyfoundry.io (~Sept 2026) — YouTube/TikTok/Meta trigger and exemption detail; TikTok's 3B+ labeled videos via TikTok Newsroom (Oct 1, 2026 — single-source on the figures, per wave 29).
- Six-step disclosure workflow: magichour.ai (updated October 2026) — paraphrased, not quoted.
- Disclosure-and-trust research synthesis: everymoviehasalesson.com (October 2026).
- Rights basics: cinemadrop.com (October 2026) — USCO Part 2 (Jan 2025), Val Kilmer/AB 1836, YouTube fake-trailer monetization losses (2025).
- Svedka/Silverside facts: ComfyUI case study (comfy.org), Adweek, TechCrunch, WSJ (via TechCrunch), the dsh-directorx case file (GitHub). Rizzardi prize: thedailymeal.com. Polarizing reception: press roundups.
- Festival/eligibility: Reuters (May 15, 2026 — Cannes); MarketersMedia PR (HK AI IFF 2027 — flagged); wave-23 festival research (Academy rule, Astana annual).
- Human Provenance framework + audience data: filmustage.com (September 2026).
- EU AI Act Art 50: digitalapplied.com (single secondary — flagged).
- Tool records: Runway Aleph 2.0 (runwayml.com research page, per aggregators); Topaz Astra; HeyGen explicit-consent tier (wave 32); StoReel likeness-refusal guard (wave 27). Verify live before planning around any model capability.
