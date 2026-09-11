# Trash Panda United — instrukcja uruchomienia od zera

Ten poradnik zakłada, że nie masz doświadczenia z serwerami. Wykonuj kroki po kolei i nie wklejaj nigdzie klucza prywatnego ani frazy odzyskiwania portfela.

## 1. Zalecana architektura

Projekt składa się z dwóch niezależnych części:

1. **Aplikacja gry** — landing page, gra, rejestracja, panel administracyjny, leaderboard, czat, support i NFT. Najlepiej uruchomić ją na **Cloudflare Workers**.
2. **Usługi dodatkowe na VPS** — PostgreSQL, indexer blockchain, zadania cykliczne, monitoring i kopie zapasowe.

Główne dane gry są zapisywane w **Cloudflare D1**, a przesłane grafiki i załączniki w **Cloudflare R2**. PostgreSQL na VPS-ie nie zastępuje D1. Służy przede wszystkim indexerowi blockchain.

Aktualna wersja gry działa już pod adresem:

https://trash-panda-united.patryk-solo440728.chatgpt.site

Jeśli chcesz tylko korzystać z obecnej strony, nie musisz kupować VPS-a. VPS będzie potrzebny, gdy uruchomisz kontrakty, indexer i automatyzacje działające przez całą dobę.

## 2. Czego potrzebujesz

- komputer z Windows 10 lub 11;
- dostęp do kompletnej paczki projektu;
- konto Cloudflare;
- portfel kompatybilny z siecią Base, np. MetaMask lub Coinbase Wallet;
- niewielką ilość testowego ETH na Base Sepolia do testów kontraktów;
- opcjonalnie domenę internetową;
- opcjonalnie VPS: 4 vCPU, 8 GB RAM, co najmniej 75 GB NVMe, Ubuntu 24.04 LTS.

Na komputerze zainstaluj:

- Node.js 22 LTS, minimum 22.13;
- Git;
- Visual Studio Code;
- Docker Desktop, jeśli chcesz lokalnie uruchamiać PostgreSQL.

Po instalacji uruchom PowerShell i sprawdź:

```powershell
node --version
npm --version
git --version
docker --version
```

Każde polecenie powinno wyświetlić numer wersji.

## 3. Rozpakowanie i instalacja projektu lokalnie

1. Rozpakuj ZIP do prostego katalogu, np. `C:\projekty\trash-panda-united`.
2. W VS Code wybierz **File → Open Folder** i otwórz ten katalog.
3. Sprawdź, czy bezpośrednio w otwartym katalogu znajduje się `package.json`.
4. Wybierz **Terminal → New Terminal**.
5. Zainstaluj pakiety:

```powershell
npm ci
```

Nie zamykaj terminala. Pierwsza instalacja może potrwać kilka minut.

## 4. Lokalna baza danych gry — Cloudflare D1

W głównym katalogu projektu utwórz plik `wrangler.local.json`:

```json
{
  "name": "trash-panda-local",
  "compatibility_date": "2026-09-10",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "site-creator-d1",
      "database_id": "00000000-0000-4000-8000-000000000000",
      "migrations_dir": "./drizzle"
    }
  ]
}
```

To jest wyłącznie lokalny identyfikator. Nie używaj go dla produkcyjnej bazy.

Następnie utwórz plik `.dev.vars`:

```dotenv
BLOCKCHAIN_NETWORK=base-sepolia
BASE_RPC_URL=https://sepolia.base.org
AUTH_ORIGIN=http://localhost:5173
AUTH_ADMIN_WALLET=0xTWOJ_PUBLICZNY_ADRES
TOKEN_ENABLED=false
```

Zamień `0xTWOJ_PUBLICZNY_ADRES` na publiczny adres portfela. Nigdy nie umieszczaj tutaj seed phrase ani klucza prywatnego.

Utwórz tabele lokalnej bazy:

```powershell
npx wrangler d1 migrations apply DB --local --config wrangler.local.json --persist-to .wrangler/state
```

Gdy pojawi się pytanie o potwierdzenie, wpisz `y` i naciśnij Enter.

Uruchom aplikację:

```powershell
npm run dev
```

Otwórz w przeglądarce:

http://localhost:5173

Lokalne dane są przechowywane w katalogu `.wrangler/state`. Usunięcie tego katalogu wyczyści lokalne konta i postęp.

## 5. Pierwsza rejestracja administratora

