# Authentication Audit

Data: 2026-09-09. Zakres: rejestracja, logowanie, sesje, portfele, uprawnienia i wszystkie API aplikacji Trash Panda United. To audyt kodu połączony z implementacją i testami, nie niezależna certyfikacja bezpieczeństwa ani potwierdzenie gotowości mainnet.

## Current architecture

Jeden backend Cloudflare Worker i D1. `registrations` reprezentuje User, `account_wallets` jeden zweryfikowany portfel, `players` postać. `auth_sessions` przechowuje hash wspólnej sesji. `lib/auth.ts` jest jedynym serwisem auth, `identity(req)` wymaga jego sesji, `adminIdentity(req)` dodatkowo roli z bazy. AuthProvider w głównym layout obsługuje wszystkie ekrany; AuthGate chroni grę, profil, kampanie i panel admina.

Logowanie wymaga podpisu SIWE/EIP-4361. Podłączenie portfela oraz brama prywatnego hostingu nie są uwierzytelnieniem aplikacji. Szczegółowe diagramy: [AUTH_FLOW.md](AUTH_FLOW.md).

## Problems found

Oceny określają ryzyko błędu lub niespójności; nie stwierdzono dowodu wykorzystania podatności ani automatycznego nadawania ADMIN wszystkim poprzednim rejestracjom.

| Severity | Affected files | Problem / security impact | Implemented fix |
|---|---|---|---|
| HIGH | `app/api/wallet/route.ts`, `app/api/account/route.ts`, `lib/server.ts` | Wallet był tylko linkiem do tożsamości platformy, nie metodą utworzenia wspólnej sesji. Niespójny model dostępu między portfelem a grą. | Zastąpione przez `/api/auth/*`, SIWE, trwałą sesję D1 i centralne `requireUser`. |
| HIGH | `lib/admin.ts`, `app/api/admin/route.ts` | Rola opierała się na identyfikatorze/emailu wpisanym w kod i oddzielnej liście, poza modelem konta. | Role w User, sprawdzane przy każdym żądaniu. Brak hardcoded owner/email. Jawny bootstrap konkretnego portfela po podpisie. |
| HIGH | `apps/server/server.mjs`, `compose.yaml`, `packages/database/postgres.sql` | Nieużywany drugi system email/hasło, osobne users i sessions, inna wersja rozgrywki. Ryzyko uruchomienia niespójnego backendu. | Usunięto drugi backend i jego usługę Docker. PostgreSQL pozostał wyłącznie opcjonalnym indexerem. |
| HIGH | `components/tpu/wallet.tsx`, `packages/blockchain/transactions.ts`, `components/tpu/admin-console.tsx` | Provider mógł zmienić konto bez powiązania z sesją aplikacji; Web3 korzystał z globalnego podłączonego adresu. | Jeden adapter providera; odczyt sesji, konta i sieci przed operacjami. Kontrola ponownie przed finalnym wysłaniem. |
| HIGH | `db/schema.ts` | Kilka walletów na userId, brak FK postaci i brak sesji auth. | `account_wallets.address` PK, UNIQUE userId i FK; FK Player; UNIQUE sesji na konto i wallet. Stare adresy nie tworzą nowych kopii konta. |
| HIGH | `components/tpu/game.tsx`, `components/tpu/account-pages.tsx`, nagłówek | Każdy moduł ładował dane osobno; wylogowanie/401 nie usuwało od razu lokalnego stanu gry. | Globalny AuthProvider, AuthGate, inicjalizacja przed chronionym fetch, unmount danych po logout, obsługa 401/403, synchronizacja kart. |
| HIGH | `packages/blockchain/config.ts`, `/api/config` | Ta sama konfiguracja RPC służyła serwerowi i publicznemu API; prywatny klucz dostawcy w URL mógł trafić do przeglądarki. | Oddzielny `publicRegistry`, publiczne URL RPC. Bootstrap admina i prywatne RPC nie są serializowane. |
| MEDIUM | poprzedni wallet challenge | Niestandardowa wiadomość linkująca; brak modelu logowania chronionego przed login-CSRF. | Wiadomość SIWE generowana przez serwer, cookie challenge HttpOnly, hash powiązania z przeglądarką, ścisły Origin/domena. |
| MEDIUM | `components/tpu/wallet.tsx` | Wielokrotne connect dokładało listeners, komponenty rozjeżdżały stan, StrictMode mógł powtarzać efekty. | Rejestracja i usuwanie listenerów w jednym adapterze; blokada równoległych operacji w AuthProvider. |
| MEDIUM | API rejestracji i gry | Rejestracja/utworzenie postaci w kilku krokach; ponawiane create zwracało konflikt także dla własnej istniejącej postaci. | Jedna transakcja User+Wallet+Player+sesja, warunkowe inserty, unikalność DB; idempotentne game create. |
| MEDIUM | `build/sites-vite-plugin.ts`, `vite.config.ts` | Nieużywana możliwość lokalnego podszycia się pod przykładowego użytkownika. | Usunięto mock auth i kod testowego auto-login. Zachowano plugin pakowania Sites. |
| MEDIUM | `/api/auth/*`, `lib/server.ts` | Nie było limitów logowania i limitu strumieniowanego JSON przed parsowaniem. | Limity nonce/verify w D1, 32 KiB na JSON, kontrolowane błędy 400/413/415/429. |
| MEDIUM | konfiguracja chain / sesja | Zmiana sieci mogła pomylić podpisaną tożsamość z kontrolerem kontraktowego portfela na innej sieci. | `networkVerified`; po zmianie konfiguracji nowy podpis i potwierdzenie także poprzedniej sieci dla istniejącego adresu. |
| LOW | dokumentacja, stare komponenty | Nieaktualne instrukcje ChatGPT login, pusty stary Admin, odnośniki do usuniętego API. | Usunięto martwe komponenty/route i odświeżono instrukcje; historia wcześniejszych wersji została oznaczona jako historyczna. |

