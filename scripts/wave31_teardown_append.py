#!/usr/bin/env python3
"""Wave 31: append the 8th teardown — Robert Gaudette's
"A Face Only a Mother Could Love" (8-minute solo AI short: $50K Runway AIFF
2026 Grand Prix + Reply AI Film Festival 2026 winner) — to
api/v1/teardowns.json.

Every production claim is sourced from the listed outlets: the Reply AI Film
Festival 2026 press release (Business Wire, Sept 7, 2026); the film's own
escape.ai page and YouTube description (the creator's own account of his
pipeline — first-hand, self-reported); Animation World Network (Aug 2026,
Nolia launch + awards record); broadcastdialogue.com (Nolia, Canadian trade);
the AI Cafe interview description (recorded June 23, 2026); Jon Flynn's
"Brag or Bury" LinkedIn essay (~July 2026); and hollywoodcgfx's October 2026
roundup (niche blog — production facts corroborated by the AI Cafe
description).
prompt_reconstruction is set ONLY where the creator documented the prompt's
components (his own account: per-shot prompts specifying character design,
camera movement, colour palette, emotional register, visual grammar) and is
explicitly labeled analytical. No direct quotes are used anywhere in this
entry; all facts are paraphrased.
"""
import json

PATH = "/home/hatch/workspace/ai-film-master-guide/api/v1/teardowns.json"

