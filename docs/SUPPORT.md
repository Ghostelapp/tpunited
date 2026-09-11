# Bug reports and player support

## Player workflow

1. Select SUPPORT in the website header, or HELP / REPORT BUG in the game header or pause menu. The game link opens a separate tab so the current game view stays available.
2. Sign in with your registered wallet. Tickets are linked to this account; there is no anonymous or email-based submission channel in this release.
3. Select NEW TICKET and choose Bug report or Support request.
4. Choose gameplay, account, wallet, NFT, website or other; enter a descriptive subject and explain the problem.
5. For bugs, include steps to reproduce, expected behavior and actual behavior.
6. Optionally include browser, page, viewport size and language. This checkbox starts unchecked. No automatic wallet contents, cookies, local storage, private keys or full game saves are attached.
7. Submit the ticket. A ticket number confirms it was saved. The limit is one new ticket per 30 seconds and ten new tickets per day.
8. Add screenshots after submission: PNG, JPEG or WebP, up to 2 MB each, at most ten per ticket. Attachments are visible only to the ticket owner and support staff. Do not include secrets in text or screenshots.
9. Read replies and respond in the ticket. Lists and open conversations refresh every 15 seconds. No email, push or external messaging notification is sent.
10. Reopen a resolved or closed ticket if the issue persists. Closing a ticket does not delete its history.

## Administrator workflow

Open Admin → Support & bugs. This view requires the persisted ADMIN or SUPER_ADMIN role.

- Filter by status, request type or subject/ticket number. Lists are paginated, 50 tickets per page.
- Read the original report, optional diagnostic details and private screenshots.
- Set priority: low, normal, high or critical.
- Set status: open, in progress, waiting for player, resolved or closed.
- Assign a ticket to yourself, keep its existing assignment or unassign it.
- Send a public reply. This changes the status to waiting for player. A player reply changes it back to open.
- Check Internal note to write a staff-only note. Notes do not change the ticket's status and are excluded from player API responses.
- Screenshot attachments are always shared with the player; the internal-note switch does not make screenshots staff-only.
- Mark the ticket resolved when the issue is fixed. Both the owner and staff can reopen it.
- Staff actions are recorded in the existing audit log.

Threads load the latest 100 messages initially. LOAD OLDER MESSAGES retrieves earlier pages. Concurrent edits use ticket revisions; a stale update fails instead of overwriting another operator's work. The user interface keeps the unsent reply after an error.

## Storage and security

`support_tickets`, `support_messages` and `support_files` are stored in D1. Screenshot bytes use the existing BUCKET binding under the private `support/` prefix. Unlike NFT artwork, support files are not served through a public image route. Every download checks the signed-in user's ticket access and uses private, non-cacheable responses.

The server enforces ownership, administrator roles, CSRF checks, input limits, atomic ticket creation limits and reply revisions. Screenshot formats are checked from their byte signatures. Uploaded HTML and SVG are not accepted as screenshots. Message text is rendered as text rather than executable HTML.

No email service, agent bot, external help desk, automatic refund, automatic token transfer or guaranteed response-time promise is configured. A player unable to sign in cannot use this account-based inbox; an independent account-recovery contact channel remains a separate integration requiring an actual operator-controlled address/service.

## English product language

All new player and administrator labels, statuses, validation messages and this guide are written in English. Remaining Polish HUD labels were translated to Move HUD, Done, Minimap, Boss health and Notification area. Player-written messages, ticket content and administrator-written announcements remain in the language chosen by their authors.

## Verification

Run `node --test scripts/support.test.mjs` for authentication, private-ticket access, concurrent throttling, status flow, notes, revision conflicts, screenshot authorization and CSRF. Run `npm run typecheck` and `npm run build` before publishing code changes. Applied migrations must not be edited; append new migrations for subsequent schema changes.