## Previous login flow

Prywatna tożsamość ChatGPT → rezerwacja nazwy → podłączenie portfela → podpis linkujący → aktywacja rejestracji → osobne pobranie postaci. Dodatkowy, niepodłączony serwer posiadał email/hasło i własne sesje. Samo połączenie portfela nie dawało wcześniej serwerowego dowodu, ale interfejs nie miał jednego źródła stanu konta.

## New login flow

Connect → serwerowy nonce → SIWE signature → weryfikacja kryptograficzna → jednorazowe zużycie → odczyt konta po zweryfikowanym adresie → losowy token sesji w HttpOnly cookie → `/api/auth/me`. Każda część aplikacji korzysta z tej sesji. Nowy podpis unieważnia poprzednią sesję danego konta; nie utrzymujemy niekontrolowanej liczby sesji.

## Registration flow

Nieznany portfel po podpisie otrzymuje krótki dowód, nie dostęp do gry. Formularz zbiera nazwę i zgodę na utworzenie konta/przechowywanie danych gry. Jedna transakcja tworzy User z USER, jeden Wallet, jeden Player i aktywuje sesję. Wartości role/userId/wallet z klienta są odrzucane. Email nie jest wymagany. Brak w projekcie zatwierdzonych regulaminu i polityki prywatności; nie udajemy zgody na dokumenty, których właściciel nie dostarczył.

## Wallet authentication flow

Wiadomość zawiera domenę, URI, scheme, adres, chainId, akcję, losowy nonce 256-bitowy, issuedAt i expirationTime. Backend podpisuje/akceptuje wyłącznie zapisaną przez siebie treść, nie message przesłane weryfikacją. Nonce ma 5 minut, wiązanie z przeglądarką i atomowe DELETE RETURNING po poprawnej weryfikacji. Dwie równoległe poprawne odpowiedzi nie tworzą dwóch sesji. Zły podpis, inny adres, inna przeglądarka, ponowne użycie lub wygaśnięcie są odrzucane.