1. Przed rejestracją upewnij się, że `AUTH_ADMIN_WALLET` zawiera właściwy adres.
2. Otwórz stronę rejestracji.
3. Podłącz ten sam portfel.
4. Podpisz komunikat logowania. Zwykłe logowanie nie powinno wysyłać transakcji ani pobierać opłaty gas.
5. Załóż konto.
6. Otwórz `/admin` i sprawdź dostęp.

Jeżeli konto zostało założone przed ustawieniem adresu administratora, sama późniejsza zmiana zmiennej może nie nadać mu roli administratora. Najbezpieczniej ustawić adres przed pierwszą rejestracją.

## 6. Produkcyjne uruchomienie gry na Cloudflare

Ten rozdział jest potrzebny, jeżeli chcesz wdrożyć projekt na własne konto Cloudflare. Aktualna strona opublikowana przez ChatGPT Sites nie wymaga ponownego wykonywania tych kroków.

Zaloguj Wrangler do Cloudflare:

```powershell
npx wrangler login
```

Utwórz produkcyjną bazę D1:

```powershell
npx wrangler d1 create trash-panda-db
```

Zapisz otrzymany `database_id`.

Utwórz bucket R2:

```powershell
npx wrangler r2 bucket create trash-panda-files
```

Binding bazy w konfiguracji musi nazywać się dokładnie `DB`, a binding R2 dokładnie `BUCKET`, ponieważ takich nazw używa kod.

Zbuduj aplikację:

```powershell
npm run typecheck
npm run build
```

Po kompilacji zachowaj pełną zawartość wygenerowanego `dist/server/wrangler.json`. Uzupełnij w nim:

- prawdziwy `database_id` dla D1;
- `database_name`: `trash-panda-db`;
- `migrations_dir`: `../../drizzle`;
- bucket R2 `trash-panda-files`;
- bindingi `DB` i `BUCKET`;
- `AUTH_ORIGIN` odpowiadający dokładnemu publicznemu adresowi strony;
- `AUTH_ADMIN_WALLET` z publicznym adresem administratora.

Nie zastępuj całego wygenerowanego pliku krótkim przykładem — zawiera również ustawienia kodu serwera i plików statycznych.

Zastosuj migracje na zdalnej bazie:

```powershell
npx wrangler d1 migrations apply DB --remote --config dist/server/wrangler.json
```

Opublikuj aplikację:

```powershell
npx wrangler deploy --config dist/server/wrangler.json
```

Po wdrożeniu sprawdź, czy `AUTH_ORIGIN` jest identyczny z końcowym adresem HTTPS, bez ukośnika na końcu. Ponowne `npm run build` może odtworzyć konfigurację w `dist`, dlatego przed kolejnym wdrożeniem ponownie sprawdź identyfikatory D1 i R2.

## 7. Zakup i utworzenie VPS-a

Zalecany startowy VPS:

- Ubuntu 24.04 LTS;
- 4 vCPU;
- 8 GB RAM;
- 75–100 GB NVMe;
- region europejski;
- automatyczne kopie zapasowe.

Po zakupie otrzymasz adres IP oraz sposób pierwszego logowania. W panelu dostawcy dodaj wcześniej własny klucz SSH, jeśli jest taka możliwość. Logowanie hasłem roota jest mniej bezpieczne.

Na Windows otwórz PowerShell:

```powershell
ssh root@ADRES_IP_SERWERA
```

Przy pierwszym połączeniu wpisz `yes`. Następnie podaj hasło, jeśli serwer go wymaga.

## 8. Podstawowe zabezpieczenie VPS-a

Zaktualizuj system:

```bash
apt update
apt upgrade -y
```

Utwórz zwykłego użytkownika:

```bash
adduser trashpanda
usermod -aG sudo trashpanda
```

Włącz firewall:

```bash
ufw allow OpenSSH
ufw enable
ufw status
```

Na tym VPS-ie nie trzeba otwierać portu PostgreSQL `5432` publicznie. Baza ma być dostępna tylko dla kontenerów na serwerze.

Zainstaluj zabezpieczenie logowania:

```bash
apt install -y fail2ban
systemctl enable --now fail2ban
```

Nie wyłączaj logowania roota ani uwierzytelniania hasłem, dopóki nie sprawdzisz w drugim oknie terminala, że możesz zalogować się nowym użytkownikiem i kluczem SSH.

## 9. Instalacja Dockera na VPS-ie

Zaloguj się jako `trashpanda`, a następnie zainstaluj Docker z oficjalnego repozytorium zgodnie z bieżącą instrukcją Docker dla Ubuntu. Po instalacji sprawdź:

```bash
docker --version
docker compose version
```

