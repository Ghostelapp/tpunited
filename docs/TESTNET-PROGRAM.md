# Testnet program operations

## What ships

- `/program`: public season introduction, live published season status/rules, links into gameplay and reviewed social campaigns, and a free account-bound Founder interest list.
- Admin → Testnet program: idempotent preparation of a 42-day draft season and three original-content quest drafts, plus aggregated Founder interest counts.
- Interest can be changed or withdrawn. It creates no points, allocation, payment or reservation. Existing paid marketplace functionality is separate and unchanged.
- Templates cover original gameplay, a beginner guide, and a boss strategy. Public posts must disclose rewarded participation. Admin review checks originality, usefulness and a working public proof link.

## Launch procedure

1. In Testnet program, select PREPARE SEASON & QUEST DRAFTS.
2. In Leaderboard, review the Founding Scavengers draft. Proposed minimum: 500 points over seven scoring days. Daily caps: quests 60, exploration 30, dungeon 75, social 40. The existing fixed social award is 20 season points per approved submission, regardless of a campaign's separate community-point value.
3. Confirm a realistic 42-day operating window. Start and lock the season through the existing control. An existing active season must be frozen first; preparation never stops it automatically.
4. Reload admin. In Social & airdrops, edit each draft's dates to match the launched season and publish the quests. A delayed launch requires updated campaign dates.
5. Review submissions regularly while the season is open. Reject with a specific reason; users may resubmit rejected proof. Existing approval logic awards points to the active season at approval time, not submission time. Close submissions early enough to complete reviews before season end.
6. Review suspected manipulation and appeals before freezing. Never infer misconduct solely from a shared IP or household. Existing exclusions and audit records remain available.
7. Freeze the final leaderboard and export the snapshot only after review. Percentages are indicative shares under the existing formula, not a promise of a funded mainnet payout.

## Founder offer: decisions before taking payment

Define delivered cosmetic/title benefits, supply, price/currency/network, launch and delivery dates, cancellation/refund treatment, testnet reset treatment, mainnet entitlement migration, and what happens if mainnet is delayed or cancelled. Review the actual offer and token-distribution structure with qualified counsel. Publish the terms before opening a separate paid offer. The interest list is not an email-marketing opt-in or a purchase reservation.

## Remaining work

- Qualified referrals: immutable referrer attribution, distinct active accounts, tutorial/completion checks, several different gameplay days, limits and reversal/audit handling. No referral points are currently offered.
- Founder checkout and onchain entitlement contracts: not introduced by this release.
- Mainnet token allocation, funding, contract audit and distribution: not introduced.
- Acquisition analytics: retention cohorts, qualified referral conversion and attributable sales require further instrumentation. Current interest counts are exact account counts, not purchases.

Start with a small recruited testing cohort and weekly original-content tasks. Review return visits and useful gameplay feedback before scaling sales or paid acquisition.

## Update: referrals and Founder term management

The earlier remaining-work list is superseded for referrals and offer authoring:

- New users can attach an invitation at wallet-verified registration. Existing users cannot add or replace a referrer. Signed-in inviters generate stable share links on `/program`.
- Referral rewards require 72 hours since signup, the completed starter quest and positive gameplay points on three different UTC days in the active season. Social/referral points do not satisfy those gameplay days. Both accounts need active registration and distinct wallets, with neither excluded from the season.
- Admin → Testnet program → Referral review approves, rejects or revokes a referral with a note. Approval is authoritative, idempotent, capped at five rewarded referrals per season and the season's daily referral cap. Revocation removes the awarded score while results remain unfrozen. A reviewer must still assess manipulation; separate wallets alone do not prove different humans.
- Referral scoring is opt-in per season. Existing active/frozen season rules are unchanged. New drafts default to 30 points per referral and 60/day. To enable a previously prepared draft, edit and save it in Leaderboard before starting. Do not change active-season rules.
- START SEASON & LAUNCH THREE QUESTS aligns program quest dates to the season in one database batch. This control is available for a prepared draft; it cannot replace an active season or restart a frozen one.
- Founder editor supports draft, public informational announcement and withdrawal, with revision checks. Announcement requires complete benefits, supply, price/currency/network, delivery, migration, cancellation and airdrop terms, plus administrator review confirmation. It still does not collect money. Saving edits withdraws the old announcement until re-announced.
- Dashboard metrics include active accounts, starter quest completions, interest-list accounts, attributed signups, approved referrals and this program season's three-day gameplay scorers. These are not sales or conventional D7 retention measurements.

### Still needed before paid sales / mainnet rewards

The owner must define the actual commercial offer and mainnet reward policy. Checkout contracts, payment reconciliation, delivery of purchased Founder entitlements and funded mainnet distribution are not activated by these information and referral features. Do not represent an interest-list entry, announced terms or testnet leaderboard percentage as a purchase or guaranteed future payment.