Viem weryfikuje EOA oraz obsługuje ścieżkę portfeli kontraktowych. Testy EOA są rzeczywiste kryptograficznie; RPC w zestawie testowym jest kontrolowanym adapterem i nie stanowi testu działającego Base Account/ERC-1271/ERC-6492 na sieci.

## Session architecture

Pełna sesja serwerowa, bez JWT. Cookie produkcyjne `__Host-tpu_session`: Secure, HttpOnly, SameSite=Lax, Path=/, bez Domain, Max-Age. W bazie wyłącznie hash SHA-256 tokena 32 losowych bajtów. Czas bez odnowienia 7 dni; bezwzględny limit 30 dni. `/refresh` nie wskrzesza sesji po logout/wygaśnięciu. Token zmienia się przy nowym logowaniu; zwykłe odnowienie serwerowej sesji zachowuje token, dlatego nie ma wyścigu wymiany refresh tokenów między kartami.

Nie da się odtworzyć sesji z localStorage ani nagłówków platformy. `tpu-auth-event` w storage jest wyłącznie losowym sygnałem odświeżenia `/me`. LocalStorage zachowuje niesekretne ustawienia HUD i hash transakcji wypłaty do odzyskania stanu; nie są dowodem logowania.

Lokalne HTTP jest dozwolone tylko dla loopback i wewnętrznego podglądu. Produkcja wymaga HTTPS i skonfigurowanego `AUTH_ORIGIN`. Cookie deweloperskie nie jest odczytywane przy żądaniu HTTPS.

## Database relations

| Tabela | Relacja i ograniczenia |
|---|---|
| registrations | User: user_id PK, username UNIQUE, status, role default USER, consented_at |
| account_wallets | address PK, user_id UNIQUE FK → registrations, chain_id, created_at |
| players | user_id PK FK → registrations, username UNIQUE, state, revision |
| auth_sessions | hash PK, user_id nullable FK → registrations i UNIQUE, wallet UNIQUE; nullable user tylko dla dowodu przed rejestracją |
| auth_nonces | nonce PK, browser_hash, address, message, chain_id, expires_at |
| auth_limits | klucz limitu PK, licznik i termin |
| submissions / allocations | unikalna para campaign/user, odczyt i zapis po sesji; przydział zawiera zamrożony zweryfikowany wallet |
| wallets / nonces | dawna historia; brak aktywnych tras zapisujących. wallets odczytywane tylko przez adapter migracji. |

Dodano wygenerowane migracje 0004 i 0005. W nowej, jeszcze nieopublikowanej migracji 0005 dopasowano PRAGMA do D1 (`defer_foreign_keys`); wcześniejsze migracje pozostają niezmienione. Przed dodaniem FK odczyt istniejącej bazy potwierdził jeden zgodny User/Player. Nie wpisywano kopii danych użytkownika do migracji.

## Landing → Game authentication

AuthProvider startuje w INITIALIZING i pobiera `/me`. AuthGate nie montuje gry przed odpowiedzią pozytywną. Cookie Path=/ obejmuje obie ścieżki. Gra pobiera Player przez userId z sesji, nie z formularza. Postać nowego użytkownika istnieje już po rejestracji.

## Game → Landing authentication

Ten sam cookie i provider. Nawet pełna nawigacja oraz F5 uruchamiają `/me`, a nie kolejne podpisanie. Testy API potwierdzają ciągłość tokena i tego samego userId. Rzeczywisty restart przeglądarki i podpis w rozszerzeniu wymagają osobnego testu urządzeniowego.

## Admin authorization

`adminIdentity(req)` wywołuje ten sam `requireUser(req)`, następnie wymaga ADMIN/SUPER_ADMIN z bazy. Brak loginu admina, hardcoded emaila albo automatycznej promocji pierwszego konta. Zawieszenie konta unieważnia jego sesje; odblokowanie nie przywraca starego cookie. Nie można zawiesić siebie ani SUPER_ADMIN.

