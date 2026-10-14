/* Episode Forge, a serialized mini-drama episode planner built from the
   guide's own craft data. The arc is the one the craft chapters teach:
   the judged-short template (craft/story-structure.md: cold open,
   escalation, reversal, button) folded into the mini-drama genre anatomy
   (craft/episodic-shortform.md: hook line in the first 3 seconds, 3 to 5
   beats serving one emotion, a dedicated shot for the emotional turn,
   a cliffhanger that is never the resolution).
   Every beat is matched against the REAL prompt-template library
   (data/v1/prompt-templates.json + prompts-facets.json) by a
   deterministic score over the templates' own facets and use lines.
   A beat no template clears the bar for is reported as uncovered, the Forge never invents a template. Teardown lessons attach through
   the facets' own teardown links. */
(function () {
  "use strict";

  /* The 8-beat arc. Facet wants are vocab values from prompts-facets.json;
     useKeys are matched against each template's own `use` + `anatomy`. */
  var ARC = [
    { id: "hook", act: "Act 1, Cold open", name: "The hook",
      craft: "Hook line in the first 3 seconds; caption and opening shot say the same thing (genre anatomy, Episodic Short-Form).",
      shotTypes: ["establishing", "wide"], movements: ["dolly-out-pull-back", "crane-up-crane-down"],
      moods: ["expansive", "majestic", "tense"], useKeys: ["opening", "hook"] },
    { id: "stake", act: "Act 1, Cold open", name: "The stake",
      craft: "One want, visible on screen: the protagonist wants something concrete (Story Structure, the short-film engine).",
      shotTypes: ["two-shot", "medium"], movements: ["static-locked-off"],
      moods: ["conversational", "intimate", "grounded"], useKeys: ["conversation", "dialogue"] },
    { id: "escalation", act: "Act 2, Escalation", name: "Escalation",
      craft: "The want meets the obstacle; each shot raises the stakes or deepens the world (Story Structure, the judged-short template).",
      shotTypes: ["tracking", "wide"], movements: ["tracking-shot", "dolly-in-push-in"],
      moods: ["kinetic", "tense", "dramatic"], useKeys: ["chases", "action", "montage"] },
    { id: "turn", act: "Act 2, Escalation", name: "The turn",
      craft: "One turn, the moment everything changes; a dedicated shot for the emotional turn (Story Structure; gate G4, Episodic Short-Form).",
      shotTypes: ["close-up", "medium"], movements: ["dolly-in-push-in"],
      moods: ["dramatic", "intimate", "somber"], useKeys: ["emotional"] },
    { id: "complication", act: "Act 2, Escalation", name: "The complication",
      craft: "The plan fails or the truth lands, pressure builds before the reversal (Story Structure, the judged-short template).",
      shotTypes: ["close-up", "two-shot"], movements: ["static-locked-off", "handheld"],
      moods: ["unsettling", "tense", "somber"], useKeys: ["horror", "suspense", "dialogue"] },
    { id: "reversal", act: "Act 3, Reversal & button", name: "The reversal",
      craft: "The reversal: the choice gets made. Most AI-film losers are tech demos with no second act, this is the second act (Story Structure).",
      shotTypes: ["close-up", "tracking"], movements: ["tracking-shot", "orbit-arc-shot"],
      moods: ["dramatic", "kinetic", "triumphant"], useKeys: ["emotional", "action", "transformation"] },
    { id: "button", act: "Act 3, Reversal & button", name: "The button",
      craft: "One final image that reframes everything before it. End on the image, not on explanation (Story Structure, the judged-short template).",
      shotTypes: ["wide", "establishing"], movements: ["static-locked-off", "dolly-out-pull-back"],
      moods: ["dreamlike", "somber", "expansive"], useKeys: ["transition", "transformation"] },
    { id: "cliffhanger", act: "Act 3, Reversal & button", name: "The cliffhanger",
      craft: "Ends mid-beat or on an unanswered question, never the resolution. The resolution is what Episode N+1 is (genre anatomy, Episodic Short-Form).",
      shotTypes: ["close-up", "medium"], movements: ["static-locked-off"],
      moods: ["tense", "unsettling", "dramatic"], useKeys: ["reaction", "listening", "emotional"] }
  ];

  /* One emotion per episode (genre anatomy). Each maps to mood weights in
     the facets vocabulary, a nudge on top of the beat's own wants. */
  var EMOTION_MOODS = {
    longing: ["dreamlike", "nostalgic", "intimate"],
    dread: ["unsettling", "tense", "somber"],
    grief: ["somber", "intimate", "nostalgic"],
    relief: ["warm", "dreamlike", "grounded"],
    triumph: ["kinetic", "dramatic", "expansive"],
    suspense: ["tense", "unsettling", "dramatic"],
    comfort: ["warm", "intimate", "grounded"],
    heartbreak: ["somber", "dramatic", "intimate"],
    defiance: ["dramatic", "kinetic", "grounded"],
    tenderness: ["intimate", "warm", "dreamlike"],
    guilt: ["somber", "unsettling", "intimate"],
    joy: ["playful", "warm", "expansive"]
  };

  var MIN_SCORE = 3; /* below this the library does not cover the beat */

  function scoreTemplate(beat, tpl, facet, emotionMoods) {
    if (!facet) return 0;
    var s = 0;
    if (beat.shotTypes.indexOf(facet.shot_type) >= 0) s += 3;
    if (beat.movements.indexOf(facet.movement) >= 0) s += 2;
    if (beat.moods.indexOf(facet.mood) >= 0) s += 2;
    if (emotionMoods && emotionMoods.indexOf(facet.mood) >= 0) s += 1;
    var hay = ((tpl.use || "") + " " + (tpl.anatomy || "")).toLowerCase();
    var hits = 0;
    beat.useKeys.forEach(function (k) { if (hay.indexOf(k) >= 0) hits++; });
    s += Math.min(hits, 2);
    return s;
  }

  /* Deterministic plan: beats in arc order, each takes its best-scoring
     unused template; ties break by template id so the plan is stable. */
  function buildPlan(input, data) {
    var templates = data.templates || [];
    var facets = data.facets || {};
    var teardowns = data.teardowns || {};
    var emotionMoods = EMOTION_MOODS[input.emotion] || [];
    var used = {};
    var beats = ARC.map(function (beat) {
      var best = null, bestScore = -1;
      templates.forEach(function (tpl) {
        if (used[tpl.id]) return;
        var sc = scoreTemplate(beat, tpl, facets[tpl.id], emotionMoods);
        if (sc > bestScore || (sc === bestScore && best && tpl.id < best.id)) {
          best = tpl; bestScore = sc;
        }
      });
      if (!best || bestScore < MIN_SCORE) {
        return { beat: beat, covered: false, score: Math.max(bestScore, 0), template: null, teardown: null };
      }
      used[best.id] = true;
      var facet = facets[best.id] || {};
      var td = null;
      (facet.teardowns || []).forEach(function (tid) {
        if (!td && teardowns[tid]) td = teardowns[tid];
      });
      return { beat: beat, covered: true, score: bestScore, template: best, teardown: td };
    });
    return {
      title: input.title || "", premise: input.premise || "",
      format: input.format || "minidrama", emotion: input.emotion || "longing",
      episode: input.episode || 1, beats: beats,
      coveredCount: beats.filter(function (b) { return b.covered; }).length
    };
  }

  function planToMarkdown(plan, formatLabels) {
    var lines = [];
    lines.push("# Episode " + plan.episode + ", forged plan");
    if (plan.title) lines.push("Series: " + plan.title);
    lines.push("Format: " + ((formatLabels || {})[plan.format] || plan.format) +
      " · One emotion: " + plan.emotion);
    if (plan.premise) lines.push("Premise: " + plan.premise);
    lines.push("");
    lines.push("Arc: the judged-short template (cold open → escalation → reversal → button) " +
      "folded into the mini-drama genre anatomy, hook in the first 3 seconds, one emotion, " +
      "cliffhanger never the resolution. Templates are the guide's own library records; " +
      "nothing here is invented.");
    var act = "";
    plan.beats.forEach(function (b, i) {
      if (b.beat.act !== act) { act = b.beat.act; lines.push(""); lines.push("## " + act); }
      lines.push("");
      lines.push("### Beat " + (i + 1) + ", " + b.beat.name);
      lines.push("Craft: " + b.beat.craft);
      if (!b.covered) {
        lines.push("Template: NONE, the guide's library has no template that covers this beat. " +
          "Write this beat by hand or take it to the prompt workshop; the Forge does not invent one.");
        return;
      }
      var t = b.template;
      lines.push("Template: " + t.title + " (" + t.id + "), " + (t.use || ""));
      lines.push("Anatomy: " + (t.anatomy || ""));
      if (t.models && t.models.length) lines.push("Shortlisted models: " + t.models.join(", "));
      lines.push("Prompt: " + t.prompt);
      if (b.teardown) {
        lines.push("Field lesson (" + b.teardown.title + "): " + b.teardown.lesson);
      }
    });
    lines.push("");
    lines.push("## Before it ships, the episode gates");
    lines.push("- G2 Script: hook line in line 1; one emotion; ends mid-beat, never a resolution.");
    lines.push("- G4 Keyframes: dedicated shots for the emotional turn and the cliffhanger.");
    lines.push("- Golden rule: picture is cut TO the locked dialogue track, never the reverse.");
    lines.push("");
    lines.push("Forged from the AI Film Master Guide's own data: prompt-templates.json (" +
      "47 templates), prompts-facets.json, teardowns.json. Verify model facts live before spending.");
    return lines.join("\n");
  }

  var ForgeEngine = { ARC: ARC, EMOTION_MOODS: EMOTION_MOODS, MIN_SCORE: MIN_SCORE,
    scoreTemplate: scoreTemplate, buildPlan: buildPlan, planToMarkdown: planToMarkdown };

  if (typeof module !== "undefined" && module.exports) module.exports = ForgeEngine;
  if (typeof window !== "undefined") window.ForgeEngine = ForgeEngine;

  /* ---------------- page wiring ---------------- */
  if (typeof document === "undefined") return;
  var island = document.getElementById("fg-data");
  if (!island) return;
  var DATA;
  try { DATA = JSON.parse(island.textContent); } catch (e) { return; }

  var FORMAT_LABELS = { minidrama: "Mini-drama", pov: "POV series", daylife: "Day-in-the-life",
    revenge: "Revenge arc", interactive: "Interactive" };
  var els = {
    title: document.getElementById("fg-title"),
    premise: document.getElementById("fg-premise"),
    format: document.getElementById("fg-format"),
    emotion: document.getElementById("fg-emotion"),
    episode: document.getElementById("fg-episode"),
    forge: document.getElementById("fg-forge"),
    stage: document.getElementById("fg-stage"),
    summary: document.getElementById("fg-summary"),
    copy: document.getElementById("fg-copy"),
    download: document.getElementById("fg-download"),
    msg: document.getElementById("fg-msg")
  };
  if (!els.stage) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function currentInput() {
    return {
      title: els.title ? els.title.value.trim() : "",
      premise: els.premise ? els.premise.value.trim() : "",
      format: els.format ? els.format.value : "minidrama",
      emotion: els.emotion ? els.emotion.value : "longing",
      episode: Math.max(1, parseInt(els.episode && els.episode.value, 10) || 1)
    };
  }
  var lastPlan = null;
  function render() {
    var plan = ForgeEngine.buildPlan(currentInput(), DATA);
    lastPlan = plan;
    if (els.summary) {
      els.summary.textContent = "Episode " + plan.episode + " · " +
        (FORMAT_LABELS[plan.format] || plan.format) + " · one emotion: " + plan.emotion +
        " · " + plan.coveredCount + " of " + plan.beats.length +
        " beats covered by the library" +
        (plan.coveredCount < plan.beats.length
          ? ", the rest are named as uncovered below; the Forge invents nothing." : ".");
    }
    var act = "";
    var html = "";
    plan.beats.forEach(function (b, i) {
      if (b.beat.act !== act) {
        act = b.beat.act;
        html += '<h3 class="fg-act">' + esc(act) + "</h3>";
      }
      html += '<article class="fg-beat"><div class="fg-beat-head">' +
        '<span class="fg-num">' + (i + 1) + "</span><h4>" + esc(b.beat.name) + "</h4>" +
        (b.covered
          ? '<span class="fg-tag">' + esc(b.template.id) + " · match " + b.score + "</span>"
          : '<span class="fg-tag fg-tag-none">no library template</span>') +
        "</div><p class=\"fg-craft\">" + esc(b.beat.craft) + "</p>";
      if (!b.covered) {
        html += '<p class="fg-none">The guide\'s library has no template that covers this beat. ' +
          "Write it by hand or take it to the <a href=\"workshop.html\">prompt workshop</a>, " +
          "the Forge does not invent one.</p>";
      } else {
        var t = b.template;
        html += '<p class="fg-tpl"><strong>' + esc(t.title) + "</strong>, " + esc(t.use || "") + "</p>" +
          '<p class="fg-anatomy">' + esc(t.anatomy || "") + "</p>" +
          '<pre class="fg-prompt">' + esc(t.prompt) + "</pre>";
        if (t.models && t.models.length) {
          html += '<p class="fg-models">Shortlisted models: ' + esc(t.models.join(", ")) + "</p>";
        }
        if (b.teardown) {
          html += '<p class="fg-lesson"><strong>Field lesson, ' + esc(b.teardown.title) +
            ":</strong> " + esc(b.teardown.lesson) + ' <a href="teardown.html">Teardowns</a></p>';
        }
      }
      html += "</article>";
    });
    els.stage.innerHTML = html;
  }
  if (els.forge) els.forge.addEventListener("click", render);
  ["change", "input"].forEach(function (ev) {
    [els.format, els.emotion, els.episode].forEach(function (el) {
      if (el) el.addEventListener(ev, render);
    });
  });
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "absolute"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta); done(ok);
  }
  if (els.copy) els.copy.addEventListener("click", function () {
    if (!lastPlan) render();
    copyText(ForgeEngine.planToMarkdown(lastPlan, FORMAT_LABELS), function (ok) {
      els.msg.hidden = false;
      els.msg.textContent = ok ? "Episode plan copied, markdown, ready to paste into your production notes."
        : "Copy failed, use Download plan instead.";
    });
  });
  if (els.download) els.download.addEventListener("click", function () {
    if (!lastPlan) render();
    var blob = new Blob([ForgeEngine.planToMarkdown(lastPlan, FORMAT_LABELS)], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "episode-" + lastPlan.episode + "-forged-plan.md";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
  render();
})();
