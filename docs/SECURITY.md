# Model bezpieczeństwa

- Tożsamość aplikacji pochodzi wyłącznie z podpisu SIWE i serwerowej sesji D1. Hostowane ograniczenia dostępu są niezależne od konta gry.
- Każdy zapis związany z kontem wymaga sesji i zgodnego Origin. Auth dodatkowo sprawdza skonfigurowany origin, nonce, przeglądarkę, termin i sieć.
- ADMIN/SUPER_ADMIN są rolami konta w bazie. Zmienna bootstrap wskazuje jeden konkretny portfel; nie daje roli bez podpisu. Domyślna rejestracja nadaje USER.
- Postać zapisuje intencje zamiast akceptować ilość Scrap, XP, loot czy pozycję z klienta. Ruch jest ograniczony czasem, kolizją i prędkością; atak przez dystans i cooldown; quest jest jednorazowy.
- D1 stosuje optimistic concurrency i atomowe batch. Zapis ekonomii jest powiązany z rewizją gracza.
- SIWE: domain/URI/chain/address/nonce/issuedAt/expiry/action, 5 minut, atomowe zużycie nonce i cookie wiążące go z przeglądarką. Sesja: HttpOnly Secure SameSite=Lax, 7 dni bez odnowienia, maksymalnie 30 dni od podpisu.
- On-chain LAND jest źródłem własności. Budowa wymaga zgodności latest/safe ownership i powiązanej tożsamości. Transfer NFT nie zmienia istnienia budynków na działce.
- Kontrakty używają OpenZeppelin ERC721, AccessControl, Pausable, ReentrancyGuard i SafeERC20. Marketplace zapamiętuje fee/treasury w momencie listowania i transferVersion aktywa, aby nie odżywały stare oferty po transferze z powrotem.
- Brak adminowej funkcji konfiskaty NFT. NFT musi być zatwierdzone przez sprzedawcę. Payment router mintuje dopiero w atomowo opłaconej transakcji. ERC20 z opłatą od transferu są odrzucane.
- Indexer: idempotencja chain/contract/tx/logIndex, 12 bloków opóźnienia, trwały checkpoint, kontrola hash bloku i odbudowa projekcji po reorg. Wersja D1 uruchamiana na żądanie; PostgreSQL ma osobny proces. Wymaga testów awarii na live RPC przed produkcją.
- Znane ograniczenia: brak niezależnego audytu zewnętrznego, kompleksowego rate limitu na hostowanym API, moderacji czatu, pełnego modelu uprawnień odwiedzin działek, produkcyjnego antycheata i multiplayer combat. Wersja prywatna alpha.
- Prywatne klucze nie trafiają do frontendu ani do repozytorium. `.env.*` w repo to publiczne szablony bez sekretów. Rzeczywiste sekrety używają lokalnego `.env.local` albo secret managera.
