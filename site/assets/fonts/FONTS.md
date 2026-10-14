# Self-hosted fonts, provenance

All files in this directory are SIL Open Font License (OFL) webfonts,
downloaded 2026-10-12 from the Google Fonts css2 API (latin subset,
woff2) and served locally so the site makes **zero remote font
requests**. Re-download with `/tmp/fetch_fonts.py`-style flow:

```
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Anton&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
```

Keep only the `/* latin */` @font-face blocks.

| file | family | style | weight | notes |
|---|---|---|---|---|
| anton-latin-normal-400.woff2 | Anton | normal | 400 (static) | display face; removed in v2, RESTORED in v3 (rotation 21 identity pass) from the pre-v2 tree; the cutting room's headline voice |
| newsreader-latin-normal-var.woff2 | Newsreader | normal | 200 to 800 variable | prose |
| newsreader-latin-italic-var.woff2 | Newsreader | italic | 200 to 800 variable | prose italics |
| inter-latin-normal-var.woff2 | Inter | normal | 100 to 900 variable | tool UI body |
| jetbrains-mono-latin-var.woff2 | JetBrains Mono | normal | 400 to 800 variable | the timecode voice (rotation 23): timecodes, slate labels, record numbers, metadata. Removed in v2 as decoration; restored 2026-10-14 from the Google Fonts css2 API (latin subset, variable file) with a job, the domain's own notation as design (FINDINGS 5.3) |

Note: Google's css2 API now serves Inter and JetBrains Mono as single
variable files even when discrete weights are requested (all five/six
latin blocks point at the same URL), one file each is all we ship.
