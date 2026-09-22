# Website readability review — 2026-09-22

Reviewed all App Router page entry points and their rendered components/CSS. This is a source/style review, not a claim of authenticated production browser testing. Browser preview could not run in this environment; production build, TypeScript and CI are the automated checks. Live visual review at 100% browser zoom is still required, particularly for long user-generated content and narrow screens.

| Route | Findings and changes |
| --- | --- |
| `/` (home) | Small labels and muted descriptions; scoped landing text sizing, higher contrast, readable footer and advertisement label. Preserve artwork and hero typography. |
| `/campaigns` | Dedicated width/gutters and larger card typography from PR25 retained; shared forms/focus improvements apply. |
| `/leaderboard` | Small table labels, oversized condensed section title and dense rules; 16px table text, clearer header/current-user row, 14px metadata, readable card headings, separated rules paragraphs, keyboard-focusable horizontal table region. Stacked summary cards on mobile. |
| `/program` | Shared readable card headings and copy, 14px explanatory notes, larger controls and fixed page gutters. |
| `/land` | Shared form/description contrast and sizes, wrapping page heading; grid children can shrink without forcing page overflow. |
| `/marketplace` | Uses the land component; same improvements plus readable card headings. |
| `/decorations` | Shared NFT card headings, descriptions, notices and action sizes. |
| `/profile` | Larger history table typography and local horizontal scrolling; definition-list wrapping for long values. |
| `/community` | Chat text 16px, names/times 14px, clearer aside, wrapping mobile composer. |
| `/register` | Readable onboarding steps, 48px inputs/buttons and wider account card. Same treatment for auth gate states. |
| `/admin` | Explicit text palette, readable tab controls, tables and metadata, fixed page gutters and wrapping rows. |
| `/support` | Larger message dates, attachment labels and metadata; existing single-column mobile thread retained. |
| `/privacy` | Uses admin-console/profile-card wrappers; paragraph spacing, brighter body text and sans-serif section headings. |
| `/litepaper` | Separate CSS module reviewed; larger contents, footnotes, captions, blocks and table text; fixed gutters. Print styles preserved. |
| `/game` | Canvas and in-game HUD deliberately excluded from the website reading layer. Auth gate still gains readable text. No changes to gameplay or camera scale. |
| `/parcel/[id]` | Redirects to `/game?parcel=…`; no independent reading layout. |

Navigation now uses 14px labels and switches to the existing menu earlier instead of shrinking links to 10px. Keyboard focus outlines are visible. Accent/status colors remain distinct from body copy. Changes are scoped to website containers, not global `p`/`button` selectors that would resize the game HUD.

New core normal-text pairs were checked mathematically against 4.5:1 contrast: copy/metadata on card surfaces, labels on table headers, lime rewards on rule cards, placeholders on inputs. This is not a blanket WCAG certification of every element or image background.

Before release visual sign-off: check desktop (1440px), mobile (390px and 320px), browser zoom 200%, long names/wallets, signed-out states and expanded admin/support forms. Tables should scroll inside their wrapper instead of shrinking text. No database migration or realtime redeployment is needed for this change.
