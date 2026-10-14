#!/usr/bin/env python3
"""Wave 27: append the 7th teardown (StoReel's "Off Campus" $150 microdrama
experiment) to api/v1/teardowns.json.

Every production claim is sourced from the listed outlets (TheWrap's two
June-2026 pieces documenting their own Canvas build; Sixth Tone's June-2026
visit to Qidian Interactive as the professional-studio corroboration).
prompt_reconstruction is set ONLY where the outlet documented the prompt's
components (TheWrap: 300-400-word stage-direction prompts per clip covering
actor movement, camera, and dialogue) and is explicitly labeled analytical.
No direct quotes are used anywhere in this entry.
"""
import json

PATH = "/home/hatch/workspace/ai-film-master-guide/api/v1/teardowns.json"

entry = {
    "id": "storeel-off-campus",
    "title": "The $150 Microdrama",
    "subtitle": (
        "StoReel's 'Off Campus' experiment, four AI episodes in four days, "
        "documented clip by clip, and the factory that runs the same pipeline at scale"
    ),
    "context": (
        "StoReel, a Chinese AI-native microdrama platform, launched Canvas, a tool "
        "that lets anyone build a microseries, and gave TheWrap early access. The "
        "result is the most honestly documented AI microdrama build of 2026: an "
        "entertainment reporter made a four-episode spoof of the hockey romance "
        "'Off Campus' (characters Allie Hayes and Dean Di Laurentis) in four days "
        "for about $150 worth of digital credits (11,000+ StoReel credits), writing "
        "down every step, including the failures (TheWrap, June 2026). A second, "
        "complementary source documents the professional version of the same "
        "pipeline: Qidian Interactive's AI-video studio in Wuxi, visited by Sixth "
        "Tone in June 2026, its in-house Yudian system, three-group production "
        "flow, and a shelved 8-10 million yuan, three-year project it finished "
        "with AI in two months for around 1 million yuan.\n\n"
        "SOURCING NOTE, read before the shots: TheWrap's numbers are from their "
        "own documented experiment, not a marketing claim, including the costs "
        "that didn't work (paid character regenerations). StoReel's engine "
        "identity is reported, not audited: TheWrap describes the leading AI "
        "microdrama engines as compatible with ByteDance's Seedance 2.0; a TikTok "
        "creator promo for the tool claims a Seedance 2.0 engine outright, treat "
        "the second as marketing, the first as the outlet's reporting. Qidian's "
        "figures are company statements made during a site visit, not audited "
        "books. Prompt reconstructions appear once below, explicitly labeled; "
        "everything else carries its outlet."
    ),
    "sources": [
        "https://www.thewrap.com/industry-news/tech/off-campus-ai-microdrama-see-the-results-storeel/",
        "https://www.thewrap.com/media-platforms/tv/ai-generated-microdramas-could-be-the-future-of-mobile-entertainment/",
        "https://www.sixthtone.com/news/1018935",
    ],
    "shots": [
        {
            "n": 1,
            "title": "The headline numbers, $150, four episodes, four days",
            "setup": (
                "Four one-minute episodes for ~$150 (11,000+ StoReel credits). The "
                "character-and-setting generation cost 288 credits, inside the 300 "
                "free credits every Canvas user gets; the extra spend came from "
                "regenerations and topping up for the clips. TheWrap's reported "
                "per-minute economics: an AI-generated series can cost as little "
                "as $50/minute of finished content, against roughly $2,000/minute "
                "for a typical live-action microseries."
            ),
            "works": (
                "The per-episode math is checkable in a way no studio press release "
                "allows: ~$37.50 per minute-long episode in generation credits, "
                "four days from idea to four episodes. As a sanity check against "
                "this guide's own 29-model database (illustrative, not the same "
                "credit system, flag the mismatch): a 60-second episode at the "
                "Studio's draft tier (10 shots x 6s x 3 takes = 180 generated "
                "seconds) on Seedance 2.0 at the reported BytePlus estimate "
                "(~$0.37/s, 1080p, third-party, verify live) comes to ~$66.60. "
                "Same order of magnitude, same lesson: generation for a "
                "serialized episode is a two-figure line item, not a budget."
            ),
            "breaks": (
                "The $150 is generation credits only, free labor (a reporter), no "
                "scripting cost counted, and only 4 of the 30 storyboarded "
                "episodes shipped. TheWrap itself notes finishing the show would "
                "have cost 'a few thousand dollars more' in platform credits. "
                "Treat the $50/min figure as the documented benchmark to beat, "
                "not a promise, it's one platform's rate card, one experiment."
            ),
            "lesson": (
                "Budget generation per finished minute with a real number, not a "
                "vibe. Feed the $50/min benchmark (documented, platform-specific) "
                "into the Studio's cost optimizer as a comparison point: if your "
                "own plan's per-minute generation cost lands far above it, find "
                "out why before you generate shot one."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 2,
            "title": "Script in five minutes, breakdown in one click",
            "setup": (
                "The script came from a single one-paragraph prompt asking for a "
                "30-page, 30-episode script with a cliffhanger per 1-2 minute "
                "episode. ChatGPT refused the copyrighted recreation and returned "
                "an adaptation outline instead; Claude produced a 50-page script "
                "in about five minutes from the same prompt. StoReel's Canvas "
                "then ran a one-click breakdown: the script was divided into "
                "characters and settings, and the full 30-episode storyboard was "
                "split into 146 clips of 10-15 seconds each, the unit of "
                "generation for the whole production."
            ),
            "works": (
                "The story pipeline is script-first and human-edited: before "
                "generation, TheWrap edited each character's physical attributes "
                "and details in the tool. The engine handled decomposition, "
                "script to storyboard to clip list, the boring bookkeeping that "
                "usually eats a production coordinator. One page of dialogue "
                "equals about one minute, about one episode: the genre's script "
                "unit is the episode unit (TheWrap's wider industry piece "
                "documents showrunners feeding a page of dialogue into the "
                "engine to get a minute of content)."
            ),
            "breaks": (
                "TheWrap did not edit the AI-generated stage directions or "
                "camera cuts before generating, they printed them straight, "
                "and the result shows in shot 7. One-click breakdown is drafting, "
                "not directing: it organizes the work, it doesn't make the "
                "decisions."
            ),
            "lesson": (
                "Lock the script, then break it down by hand, one emotion, "
                "beats, a cliffhanger per episode (the episode planner's block "
                "structure is this same decomposition, done by you instead of "
                "the platform). And write the script prompt like a commission: "
                "length, episode count, episode length, cliffhanger rule, the "
                "Claude script worked because the brief was specific."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 3,
            "title": "The character library, continuity is an asset pipeline",
            "setup": (
                "Canvas's one-click breakdown produced the cast and settings as "
                "editable assets: TheWrap adjusted physical attributes and "
                "details per character before generating. StoReel auto-generated "
                "unusually specific physical descriptors for each character, "
                "perioral-region notes, iris-shape notes, the granular detail "
                "continuity lives or dies on. When Garrett Graham came out "
                "looking wrong next to the source characters, they paid to "
                "regenerate him: continuity failures are priced in credits, not "
                "reshoots. A likeness request for the real Prime Video actors "
                "was refused outright, a copyright guard against synthetic "
                "casting."
            ),
            "works": (
                "Faces are generated ONCE and reused, the same principle as "
                "this guide's series bible ('face anchors never re-run') and "
                "the Studio's locked anchor plates. Qidian's studio runs the "
                "professional version: a digital prop room of characters, "
                "locations, objects, and lighting setups reused across scenes "
                "and productions, plus a 3D plug-in that positions characters "
                "and objects in space so the model gets a clear map of each "
                "shot. Consistency is a supply chain, not a prompt trick, the "
                "professional studio literally built a room for it."
            ),
            "breaks": (
                "Regeneration is the hidden budget line: every wrong face costs "
                "a second generation. And the likeness refusal is a real "
                "creative constraint, you can't cast the star's face; you "
                "cast a face and lock it."
            ),
            "lesson": (
                "Lock faces once; regenerate, don't re-prompt. In the prompt "
                "library this is the l2 discipline (character re-entry: "
                "identity label + three locked traits restated every scene), "
                "the documented production used a character library, not "
                "better descriptions. If your plan has no character library, "
                "your plan has no continuity."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 4,
            "title": "The 300 to 400-word stage direction, one prompt per clip",
            "setup": (
                "Every one of the 146 clips got its own intricate storyboard "
                "with detailed stage directions for how each AI actor should "
                "behave. Each prompt ran 300-400 words, covering how the "
                "actors move, where the camera goes, and where the dialogue "
                "lines fit between the action. Rendering a 10-second clip "
                "took roughly 10 minutes of platform time."
            ),
            "works": (
                "The prompt is a director's note, not a mood word: actor "
                "movement + camera + lines in one instruction, per clip. The "
                "10-minute render is the real schedule unit, budget time in "
                "clips, not minutes of finished content: 146 clips x ~10 "
                "minutes is the production calendar, not the 30-minute "
                "runtime. The prompt library's f3 template (tactics-driven "
                "dialogue beat: tactic + line + one physical action) is this "
                "same discipline in template form, give the model a playable "
                "action, not an emotion."
            ),
            "breaks": (
                "TheWrap never edited the provided stage directions or camera "
                "cuts, and the generation shows it (see shot 7). The "
                "300-400 words are an upper bound on instruction, not on "
                "quality: unedited direction is unedited direction."
            ),
            "lesson": (
                "Write the prompt like a shot list: who moves, where, what "
                "the camera does, when the line lands. Then EDIT the "
                "generated stage directions before spending credits on the "
                "clip, the difference between this experiment and a series "
                "worth watching is the pass TheWrap skipped."
            ),
            "prompt_reconstruction": (
                "Reconstruction for study, not the actual prompt, built from "
                "the documented components (actor movement + camera + line "
                "between actions) for the 'Dean ruminating on the ice' scene: "
                "'Empty ice rink, night, cool overhead fluorescents, faint "
                "breath-fog in the air. Dean sits alone on the players' bench, "
                "elbows on knees, stick across his lap, staring down the ice. "
                "Camera: slow lateral track left-to-right, settling into a "
                "medium close-up on his face. He exhales once, looks down at "
                "his skates. Dean (quiet, low): \"I keep thinking if I skate "
                "hard enough I won't hear it.\" Hold two beats on his face. "
                "Static. No on-screen text.'"
            ),
        },
        {
            "n": 5,
            "title": "The discipline of retakes, the industry calls it 'drawing cards'",
            "setup": (
                "TheWrap paid for regenerations whenever a character or scene "
                "missed. Sixth Tone found the same practice industrialized "
                "across Chinese AI-drama studios: it has a name, 'drawing "
                "cards', and some studios employ dedicated card operators "
                "whose job is generating shot after shot until one works. "
                "Huang, a 26-year-old at a Shanghai production company now "
                "working entirely on AI dramas, generates the same shot three "
                "to five times for one usable result; during the afternoon "
                "rush, a single attempt can take 10-20 minutes. The "
                "continuity tax is concrete: a single-seat sofa returns as a "
                "two-seater, leather upholstery becomes fabric, and for "
                "consistency-critical shots, the team feeds reference images "
                "and generates again."
            ),
            "works": (
                "Retakes are the schedule, not a sign of failure: generation "
                "is near-instant, selection is the job. The pros' version adds "
                "structure, a team leader reviews throughout (Qidian's "
                "three-group flow: characters-and-settings, footage "
                "generation, editing, one to two people each), and a separate "
                "assessment model scores each project on 10+ criteria "
                "(cliffhanger strength, emotion pacing, scene efficiency, "
                "content-review risk). Nobody ships the first generation; "
                "nobody ships without a gate."
            ),
            "breaks": (
                "The drift tax never goes to zero, even the veterans treat "
                "every generated result as a gamble (paraphrase of Ma Shuan, "
                "the two-decade lighting artist now at Qidian). Retake count "
                "is a function of peak load too: generation queues stretch "
                "at rush hour."
            ),
            "lesson": (
                "Put 3-5 takes per shot in the Studio's takes field, that is "
                "the documented retake rate, not pessimism. For anything that "
                "must persist across shots (sofas, faces, props), attach "
                "reference images and regenerate against them; the pros use "
                "images, not adjectives, to pin continuity down."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 6,
            "title": "The business, the PUGC payout rate is published",
            "setup": (
                "StoReel's Canvas is a supply strategy, not just a tool: the "
                "company calls creator-made content 'professional "
                "user-generated content' (PUGC) and pays about 1,000 yuan "
                "(~$150) per minute of content it designates for a series. "
                "Roughly 20% of content is in-house, 80% comes from the PUGC "
                "ecosystem, and the goal is 100 shows per month, 'we're "
                "looking to build a YouTube, not an HBO,' in co-founder "
                "Angela Yu's paraphrased telling. The catalog is already over "
                "80 AI-original series, and StoReel reports average Day-7 "
                "retention 22% higher than comparable live-action titles, "
                "with one AI title recording a $4.63 cost per install against "
                "the typical $8-10 for live-action dramas."
            ),
            "works": (
                "The format now has a published payout rate, a creator can "
                "price a series before making it: 30 episodes x 1 minute x "
                "~$150/min = ~$4,500 of platform revenue for a full AI "
                "series. That makes the production economics above an actual "
                "business model, not a demo: $150 of generation credits "
                "against $150/min payouts is the whole pitch. The retention "
                "and CPI numbers are company-reported, but the mechanism is "
                "what matters for a filmmaker: AI drama is now a two-sided "
                "marketplace with a rate card."
            ),
            "breaks": (
                "StoReel's OWN content still takes 10 days to a month on "
                "scripting and a month in production, AI collapsed the "
                "generation time, not the story time. And volume is the "
                "strategy: the ECNS-reported Q2 2026 China numbers (239,000 "
                "microdramas released, ~153,000 described as AI-generated, "
                "reported industry data, flag) describe a flood, not a "
                "filter. A rate card doesn't make every series worth making."
            ),
            "lesson": (
                "Price the series with the payout math, not the generation "
                "math: what does a finished minute earn on the platform "
                "you're publishing to? Yu's reported thesis, with the tech "
                "this good, taste is the differentiator, is the whole "
                "strategy page: when generation costs collapse, the moat is "
                "story judgment, and the audience numbers above say viewers "
                "don't penalize the medium when the story lands."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 7,
            "title": "The verdict, steal the pipeline, skip the fantasy",
            "setup": (
                "TheWrap's verdict on its own build: realistic-looking but "
                "wooden, actors took unnatural breaks between lines, stared "
                "more intently than in human conversation, some lines arrived "
                "devoid of emotion. The visual drift showed up too: two "
                "characters sitting on one side of a couch reappeared on the "
                "other, a wall went missing mid-scene, and the engine "
                "hallucinated the book's author from Steinbeck to Steinberg. "
                "Their conclusion, paraphrased: not just anyone can make "
                "something worth watching, it takes taste."
            ),
            "works": (
                "The honesty is the teaching: this is the only documented "
                "build that published its failure reel alongside its "
                "receipts, the same reason this guide's failure gallery "
                "exists. The failures map exactly onto the pipeline's "
                "skipped stages: no edited stage directions (wooden acting, "
                "weird pauses), no continuity pass (vanishing wall), no "
                "proper-noun verification (Steinberg)."
            ),
            "breaks": (
                "What to SKIP: shipping unedited AI stage directions, the "
                "one pass TheWrap skipped is the one pass that mattered; "
                "assuming proper nouns survive generation, verify names, "
                "brands, and credits in post; treating 'AI-assisted' as "
                "'AI-directed', the engine stages, it doesn't direct. "
                "Qidian's version of the same warning: their three-group "
                "flow and team-leader review exist precisely because nobody "
                "ships the first generation."
            ),
            "lesson": (
                "Steal the pipeline: script with a real brief → character "
                "library as continuity engine → one 300-400-word stage "
                "direction per clip → 3-5 retakes per shot → human gates "
                "throughout. Skip the fantasy that generation is directing. "
                "The $150 experiment and the 1-million-yuan studio rebuild "
                "agree on one thing: the expensive part was always the "
                "story and the judgment, AI just moved the camera work into "
                "the credits column."
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
