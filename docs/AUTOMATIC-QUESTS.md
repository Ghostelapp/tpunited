# Automatyczne questy społecznościowe i Web3

## Obsługa

Gracz otwiera `/campaigns`, łączy konto Discord przez przycisk zadania i korzysta z portfela przypisanego podczas logowania. Przycisk **CHECK ALL MISSIONS** sprawdza do czterech zadań. Strona ponawia sprawdzanie co minutę, gdy jest widoczna. Wynik, wymagania, sieć i ukończone zadania są widoczne na kartach. Filtry wyróżniają zadania automatyczne i Web3.

Worker multiplayer ma cron co minutę: sprawdza do 20 najdawniej sprawdzanych par gracz–zadanie, po cztery równolegle. Działa również po zamknięciu strony. Przy większej liczbie graczy pełny obieg trwa dłużej niż minutę. Zadania ukończone i nieaktywni gracze nie trafiają do kolejki. Błąd dostawcy nie przyznaje punktów; zadanie będzie sprawdzane ponownie. Na daną parę obowiązuje 60 sekund przerwy pomiędzy kontrolami.

Administrator w `/admin` tworzy kampanię **social**, wybiera sposób weryfikacji, wypełnia pokazane pola, ustawia punkty oraz daty, zapisuje szkic i uruchamia kampanię. Uruchomione wymagania są zamrożone; zmienione zasady wymagają nowej kampanii. Nie trzeba pisać SQL ani kodu dla kolejnego zadania.

## Dostępne wymagania

| Typ | Warunek i ustawienia |
| --- | --- |
| Tutorial | Nagroda tutoriala odebrana po stronie serwera |
| Game level | Wymagany poziom na podstawie XP zapisanych gracza |
| Game kills | Wymagana liczba zabójstw w zapisanym stanie gry |
| Dungeon clear | Bieżący zapis lochu ma `cleared=true`; sprawdzanie nie odtwarza historii wcześniejszych przebiegów |
| Story quest | Zapisany quest fabularny ma stan `complete` |
| Discord member | Użytkownik jest członkiem wskazanego serwera i ukończył screening |
| Discord role | Członkostwo oraz wskazana rola na serwerze |
| Verified wallet | Konto ma uwierzytelniony portfel przypisany do wybranej sieci |
| Native balance | Co najmniej wskazana ilość ETH |
| ERC-20 balance | Adres kontraktu i ilość w pełnych jednostkach tokena, np. `1.5` |
| ERC-721 balance | Adres kolekcji i całkowita liczba posiadanych NFT |
| ERC-1155 balance | Adres kontraktu, ID przedmiotu i całkowita liczba sztuk |
| Manual proof | Link/opis oceniany przez moderatora |

Web3 obsługuje Base (8453) i Base Sepolia (84532). Kontrola wykorzystuje portfel zapisany na koncie dla danej sieci, a nie adres podany przez przeglądarkę przy sprawdzaniu zadania. Gdy konto ma kilka portfeli w tej samej sieci, używany jest najwcześniej przypisany. Salda pochodzą z bloku `finalized`, więc najnowsza transakcja może nie zostać od razu uwzględniona. To potwierdzenie posiadania w momencie kontroli, nie dowód mintowania ani zakaz późniejszego transferu. Zweryfikowana nagroda pozostaje przyznana po zmianie salda/roli. Kontrole nie wysyłają transakcji, nie żądają zgód na wydawanie tokenów ani klucza prywatnego.

Punkty społecznościowe są naliczane raz na gracza i kampanię. Osobne punkty sezonowe podlegają istniejącym limitom sezonu. Nie są to automatyczne wypłaty tokenów. Istniejące wypłaty test ETH nadal wymagają podpisu administratora. X/Instagram i ocena jakości treści nie są weryfikowane przez samo kliknięcie: należy użyć zadania manualnego. Ten moduł nie zawiera integracji z API X ani oceny przez AI.

## Jednorazowa konfiguracja Discorda