Dodaj użytkownika do grupy Docker:

```bash
sudo usermod -aG docker trashpanda
```

Wyloguj się:

```bash
exit
```

Zaloguj się ponownie, żeby nowe uprawnienia zaczęły działać.

## 10. Wgranie projektu na VPS

Najprostsza metoda dla początkującego to WinSCP:

1. Zainstaluj WinSCP.
2. Utwórz połączenie SFTP z adresem VPS-a.
3. Zaloguj się jako `trashpanda`.
4. Utwórz katalog `/home/trashpanda/apps/trash-panda-united`.
5. Wgraj rozpakowane pliki projektu bez `node_modules`, `dist`, `.wrangler` i lokalnych sekretów.

W terminalu VPS-a przejdź do projektu:

```bash
cd /home/trashpanda/apps/trash-panda-united
```

Sprawdź obecność plików:

```bash
ls -la
```

Powinieneś widzieć między innymi `package.json`, `compose.yaml`, `apps`, `packages` i `drizzle`.

## 11. PostgreSQL dla indexera blockchain

Plik `compose.yaml` projektu zawiera PostgreSQL. Przed uruchomieniem zmień przykładowe hasło na długie, losowe hasło. Nie używaj hasła `local-development-only` na serwerze produkcyjnym.

Uruchom sam PostgreSQL:

```bash
docker compose up -d postgres
```

Sprawdź kontenery:

```bash
docker compose ps
```

Sprawdź logi:

```bash
docker compose logs --tail=100 postgres
```

Status powinien być `running` lub `healthy`. PostgreSQL przechowuje dane na wolumenie Dockera. Samo usunięcie kontenera nie musi usuwać danych, ale polecenie `docker compose down -v` usuwa wolumeny — nie wykonuj go na produkcji bez kopii zapasowej.

## 12. Konfiguracja indexera

Indexer ma sens dopiero po wdrożeniu kontraktów i uzyskaniu ich adresów. Przygotuj plik `.env.testnet` na VPS-ie:

```dotenv
BLOCKCHAIN_NETWORK=base-sepolia
BASE_RPC_URL=https://sepolia.base.org
DATABASE_URL=postgresql://trashpanda:TWOJE_MOCNE_HASLO@postgres:5432/trashpanda
LAND_CONTRACT=0xADRES_KONTRAKTU_LAND
NFT_CONTRACT=0xADRES_KONTRAKTU_NFT
MARKETPLACE_CONTRACT=0xADRES_MARKETPLACE
PAYMENT_ROUTER=0xADRES_PAYMENT_ROUTER
DEPLOYMENT_BLOCK=NUMER_BLOKU_WDROZENIA
```

Nie zgaduj adresów kontraktów ani numeru bloku. Skopiuj je z potwierdzonego wdrożenia. Publiczny RPC Base może mieć limity; produkcyjnie warto użyć własnego klucza od dostawcy RPC i zachować go jako sekret.

Jeśli `compose.yaml` udostępnia profil `blockchain`, uruchom indexer:

```bash
docker compose --profile blockchain up -d
```

Sprawdź jego logi:

```bash
docker compose --profile blockchain logs -f --tail=100 indexer
```

Wyjście z podglądu logów: `Ctrl+C`. Nie zatrzymuje to kontenera.

Jeżeli kontrakty nie są jeszcze wdrożone, pozostaw indexer wyłączony. Landing page, gra, konta, D1, czat, support i panel administracyjny mogą działać bez niego.

## 13. Domena

Najprostszy wariant:

1. Dodaj domenę do Cloudflare.
2. Ustaw serwery DNS domeny zgodnie z instrukcją Cloudflare.
3. Dodaj własną domenę do wdrożonego Workera/Site.
4. Poczekaj na aktywację certyfikatu SSL.
5. Zmień `AUTH_ORIGIN` na dokładny adres domeny, np. `https://game.twojadomena.com`.
6. Wdróż aplikację ponownie.

Nie kieruj domeny gry na IP VPS-a, jeżeli frontend i backend pozostają na Cloudflare. VPS może otrzymać osobną subdomenę tylko wtedy, gdy rzeczywiście wystawisz na nim publiczne API.

## 14. Kopie zapasowe

### PostgreSQL na VPS-ie

Utwórz katalog:

```bash
mkdir -p /home/trashpanda/backups/postgres
```

Ręczna kopia:

```bash
docker compose exec -T postgres pg_dump -U trashpanda trashpanda > /home/trashpanda/backups/postgres/trashpanda.sql
```

