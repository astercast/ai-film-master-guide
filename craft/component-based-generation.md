# Component-Based Generation: Characters, World, and Action as Separate Controls

The most instructive commercial AI production of 2026 didn't win on prompts. It won on architecture: Silverside AI rebuilt Svedka's lost Fembot mascot and put the first primarily AI-generated Super Bowl commercial on air (Super Bowl LX, February 8, 2026) by splitting the production into separately controllable components, characters, world, and choreography, and engineering every workflow for progressive changes. Twelve distinct robot actions in the first ten seconds of a thirty-second spot is a choreography density no single-prompt pipeline can hold. This chapter teaches the architecture, sourced from the production that published it.

## 1. The shape of the thing

Svedka's "Shake Your Bots Off" starred the vodka brand's Fembot robot mascot, revived the previous fall after a twelve-year hiatus, alongside a new sidekick, BroBot, dancing in a club (ComfyUI case study, comfy.org). ADWEEK credits the spot as the first primarily AI-generated Super Bowl commercial; Sazerac's own announcement adds the business firsts: the company's first-ever Super Bowl commercial and the first national Big Game spot dedicated solely to a vodka in over thirty years. The studio was Silverside AI, a San Francisco AI innovation lab founded by advertising veteran PJ Pereira. The problem the production existed to solve: Sazerac had acquired Svedka from Constellation Brands in 2024, the brand had been neglected for roughly a decade, and nobody had the CGI files for its most recognizable character anymore. The core technique was component-based ComfyUI workflows: characters, world, and choreography as separately controllable elements, built for progressive changes.

Two numbers define the production. The Wall Street Journal's reported figure (via TechCrunch): roughly four months to reconstruct the Fembot and train the AI to mimic facial expressions and body movements, the character-rebuild R&D. The case study's figure: under one month of spot production, against a historical half-year benchmark for campaigns of this scale. Two phases, not a contradiction: rebuild first, generate second.

## 2. Why single-prompt generation fails at production scale

The case study's diagnosis of the alternative is the chapter's founding argument. Single-prompt tools fail in a familiar way: the result comes back close enough, but changing one more thing changes everything. A director who wants the robot's arm two inches lower re-rolls the face, the lighting, and the background along with it. At commercial choreography density, twelve separate actions in ten seconds, that failure mode is fatal: every revision destroys the parts that were already right.

Workflow systems end that cycle. Instead of a slot machine that hands back something to be used or discarded, the environment leaves every element of a shot under the production's control. ComfyUI is the reference implementation here, a node graph where character identity, environment, and action are separate connected components, but the principle is tool-agnostic: any pipeline where one element can be revised without regenerating the others is component-based, and any pipeline where it can't is a slot machine wearing a workflow costume. The practical test: change the choreography timing on an approved shot. If the face survives, you have components. If it doesn't, you have a slot machine.

## 3. The three-component split: identity, world, action

Silverside's split is the template: character identity (who), world (where), choreography (what they do), three separately trained, separately controllable elements.

- **Identity**, the characters as trainable, lockable assets. Silverside's three-track production ran character training as its own parallel workstream: one group trained AI models on the new Fembot and BroBot designs while other groups built the world and developed stories. Identity is the component with the longest lead time (months, in the reference production) and the strictest ownership discipline: the team trained on a mascot the brand owned outright, the clean case in this guide's own-or-clear likeness rule (documentary-ethics.html). A lost asset you own is a rebuild job; a lost asset you don't own is someone else's lawsuit.
- **World**, the environment as its own trainable component. A separate group trained models to build the characters' world, independent of the character work. The payoff: the club can be relit, redressed, or re-composed without touching the robots' faces.
- **Action**, choreography as a swappable input. The winning TikTok dance was choreographed into the robots in hours, the Fembot's moves in minutes, after the main scenes were already built, because action was a component that plugged into the workflow rather than a property baked into each shot.

The rebuild-then-generate order matters. Silverside started with paper, pencil, and industrial design, hand work, to modernize the Fembot and create BroBot before any model trained. Lock the designs as decisions first; training then has targets instead of explorations. Animated prototypes existed for every script the team liked within days, because the story team was prototyping against trained characters, not waiting for a sequential pipeline.

## 4. Progressive-change workflows: design for the revision you haven't thought of

The case study's load-bearing engineering detail: the production had to develop new workflows for progressive changes, so another idea did not mean restarting generations. This is the discipline that separates a component-based pipeline from a component-based demo. Every workflow should be built so a new idea lands as a parameter change, re-time the dance, swap the routine, relight the set, rather than a restart of the generation chain.

Design for it explicitly: checkpoint each component independently, keep the inputs that produced each approved state, and test the revision path before you need it. The reference production's proof is the crowdsourced dance arriving after the main scenes were built and integrating in hours. A pipeline locked months earlier could not have absorbed a routine that didn't exist when production started. When you evaluate any generation workflow, ComfyUI or otherwise, ask the progressive-change question first: what happens when the idea changes after the scenes are approved?

## 5. The nothing-locked contract: review at 2 AM, and the discipline it demands

With strategy, creative, and production running simultaneously, the Svedka ad stayed editable in ways linear production never allows: review cycles ran around the clock, new cuts were texted to the brand at 2 AM, and significant changes landed a week before launch (ComfyUI case study). This is the nothing-locked contract, no decision is final until air.

The same account is explicit that the freedom intensified the work rather than cheapening it. The team spent more time on the ad, with more touches with its creatives, because once a new idea can be changed as you go, everyone wants to change it a lot. Sazerac's strategy director names the price of admission: a very tight team, a lot of trust, and clarity of intent, because when everything is controllable, theoretically anything is an option.