Dla obecnego wdrożenia zmienna `AUTH_ADMIN_WALLET` została ustawiona na już zweryfikowany w bazie portfel właściciela. Rola będzie zapisana dopiero po jego poprawnym podpisie. Po tym kroku należy usunąć bootstrap z konfiguracji. Zmienna jest świadomą polityką inicjalizacji administratora, nie sekretem i nie tożsamością przesłaną przez frontend.

## Backend authorization: przegląd wszystkich tras

| Endpoint | Kontrola |
|---|---|
| GET auth/me | Odczyt własnej sesji; anonimowy wynik nie ujawnia innych kont |
| POST auth/nonce | Origin, produkcyjna domena, chain, adres, limity, wiązanie cookie |
| POST auth/wallet | Origin, zapisany nonce, podpis, browser hash, termin i sieć |
| POST auth/register | Ważny dowód portfela, zgoda, ścisły schemat, atomowa transakcja |
| POST auth/refresh, logout | Origin i własny cookie; brak wyboru userId |
| GET/POST game | requireUser; postęp odczytywany po sesji, serwerowe reguły i revision |
| GET profile | requireUser; portfel, postać i historia wyłącznie tego userId |
| GET/POST campaigns | requireUser; własne submissions/allocations, jednorazowe nagrody |
| GET/POST admin | requireUser + rola DB; brak awansu z requestu |
| GET/POST build | Sesja + zweryfikowany wallet + zgodne latest/safe ownership działki |
| POST travel | Sesja + potwierdzone on-chain ownership i przypisany wallet |
| POST sync | Sesja i Origin; synchronizacja istniejącej projekcji, bez przyjęcia adresu właściciela od klienta |
| GET community | Publiczne wiadomości świata, bez prywatnego userId |
| POST community | Sesja, Origin, nazwa z własnego Player, limit długości i odstępu |
| GET content | Tylko opublikowana treść i aktywne komunikaty; brak draftów |
| GET config | Tylko publiczna konfiguracja sieci/kontraktów, bez prywatnych URL RPC |
| GET land, metadata/land/:id | Publiczna własność on-chain i metadane; brak prywatnej sesji/progresu |

IDOR: parametry userId w URL nie wybierają właściciela danych. Gra jawnie odrzuca userId/walletAddress/role w payload. Pozostałe schematy działań prywatnych są ścisłe lub wyciągają wyłącznie konkretną, niesłużącą autoryzacji wartość. Airdrop korzysta z przypisanego portfela, a przekazany portfel administratora musi odpowiadać sesji i weryfikacji w bazie. Poświadczenie wypłaty wymaga zgodności odbiorcy, kwoty, nadawcy, chain i potwierdzeń.

## Security protections

- CSRF: dokładny Origin, brak wildcard CORS, credentials same-origin i SameSite cookie. Nonce dodatkowo związany z przeglądarką.
- Replay: krótki nonce, zapisane message i atomiczne single-use.
- Session fixation: nowy serwerowo losowany token po podpisie; klient nie może wskazać tokena.
- Kradzież tokena przez JavaScript: HttpOnly i brak sekretów auth w storage. HttpOnly nie zapobiega wszystkim skutkom XSS; kod w originie nadal może wykonywać działania użytkownika.
- Privilege escalation: default USER, ścisła rejestracja, role tylko serwer/baza.
- Wyścigi: UNIQUE i batch, conditional inserts, cleanup providera, blokada działań UI, kontrola generacji odpowiedzi auth.
- Zmiana wallet/chain: blokada Web3 i ponowny odczyt tuż przed transakcją.
- Nadużycia: limity nonce i verify, ograniczenie JSON przed parsowaniem; ochrona DDoS na brzegu nadal jest zadaniem operacyjnym.
- Zależności: użyto istniejącego viem/SIWE; dodano SDK WalletConnect i Playwright do testów. Nie tworzono własnego algorytmu podpisu.

