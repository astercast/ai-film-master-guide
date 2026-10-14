#!/usr/bin/env python3
"""Wave 39: append the 10th teardown, Svedka's "Shake Your Bots Off"
(Super Bowl LX, Feb 8, 2026), the first primarily AI-generated Super Bowl
commercial (per ADWEEK), built by Silverside AI on component-based ComfyUI
workflows after the brand's source files for its Fembot mascot turned up
missing: characters, world, and choreography as separately controllable
elements, progressive-change workflows, a crowdsourced TikTok dance
choreographed into the robots in hours, and a spot that aired into a real
backlash about whether novelty is a concept.

Every production claim is sourced from the listed outlets: the ComfyUI case
study (comfy.org, vendor-hosted, the published workflow account); ADWEEK's
pre-game report (firsts, acquisition, exclusivity history, choreography
pipeline); TechCrunch's Super Bowl AI-ads roundup (the ~4-month rebuild
figure, credited to the Wall Street Journal; humans on storyline; Silverside
as the studio behind the controversial 2024 Coca-Cola AI holiday ads);
ADWEEK's "Creatives React" post-game piece (the backlash); Fast Company's
Coca-Cola AI-ads piece (Silverside's 2024 track record: three studios,
Leonardo/Luma/Runway stack); the Sazerac PR Newswire release (first-ever
Sazerac Super Bowl commercial, first vodka-only Big Game spot in 30+ years,
:30 slot placement, $10,000 dance contest, Victoria Justice); Parade's Mark
Ballas interview (contest window Dec 3-14, $10,000 prize); and Mix 92.9
Nashville (winner Jessica Rizzardi, 23, learned of the contest on TikTok).

Record fixes made while researching: (1) Sazerac's acquisition of Svedka
from Constellation Brands is dated 2024 by ADWEEK and TechCrunch; a Just
Jared item says "earlier this year", taking 2024 (two outlets), flagged in
the sourcing note. (2) The timeline is two phases, not a contradiction: the
Wall Street Journal's ~4 months (via TechCrunch) is the character-rebuild
R&D; the ComfyUI case study's "under one month of production" is the spot
production against a historical half-year benchmark for campaigns of this
scale.

prompt_reconstruction is null throughout: no prompts were published for
this production. No direct quotes are used anywhere in this entry; all facts
are paraphrased.
"""
import json

PATH = "/home/hatch/workspace/ai-film-master-guide/api/v1/teardowns.json"

