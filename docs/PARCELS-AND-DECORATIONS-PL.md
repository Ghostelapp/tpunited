# Osobne mapy działek i dekoracje NFT — aktualizacja

Ta paczka rozszerza Twój obecny testnet. Nie wdraża automatycznie kontraktów ani nie zmienia Twojego konta Cloudflare.

## Co działa w kodzie

- /parcel/1 ... /parcel/100: oddzielne mapy o wymiarach zapisanych w definicji działki. Obecnie wszystkie definicje mają 32 × 32 pola. Nie zmieniono rozmiarów zakupionych działek.
- Chodzenie WASD, strzałkami lub kliknięciem/dotknięciem. Kolizje z dekoracjami i istniejącymi budynkami. Powrót do miasta przyciskiem RETURN TO TOWN. Pozycja odwiedzającego jest lokalna dla wizyty; nie przyznaje nagród i nie zmienia pozycji bojowej w mieście.
- Właściciel może wybrać NFT, ustawić je na mapie, obrócić, przesunąć i zdjąć. Rozmieszczenie zapisuje D1. Granice i nakładanie obiektów sprawdza serwer. Jedna dekoracja zajmuje od 1 × 1 do 4 × 4 pól. Maksymalnie 40 dekoracji na mapę.
- Sklep /decorations pokazuje opublikowane dekoracje i posiadane NFT (strony po 20 pozycji). Widok zakupu odczytuje aktualne ceny z kontraktu.
- Admin → Decorations NFT: tworzenie definicji, nazwa, opis, URL grafiki, rarity, szerokość, wysokość; konfiguracja ceny podpisana w portfelu; publikacja.
- Osobny kontrakt TrashPandaDecorations. Zakup za ERC20 (np. tTPU) przenosi dokładną cenę do treasury i mintuje jeden ERC721. Każda definicja to unikat 1/1. Aby sprzedać kolejny egzemplarz, utwórz kolejną definicję.
- Osobne metadane /api/metadata/decorations/ID. Grafiki przykładowe: ławka, donica i beczka wycięte z istniejących arkuszy.
- Dekoracje pozostają w portfelu po sprzedaży działki. Zapis rozmieszczenia jest unieważniany po zmianie właściciela działki lub NFT, także po transferze tam i z powrotem. Odczyt wymaga zgodnych stanów latest i safe; w trakcie potwierdzania może pojawić się komunikat, aby spróbować później. Otwarta mapa odświeża własność co 30 sekund. Błąd RPC blokuje odczyt/edycję, nie usuwa automatycznie zapisanych dekoracji.
- Goście zalogowani do gry mogą odwiedzać mapy, ale nie edytować cudzej działki.

Stałe budynki z poprzedniej wersji pozostają przypisane do działki i są wyświetlane na mapie. Ich dawne pola 8 × 8 odpowiadają blokom 4 × 4 na mapie 32 × 32. Osobne NFT dekoracyjne nie przechodzą razem z działką. Nie zmieniono umowy własności wcześniej wybitych NFT działek ani kontraktów tTPU/marketplace.

## 1. Kopia bezpieczeństwa