## Tests added

`npm run auth:test` uruchamia testy serwisu/API, regresje administracji i adaptera portfela. Obejmują prawdziwe ECDSA, zły podpis, spoofing, replay, expiry SIWE/nonce, wiązanie domeny/przeglądarki, CSRF, cookie/hash, renewal/absolute expiry, logout/inna karta, 5 równoległych rejestracji, role, ban, IDOR, migrację istniejącego gracza, relacje DB, rate limiting, zmianę sieci i kontrolę poufnych konfiguracji.

Adapter EIP-1193 ma testy cleanup listenerów, zmiany konta/sieci, braku zdarzenia providera, odmowy podpisu i braku sesji mimo połączenia portfela.

`tests/e2e/auth.spec.ts`: rejestracja → gra → landing/F5; wejście bezpośrednio z gry, druga karta i logout/login; odnowienie sesji i admin 403; odmowa podpisu/zmiana sieci. Konfiguracja desktop + mobile. To przygotowany zestaw, **nie deklaracja wykonania**.

## Tests executed

- Automatyczne API/auth/wallet: wyniki końcowe zapisane poniżej po uruchomieniu.
- Reguły gry: 34/34 PASS; ruch, kolizje, walka, questy, dailies, wnętrza, dungeon, loot i migracja miasta.
- TypeScript i production build: końcowa weryfikacja poniżej.
- Przeglądarka: landing, link do gry, loading i ekran blokady bez sesji, terminal wallet, powrót na stronę i rejestracja bez formularza przed podpisem. Po zmianie konfiguracji podgląd wymagał restartu; ponowny odczyt ekranów był poprawny.
- Nie wykonano faktycznego podpisu w rozszerzeniu: przeglądarka testowa nie miała wstrzykniętego providera EVM. Nie użyto obejścia auth, cudzych kluczy ani kont testowych w produkcji.
- Nie wykonano przygotowanego Playwright E2E ani testu restartu prawdziwej przeglądarki z sesją, MetaMask mobile, Base Account czy WalletConnect QR. Integracyjne testy API nie zastępują tych sprawdzeń.

## Remaining risks

1. **Bramka przed publicznym uruchomieniem/mainnet:** rzeczywiste E2E podpisu i transakcji na docelowym originie, test cookie po restarcie iOS/Android, MetaMask, Base Account i portfeli kontraktowych. Tego etapu nie można rzetelnie uznać za wykonany bez portfela i urządzeń.
2. **WalletConnect:** SDK i obsługa QR są w kodzie, ale brakuje `WALLETCONNECT_PROJECT_ID` Reown i allowlisty domen. Opcja jest ukryta do czasu konfiguracji; nie jest obecnie uruchomioną metodą logowania.
3. **Bootstrap administratora:** pierwszy podpis właściciela ma utworzyć trwałą rolę; potem usunąć zmienną bootstrap. Nie zostawiać jej przy odebraniu tej roli.
4. **Zgody:** potrzebne zatwierdzone Terms/Privacy oraz polityka retencji i usuwania danych przed publiczną rejestracją. Obecnie przechowywana jest zgoda na utworzenie konta i zapis danych gry, nie fikcyjna akceptacja nieistniejących dokumentów.
5. **Operacje:** skonfigurować monitoring, backup/restore D1, limity/bramkę antybot na publicznym ruchu, alarmy błędnych logowań. Rejestracja jest podpisem wallet, nie dowodem jednej osoby; Sybil resistance kampanii wymaga osobnej polityki.
6. **Dziedzictwo:** dodatkowe dawne portfele i konta bez wcześniejszej weryfikacji wymagają odzyskiwania pod kontrolą operatora. Nie scalać ich automatycznie po emailu. Stare tabele pozostają historią migracji, nie drugim auth.
7. **Sesje:** kradzież działającego cookie poza przeglądarką nadal daje dostęp do czasu odwołania/wygaśnięcia. Model jednej sesji oznacza wylogowanie poprzedniego urządzenia po nowym podpisie.
8. **Blockchain:** kontrakty nie mają wdrożenia i pełnego E2E Base; wypłaty pozostają ograniczone do test ETH Base Sepolia. Zmiana auth nie jest zgodą na uruchomienie realnych wypłat ani mainnet.
9. **XSS i zależności:** React domyślnie escapuje treść; pełna polityka CSP dostosowana do Vinext/wallet iframe i zewnętrzny przegląd zależności nadal powinny być częścią bramki produkcyjnej.