1. W [Discord Developer Portal](https://discord.com/developers/applications) utwórz aplikację i bota. Dodaj bota do serwera kampanii. Nie nadawaj mu uprawnień administratora; weryfikacja odczytuje konkretnego członka przez endpoint Get Guild Member i nie zarządza rolami.
2. W OAuth2 dodaj dokładne Redirect URLs:
   - `https://tpunited.xyz/api/social/discord/callback`
   - `https://game.tpunited.xyz/api/social/discord/callback`
3. Po buildzie i przygotowaniu konfiguracji ustaw sekrety poniższymi poleceniami. Wartości wklejaj wyłącznie do ukrytego monitu Wrangler. Nie zapisuj ich w repozytorium ani wiadomościach.
4. W Discordzie włącz Developer Mode, skopiuj ID serwera i opcjonalnie ID roli, a następnie wpisz je w formularzu kampanii. Konto testowe powinno dołączyć do serwera i ukończyć screening.

```bash
npx --no-install wrangler secret put DISCORD_CLIENT_ID --config dist/server/wrangler.production.json
npx --no-install wrangler secret put DISCORD_CLIENT_SECRET --config dist/server/wrangler.production.json
npx --no-install wrangler secret put DISCORD_BOT_TOKEN --config dist/server/wrangler.production.json
npx --no-install wrangler secret put DISCORD_BOT_TOKEN --config wrangler.realtime.json
```

Client ID i Client Secret są z aplikacji OAuth2; Bot Token pochodzi z zakładki Bot. Ten sam Bot Token jest potrzebny obu workerom: strona sprawdza żądania gracza, realtime wykonuje cron. Sam OAuth umożliwia pojedyncze sprawdzenie przez przycisk Discord; bot umożliwia późniejsze kontrole bez ponownego logowania. Token OAuth gracza nie jest przechowywany. Jeden Discord może być powiązany tylko z jednym graczem.

Jeżeli Discord zwraca błąd, sprawdź czy bot należy do właściwego serwera oraz czy podano prawidłowe ID serwera/roli. Dostęp do konkretnego członka opisuje [dokumentacja Discord](https://docs.discord.com/developers/resources/guild#get-guild-member).

## Wdrożenie na macOS

Uruchom cały blok w terminalu, będąc w repozytorium. Nawiasy oraz `set -e` zatrzymują kolejne kroki po błędzie. Zmień katalog na swój, jeśli repozytorium znajduje się gdzie indziej.

```bash
(
  set -e
  cd ~/Projects/tpunited
  git pull --ff-only origin main
  npm ci
  npm run build
  node scripts/prepare-cloudflare-testnet.mjs
  npx --no-install wrangler d1 migrations apply DB --remote --config wrangler.realtime.json
  npx --no-install wrangler deploy --config wrangler.realtime.json
  npx --no-install wrangler deploy --config dist/server/wrangler.production.json
)
```

Migracja `0020_automatic_quests.sql` musi wejść przed wdrożeniem workerów. Dodaje ustawienia Web3 i tabelę wyników kontroli. Nie usuwa istniejących kampanii ani punktów. Harmonogram jest w `wrangler.realtime.json`; nie dodawaj drugiej kopii crona do workera strony.

## Kontrola po wdrożeniu

Utwórz mały quest tutoriala oraz portfela na Base Sepolia. Sprawdź konto spełniające i niespełniające warunku, a następnie ponów kontrolę — suma punktów ukończonego zadania nie powinna wzrosnąć drugi raz. Na drugim zadaniu zamknij tablicę i sprawdź później przyznane punkty, aby potwierdzić działanie crona. Discord wymaga rzeczywistych sekretów i konta testowego; testy automatyczne używają symulowanych odpowiedzi Discord/RPC.

Lokalnie: `npm run social:test`, `npm run typecheck`, `npm run build`, `npm run realtime:build`. CI uruchamia również testy gry, multiplayera i integrację całej aplikacji.
