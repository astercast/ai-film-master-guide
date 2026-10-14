#!/usr/bin/env python3
"""Wave 22: append the 6th teardown (The First Honest Day) to api/v1/teardowns.json.

Every production claim is sourced from the listed outlets. No tools, runtime,
team size, budget, shot count, or prompts are documented for this film, the
entry says so explicitly. prompt_reconstruction is null on every shot: with no
published stack, reconstruction would be invention, not teaching.
"""
import json

PATH = "/home/hatch/workspace/ai-film-master-guide/api/v1/teardowns.json"

entry = {
    "id": "first-honest-day",
    "title": "The First Honest Day",
    "subtitle": "The $450,000 Astana Grand Prix winner, a morality tale that turned AI's hardest problem into its story engine",
    "context": (
        "Nikolay Shestak's AI film won the $450,000 Grand Prix at the inaugural Astana AI Film Festival "
        "(Oct 1-3, 2026), which drew 8,067 entries from 125 countries; only 25 reached the final. "
        "The film competed in the main thematic program 'The Future Worth Living In' (10 finalists). "
        "The documented premise: a person's actions are reflected in their appearance, do bad things and "
        "you become ugly; do good and you don't. Shestak is a former actor who started directing about four "
        "years ago and began making AI-assisted films two years ago; he entered because the competition's "
        "format matched work he was already pursuing, and he plans to invest the prize money in making new films.\n\n"
        "SOURCING NOTE, read before the shots: no outlet has published this film's runtime, tools, team size, "
        "budget, shot count, or prompts. One critic checked and found no outlet stating what tools made it "
        "(Temperature Zero, Oct 9, 2026). The festival requires finalists to disclose 'model(s) and pipeline' "
        "on submission, the organizers hold all 25 pipelines and have not published them. The documented "
        "finalist ecosystem (per a state portal's account, single-source, treat as reported, not audited): "
        "80+ models in play across the competition, including Suno, Kling, Wan 2.6, GPT Image 2, ElevenLabs "
        "and Seedance 2.5; BytePlus was the technology partner, and each finalist received a one-year DRAMAGIC "
        "subscription with 60,000 credits. Those models are the COMPETITION'S ecosystem, not this film's stack "
        "nothing documented ties them to The First Honest Day. Prompt reconstructions are omitted (null) on "
        "every shot below: with no published stack, reconstructing prompts would be invention, not teaching."
    ),
    "sources": [
        "https://dailyguardian.eu/latvian-filmmaker-wins-e400000-grand-prix-at-kazakhstans-ai-film-festival/",
        "https://qazinform.com/news/from-actor-to-ai-filmmaker-nikolay-shestak-on-his-astana-ai-film-festival-triumph-1c1b9e",
        "https://qazinform.com/news/aaiff-2026-winners-share-stories-behind-their-ai-generated-films-163b82",
        "https://www.ajupress.com/view/20261006193412031",
        "https://temperaturezero.com/2026/10/09/biggest-ai-film-prize-toolmaker-on-the-jury/",
    ],
    "shots": [
        {
            "n": 1,
            "title": "The moral engine, the documented premise",
            "setup": "The documented logline (Daily Guardian EU): the film explores how people's actions shape who they become, bad deeds make its characters physically uglier, good deeds change them for the better. It competed under the theme 'The Future Worth Living In' (Aju Press).",
            "works": "One visual rule the whole film obeys. Every AI film's hardest problem is character-consistency drift, faces morphing between generations (see craft/character-consistency.md). Here the story's central mechanic IS transformation: the audience expects the face to change, so drift becomes direction. The model's weakest habit becomes the plot device.",
            "breaks": "The rule has to stay legible frame to frame, if a character's 'ugly' reads as random noise, the moral lands as cruelty, not justice. Without continuity discipline (locked base portraits, consistent lighting), the gimmick collapses into exactly the inconsistency the guide warns about.",
            "lesson": "Build the story around ONE visual rule AI can execute. When the concept's mechanic requires visible change, generation drift stops being a bug and starts being theme. Concept-first design (craft/story-structure.md): the idea has to survive contact with the tool's actual failure modes.",
            "prompt_reconstruction": None,
        },
        {
            "n": 2,
            "title": "Why the jury picked it, the documented rubric",
            "setup": "Daily Guardian EU reports the films were judged not only on how AI tools were used, but on artistic vision, storytelling, and overall coherence, plus how organically the technology was integrated into the creative concept. 8,067 entries narrowed to 25 finalists; this film took the $450,000 top prize.",
            "works": "The rubric is public and concept-weighted: 'organic integration' means the AI has to serve the story, not star in it. A film about faces changing with morality passes that test by construction, the technology IS the theme. The win documents that juries are grading AI films like films.",
            "breaks": "The exact weighting of the five criteria was never published, so 'what wins' can't be reduced to a formula. Don't over-fit your film to one festival's taste, the rubric above is a direction, not a scoring sheet.",
            "lesson": "Judge your entry on story first, tool second, because juries now do. The guide's entry-craft teardowns (case-studies/entry-craft-teardowns.md) say the same: coherence and vision outrank render quality. Write the rubric onto a sticky note before you generate shot one.",
            "prompt_reconstruction": None,
        },
        {
            "n": 3,
            "title": "The director's road, two years of reps",
            "setup": "Qazinform's profile: Shestak began as an actor, moved into directing about four years ago, and started experimenting with AI-generated films two years ago. His acting credits include Guardians (2017) and others (filmmakers.eu listing). He said he had not expected to win, given the number and diversity of entries.",
            "works": "An actor's instincts transferred: directing performance (craft/directing-performance.md) is about behavior, not renderers, blocking, reaction, timing. The documented timeline is the real lesson: the 'overnight success' at Astana was a two-year pipeline of AI experimentation layered on four years of directing.",
            "breaks": "The biography is public; the day-to-day craft process is not. Nothing documented says whether he storyboards, how many iterations a shot takes, or what he edits in. The gap is the point, a great backstory is not a reproducible workflow.",
            "lesson": "Two years of reps beat two weeks with a new model. The win belongs to a filmmaker who internalized directing BEFORE he automated it. If you can't block a scene with humans, you can't block it with generations either, learn the craft, then the tool.",
            "prompt_reconstruction": None,
        },
        {
            "n": 4,
            "title": "The ecosystem around the film, documented, not the film's stack",
            "setup": "The documented finalist ecosystem (Temperature Zero, citing a state portal, single-source, reported not audited): 80+ models in play across the competition, including Suno (music), Kling, Wan 2.6 and Seedance 2.5 (video), GPT Image 2 (stills), ElevenLabs (voice). BytePlus was the technology partner; each finalist received a one-year DRAMAGIC subscription with 60,000 credits. FLAG: none of this is documented as The First Honest Day's stack.",
            "works": "What it honestly tells a filmmaker: the winning ecosystem was a toolbox, not a magic model. And the generation math for a festival short is real and checkable, from this guide's own 29-model database, a 60-second short (10 shots x 6s, 3 takes = 180 generated seconds): Kling 3.0 (kling-v3 std, $0.084/s) ≈ $15.12; Seedance 2.5 (reported ~$0.231/s) ≈ $41.58; Wan 2.6 (7 credits/5s = 252 credits; at the guide's reference $0.0392/credit ≈ $9.88, rate flagged verify-live). Generation for a prize-winning short is a two-figure line item, not a budget.",
            "breaks": "These numbers are ILLUSTRATIVE, the film's actual generation bill is undocumented, and inventing one would be fabrication. The '80+ models' figure is a single state-portal account. Cost math proves a point about the field, not about this production.",
            "lesson": "Budget generation like a producer: shots x seconds x takes x $/s from the live rate card (the Studio does this automatically). The expensive parts of a prize-winning AI short are the concept and the edit, generation is the cheapest line on the page. Don't let a tool's price tag decide your story.",
            "prompt_reconstruction": None,
        },
        {
            "n": 5,
            "title": "The missing dataset, the bottleneck isn't technical",
            "setup": "The festival's own rule: 'model(s) and pipeline [are] disclosed on submission', the organizers hold all 25 finalists' pipelines. As of Oct 9, 2026, they had not published them (Temperature Zero). The critic's argument: that dataset, which tools, how many shots, how much hand work around the generation, is worth more to the field than the trophy.",
            "works": "A $2M-fund festival accidentally created the most valuable dataset in AI cinema: the disclosed pipelines of 25 finalists judged by a serious jury (former UNESCO director-general Audrey Azoulay, investor Balaji Srinivasan among them). The structural lesson: pipeline disclosure is becoming the industry's expected habit, and the first festivals to publish will teach the field.",
            "breaks": "The dataset doesn't exist publicly. Every teardown of this film, including this one, is reconstructed from press coverage, not production data. That is the honest limit of this entry, stated here rather than hidden: the shots above are lessons drawn FROM documented facts, not a shot-by-shot of the production.",
            "lesson": "Publish your own pipeline. When festivals don't publish theirs, your breakdown becomes the field's documentation. The teardown habit, what worked, what broke, what it cost, with sources, is the contribution. Start with your own next film; this guide's teardowns are the template.",
            "prompt_reconstruction": None,
        },
        {
            "n": 6,
            "title": "What a filmmaker can steal, the documented competition strategy",
            "setup": "Shestak told Qazinform he entered after coming across the competition and realizing its format matched the kind of work he was already pursuing. He called the $1M prize fund unprecedented for an AI festival, 'the first time in history someone gives you one million dollars in an AI festival', and saw he had a chance. He won $450,000, and said he plans to invest the prize in making new films and developing his projects.",
            "works": "Two documented decisions, both stealable: (1) enter competitions whose format matches work you're ALREADY making, no bespoke entries, no contortions, just a film that found its venue; (2) treat prize money as production capital, the reinvestment was announced immediately, not after the money was spent. Theme programs like 'The Future Worth Living In' reward stories about how people should live, a morality play was on-brief by design.",
            "breaks": "The prize is an outlier, $450K is the largest AI-film prize on record, not the median. Don't budget a career on prize money; the reinvestment plan works precisely because the next film is funded by the last one, and that chain breaks without a win.",
            "lesson": "The winning entry strategy is boring and repeatable: make the film you'd make anyway, then find the competition it fits. Read the theme, check the rubric, ship the work you already believe in. And when money comes, it goes back into the work, that's how a $450K night becomes a career instead of a story.",
            "prompt_reconstruction": None,
        },
    ],
}

with open(PATH) as f:
    doc = json.load(f)

ids = [t["id"] for t in doc["teardowns"]]
assert entry["id"] not in ids, "duplicate teardown id"
doc["teardowns"].append(entry)
doc["observed"] = "2026-10-11"

with open(PATH, "w") as f:
    json.dump(doc, f, indent=2, ensure_ascii=True)
    f.write("\n")

print("teardowns now:", len(doc["teardowns"]))