## Production checklist

- [x] Jeden backend auth i trwały User ID.
- [x] Jeden aktywny wallet z UNIQUE i FK, jedna postać na konto.
- [x] Prawdziwe podpisy SIWE, nonce single-use, expiry i browser binding.
- [x] Cookie Secure/HttpOnly/Path=/, server-side session i globalny logout.
- [x] Role z bazy, domyślny USER, backendowe zabezpieczenia admin/game/campaigns.
- [x] Prywatne RPC/konfiguracja admina poza publicznym API.
- [x] Usunięty drugi backend i mock auto-login.
- [x] Migracje i testy regresji w repozytorium.
- [ ] Wykonany cały przygotowany Playwright E2E.
- [ ] Rzeczywisty test MetaMask, Base Account, mobile oraz restartu sesji.
- [ ] Project ID i allowlista WalletConnect, test QR.
- [ ] Pierwszy podpis administratora i usunięcie bootstrap.
- [ ] Terms/Privacy, polityka danych i publiczna konfiguracja dostępu.
- [ ] Backup/restore, monitoring, limity publiczne i testy awarii RPC.
- [ ] Niezależny audyt przed realnymi nagrodami/mainnet.

## Final audit conclusion

Kod strony, gry, profilu, kampanii i panelu admina korzysta z jednego systemu kont i sesji. Zachowano tożsamość istniejącego gracza. Nie oznacza to zakończenia wszystkich bramek produkcyjnych: brak rzeczywistych testów portfeli i konfiguracji WalletConnect jest jawnie odnotowany. Publicznego mainnet nie należy uruchamiać na podstawie samego tego raportu.

## References

SIWE i walidacja zostały oparte o [viem createSiweMessage](https://viem.sh/docs/siwe/utilities/createSiweMessage) oraz implementację `verifySiweMessage` z zainstalowanego viem 2.x. Sposób migracji FK sprawdzono w [dokumentacji Cloudflare D1](https://developers.cloudflare.com/d1/sql-api/foreign-keys/).

### Odnowienie bez wyścigu cookie

Cookie sesji ma termin bezwzględny do 30 dni, ale backend odrzuca je już po 7 dniach bez odnowienia. Odnowienie zmienia wyłącznie termin w D1; nie wysyła ponownie Set-Cookie. Dzięki temu opóźniona odpowiedź refresh nie może nadpisać cookie po wylogowaniu lub podpisie innego konta. Termin absolutny liczy się od podpisu, również jeśli wybór nazwy zajął kilka minut.

## Końcowy zapis walidacji

- `npm run auth:test`: **35/35 PASS** (w tym migracja wypełnionej bazy i kontrola FK).
- `npm run game:test`: **34/34 PASS**.
- `npm run typecheck`: **PASS**, również dla przygotowanych plików Playwright.
- Production build Vinext/Worker: **PASS**; wszystkie sześć tras `/api/auth/*` obecne, stare `/api/account` i `/api/wallet` usunięte.
- `git diff --check`: **PASS**.
- Pełny E2E podpisu, restartu sesji i rzeczywistych urządzeń: **NIEWYKONANY**, zgodnie z ograniczeniami powyżej.
