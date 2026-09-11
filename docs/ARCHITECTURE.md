# Architektura

`app/` i `components/tpu/`: frontend i hostowane API Worker.
`packages/game-core/`: wspólne czyste reguły, regiony, NPC, kolizje i seed parcel.
`db/`, `drizzle/`: hostowany schemat D1, wygenerowane migracje.
`packages/blockchain/`: centralny ContractRegistry, client RPC z fallback, ABI, transakcje i indexer D1.
`packages/contracts/`: Solidity, kompilacja solc, testy Hardhat EDR, deployment i read-only weryfikacja.
`apps/indexer/`: adapter D1 i samodzielny indexer PostgreSQL.
`lib/auth.ts`, `app/api/auth/`, `components/tpu/auth-provider.tsx`: jedyny system logowania SIWE i sesji D1.
`packages/database/`: wyłącznie schemat opcjonalnego indexera PostgreSQL.
`deployments/`: oddzielne manifesty Base Sepolia / mainnet, puste dopóki nie ma prawdziwego deploymentu.

Framework hostingu wymaga Worker i D1; PostgreSQL nie jest udawany w hostowanej wersji. Pełne przełączenie na własny serwer wymaga podpięcia wszystkich tras i frontendu do samodzielnego API. Npm zachowuje lockfile startera; nie dodano drugiego menedżera pakietów ani niezgodnej warstwy pnpm.

Budynki są rekordami związanymi wyłącznie z ID parceli. Nie mają niezależnego NFT ownera. Działki w world.ts mają rzeczywiste współrzędne gry. Ekran budowy modyfikuje rekordy działki po sprawdzeniu chain ownership. Wygląd budynków renderuje canvas poprzez oryginalne arkusze sprite.
