/* Hook-title generator — builds captions from the observed formula
   [Episode N] + [one-line emotional stake] + [CTA].
   Grounded in craft/episodic-shortform.md. No storage; copy-to-clipboard only. */
(function () {
  "use strict";

  var EMOJI_FOR = [
    { test: /daddy|father|mom|mother|dada|mama|parents/i, emoji: "💔" },
    { test: /wait|waiting|still|years/i, emoji: "🕯️" },
    { test: /alone|lost|left behind/i, emoji: "😔" },
    { test: /door|wall|room|hallway|behind/i, emoji: "🚪" },
    { test: /secret|hidden|nobody knows|didn't tell/i, emoji: "🤫" },
    { test: /reunion|found|home|returned/i, emoji: "🥹" },
    { test: /surprise|twist|shocked|didn't expect/i, emoji: "😳" }
  ];
  var FALLBACK_EMOJI = "🥺";

  var CTAS = {
    tomorrow: function (n) { return "part " + (n + 1) + " tomorrow ⏳"; },
    funnel: function () { return "more inDrama ↓"; },
    thesis: function () { return "some doors only open from the other side"; },
    poll: function () { return "vote in the comments — the winning choice plays out tomorrow 🗳️"; }
  };
  var CTA_LABEL = {
    tomorrow: "Next-part tease",
    funnel: "Funnel tease (longer cut elsewhere)",
    thesis: "Finale thesis line",
    poll: "Interactive — vote CTA (TikTok comment poll)"
  };

  function pickEmoji(stake) {
    for (var i = 0; i < EMOJI_FOR.length; i++) {
      if (EMOJI_FOR[i].test.test(stake)) return EMOJI_FOR[i].emoji;
    }
    return FALLBACK_EMOJI;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Stake hygiene (wave 38): users paste full captions. Strip a leading
     "Episode N —" prefix, collapse whitespace, drop trailing punctuation —
     so the formula never emits "Episode 3 — Episode 3 — …". */
  function sanitizeStake(s) {
    return String(s == null ? "" : s)
      .replace(/^\s*episode\s*\d+\s*[—–-]\s*/i, "")
      .replace(/\s+/g, " ")
      .replace(/[.!?…]+\s*$/, "")
      .trim();
  }

  /* Six worked variants of the observed formula, each a different hook framing. */
  function variants(n, stake, emoji, cta, hashtag) {
    var tag = hashtag ? " #" + hashtag.replace(/^#/, "") : " #aiminidrama";
    var base = "Episode " + n + " — ";
    return [
      {
        title: "Direct stake (the observed form)",
        text: base + cap(stake) + " " + emoji + "\n" + tag + " #aianimation #fyp #emotionalstory\n" + cta,
        why: "The observed formula, verbatim: number + stake + CTA. Zero ambiguity — the viewer knows the series, the stake, and what to do next in one read."
      },
      {
        title: "Question hook",
        text: base + "What happens when " + uncap(stake) + "? " + emoji + "\n" + tag + " #aianimation #fyp #emotionalstory\n" + cta,
        why: "Converts the stake into an unanswered question — the same open-loop trick the episode itself ends on. Curiosity gap does the clicking."
      },
      {
        title: "Mid-action freeze",
        text: base + "She was already " + uncap(stake) + " when the camera found her " + emoji + "\n" + tag + " #aianimation #fyp #emotionalstory\n" + cta,
        why: "Implies footage already exists of a dramatic moment — the viewer feels they walked in late. Works when the hook visual is already strong."
      },
      {
        title: "Identity + ritual",
        text: base + "Every night she " + uncap(stake) + ". Tonight was different " + emoji + "\n" + tag + " #aianimation #fyp #emotionalstory\n" + cta,
        why: "Establishes a recurring ritual (act-1 fuel for the arc) and breaks it in the same sentence. Ritual-then-rupture is the mini-drama engine."
      },
      {
        title: "Address the viewer",
        text: base + "POV: you're watching " + uncap(stake) + " " + emoji + "\n" + tag + " #aianimation #fyp #emotionalstory\n" + cta,
        why: "Second-person framing makes the viewer a witness, not a scroller. Use sparingly — once per series arc, or it becomes the house style and loses force."
      },
      {
        title: "Vote hook (the interactive read)",
        text: base + cap(stake) + " — you decide what happens next " + emoji + "\n" + tag + " #aianimation #fyp #emotionalstory\n" + CTAS.poll(n),
        why: "Hands the decision to the viewer — the interactive-format read (TikTok comment polls since Sept 2026; DRAMAGO's interactive slate). This variant always carries the vote CTA, whatever is selected above: the poll is the point. Only for interactive episodes — a vote CTA on a linear episode breaks the participation contract."
      }
    ];
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function uncap(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  /* The stake may already start with the character name — never double it. */
  function nameFirst(name, stake) {
    return !!name && new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(stake);
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    done(ok);
  }

  var els = {
    num: document.getElementById("hg-num"),
    stake: document.getElementById("hg-stake"),
    character: document.getElementById("hg-character"),
    cta: document.getElementById("hg-cta"),
    hashtag: document.getElementById("hg-hashtag"),
    gen: document.getElementById("hg-generate"),
    results: document.getElementById("hg-results"),
    empty: document.getElementById("hg-empty"),
    status: document.getElementById("hg-status")
  };
  if (!els.gen) return;

  function setStatus(text, isErr) {
    els.status.hidden = false;
    els.status.textContent = text;
    els.status.className = "calc-note" + (isErr ? " td-error" : "");
  }

  function generate() {
    var n = parseInt(els.num.value, 10);
    var stake = sanitizeStake(els.stake.value);
    var character = els.character.value.trim();
    var ctaKey = els.cta.value;
    var hashtag = els.hashtag.value.trim();

    if (!n || n < 1) { setStatus("Episode number is required — serialization is the follow mechanic.", true); els.num.focus(); return; }
    if (!stake) { setStatus("Give one line of emotional stake — legible in two seconds to a stranger.", true); els.stake.focus(); return; }
    if (character && !nameFirst(character, stake)) stake = character + " " + uncap(stake);

    var emoji = pickEmoji(stake);
    var cta = CTAS[ctaKey](n);
    var list = variants(n, stake, emoji, cta, hashtag);
    var words = stake.split(/\s+/).filter(Boolean).length;

    els.results.innerHTML = "";
    list.forEach(function (v, i) {
      var card = document.createElement("article");
      card.className = "card hg-card";
      var h3 = document.createElement("h3");
      h3.id = "hg-v" + i + "-t";
      h3.innerHTML = '<span class="hg-num" aria-hidden="true">' + (i + 1) + "</span> " + esc(v.title);
      card.appendChild(h3);
      var pre = document.createElement("pre");
      pre.className = "hg-caption";
      pre.id = "hg-v" + i + "-c";
      pre.textContent = v.text;
      card.appendChild(pre);
      var why = document.createElement("p");
      why.className = "hg-why";
      why.innerHTML = '<strong>Why this hooks:</strong> ' + esc(v.why);
      card.appendChild(why);
      var row = document.createElement("div");
      row.className = "btn-row";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost btn-sm";
      btn.textContent = "Copy caption";
      btn.setAttribute("aria-describedby", h3.id + " " + pre.id);
      btn.addEventListener("click", function () {
        copyText(v.text, function (ok) {
          btn.textContent = ok ? "Copied ✓" : "Copy failed";
          setTimeout(function () { btn.textContent = "Copy caption"; }, 1600);
        });
      });
      row.appendChild(btn);
      card.appendChild(row);
      els.results.appendChild(card);
    });
    els.empty.hidden = true;
    var lengthNote = words > 14
      ? " Stake is " + words + " words — the observed hook reads in ~2 seconds; trim toward ~10."
      : "";
    setStatus("6 variants from the formula — " + CTA_LABEL[ctaKey] + ". Never lead with hashtags; the character is named every time." + lengthNote, false);
    var first = els.results.querySelector("h3");
    if (first) first.setAttribute("tabindex", "-1");
  }

  els.gen.addEventListener("click", generate);
  [els.num, els.stake, els.character, els.hashtag].forEach(function (el) {
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); generate(); }
    });
  });
})();
