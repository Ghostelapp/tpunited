# Litepaper v0.1

The public English litepaper is available at `/litepaper` with a downloadable eight-page PDF at `/docs/trash-panda-united-litepaper-v0.1.pdf`. The landing footer links to it.

Editorial source: `content/litepaper.json`. The web page reads this source directly. Implemented alpha features are distinguished from planned features; the document does not establish tokenomics or a guaranteed airdrop.

To regenerate the PDF on Linux, install Python `reportlab` and the DejaVu Sans fonts, then run `python scripts/build-litepaper.py` from the project root. The builder uses the existing embedded PNG artwork from the equipment SVG files. Render all pages and review layout after editing copy; fixed page layouts require manual spacing adjustments for longer text.

Validation for this edition: eight PDF pages rendered and visually inspected; text bounds and key sections checked. No full application build or browser test was run in the authoring environment. No database migration or contract transaction is required.
