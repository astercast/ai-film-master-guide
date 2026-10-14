# The Agentic Production Office: Running a Solo Film With a File-Driven Agent Crew

The most documented solo AI-film pipeline of late 2026 isn't a better prompt. It's a production office: one agent, a written skill file, and a folder of reference files that together do the job a whole department does on a conventional shoot. This chapter teaches that operating system, sourced from the productions that actually published theirs, so a one-person film can run with the memory and discipline of a crew.

## 1. The shape of the thing

Filmmaker Tim Simmons (Theoretically Media, seventeen years of professional production experience) made his AI action short *Dragon Blue*, a hyper-stylized vengeance-and-katanas film starring Flame/Katana Girl, every shot generated in Seedance 2.0, solo, in two days, with Claude Cowork as his "production office" (Theoretically Media newsletter, "The Ultimate AI Film Pipeline"). The office wasn't a metaphor: an agent with local folder access ran the film's pipeline from a published skill file (v3), parsing the script, generating character reference grids and scene boards, writing video prompts, filing assets, and tracking progress.

He's not alone in the pattern. HiDream.ai's vivago R1 (global availability October 9, 2026) is a commercial version of the same idea: a lead agent interprets the brief and develops a production plan while specialist agents handle scripts, storyboards, characters, environments, and audio, with shared context managed underneath (EZ Newswire syndication, October 2026). Higgsfield's Academy documents a leaner version of the loop for its multi-style short: Claude writes the shot's prompt, Seedance 2.0 executes it, visual building blocks come from image tools, and the previous scene's finished video chains forward as the next scene's reference (Higgsfield Academy, "The full film, and the workflow behind it"). The through-line: the film's memory lives in files and agent state, not in one person's head or one chat window.

One boundary to hold: Simmons' follow-up newsletter piece on piping his pipeline into Martini.film's canvas is disclosed sponsored content (he says so). The pattern it describes is real, but treat vendor-adjacent claims as product material, not craft evidence.

## 2. The file contract: what lives where, and why

Simmons published the actual skill, so the file contract is checkable rather than aspirational. The shape:

- **SKILL.md**, the one file the agent reads when the pipeline activates. It walks the agent through the entire two-stage workflow (still image generation: character refs plus scene grids; video generation second) and handles asset management: sorting grids into scene folders, curating best picks, tracking progress across the project. Installation is: unzip into a working folder, point the agent project at that folder with SKILL.md uploaded, and instruct it to follow the workflow exactly, starting with Step 0.
- **references/prompt-templates.md**, three placeholder-based templates the agent fills in per project: Character Reference Grids, Scene Grids (2×2 stills), Video Prompts.
- **references/filter-safety-guide.md**, the institutional memory file. Blocked prompt keywords get stored here; once a workaround is found, future prompts use that language automatically. Every filter fight is fought exactly once.
- **references/style-guide.md**, the visual lock: style, color palette, lighting, film stock decisions, made once in writing before generation starts spending.
- **references/story-notes.md**, the script, outline, or book passage goes in; the agent parses it into scenes.
- **tracking/production-tracker.md**, a status tracker for every character and scene, updated by the agent as work proceeds, so the production survives context death.

The why is the whole chapter in one sentence: chat context dies; files persist. Upload the final script, answer the agent's setup questions (target style, existing characters), and the folder populates itself. When a session degrades, the agent packages up a handoff prompt saved in the project folder, and a fresh project pointed at the same folder picks up where it left off.

## 3. Stills before video: the two-stage discipline

The pipeline's deepest craft decision is its order of operations. Stage one is stills: character reference grids lock identity, 2×2 scene grids lock composition, and everything is curated before a single video credit burns. Stage two is video: the locked stills become the generation brief. Simmons' engine choices inside the stages are instructive, Nano Banana Pro over Nano Banana 2 for reference stills, because Pro frames more cinematically and renders texture better while NB2 carries too much "sheen" and weaker composition; scene boards built on Luma's Agent Board (an agent canvas with project-wide knowledge) using a "spray and select" approach, generating lots of grids and curating the selects.

