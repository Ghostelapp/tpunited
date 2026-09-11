# Aktualizacja tTPU — instrukcja dla Twojego działającego testnetu

Paczka to nakładka na wersję 25. Nie zawiera bazy ani sekretów. Nie usuwa kont ani postępu. UI jest po angielsku. W tej paczce nie wykonano żadnych transakcji na Base Sepolia.

## Co dodano

- ERC20 Trash Panda Test Token (tTPU), 18 miejsc dziesiętnych.
- Kranik wewnątrz kontraktu: 1000 tTPU / portfel / 24 godziny, maksymalnie 10 mln tokenów. Bez opłat za token; użytkownik płaci testowym ETH za gas.
- Kontrakt dopuszcza Base Sepolia i lokalną sieć testową 31337; odrzuca mainnet.
- Saldo i przycisk CLAIM w oknie portfela w grze i na stronie. Potwierdzenie transakcji, odświeżanie, cooldown i błędy.
- Skrypt wdrożenia zapisujący adres i hash transakcji; uruchomienie ponownie wykorzystuje zapis zamiast wdrażać drugi token.
- Skrypt otwarcia jednej wybranej działki za tTPU (gdy kontrakty działek są wdrożone).
- Naprawiona grafika sheet-3.webp.

Per-wallet limit nie jest zabezpieczeniem przed wieloma portfelami. Token nie daje punktów leaderboardu, nie reprezentuje pieniędzy i nie obiecuje wymiany na mainnet. Kranik nie ma administratora mintującego dodatkowo, resetowania cooldownu ani funkcji zwiększania podaży. Po wyczerpaniu limitu przestaje wydawać tokeny.

## 1. Podmień pliki

Zrób kopię swojego folderu projektu. Zamknij lokalny podgląd, jeśli działa.
Z ZIP-a skopiuj ZAWARTOŚĆ folderu patch do głównego folderu projektu (tam gdzie package.json). Potwierdź zastąpienie wskazanych plików. Nie kopiuj folderu patch jako podfolderu projektu.

Nie zmieniono package.json ani package-lock.json. Nie musisz ponownie instalować zależności.

## 2. Testy

W PowerShell, w głównym folderze projektu:

```powershell
npm.cmd run contracts:compile
node packages/contracts/test/test-token.mjs
npm.cmd run contracts:test
```

W razie błędu nie przechodź do wdrożenia. Nowe testy sprawdzają kranik, cooldown, transfery, globalny limit oraz rzeczywisty zakup działki za tTPU z dokładną zgodą ERC20. Dotychczasowe testy sprawdzają także marketplace.

## 3. Wdróż tylko token na Base Sepolia

Użyj osobnego portfela testowego z testowym ETH. Nie udostępniaj jego klucza ani frazy odzyskiwania. Publiczny adres administratora aplikacji nie wystarcza do podpisania transakcji wdrożenia.

```powershell
$env:BLOCKCHAIN_NETWORK = 'base-sepolia'
$env:BASE_RPC_URL = 'https://sepolia.base.org'
$tpuKey = Read-Host 'Klucz prywatny portfela TESTOWEGO (0x...)' -AsSecureString
$env:DEPLOYER_PRIVATE_KEY = [System.Net.NetworkCredential]::new('', $tpuKey).Password
try {
  node packages/contracts/deploy-test-token.mjs
} finally {
  Remove-Item Env:DEPLOYER_PRIVATE_KEY -ErrorAction SilentlyContinue
  Remove-Variable tpuKey -ErrorAction SilentlyContinue
}
```

Endpoint możesz zastąpić własnym RPC Base Sepolia. Klucz jest używany lokalnie, nie trafia do Cloudflare. Skrypt wymaga sieci 84532 i zapisuje deployments/test-token-base-sepolia.json. Zachowaj ten plik. Jeśli oczekiwanie na potwierdzenie zostanie przerwane, powtórz blok z tym samym portfelem i plikiem — sprawdzi wcześniejszy hash.

Jeśli sama transakcja została odrzucona, skrypt zgłosi błąd; sprawdź transakcję przed usunięciem zapisu. Nie usuwaj zapisu tylko dlatego, że terminal długo czeka.

## 4. Zbuduj i opublikuj aktualizację gry

Po poprawnym wdrożeniu tokena:

```powershell
npm.cmd run build
node scripts/prepare-cloudflare-testnet.mjs
npx.cmd wrangler deploy --config dist/server/wrangler.production.json --dry-run
npx.cmd wrangler deploy --config dist/server/wrangler.production.json
```

Wykonuj kolejno, zatrzymując się przy błędzie. Skrypt konfiguracji jest dopasowany do Twojej bazy c8d649c0-0494-4f05-812f-a56c3361efa5 i bucketu tpu. Zachowuje wygenerowane ścieżki builda. Z pliku deployments odczytuje adres tokena i ustawia TEST_TOKEN_CONTRACT, PAYMENT_TOKEN, PAYMENT_TOKEN_SYMBOL=tTPU, PAYMENT_TOKEN_DECIMALS=18 oraz TOKEN_ENABLED=true. Bez ukończonego wdrożenia tokena nie włącza kranika.