Copy the doctrine with the architecture. A nothing-locked pipeline without the discipline is infinite revision with no convergence: the freedom to change everything, exercised constantly, with nobody empowered to stop. Budget the decision load, not just the render load. The one-line management rule for component-based production: clarity of intent becomes incredibly important when anything is an option.

## 6. The final pass: a dedicated hallucination cleanup

One line item in the case study deserves its own section because productions routinely skip it: a dedicated final pass cleaned the remaining hallucinations before delivery. Generation is never the last step. However good the components are, the assembled frames carry the model's small lies, a finger count here, a logo warp there, and the reference production scheduled a distinct cleanup pass to catch them, separate from generation and separate from the edit.

Make it a named gate in your own pipeline: after the last generation, before the grade, one pass whose only job is hunting artifacts. The guide's regenerate-vs-repair discipline (craft/editing-ai-footage.md) is the companion read, the final pass decides what gets repaired in post and what gets re-rolled, and it needs its own time on the schedule, not the scraps of it.

## 7. Humans in the loop: story, choreography, QC

None of the component architecture removed people from the work. The campaign's own account: just as many brains and hands touched the spot as any traditional production, it just all happened in post. The human gates are specific and worth copying:

- **Story**, developed by humans (TechCrunch). Sazerac prototyped three AI-assisted spots the previous fall before committing to the Super Bowl concept; the idea won the internal pitch, not the technology.
- **Choreography**, a human dancer's. The open call (fans 21+, Instagram and TikTok, December 3 to 14, judged by Victoria Justice, $10,000 cash prize, Sazerac announcement; Parade) put the hardest-to-direct element in human hands; the workflow only had to integrate it. The winner, 23-year-old Nashville dancer Jessica Rizzardi, learned about the contest on TikTok (Mix 92.9).
- **Design**, industrial designers on paper before training began.
- **QC**, the final hallucination pass, plus the around-the-clock review cycles.

The $10,000 prize is a real economics data point: a national-choreography buy for the price of a used car, because the call was open. And the brand's risk calculus is worth noting honestly: the marketing VP said the team walked into the eye of the storm knowingly, with the studio's controversial 2024 Coca-Cola AI holiday ads in its recent past (Fast Company), criticism was priced in. The worst thing for a brand, in her telling, is being irrelevant.

## 8. The honest limits

Three cautions, all from the record. First, the evidence is n=1 and the workflow account is vendor-hosted: Comfy's case study documents the procedure checkably, and ADWEEK/TechCrunch corroborate the structure, but treat vendor-adjacent claims as product material where they serve the vendor, the "why ComfyUI" argument is craft, the superlatives are marketing. Second, thirty seconds is not a feature: component separation at commercial scale is proven here; nothing in this case study tells you what the architecture costs at ninety minutes. Third, the tool stack is perishable, ComfyUI workflows are infrastructure you own and can version, which is more durable than a SaaS prompt box, but the models underneath still churn. Build for the component contract, not the engine.

## Where this connects

- [Character consistency](character-consistency.html), the identity component's craft: reference grids, face anchors, and the lock discipline that makes a trainable character stay one person.
- [Long-form pipelines](longform-pipelines.html), the asset-registry architecture; components are the registry's runtime form.
- [Documentary ethics](documentary-ethics.html), the own-or-clear likeness rule; the Fembot rebuild is the clean owned-IP case.
- [Editing AI footage](editing-ai-footage.html), the regenerate-vs-repair discipline the final cleanup pass runs on.
- [The Agentic Production Office](agentic-production-office.html), the parallel-track production structure; components are what the office's folders hold.
- [Sound, music & audio](sound-music-audio.html), the spot's "Super Freak" needle-drop is a reminder that music licensing is a separate component too, clear it like one.
- [Shot-by-shot teardowns](../teardown.html), *The Lost Fembot*, broken into seven shots.

## Sources & confidence

- Production workflow, timeline, technique, review discipline: ComfyUI case study, "Shake Your Bots Off: how Svedka and Silverside AI made the first AI-generated Super Bowl ad with ComfyUI" (comfy.org), vendor-hosted, paraphrased throughout, no direct quotes; structure corroborated by ADWEEK/TechCrunch.
- Firsts, acquisition (2024), exclusivity history, Fembot revival: ADWEEK, "Svedka Bets on AI and Its Fembot to Make Super Bowl History" (Feb 2026).
- Four-month rebuild figure (WSJ via TechCrunch), humans on storyline, Silverside's Coca-Cola track record: TechCrunch, "From Svedka to Anthropic, brands make bold plays with AI in Super Bowl ads" (Feb 8, 2026).
- Post-game backlash: ADWEEK, "Creatives React: Svedka's Forgettable Super Bowl Ad Proves AI Isn't an Idea" (Feb 2026), three creative leaders' verdicts paraphrased.
- Silverside's 2024 Coca-Cola AI holiday ads (three studios; Leonardo/Luma/Runway stack; backlash): Fast Company (Nov 2024).
- Sazerac announcement (first-ever Super Bowl commercial; first vodka-only Big Game spot in 30+ years; :30 placement after halftime; $10,000 dance contest; Victoria Justice): PR Newswire via millcreekjournal.com (Dec 2025 syndication).
- Dance contest window (Dec 3 to 14) and $10,000 prize: Parade, Mark Ballas interview (Dec 2025). Winner Jessica Rizzardi, 23, Nashville, learned of the contest on TikTok: Mix 92.9 (Feb 9, 2026).
- Record fix: Sazerac's Svedka acquisition dated 2024 by ADWEEK and TechCrunch; a Just Jared item says "earlier this year", 2024 stands (two outlets), flagged.
- Generation spend: never published; ComfyUI workflows are self-built infrastructure, not a priced API, no cost math attempted, stated explicitly.
