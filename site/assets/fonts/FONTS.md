# Self-hosted fonts, provenance (v6, rotation 130)

All files are SIL Open Font License 1.1 webfonts, self-hosted, zero remote font requests.
Source: the Fontsource npm packages (`@fontsource-variable/archivo`, `@fontsource-variable/newsreader`),
which repackage the official Google Fonts releases. The OFL text ships in each package's LICENSE file;
keep a copy beside the fonts when you commit them.
Subset to Latin plus the punctuation, arrows and symbols the site uses; axes trimmed with fontTools.

| file | family | axes | used for |
|---|---|---|---|
| archivo-var.woff2 | Archivo (Omnibus-Type) | wght 400 to 800, wdth 70 to 112 | titles, headings, interface |
| newsreader-text.woff2 | Newsreader (Production Type) | wght 400 to 700 | long reading text |
| newsreader-text-italic.woff2 | Newsreader italic | wght 400 to 600 | emphasis inside reading text |
| geist-mono-latin.woff2 | Geist Mono | wght 400 to 700 | reel numbers, credit lines |
| jetbrains-mono-latin-var.woff2 | JetBrains Mono | wght 400 to 800 | timecodes, code |

Removed in v6: Anton, Bodoni Moda (roman and italic), Geist, Inter, the full Newsreader files.