entry = {
    "id": "gaudette-mother-could-love",
    "title": "The Character Sheets Came First",
    "subtitle": (
        "Robert Gaudette's 8-minute solo short — the $50K Runway AIFF 2026 "
        "Grand Prix and Reply AI Film Festival 2026 winner, made alone in two "
        "weeks of 17-hour days: character sheets before shot one, lip-sync in "
        "the prompt, redub for the voice"
    ),
    "context": (
        "Robert Gaudette, a 54-year-old nonprofit worker from Toronto with no "
        "film school background, worked in tech early in his career, tried "
        "full-time photography, then moved into the nonprofit sector; when "
        "Midjourney and other AI image tools arrived in 2022 he started "
        "generating shots with AI as a side practice that has since become "
        "his full-time work (AI Cafe interview description, recorded June 23, "
        "2026). He conceived, wrote, and produced the 8-minute short alone — "
        "no actors, no crew — over two weeks of seventeen-hour days "
        "(corroborated by the AI Cafe description and hollywoodcgfx's October "
        "2026 roundup; Jon Flynn's 'Brag or Bury' essay repeats the same "
        "envelope). The film took the $50,000 Grand Prix at the 2026 Runway "
        "AI Film Festival, then won the Reply AI Film Festival 2026 in "
        "Venice in September, where a jury chaired by Oscar-winner Gabriele "
        "Salvatores cited the Grok/Nano Banana/Seedance stack as the way the "
        "screenplay reached the screen (Business Wire, Sept 7, 2026). Trade "
        "coverage (Animation World Network, Aug 2026) records further wins — "
        "Best Picture at the OMNI International Film Festival, Best AI Film "
        "at the New York International Film Awards, the David Harold "
        "Blackwell Award for AI & Emerging Technology Film at The Eudaimonia "
        "Project Film Festival — and the launch of Gaudette's Toronto "
        "AI-native studio, Nolia, with producer Kirk Hipkiss.\n\n"
        "The film follows Marcel Dupont, a Parisian man with a facial "
        "disfigurement whose mother told him every morning for thirty-eight "
        "years that he was beautiful. He moves through Paris with complete "
        "confidence while the world moves away from him; every evening he "
        "dances alone in his apartment, one hand raised for a partner who "
        "isn't there. On one Halloween night, a woman sits down beside him "
        "in the park and doesn't leave — she has been watching him for years "
        "(the creator's own synopsis, escape.ai / YouTube).\n\n"
        "SOURCING NOTE — read before the shots: the tool identity is "
        "reported, not audited, and it varies across sources — the Reply "
        "press release names Grok, Nano Banana, and Seedance; the film's "
        "escape.ai page (creator-submitted) tags CapCut, Dreamina, Gemini AI, "
        "and Runway ML. The pipeline description — character sheets first, "
        "five-field shot prompts, two-pass voice, Suno score — is the "
        "creator's own account on the film's pages: first-hand, but "
        "self-reported. Production-envelope facts (17-hour days, solo, no "
        "published budget) come from a niche blog (hollywoodcgfx) "
        "corroborated by the AI Cafe interview description; treat "
        "uncorroborated single-source color as the creator's telling. Prompt "
        "reconstruction appears once below, explicitly labeled analytical."
    ),
    "sources": [
        "https://markets.financialcontent.com/bpas/article/bizwire-2026-9-7-reply-a-face-only-a-mother-could-love-by-robert-gaudette-wins-the-reply-ai-film-festival-2026-the-international-competition-exploring-the-intersection-of-cinema-and-artificial-intelligence",
        "https://escape.ai/watch/6a3fc8c5a088e7b2ca9c9c33",
        "https://www.youtube.com/watch?v=wytfCS-N8Sk",
        "https://www.awn.com/news/bob-gaudette-and-kirk-hipkiss-launch-ai-film-and-tv-production-studio-nolia",
        "https://hollywoodcgfx.com/the-latest-ai-movies-6-films-made-with-generative-ai-in-2026/",
        "https://www.youtube.com/watch?v=UmA5FK4HvmA",
        "https://www.linkedin.com/pulse/brag-bury-jon-flynn-gaftc",
        "https://broadcastdialogue.com/bob-gaudette-and-kirk-hipkiss-launch-ai-native-nolia-studios-in-toronto/",
    ],
    "shots": [
        {
            "n": 1,
            "title": "The headline numbers — 8 minutes, ~238 hours, one person",
            "setup": (
                "Eight finished minutes. One person. No actors, no crew. Two "
                "weeks of seventeen-hour days — about 238 hours of one "
                "person's time — for an 8-minute short (AI Cafe; "
                "hollywoodcgfx). The film collected the $50,000 Grand Prix at "
                "the 2026 Runway AI Film Festival, then the top prize at the "
                "Reply AI Film Festival 2026 in Venice, plus Best Picture "
                "(OMNI), Best AI Film (NY International Film Awards), and the "
                "Blackwell emerging-technology award (AWN). No budget has "
                "been published (hollywoodcgfx)."
            ),
            "works": (
                "Bounding math, explicitly illustrative: this guide's model "
                "database prices Seedance 2.5 at $0.5686 per second at 1080p "
                "(BytePlus list, re-verified Oct 2026) — 480 finished seconds "
                "generated exactly once would be ~$273. The real number is "
                "unknowable (retakes, subscriptions, multiple tools), but the "
                "order of magnitude is the lesson: generation for a "
                "festival-winning 8-minute short is a hundreds-of-dollars "
                "line item, not a budget line. The money went to time, not "
                "pixels — the same shape as the wave-27 microdrama math."
            ),
            "breaks": (
                "Two hundred and thirty-eight hours in fourteen days is "
                "burnout arithmetic, not a schedule — copy the fortnight, "
                "not the days. And 'no published budget' cuts both ways: "
                "nobody can reproduce the spend, which means the only "
                "reproducible part of this production is the pipeline."
            ),
            "lesson": (
                "Budget the labor, not the generation. An 8-minute AI short "
                "costs roughly one dedicated human fortnight plus "
                "subscription-class tool spend; if your plan's generation "
                "line dwarfs that, you're pricing the wrong thing."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 2,
            "title": "The drawer scripts — write now, generate when the tools catch up",
            "setup": (
                "Gaudette wrote about thirty scripts over the years and filed "
                "them away, because — in his own telling — nobody funds a "
                "short film by a nobody from Toronto (LinkedIn 'Brag or "
                "Bury', paraphrased). The winning film started as one of "
                "those: a story he had written some time ago, an experiment "
                "he began with no intention of submitting to festivals, let "
                "alone winning them (Reply press release, paraphrased)."
            ),
            "works": (
                "The script stockpile is the cheapest production asset in AI "
                "film: writing costs nothing, and AI removed the funding gate "
                "that used to strand a drawer full of scripts. The pipeline "
                "ran script-first — the directing happened in the 238 hours, "
                "not in a writers' room."
            ),
            "breaks": (
                "A drawer script is a head start, not a production: the story "
                "still took two weeks of 17-hour days to direct, generate, "
                "and finish. The script removed the 'what' — the labor was "
                "all 'how.'"
            ),
            "lesson": (
                "Keep a script drawer. Write the shorts you can't afford yet; "
                "AI film makes the backlog producible. The discipline is the "
                "same as the guide's long-form rule: nothing shoots until "
                "the script is locked."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 3,
            "title": "Character sheets first — continuity is an asset pipeline",
            "setup": (
                "Before generating any shots, Gaudette generated initial AI "
                "character sheets for the cast — and says continuity held "
                "because of them: the characters and their distinctive "
                "physicality stayed coherent across the whole film (the "
                "creator's own account on the film's pages, paraphrased)."
            ),
            "works": (
                "This is the guide's continuity-as-asset-pipeline thesis in "
                "one sentence: Marcel's disfigurement is exactly the trait "
                "that drifts shot to shot without a locked reference — the "
                "sheet made the trait lockable. It maps onto the "
                "craft-character-sheets skill (face anchor first, base "
                "portrait never re-run) and the longform asset registry: "
                "generate identity ONCE, reuse it everywhere. The Reply "
                "release ties the image stage to Grok and Nano Banana; the "
                "escape.ai tags list Dreamina and Gemini AI — the tool name "
                "varies, the discipline doesn't."
            ),
            "breaks": (
                "Sheets pin identity, not performance: emotion, gait, and "
                "gesture still vary shot to shot. And the creator's own "
                "account is the only record of the sheet discipline — "
                "reported, not audited."
            ),
            "lesson": (
                "Lock faces once; regenerate, don't re-prompt — the l2 "
                "discipline (character re-entry: identity label + three "
                "locked traits restated every scene). If your plan has no "
                "character sheet, your plan has no continuity; Gaudette's "
                "film is the proof that sheets, not better prompts, hold a "
                "face."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 4,
            "title": "The five-field shot spec — every prompt a director's note",
            "setup": (
                "Every visual in the film was generated from detailed "
                "cinematic prompts crafted per shot — each one specifying "
                "character design, camera movement, colour palette, emotional "
                "register, and the visual grammar of its sequence (the "
                "creator's own account, paraphrased). The prompt is a "
                "director's note, not a mood word."
            ),
            "works": (
                "The five fields are prompt anatomy made explicit: "
                "subject/design, camera, palette (the color-grading chapter), "
                "emotional register (directing-performance), visual grammar "
                "(cinematic-language). A generation prompt that carries all "
                "five gives the model nowhere to improvise the wrong thing."
            ),
            "breaks": (
                "Five fields per shot times an 8-minute film is hundreds of "
                "prompts — the spec discipline IS the 238 hours. There is no "
                "shortcut version of this; the craft is the labor."
            ),
            "lesson": (
                "Write every prompt like a shot list: who, what the camera "
                "does, the palette, the emotional register, the grammar. "
                "Then keep the five fields in the prompt library's anatomy."
            ),
            "prompt_reconstruction": (
                "Reconstruction for study, not the actual prompt — built from "
                "the documented five fields for the dancing-alone-in-the-"
                "apartment shot: 'Marcel Dupont, middle-aged, facial "
                "disfigurement, worn sweater; alone in a small Paris "
                "apartment at night, one hand raised as if holding a dancing "
                "partner. Camera: slow push-in from wide to medium close-up, "
                "settling on his face. Palette: warm tungsten practicals "
                "against deep blue window night. Emotional register: quiet, "
                "unselfconscious joy — he does not know he is being watched. "
                "Grammar: a single unbroken take, no cuts, no on-screen "
                "text; the room stays still so the dance is the only "
                "motion.'"
            ),
        },
        {
            "n": 5,
            "title": "Two-pass voice — lip-sync in the prompt, redub for the voice",
            "setup": (
                "Dialogue was generated with lip-sync animation integrated "
                "directly into the generative prompts — and then redubbed "
                "for voice consistency using 11Labs. The narration was also "
                "11Labs, tuned for tone, rhythm, and the precise deadpan "
                "warmth the script required (the creator's own account, "
                "paraphrased)."
            ),
            "works": (
                "The two passes separate the two jobs: the mouth performs "
                "(lip-sync in the generation prompt), the voice identifies "
                "(redub). It maps to the audio-lip-sync-route skill — "
                "Gaudette effectively ran both routes in sequence, using the "
                "first for performance and the second for identity. Voice "
                "consistency is the hard problem in long-form AI audio; the "
                "redub pass is how you solve it without re-generating the "
                "picture."
            ),
            "breaks": (
                "Two passes = two failure surfaces: a redub that doesn't "
                "match the mouth is worse than a consistent voice with "
                "imperfect sync. And the narration is the film's spine — an "
                "8-minute short carried by a narrator needs the read-aloud "
                "test from the audio chapter, not just a good voice model."
            ),
            "lesson": (
                "Generate the mouth, then cast the voice. For any speaking "
                "character that recurs: in-prompt lip-sync for the "
                "performance, a dedicated voice pass for consistency. Never "
                "ship the first voice — the redub is a gate, not a fix."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 6,
            "title": "The worn-in score and the textured Paris",
            "setup": (
                "The score was generated with Suno, briefed to feel worn-in "
                "and melancholic. Sound design and ambience were assembled "
                "with AI audio tools to build a textural Paris across three "
                "worlds: Halloween night, the quiet apartment, the park at "
                "dusk. The edit was assembled in CapCut (the creator's own "
                "account + tool tags, paraphrased)."
            ),
            "works": (
                "The emotional realism came from the soundtrack, not the "
                "pixels: viewers forgot the film was synthetic and asked "
                "who the actors were (LinkedIn, paraphrased). Brief the "
                "music by emotional function — not genre, not era — and "
                "build one ambience bed per world. This is the "
                "audio-music-brief, audio-sfx-bed, and audio-final-mix "
                "skills in procedure form, with a documented production "
                "proving the shape."
            ),
            "breaks": (
                "AI music has the same consistency problem as AI faces: a "
                "score that changes character between scenes breaks the "
                "film the same way a drifting face does. The 'worn-in' "
                "brief is a consistency strategy disguised as taste."
            ),
            "lesson": (
                "Score the film like a composer would: one emotional "
                "function, one sonic identity, all the way through. Sound "
                "does the realness — budget it like a department, not an "
                "afterthought."
            ),
            "prompt_reconstruction": None,
        },
        {
            "n": 7,
            "title": "The verdict — steal the craft, skip the sprint",
            "setup": (
                "Gaudette's line on the whole build: AI was present in every "
                "frame, every sound, every word, every silence — used as a "
                "collaborator, not a shortcut (the creator's framing, "
                "paraphrased). The room at Alice Tully Hall forgot the "
                "actors didn't exist (LinkedIn, paraphrased). He has since "
                "launched Nolia Studios in Toronto with producer Kirk "
                "Hipkiss — original IP, features and episodic in "
                "development (AWN; broadcastdialogue)."
            ),
            "works": (
                "The stealable pipeline: character sheets before shot one → "
                "five-field prompt per shot → in-prompt lip-sync, redub for "
                "voice → narration tuned like a performance → score "
                "briefed by emotional function → one ambience bed per "
                "world. The script drawer: write now, produce when the "
                "tools catch up. The sound thesis: audiences believe with "
                "their ears."
            ),
            "breaks": (
                "What to SKIP: the 17-hour-day sprint as a method — that is "
                "~238 hours of one human in 14 days; budget the fortnight, "
                "not the day. The tool lists vary across sources "
                "(Grok/Nano Banana/Seedance in the press release vs. "
                "CapCut/Dreamina/Gemini AI/Runway ML in the creator's tags) "
                "— reported, not audited; don't build a stack from a tag "
                "cloud. And the 'collaborator' framing is marketing voice — "
                "the stealable part is the pipeline, not the posture."
            ),
            "lesson": (
                "Steal the craft: sheets first, five-field prompts, two-pass "
                "voice, worn-in score, textured sound, a drawer full of "
                "scripts. Skip the sprint, skip the tag-cloud stack, skip "
                "the poetry. The film won because one person directed every "
                "frame — the tools just held the camera."
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
