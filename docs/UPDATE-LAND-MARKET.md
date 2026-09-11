# LAND marketplace follow-up

Continuation after the Homestead/tutorial 0013 and navigation updates.

## Changes
- A synchronous guard blocks duplicate clicks before wallet simulation starts. The review remains open while the transaction is running.
- A completed action cannot be submitted again from the same review.
- A submitted transaction whose confirmation fails or times out keeps its explorer link and is not presented as safe to retry. Inspect its on-chain outcome before opening a new review.
- ERC-20 approval confirmation still permits the separate purchase action.
- After confirmation, and on explicit REFRESH NETWORK, the property request bypasses the ten-second server cache. Ownership and offers are read again from the existing contracts.
- Filtered listing counts and empty states reflect MY LAND and ETH sorting. Price comparison uses bigint without converting wei differences to Number.
- Failed configuration requests produce an error, and market actions require configured deployed contracts.

## Validation
- TypeScript and production build.
- 18 local EVM contract scenarios, including A-to-B LAND purchase, exact fee/proceeds, ERC-20 allowance, cancellation, duplicate purchase, stale transfer versions, replacement offers, revoked NFT approval and frozen fee/treasury terms.
- No new Solidity source, contract deployment or schema migration.
- No browser/wallet E2E or live Base Sepolia transaction was performed. This is not a security audit.

## Remaining live verification
Use two test wallets on Base Sepolia: A approves and lists owned LAND; B purchases; verify explorer receipt, A/B balances, new owner, access to building tools and revoked previous-owner permissions. Also test seller cancellation, rejected signature and refreshing after pending confirmation. Run on the external Cloudflare deployment after deploying this source update.