The economics of the order are simple: stills are where composition, texture, and palette decisions happen, at image cost. Video only ever executes locked frames. "Spray and select" is honestly a retake budget with a friendly name, budget the spray, not just the selects, but the spray happens in the cheap medium.

This is the same discipline the guide's long-form chapter teaches with different words (assets before shots, always), executed by an agent instead of a department.

## 4. The safety memory: never fight the same filter twice

The filter-safety file deserves its own section because it's the clearest example of what the office buys you. Content filters on generation platforms block keywords unpredictably; every solo filmmaker has lost an afternoon re-discovering that a particular word kills a prompt. The safety guide converts that afternoon into an asset: the blocked keyword goes in the file with the workaround, and every future prompt the agent writes uses the workaround language from the start.

Generalize the principle beyond filters: anything the production re-derives should be written down once. The style lock, the character descriptors, the template structures, the third film is cheaper than the first because the files survive. This is why the skill is at v3: the pipeline versions itself. Expect to rebuild it within weeks of major model drops; the office that ships the next film is the one that learned from this one, in files.

## 5. Token budget: spend judgment where judgment lives

Simmons built the pipeline lean on purpose, roughly 4.7k tokens, because agent sessions have limits and a bloated skill eats the working room. Model choice is role-split by design: the smartest model does brainstorming and prompt writing, where judgment lives; the cheap models do asset management and folder cleanup, "the intern" does the grunt work. Spending the expensive brain on filing is the agentic equivalent of paying a DP to carry sandbags.

Two hard-won operational rules come with the system. First, the handoff discipline: when a long session degrades (bad prompts, misbehaving agent), have it package a handoff prompt and restart in a fresh project against the same folder, the tracker file makes the restart nearly lossless, though nuance still leaks (even the saved "Personality Notes" are a sketch, not the session). Second, the rename warning: never let the agent rename files while you're editing, it breaks the editor's links. An agent reorganizing mid-edit is a continuity break in your own toolchain.

## 6. The honest limits

Three cautions, all from the record. First, the evidence is n=1 and self-reported: one filmmaker's v3, battle-tested on his films, published checkably but not independently verified across other productions. Steal the file structure; treat the specific templates as a starting draft. Second, the agent doesn't verify, you do. The office files assets and tracks progress; it doesn't watch the frames. Every select still needs human eyes, the way every department's work needs a director's. Third, the tool stack is perishable. The skill is oriented to a Nano Banana Pro / Seedance 2.0 workflow today, and its author expects the video prompts to work across most modern generators, build for the file contract, not the engine, because the engine will be different by the next film.

## 7. When to run an office

Not every film needs one. A single scene, a test, a weekend experiment, the office is overhead. The office pays off when the production has enough moving parts that memory becomes the bottleneck: multiple characters, multiple scenes, a real schedule, retakes you need to track. Roughly: if you'd hire a production coordinator on a conventional shoot, build the file office instead. The guide's long-form pipelines chapter is the natural companion, the folder-per-film shape (`brief.md`, `script.md`, registry, per-scene shotlists, version log) and the production office are the same discipline, one run by a department and one run by an agent.

**Sources:** Theoretically Media newsletter, "Free AI Film Pipeline Skill for Claude Cowork" (the Ultimate AI Film Pipeline v3, published skill contents); Theoretically Media YouTube masterclass description, "The AI Film Workflow No One is Talking About...Yet" (Dragon Blue pipeline: Seedance 2.0 on Dreamina, Nano Banana Pro, Claude Cowork, Luma Agent Board, Topaz Video, Suno, Adobe Podcast Enhance Speech); theoreticallymedia.com/about (creator background); EZ Newswire syndication via financialcontent.com (vivago R1 global availability, October 9, 2026, lead agent + specialist agents, HD-AgentOS, up to five-minute videos, CLI); Higgsfield Academy, "The full film, and the workflow behind it" (four-step loop: Claude writes the prompt, Seedance 2.0 executes, previous scene's finished video chains forward as reference).