Nie uruchamiaj migracji: ta aktualizacja nie zmienia schematu bazy. AUTH_ORIGIN i AUTH_ADMIN_WALLET ustawione jako sekrety tego samego Workera pozostają na Cloudflare. Jeśli wcześniej ręcznie zmieniałeś dodatkowe zwykłe vars, przenieś je świadomie do nowego configu; skrypt ustawia własną sekcję vars. Nie kopiuj tam klucza wdrażającego.

## 5. Sprawdź kranik

1. Otwórz swoją grę i odśwież Ctrl+Shift+R.
2. Zaloguj się portfelem na Base Sepolia.
3. Kliknij swoją nazwę/portfel w prawym górnym rogu.
4. Sekcja TEST TOKEN pokazuje saldo. Kliknij CLAIM 1000 tTPU.
5. Portfel pokaże transakcję claim, wymagającą niewielkiej ilości testowego ETH.
6. Po potwierdzeniach saldo powinno wzrosnąć o 1000. Przycisk pokaże czas do następnego odbioru.
7. Odśwież stronę: saldo i cooldown są odczytywane z blockchaina, nie z pamięci przeglądarki.

Jeśli przycisku nie widać, sprawdź /api/config: testToken powinno zawierać adres, chainId powinno wynosić 84532. Jeżeli jest null, konfiguracja tokena nie została opublikowana. Jeśli portfel lub sieć nie pasuje do zalogowanego konta, przycisk będzie zablokowany. REFRESH BALANCE ponawia odczyt po problemie RPC. Zmiana adresu podczas transakcji wymaga odświeżenia salda.

## 6. Działki — kolejny etap, nie część samego wdrożenia tokena

Sam token nie tworzy kontraktów działek, przedmiotów i marketplace. Jeśli jeszcze ich nie wdrożono, zatrzymaj się po kroku 5 i prześlij publiczny adres tokena oraz wynik testu kranika.

Do wdrożenia istniejących kontraktów potrzebna jest poprawna konfiguracja TREASURY_ADDRESS i METADATA_BASE_URL (faktycznie działające metadane). W istniejącym skrypcie deploy.mjs ustaw PAYMENT_TOKEN na adres tTPU, aby zaakceptować go jako walutę. Samo włączenie TOKEN_ENABLED nie konfiguruje kontraktów.

Gdy LAND_CONTRACT, NFT_CONTRACT, PAYMENT_ROUTER, MARKETPLACE_CONTRACT i DEPLOYMENT_BLOCK są wdrożone oraz ustawione jako sekrety Workera, można otworzyć jedną nieposiadaną działkę. Poniższy blok wykonuje trzy transakcje administracyjne na routerze i marketplace. Użyj portfela z uprawnieniami tych kontraktów.

```powershell
$env:BLOCKCHAIN_NETWORK = 'base-sepolia'
$env:TEST_TOKEN_CONTRACT = 'TU_ADRES_TOKENA_0x'
$env:PAYMENT_ROUTER = 'TU_ADRES_ROUTERA_0x'
$env:MARKETPLACE_CONTRACT = 'TU_ADRES_MARKETPLACE_0x'
$env:TEST_PARCEL_ID = '1'
$env:TEST_PARCEL_PRICE = '100'
$tpuKey = Read-Host 'Klucz portfela administrujacego kontraktami TESTOWYMI' -AsSecureString
$env:DEPLOYER_PRIVATE_KEY = [System.Net.NetworkCredential]::new('', $tpuKey).Password
try {
  node packages/contracts/configure-test-sale.mjs
} finally {
  Remove-Item Env:DEPLOYER_PRIVATE_KEY -ErrorAction SilentlyContinue
  Remove-Variable tpuKey -ErrorAction SilentlyContinue
}
```

Zastąp wszystkie przykłady rzeczywistymi adresami. ID 1 użyj tylko, jeśli ta działka nie jest już wybita i może zostać sprzedana. Skrypt ustawia jej ofertę na 100 tTPU i włącza tę walutę w kontraktach. Nie dotyka innych ofert.

Na /land wybierz tę działkę, sprawdź cenę w tTPU, zatwierdź APPROVE EXACT TOKEN AMOUNT, następnie CONFIRM IN WALLET. To dwie transakcje, obie wymagają testowego ETH. Zweryfikuj właściciela NFT, spadek salda i aktualizację własności w grze. Interfejs tworzenia nowych ofert wtórnych nadal domyślnie wystawia za ETH; ta aktualizacja nie dodaje wyboru waluty przy wystawianiu. Kupowanie istniejącej oferty ERC20 korzysta z dotychczasowego przepływu.

## Co jeszcze wymaga rzeczywistego sprawdzenia

Testy lokalne nie są audytem ani testem publicznego wdrożenia. Na Twoim koncie trzeba sprawdzić podpisy portfela, potwierdzenia Base Sepolia, RPC, widok mobilny, zakup i synchronizację. Nie wdrożono tu mainnetowego tokena, mainnetowego airdropa ani płatnego Founder checkoutu. Aktualizacja nie zmienia zasad leaderboardu.
