"""Minimal Markdown -> HTML converter for the guide's chapter files.

Supports the subset used across chapters: ATX headings, paragraphs,
**bold**, *italic*, `code`, fenced code blocks, - and 1. lists (one level),
task lists (- [ ]), [links](url), > blockquotes, --- rules, and | tables|.
Not a general-purpose parser — deterministic for this corpus.
"""
import re
import html


def _inline(text):
    text = html.escape(text)
    text = re.sub(r"`([^`]+?)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\w)\*([^*\n]+?)\*(?!\w)", r"<em>\1</em>", text)
    text = re.sub(r"\[([^\]]+?)\]\(([^)]+?)\)", r'<a href="\2">\1</a>', text)
    return text


def _table_row(cells, header=False):
    tag = "th" if header else "td"
    return "<tr>" + "".join(f"<{tag}>{_inline(c.strip())}</{tag}>" for c in cells) + "</tr>"


def convert(md):
    lines = md.split("\n")
    out = []
    i = 0
    in_code = False
    code_buf = []
    list_stack = []  # "ul" | "ol"

    def close_lists():
        while list_stack:
            out.append(f"</{list_stack.pop()}>")

    def close_code():
        nonlocal in_code
        if in_code:
            out.append("<pre><code>" + html.escape("\n".join(code_buf)) + "</code></pre>")
            code_buf.clear()
            in_code = False

    while i < len(lines):
        line = lines[i]

        if line.strip().startswith("```"):
            if in_code:
                close_code()
            else:
                close_lists()
                in_code = True
            i += 1
            continue
        if in_code:
            code_buf.append(line)
            i += 1
            continue

        stripped = line.strip()

        # Image line: ![alt](src) — optionally followed by a "Photo: ..."
        # caption line, which becomes the figcaption (heritage figures,
        # Foundry round 2; the corpus previously carried no images).
        m = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)$", stripped)
        if m:
            close_lists()
            caption = ""
            if i + 1 < len(lines) and lines[i + 1].strip().startswith("Photo:"):
                caption = lines[i + 1].strip()
                i += 1
            cap = f"<figcaption>{_inline(caption)}</figcaption>" if caption else ""
            out.append(f'<figure class="heritage-fig"><img src="{m.group(2)}" alt="{html.escape(m.group(1))}" loading="lazy">{cap}</figure>')
            i += 1
            continue

        if not stripped:
            close_lists()
            i += 1
            continue
        if re.match(r"^---+$", stripped):
            close_lists()
            out.append("<hr>")
            i += 1
            continue

        m = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if m:
            close_lists()
            level = len(m.group(1))
            text = _inline(m.group(2).strip())
            anchor = re.sub(r"[^a-z0-9]+", "-", m.group(2).lower()).strip("-")
            out.append(f"<h{level} id=\"{anchor}\">{text}</h{level}>")
            i += 1
            continue

        # Table: header row followed by |---| row
        if "|" in stripped and i + 1 < len(lines) and re.match(r"^\|?[\s:|-]+\|?$", lines[i + 1].strip()):
            close_lists()
            cells = [c for c in stripped.strip("|").split("|")]
            out.append("<table><thead>" + _table_row(cells, header=True) + "</thead><tbody>")
            i += 2
            while i < len(lines) and "|" in lines[i].strip():
                cells = [c for c in lines[i].strip().strip("|").split("|")]
                out.append(_table_row(cells))
                i += 1
            out.append("</tbody></table>")
            continue

        if stripped.startswith(">"):
            close_lists()
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip()[1:].strip())
                i += 1
            out.append("<blockquote>" + "".join(f"<p>{_inline(q)}</p>" for q in quote) + "</blockquote>")
            continue

        m = re.match(r"^(\s*)[-*]\s+\[([ xX])\]\s+(.*)$", line)
        if m:
            if not list_stack or list_stack[-1] != "ul":
                close_lists()
                out.append('<ul class="task-list">')
                list_stack.append("ul")
            checked = m.group(2).lower() == "x"
            box = '<input type="checkbox" disabled{} aria-hidden="true"> '.format(" checked" if checked else "")
            out.append(f"<li>{box}{_inline(m.group(3))}</li>")
            i += 1
            continue

        m = re.match(r"^(\s*)[-*]\s+(.*)$", line)
        if m:
            if not list_stack or list_stack[-1] != "ul":
                close_lists()
                out.append("<ul>")
                list_stack.append("ul")
            out.append(f"<li>{_inline(m.group(2))}</li>")
            i += 1
            continue

        m = re.match(r"^(\s*)\d+[.)]\s+(.*)$", line)
        if m:
            if not list_stack or list_stack[-1] != "ol":
                close_lists()
                out.append("<ol>")
                list_stack.append("ol")
            out.append(f"<li>{_inline(m.group(2))}</li>")
            i += 1
            continue

        close_lists()
        # Gather a paragraph (consecutive non-blank, non-special lines)
        para = [stripped]
        i += 1
        while i < len(lines):
            nxt = lines[i]
            ns = nxt.strip()
            if (not ns or ns.startswith(("#", ">", "```")) or re.match(r"^---+$", ns)
                    or re.match(r"^(\s*)[-*]\s+", nxt) or re.match(r"^(\s*)\d+[.)]\s+", nxt)
                    or ("|" in ns and i + 1 < len(lines) and re.match(r"^\|?[\s:|-]+\|?$", lines[i + 1].strip()))):
                break
            para.append(ns)
            i += 1
        out.append(f"<p>{_inline(' '.join(para))}</p>")

    close_code()
    close_lists()
    return "\n".join(out)


def headings(md, max_level=3):
    """Extract [(level, text, anchor)] for the table of contents."""
    found = []
    for line in md.split("\n"):
        m = re.match(r"^(#{1,4})\s+(.*)$", line.strip())
        if m and len(m.group(1)) <= max_level:
            text = re.sub(r"[*`_]", "", m.group(2)).strip()
            anchor = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
            found.append((len(m.group(1)), text, anchor))
    return found