Skopiuj backup poza VPS, np. do zaszyfrowanego Storage Box lub innego magazynu. Backup znajdujący się wyłącznie na tym samym serwerze nie chroni przed awarią VPS-a.

### Cloudflare D1

Regularnie eksportuj bazę z właściwą konfiguracją produkcyjną:

```powershell
npx wrangler d1 export DB --remote --config dist/server/wrangler.json --output backup-d1.sql
```

### R2

Grafiki NFT i załączniki przechowuj również poza jednym bucketem. Ustal retencję i kontroluj rozmiar danych.

## 15. Aktualizowanie projektu

Przed aktualizacją:

1. zrób backup D1, R2 i PostgreSQL;
2. sprawdź pliki migracji w `drizzle`;
3. przetestuj aktualizację lokalnie;
4. wykonaj `npm run typecheck` i `npm run build`;
5. zastosuj migracje;
6. dopiero potem opublikuj nową wersję;
7. sprawdź rejestrację, logowanie, zapis postępu, panel admina, NFT, czat i support.

Na VPS-ie po wgraniu zmian:

```bash
cd /home/trashpanda/apps/trash-panda-united
docker compose --profile blockchain up -d --build
docker compose --profile blockchain ps
```

## 16. Diagnostyka najczęstszych problemów

### `npm` nie jest rozpoznawany

Node.js nie został zainstalowany albo terminal nie został ponownie uruchomiony.

### Strona lokalna nie otwiera się

Sprawdź, czy terminal z `npm run dev` nadal działa i czy otwierasz `http://localhost:5173`.

### Błąd `DB binding missing`

Brakuje bindingu D1 o nazwie `DB` albo aplikacja została uruchomiona nieprawidłową komendą.

### Rejestracja odrzuca podpis

Sprawdź zgodność `AUTH_ORIGIN`, adres strony, sieć portfela i zegar systemowy. Nie podpisuj nieznanych komunikatów.

### Brak panelu administratora

Sprawdź, czy konto zostało zarejestrowane portfelem wskazanym przez `AUTH_ADMIN_WALLET`.

### NFT nie pojawia się w grze

Sprawdź kolejno: status `published`, właściwy kontrakt i sieć, własność tokenu przez zarejestrowany portfel, wymagany poziom oraz import do schowka gracza. Dodanie szablonu assetu nie oznacza automatycznego mintowania NFT.

### Indexer nie działa

Sprawdź:

```bash
docker compose --profile blockchain ps
docker compose --profile blockchain logs --tail=200 indexer
docker compose logs --tail=100 postgres
```

Najczęstsze przyczyny to błędny RPC, niewdrożone kontrakty, zły numer bloku, nieprawidłowe hasło PostgreSQL lub niedopasowana sieć.

## 17. Kolejność bezpiecznego startu produkcyjnego

1. Uruchom grę lokalnie.
2. Sprawdź rejestrację i konto administratora.
3. Opublikuj aplikację z D1 i R2.
4. Podepnij domenę i popraw `AUTH_ORIGIN`.
5. Zrób testowe konta, ale nie używaj głównego portfela z dużymi środkami.
6. Wdróż kontrakty na Base Sepolia.
7. Utwórz NFT testowe i sprawdź metadane.
8. Uruchom PostgreSQL i indexer na VPS-ie.
9. Włącz backupy i monitoring.
10. Dopiero po audycie kontraktów rozważ Base Mainnet oraz prawdziwy airdrop.

## 18. Ważne zasady bezpieczeństwa

- Nie zapisuj klucza prywatnego w repozytorium, czacie, panelu administracyjnym ani publicznym `.env`.
- Do wdrażania kontraktów użyj osobnego portfela technicznego z ograniczonymi środkami.
- Nie uruchamiaj airdropa na mainnecie bez testów, limitów, logów i ręcznego zatrzymania.
- Nie wystawiaj PostgreSQL na publiczny internet.
- Włącz uwierzytelnianie dwuskładnikowe w Cloudflare, hostingu, repozytorium i poczcie.
- Sprawdzaj backup przez próbne odtworzenie, nie tylko przez istnienie pliku.
- Przed mainnetem zleć niezależny audyt smart kontraktów i mechanizmu wypłat.

## Oficjalna dokumentacja

- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Cloudflare R2: https://developers.cloudflare.com/r2/
- Wrangler: https://developers.cloudflare.com/workers/wrangler/
- Docker na Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Base: https://docs.base.org/
- OVHcloud VPS: https://www.ovhcloud.com/en/vps/