Zrób kopię lokalnego folderu projektu i eksport bazy przed migracją:

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
npx.cmd wrangler d1 export trash-panda-testnet --remote --config dist/server/wrangler.production.json --output backups/before-parcels.sql
```

Plik SQL zawiera dane kont — przechowuj go prywatnie, nie publikuj w repozytorium.

## 2. Wgraj aktualizację

Wypakuj ZIP. Skopiuj ZAWARTOŚĆ folderu patch do głównego folderu projektu, tam gdzie package.json. Potwierdź zastąpienie plików. Zachowaj lokalne deployments i sekrety. Nie zmieniaj starych migracji 0000–0011. Paczka dodaje migrację 0012 oraz jej metadane Drizzle.

```powershell
npm.cmd run contracts:compile
node packages/contracts/test/decorations.mjs
node --test scripts/parcels.test.mjs
npm.cmd run build
node scripts/prepare-cloudflare-testnet.mjs
```

Komendy wykonuj kolejno. Zatrzymaj się przy błędzie. Nowe skrypty korzystają z istniejących zależności; package.json i lockfile nie zostały zmienione.

## 3. Nowe tabele D1

```powershell
npx.cmd wrangler d1 migrations list trash-panda-testnet --remote --config dist/server/wrangler.production.json
npx.cmd wrangler d1 migrations apply trash-panda-testnet --remote --config dist/server/wrangler.production.json
```

Na dotychczasowej bazie powinna oczekiwać tylko migracja 0012. Nie twórz nowej bazy. Migracja dodaje decoration_items, parcel_decorations i decoration_cells; nie kasuje graczy ani starej zabudowy.

## 4. Opublikuj aplikację

```powershell
npx.cmd wrangler deploy --config dist/server/wrangler.production.json --dry-run
npx.cmd wrangler deploy --config dist/server/wrangler.production.json
```

Po sukcesie /parcel/1 powinno wyświetlić osobną mapę. Sekcja sklepu poinformuje, że kolekcja nie jest podłączona, dopóki nie wykonasz kolejnego kroku.

## 5. Wdróż TYLKO nową kolekcję dekoracji

Nie uruchamiaj ponownie deploy.mjs od działek. Użyj poniższego nowego skryptu z osobnym portfelem testowym, którym będziesz administrować sprzedażą dekoracji. Ten portfel musi mieć testowe ETH, a w grze rolę administratora, aby korzystać z panelu.

```powershell
$env:BLOCKCHAIN_NETWORK = 'base-sepolia'
$env:BASE_RPC_URL = 'https://sepolia.base.org'
$env:AUTH_ORIGIN = 'https://trash-panda-united.patryk-solo.workers.dev'
$env:TREASURY_ADDRESS = '0x1eCa48130294a1067b76dCEfd8D3e706FfFFc305'
$tpuKey = Read-Host 'Klucz prywatny portfela TESTOWEGO' -AsSecureString
try {
    $tpuRaw = [System.Net.NetworkCredential]::new('', $tpuKey).Password.Trim()
    if ($tpuRaw -cmatch '^[0-9a-fA-F]{64}$') { $tpuRaw = '0x' + $tpuRaw }
    if ($tpuRaw -cnotmatch '^0x[0-9a-fA-F]{64}$') { throw 'Nieprawidlowy format klucza.' }
    $env:DEPLOYER_PRIVATE_KEY = $tpuRaw
    node packages/contracts/deploy-decorations.mjs
} finally {
    Remove-Item Env:DEPLOYER_PRIVATE_KEY -ErrorAction SilentlyContinue
    Remove-Variable tpuKey, tpuRaw -ErrorAction SilentlyContinue
}
```

Klucz wpisujesz wyłącznie lokalnie, nie do czatu. Skrypt zapisze deployments/decorations-base-sepolia.json. Zachowaj ten plik; ponowienie używa wcześniejszego hasha. Parametry treasury i adres metadanych muszą pozostać zgodne z zapisanym wdrożeniem. Nie zmieniaj adresu kolekcji po utworzeniu przedmiotów.

Po sukcesie otrzymasz DECORATION_CONTRACT. Wpisz go jako sekret:

```powershell
npx.cmd wrangler secret put DECORATION_CONTRACT --config dist/server/wrangler.production.json
```

Wklej publiczny adres nowego kontraktu. Nie podmieniaj NFT_CONTRACT — to istniejąca kolekcja uzbrojenia. /api/config powinno mieć pole decorations z nowym adresem.

## 6. Dodaj pierwszą dekorację w panelu

1. Otwórz /admin → Decorations NFT portfelem, którym wdrożyłeś kolekcję.
2. Wpisz np. Neon Bench, opis, rarity rare, szerokość 2, wysokość 1.
3. Grafika: /assets/decorations/bench.png. Dostępne także /assets/decorations/planter.png i /assets/decorations/barrel.png. Dla własnej grafiki użyj publicznego HTTPS URL albo URL artworku wgranego istniejącym panelem NFT; nowy formularz nie ma osobnego uploadu.
4. Kliknij CREATE DRAFT. Zapis otrzyma token ID.
5. Wpisz cenę, np. 100. Waluta jest pierwszym tokenem z konfiguracji (na Twoim testnecie tTPU).
6. Kliknij przy drafcie 1. CONFIGURE SALE IN WALLET i potwierdź transakcję. Poczekaj na potwierdzenie.
7. Kliknij 2. PUBLISH. Definicja zostaje zamrożona i trafia do sklepu oraz metadanych.

Nie traktuj roli ADMIN w aplikacji jako prawa podpisywania transakcji za właściciela kontraktu. To dwa oddzielne uprawnienia. Cena pochodzi z kontraktu, nie z wpisu przeglądarki. Nie ma automatycznego podpisywania transakcji przez serwer.

## 7. Kup i ustaw NFT

1. Zaloguj się innym portfelem niż treasury, posiadającym działkę, tTPU i testowe ETH.
2. Otwórz /decorations. Przy przedmiocie kliknij APPROVE EXACT AMOUNT, potwierdź i poczekaj; następnie BUY NFT.
3. REFRESH OWNERSHIP odczytuje rzeczywistego właściciela. Odczekaj potwierdzenie safe, jeśli przedmiot nie pokazuje jeszcze OWNED.
4. Wejdź w /land → swoją działkę → ENTER YOUR LAND, albo bezpośrednio /parcel/1.
5. Kliknij EDIT PARCEL, wybierz posiadany NFT z listy poniżej i dotknij wolnego pola.
6. ROTATE zmienia orientację o 90 stopni. Zielony podgląd oznacza wolne miejsce; serwer ponownie sprawdza zapis. Na telefonie dotknij pola bez najeżdżania myszą.
7. Kliknij ustawiony przedmiot, aby go przesunąć. REMOVE FROM MAP usuwa rozmieszczenie, ale nie token z portfela.
8. Odśwież stronę i sprawdź zapis. Zaloguj drugi portfel i potwierdź, że widzi mapę jako VISITOR bez trybu edycji.

Testy lokalne przeszły dla autoryzacji, footprintów/rotacji, kolizji, rollbacku, odrzucenia podwójnego umieszczenia, transferów i błędu RPC oraz zakupu/mintowania dekoracji. Wdrożenie na Twoim koncie i podpisy portfela muszą zostać sprawdzone po publikacji.

## Zakres i ograniczenia

- To osobne mapy do spacerowania i dekorowania. Nie wprowadzono wspólnej sesji multiplayer z widocznymi na żywo awatarami gości ani walki na działkach.
- Domyślny limit to 40 ustawionych dekoracji na parcelę; katalog ma stronicowanie, panel administratora pokazuje najnowsze 200 definicji.
- Dekoracje są osobnymi ERC721 1/1, nie seriami ERC1155. Nie dodano automatycznej sprzedaży wtórnej dekoracji do dotychczasowej listy działek marketplace. Bezpośrednie transfery NFT działają, a ich skutki są sprawdzane na mapie.
- Stałe budynki sprzedają się wraz z działką; dekoracje nie. Stary endpoint budowania nie pozwala zmieniać stałej zabudowy, gdy na działce są dekoracje, aby zachować spójność zajętych pól. Nowy edytor służy dekoracjom.
- Rozmiar mapy pochodzi z definicji gry, nie z dowolnego tekstu wpisanego w NFT. Nie zmieniaj rozmiaru już sprzedanej działki bez planu migracji.
- Na razie wdrażaj na Base Sepolia. Nie jest to audyt kontraktów ani wdrożenie mainnetowe.