entry = {
    "id": "svedka-lost-fembot",
    "title": "The Lost Fembot",
    "subtitle": (
        "Svedka's \"Shake Your Bots Off\", the first primarily AI-generated "
        "Super Bowl commercial (Super Bowl LX, Feb 8, 2026), rebuilt by "
        "Silverside AI on component-based ComfyUI workflows after the "
        "brand's source files for its robot mascot turned up missing: "
        "characters, world, and choreography as separately controllable "
        "elements, a crowdsourced TikTok dance choreographed in hours"
    ),
    "context": (
        "Svedka's \"Shake Your Bots Off\" aired during Super Bowl LX on "
        "February 8, 2026: a 30-second spot starring the vodka brand's "
        "Fembot robot mascot and a new sidekick, BroBot, dancing in a club "
        "to Rick James's \"Super Freak.\" ADWEEK credits it as the first "
        "primarily AI-generated Super Bowl commercial; Sazerac's own "
        "announcement (PR Newswire) calls it the company's first-ever Super "
        "Bowl commercial and the first national Big Game spot dedicated "
        "solely to a vodka in over three decades, it aired just after "
        "halftime, ahead of the third quarter. The production studio was "
        "Silverside AI, a San Francisco AI innovation lab founded by "
        "advertising veteran PJ Pereira, and the core technique was "
        "component-based ComfyUI workflows: characters, world, and "
        "choreography as separately controllable elements, built for "
        "progressive changes (ComfyUI case study).\n\n"
        "The backstory: Sazerac acquired Svedka from Constellation Brands in "
        "2024 (ADWEEK, TechCrunch), and the brand had been neglected for "
        "roughly a decade, Svedka's global VP of integrated marketing and "
        "innovation Amy Remley is quoted describing a brand bled of fans. "
        "The Fembot, the brand's most recognizable character since 2005, "
        "had been revived the previous fall after a 12-year hiatus, but "
        "nobody had the CGI files anymore. The campaign's own account: "
        "Sazerac bought its Super Bowl slot before picking a brand, Svedka "
        "won the internal pitch on the idea rather than the technology, and "
        "the Fembot has no voice, so the AI itself would be the celebrity "
        "(ComfyUI case study).\n\n"
        "SOURCING NOTE, read before the shots: the workflow account lives "
        "in a ComfyUI-published case study, documented, but vendor-hosted "
        "(Comfy benefits from the success story); its structure is "
        "corroborated by ADWEEK and TechCrunch's independent coverage, which "
        "agree on the technique and timeline shape. Two record fixes: "
        "(1) the acquisition is dated 2024 by ADWEEK and TechCrunch; a Just "
        "Jared item says \"earlier this year\", 2024 stands (two "
        "outlets). (2) The timeline is two phases: the Wall Street Journal's "
        "~4 months (via TechCrunch) is the character-rebuild R&D; the case "
        "study's \"under one month of production\" is the spot production "
        "against a historical half-year benchmark, not a contradiction. "
        "Generation spend was never published and ComfyUI workflows are "
        "self-built rather than a priced API, so there is no cost math to "
        "audit here, that absence is stated, not worked around."
    ),
    "sources": [
        "https://comfy.org/customers/svedka-silverside/",
        "https://www.adweek.com/creativity/svedka-bets-on-ai-and-its-fembot-to-make-super-bowl-history/",
        "https://techcrunch.com/2026/02/08/super-bowl-60-ai-ads-svedka-anthropic-brands-commercials/",
        "https://www.adweek.com/creativity/creatives-react-svedkas-forgettable-super-bowl-ad-proves-ai-isnt-an-idea/",
        "https://www.fastcompany.com/91232921/can-we-all-just-calm-down-about-cokes-ai-holiday-commercials",
        "https://pr.millcreekjournal.com/article/SAZERAC-COMPANYS-FIRST-EVER-SUPER-BOWL-COMMERCIAL-TO-STAR-SVEDKA-VODKA-AND-THE-BRANDS-ICONIC-FEMBOT-ROBOT/69307a4d476361ebf71e5109",
        "https://parade.com/entertainment/mark-ballas-svedka-super-bowl-ad-interview-dance-contest",
        "https://mix929.com/2026/02/09/local-dancer/",
    ],
    "shots": [
        {
            "n": 1,
            "title": "The headline numbers, :30, one missing character, one first",
            "setup": (
                "Thirty finished seconds. One production studio. A robot "
                "mascot whose source files no longer existed. The spot "
                "aired on Super Bowl LX (February 8, 2026), just after "
                "halftime and before the third quarter, and collected "
                "three firsts: the first primarily AI-generated Super Bowl "
                "commercial (per ADWEEK), Sazerac's first-ever Super Bowl "
                "commercial, and the first national Big Game spot dedicated "
                "solely to a vodka in over thirty years (Sazerac's PR "
                "Newswire announcement). It was also the first vodka brand "
                "ever to advertise during the game and the first Super "
                "Bowl spot from Sazerac itself (ADWEEK). The Fembot had "
                "returned to Svedka's advertising the previous fall after "
                "a 12-year recharge, alongside the new-to-2025 sidekick "
                "BroBot. The case study's headline production stat: twelve "
                "separate robot actions inside the first ten seconds of the "
                "spot, the choreography density the team points to as "
                "proof the pipeline was doing real direction, not "
                "prompt-and-pray."
            ),
            "works": (
                "The firsts matter because they define the risk profile: a "
                "debut Super Bowl buy, a neglected brand, a mascot nobody "
                "could open in a 3D package, and national scrutiny with no "
                "celebrity to anchor the spot. The team's answer was to "
                "make the production method itself the celebrity, the "
                "Fembot has no voice, so the AI behind her became the "
                "talking point (ComfyUI case study). For a reader's "
                "production, the transferable number is the choreography "
                "density: twelve distinct actions in ten seconds is a "
                "shot-level complexity budget most AI pipelines cannot "
                "hold, because single-prompt generation re-rolls everything "
                "when you touch anything. The Svedka pipeline could hold "
                "it because nothing was generated from a single prompt, "
                "see shot 4."
            ),
            "breaks": (
                "The novelty framing is the risk. 'First AI-generated X' "
                "is a headline, not a concept, ADWEEK's own post-game "
                "piece made exactly that case against this spot. Leading "
                "with the production method spends the audience's "
                "attention on how it was made instead of whether the "
                "joke lands. And the firsts cut both ways: a debut Super "
                "Bowl buy with no celebrity safety net means every "
                "imperfection gets read as an AI failure rather than a "
                "normal ad compromise."
            ),
            "lesson": (
                "When the production has no safety net, no source files, "
                "no celebrity, no second air date, pick the technique that "
                "keeps every decision revisable, not the one that promises "
                "the fastest first render."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 2,
            "title": "The problem: an icon with no source files",
            "setup": (
                "When Sazerac acquired Svedka from Constellation Brands in "
                "2024, the brand had been, in its own marketing VP's "
                "telling, neglected for about ten years and bleeding fans "
                "(ADWEEK). The revival strategy centered on the Fembot, "
                "the chrome robot mascot from the brand's mid-2000s "
                "campaigns, brought back the previous August after a "
                "twelve-year hiatus (ADWEEK; Sazerac announcement). But the "
                "files that created her were nowhere to be found. The "
                "campaign's own account is blunt about it: the team did "
                "not have the files for the whole robot, and bringing her "
                "back meant creating her and her world from scratch in "
                "post. A traditional pipeline, months of locked boards, "
                "locked scripts, locked music, could not rebuild a "
                "character from nothing and keep improving her until air. "
                "The team needed a system where nothing had to be locked."
            ),
            "works": (
                "This is the lost-asset problem, and it is more common "
                "than it sounds: acquired brands, orphaned IP, decade-old "
                "campaigns whose 3D assets died with an agency's server. "
                "The fix the case study documents is not a better prompt, "
                "it is a rebuild-then-generate order of operations (shot "
                "3) plus a workflow architecture where revision is free "
                "(shot 4). Note the licensing discipline hiding in plain "
                "sight: the character being rebuilt was the brand's own "
                "mascot, the team trained on IP it owned outright, the "
                "clean case in this guide's own-or-clear likeness rule "
                "(craft/documentary-ethics.md). A lost asset you own is a "
                "rebuild job; a lost asset you don't own is someone else's "
                "lawsuit."
            ),
            "breaks": (
                "A rebuild from nothing is a new character wearing an old "
                "name. Twelve years off-air means the audience's memory "
                "of the Fembot is fuzzy, that's freedom, but it's also "
                "drift risk: modernize too far and the nostalgia asset "
                "stops being the asset. And the lost-files problem has a "
                "rights shadow: rebuilding only works because Svedka "
                "owned the mascot outright. The same job on borrowed IP "
                "is a lawsuit wearing a production schedule."
            ),
            "lesson": (
                "Rebuild before you generate: when the asset is lost, the "
                "production starts with design and training, not with "
                "prompts, and only rebuild characters whose rights you "
                "actually hold."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 3,
            "title": "The rebuild, in parallel, paper first, then three tracks",
            "setup": (
                "Silverside started with paper, pencil, and industrial "
                "design, hand work, to modernize the original Fembot and "
                "create BroBot (ComfyUI case study). Then, instead of "
                "running the phases in sequence, the studio ran three "
                "tracks at once: one group trained AI models on the new "
                "characters, another trained models to build their world, "
                "and a third developed candidate stories. Animated "
                "prototypes existed for every script the team liked within "
                "days. The Wall Street Journal's reported figure (via "
                "TechCrunch): roughly four months to reconstruct the "
                "Fembot and train the AI to mimic facial expressions and "
                "body movements. The case study's figure: under one month "
                "of production, against a historical half-year benchmark "
                "for campaigns of this scale. These are two phases, not a "
                "contradiction, four months of character-rebuild R&D, "
                "then a sub-one-month spot production."
            ),
            "works": (
                "The parallel structure is the schedule trick. Character "
                "training, world training, and story development are "
                "independent problems, running them in sequence would have "
                "tripled the calendar; running them together meant the "
                "story team was prototyping against trained characters "
                "within days. The paper-first step matters more than it "
                "looks: the modernized designs were locked by industrial "
                "designers before any model trained, so the training "
                "targets were decisions, not explorations. And the "
                "human-gate discipline: TechCrunch notes the storyline "
                "itself was developed by humans, and Sazerac prototyped "
                "three AI-assisted spots the previous fall before "
                "committing, the four-month rebuild was R&D with an exit "
                "ramp, not a sunk-cost march."
            ),
            "breaks": (
                "Parallel tracks multiply coordination cost. Character "
                "training, world training, and story prototyping only "
                "stay aligned if someone owns the seams, otherwise the "
                "story team prototypes against characters that drift "
                "underneath them. Four months of rebuild R&D is also a "
                "real bet: Sazerac prototyped three AI-assisted spots "
                "the previous fall before committing, which is the "
                "discipline that keeps R&D from becoming a sunk-cost "
                "march. Skip the exit ramps and the parallel structure "
                "just burns money faster."
            ),
            "lesson": (
                "Parallelize by dependency, not by department: character, "
                "world, and story are independent training problems, run "
                "them together, and prototype the story against the "
                "trained characters within days."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 4,
            "title": "Component-based workflows, not prompt-and-pray",
            "setup": (
                "Silverside built the production in ComfyUI as component "
                "workflows: characters, world, and choreography as "
                "separately controllable elements, designed for progressive "
                "changes, so a new idea did not mean restarting "
                "generations. A dedicated final pass cleaned the remaining "
                "hallucinations before delivery (ComfyUI case study). The "
                "case study's own diagnosis of the alternative is worth "
                "carrying verbatim in spirit: single-prompt tools fail in "
                "a familiar way, the result comes back close enough, but "
                "changing one more thing changes everything. Workflow "
                "systems end that cycle: instead of a slot machine that "
                "hands back something to use or discard, the environment "
                "leaves every element of a shot under the production's "
                "control. No generation spend was ever published for this "
                "production, and ComfyUI workflows are self-built "
                "infrastructure rather than a priced API, so there is no "
                "cost math to audit here; the honest statement is that the "
                "money went into people and time, not per-second credits."
            ),
            "works": (
                "This is the chapter's core technique, and the reason this "
                "teardown exists: component separation is what made the "
                "twelve-actions-in-ten-seconds density possible. When "
                "character identity, environment, and choreography are "
                "separate controls, a director can re-time a dance move "
                "without re-rolling the face, or relight the club without "
                "re-rolling the robot. The progressive-change design, "
                "workflows engineered so a new idea lands as a parameter "
                "change, not a restart, is what let the team absorb the "
                "crowdsourced dance (shot 6) after the main scenes were "
                "already built. And the final hallucination-cleanup pass "
                "is a line item to copy: generation is never the last "
                "step; a dedicated cleanup pass is."
            ),
            "breaks": (
                "Component separation is infrastructure work, and most "
                "teams don't have a ComfyUI workflow engineer on staff, "
                "Silverside had to develop the progressive-change "
                "workflows themselves; they didn't download them. The "
                "vendor-hosted case study also deserves its flag here: "
                "the 'why ComfyUI' argument is craft, but the superlatives "
                "serve the vendor. And the honest gap in this production's "
                "record: generation spend was never published, so nobody "
                "can audit whether the architecture saved money or just "
                "moved it from credits to salaries."
            ),
            "lesson": (
                "Separate the controls, character, world, action, and "
                "design every workflow for the revision you haven't thought "
                "of yet; single-prompt generation can't hold commercial "
                "choreography density."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 5,
            "title": "Nothing is locked, ever, the review contract and its tax",
            "setup": (
                "With strategy, creative, and production running "
                "simultaneously, the ad stayed editable in ways linear "
                "production never allows: review cycles ran around the "
                "clock, new cuts were texted to the brand at 2 AM, and "
                "Sazerac's CMO Sara Saunders says Silverside made "
                "significant changes to the ad just a week before launch "
                "(ComfyUI case study). The campaign's marketing VP "
                "describes shipping the spot to the network while still "
                "fielding tweak requests. But the same account is explicit "
                "that the freedom intensified the work rather than "
                "cheapening it: the team spent more time on the ad, with "
                "more touches with its creatives, because once a new idea "
                "can be changed as you go, everyone wants to change it a "
                "lot. Sazerac's strategy director Drew Heidel names the "
                "price of admission: a very tight team, a lot of trust, "
                "and clarity of intent, because when everything is "
                "controllable, theoretically anything is an option."
            ),
            "works": (
                "This is the discipline most 'AI makes it fast' stories "
                "leave out. Nothing-locked is not a schedule discount; it "
                "is a decision-making load. The production bought "
                "revisability with 2 AM review cycles and a team trusted "
                "enough to make constant calls without a locked board to "
                "hide behind. Heidel's rule, clarity of intent becomes "
                "incredibly important when anything is an option, is the "
                "one-line management doctrine for every component-based "
                "pipeline in this guide. Copy the architecture without the "
                "discipline and you get infinite revision with no "
                "convergence: the freedom to change everything, exercised "
                "constantly, with nobody empowered to stop."
            ),
            "breaks": (
                "The discipline tax is real and the failure mode has a "
                "name: churn. Nothing-locked without a tight, trusted "
                "team and someone empowered to stop is infinite revision "
                "with no convergence, 2 AM review cycles are a cost, "
                "not a flex. The case study is honest that the freedom "
                "intensified the work; teams that copy the architecture "
                "without the intent doctrine get the chaos without the "
                "spot. Clarity of intent isn't a poster slogan here, "
                "it's the load-bearing management control."
            ),
            "lesson": (
                "Budget the decision load, not just the render load: a "
                "nothing-locked pipeline needs a tight, trusted team and "
                "explicit intent, or revisability becomes churn."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 6,
            "title": "The dance came from the crowd",
            "setup": (
                "In parallel with production, Svedka ran an open call for "
                "the routine the robots would perform: fans 21 and older "
                "submitted dance moves on Instagram and TikTok from "
                "December 3 to 14, judged by actress and singer Victoria "
                "Justice, for a $10,000 cash prize (Sazerac announcement; "
                "Parade). The winner was Jessica Rizzardi, a 23-year-old "
                "Nashville dancer who learned about the contest on TikTok "
                "(Mix 92.9). Silverside then choreographed the winning "
                "routine into the robots in a matter of hours, the "
                "Fembot's moves were done in minutes. The campaign's "
                "behind-the-scenes account frames the timing as the "
                "point: by the time the main scenes were ready, the "
                "winning dance was waiting, and the team just plugged it "
                "into the workflow. A crowdsourced routine arriving that "
                "late could not have survived a pipeline locked months "
                "earlier."
            ),
            "works": (
                "This is the nothing-locked architecture paying off in "
                "public. The choreography, the hardest thing to direct in "
                "AI video, came from a human dancer, through an open "
                "call, and landed as a swappable action component because "
                "the pipeline separated action from character and world "
                "(shot 4). The human-in-the-loop shape is worth naming: "
                "story by humans, choreography by a human, training on the "
                "brand's own mascot, and, in the campaign's own telling, "
                "just as many brains and hands on the spot as any "
                "traditional production, it just all happened in post. "
                "The $10,000 prize is also a real number for the guide's "
                "economics shelf: a national-choreography buy for the "
                "price of a used car, because the call was open."
            ),
            "breaks": (
                "Crowdsourcing the hardest-to-direct element means ceding "
                "creative control of it. The winning dance had to "
                "actually work on robots, a great human routine that "
                "doesn't translate to the rig is a wasted open call. "
                "And the timing was tight by design: contest entries "
                "closed December 14, the spot aired February 8, and the "
                "choreography could only integrate after the main scenes "
                "existed. If the workflow hadn't been built for late "
                "arrivals, the winning routine would have missed its own "
                "commercial."
            ),
            "lesson": (
                "Put the hardest-to-direct element (choreography) in human "
                "hands and the integration in the workflow's: an open call "
                "plus a swappable action component beats prompting a dance "
                "from scratch."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 7,
            "title": "The verdict, steal the architecture, skip the novelty play",
            "setup": (
                "What broke is on the record. ADWEEK's post-game "
                "\"Creatives React\" piece collected three creative "
                "leaders' verdicts, and none of them were about the "
                "pipeline: one argued the spot lacked a differentiating "
                "strategy, AI is a tool, not a concept; another called "
                "it weirdly low-budget, modeled on a decades-old "
                "non-AI reference; a third argued AI doesn't make "
                "advertising easier or better, it raises expectations. "
                "Independent reviewers piled on the uncanny robot designs "
                "and the irony of an anti-technology message, get off "
                "your phone, be human, produced almost entirely with the "
                "technology it seemed to critique. And the studio walked "
                "in with a track record: Silverside was one of three "
                "studios behind Coca-Cola's controversial 2024 AI holiday "
                "ads (Leonardo, Luma, and Runway, per Fast Company), which "
                "drew the 'too fake, ruined Christmas' backlash; founder "
                "PJ Pereira later sat for a full podcast interview about "
                "taking the brunt of the industry's AI backlash. Svedka's "
                "marketing VP said the team walked into the eye of the "
                "storm knowingly, the worst thing for a brand, in her "
                "telling, is being irrelevant."
            ),
            "works": (
                "Steal the architecture: the component separation, the "
                "progressive-change workflow design, the rebuild-then-"
                "generate order, the own-your-likeness training "
                "discipline, the human gates on story and choreography, "
                "the dedicated hallucination-cleanup pass, and Heidel's "
                "clarity-of-intent doctrine for nothing-locked "
                "productions. Skip two fantasies. First, the novelty play: "
                "the backlash verdict is that 'first AI-generated X' is a "
                "headline, not a concept, the work still has to be good, "
                "and AI raises the bar it has to clear. Second, the "
                "effort fantasy: the team spent more time with its "
                "creatives, not less. The honest pitch for component-based "
                "generation is not that it is cheap or fast, it is that "
                "it keeps every decision revisable until air, which is a "
                "different and more expensive kind of power."
            ),
            "breaks": (
                "The backlash is the thing to keep watching, not to "
                "dismiss. Three separate creative leaders plus "
                "independent reviewers converged on the same verdict: "
                "novelty isn't a concept, the robots read as uncanny, "
                "and an anti-technology message made with the technology "
                "it critiques invites the irony reading. The brand "
                "priced that in, irrelevance was the bigger fear, but "
                "a reader's production should know the trade it's "
                "making: the 'first AI-generated X' headline buys "
                "attention and spends goodwill in the same transaction."
            ),
            "lesson": (
                "'First AI-generated X' is a headline, not a concept, and "
                "revisability is power you pay for in decision load, not a "
                "discount you pocket."
            ),
            "prompt_reconstruction": None,
        },
    ],
}

with open(PATH) as f:
    data = json.load(f)

ids = [t["id"] for t in data["teardowns"]]
if entry["id"] in ids:
    data["teardowns"] = [entry if t["id"] == entry["id"] else t for t in data["teardowns"]]
    action = "replaced"
else:
    data["teardowns"].append(entry)
    action = "appended"

with open(PATH, "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write("\n")

print(f"{action}: {entry['id']} (now {len(data['teardowns'])} teardowns)")
