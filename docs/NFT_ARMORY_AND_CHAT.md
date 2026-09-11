# Czat i ekwipunek NFT — obsługa

## Czat w grze

Kliknij TOWN CHAT w świecie gry. Wiadomości są wspólne ze stroną Community, zapisują się na serwerze i odświeżają co 3 sekundy. Limit wynosi 400 znaków i jedną wiadomość na 3 sekundy. Nazwa nadawcy pochodzi z zalogowanego konta. Zawieszone konta nie mogą pisać. Podczas pisania sterowanie postacią jest wstrzymane. Czat można zwinąć lub przenieść przez „Przesuń HUD”; położenie jest zapamiętywane osobno na telefonie i komputerze.

## Pierwsze uruchomienie NFT

1. Zaloguj się do panelu kontem administratora i połącz jego portfel. Otwórz Admin → NFT armory.
2. Sprawdź nazwę sieci w panelu. Domyślnie projekt używa Base Sepolia. Do transakcji potrzebujesz testowego ETH w tej sieci. Nie wysyłaj klucza prywatnego do aplikacji ani na czat.
3. Kliknij DEPLOY COLLECTION WITH MY WALLET. Potwierdź utworzenie kontraktu w portfelu. Aplikacja czeka na dwie konfirmacje i zapisuje adres kolekcji. Kontrakt jest ERC-721 TrashPandaAssets, a jego administratorem jest podpisujący portfel.
4. Kliknij AUTHORIZE MY WALLET TO MINT i potwierdź nadanie swojemu portfelowi roli MINTER_ROLE. Rola administratora strony nie nadaje automatycznie uprawnień kontraktu.
5. Alternatywnie połącz istniejący zgodny kontrakt. Musi obsługiwać ERC-721 oraz mint(address,uint256), grantRole i metadane pod adresem pokazanym w panelu. Po utworzeniu pierwszego przedmiotu kolekcja w danej sieci jest zablokowana przed zmianą.

To rzeczywiste transakcje portfela. Samo opublikowanie aplikacji nie wdraża kolekcji ani nie mintuje tokenów. Gdy transakcja została wysłana, ale strona straciła połączenie, sprawdź ją przez VIEW TRANSACTION przed ponowną próbą. Adres wdrożonej kolekcji można odzyskać z potwierdzonej transakcji i wkleić do CONNECT EXISTING.

## Dodanie przedmiotu

1. Wpisz nazwę i opis.
2. Wybierz slot: Weapon albo Armor.
3. Wybierz rarity: common, uncommon, rare, epic, legendary lub mythic. Rzadkość jest metadaną i kolorem karty, nie losowym mnożnikiem statystyk.
4. Dla broni ustaw bonus obrażeń od 1 do 100 i pancerz 0. Dla zbroi ustaw pancerz od 1 do 20 i obrażenia 0.
5. Ustaw wymagany poziom gracza od 1 do 100.
6. Wgraj własną grafikę PNG/JPEG/WebP do 2 MB lub podaj adres HTTPS. Pliki są trwale przechowywane. Dla trwałości metadanych preferuj wgrywanie pliku zamiast zewnętrznego URL, którego treść może zmienić właściciel hostingu.
7. SAVE DRAFT zapisuje szkic. Możesz go jeszcze edytować.
8. PUBLISH & LOCK DEFINITION udostępnia przedmiot w katalogu gry i blokuje nazwę, opis, grafikę, rarity i statystyki. Każdy wpis odpowiada jednemu unikalnemu NFT — edycja 1/1. Identyfikator wpisu jest token ID.
9. Wpisz nazwę istniejącego gracza i wybierz MINT NFT & ADD TO GAME. Odbiorcą jest zweryfikowany portfel tego konta. Potwierdź mint w portfelu administratora. Po dwóch konfirmacjach serwer sprawdza ownerOf i dodaje NFT do magazynu gracza.
10. Jeśli token był już mintowany lub mint się udał, ale import nie, użyj IMPORT ALREADY MINTED NFT. Nie mintuj drugi raz tego samego token ID.

Podgląd najnowszych 200 wpisów znajduje się w katalogu panelu. Publiczne metadane NFT są pod /api/metadata/assets/{tokenId} i zawierają grafikę, opis, rzadkość, slot, obrażenia, pancerz, wymagany poziom oraz edycję.

## Używanie w grze

- Gracz otwiera plecak → NFT ARMORY. Przedmiot nadany przez panel pojawia się po ponownym otwarciu plecaka.
- Właściciel może również wpisać token ID i wybrać IMPORT OWNED NFT. Przycisk w katalogu wykonuje taką samą weryfikację.
- EQUIP NFT wyposaża broń lub zbroję w odpowiednim slocie, zastępując zwykły przedmiot w tym slocie. Bonus jest rzeczywiście używany przez serwer podczas walki. Wymagany poziom jest sprawdzany przez serwer.
- Przedmioty NFT nie mogą być rozkładane na Scrap. Remove from game stash usuwa tylko import do gry, bez palenia NFT i bez zmiany własności portfela. Przed usunięciem zdejmij wyposażony przedmiot.
- Serwer odczytuje definicję oraz sprawdza on-chain ownerOf przy wyposażaniu i akcjach z wyposażonym NFT. Transfer do innego portfela odbiera poprzedniemu graczowi bonus. Nowy właściciel może zaimportować token.
- W razie niedostępności RPC akcja z NFT jest odrzucana bez zmiany postępu. Nie przyznajemy bonusu na podstawie niesprawdzonego cache. Opóźnienie RPC może zwiększyć czas potwierdzania akcji.
- Magazyn NFT mieści do 40 zaimportowanych przedmiotów; zwykły loot nadal ma osobny limit 40.
- DISABLE IN GAME wyłącza bonus i możliwość nowych importów; nie odbiera NFT z portfela. Metadane pozostają dostępne. ENABLE IN GAME przywraca użyteczność.

## Zakres i dalszy rozwój

Gotowe: trwały czat, panel kolekcji, wdrożenie kontraktu z portfela, rola mintera, definicje przedmiotów, grafiki, rarity, poziomy, metadane ERC-721, mint do gracza, import potwierdzonej własności, wyposażenie i statystyki walki, odebranie bonusu po transferze, audyt administracyjny.

Ta wersja obsługuje unikalne egzemplarze 1/1 w slotach broni i zbroi. Nie zawiera wielosztukowych edycji ERC-1155, automatycznego mintowania za drop z potworów, stakingu, dodatkowych slotów ani zmiany sprite’a postaci zależnie od NFT. Mint jest dystrybucją przez administratora, bez sprzedaży NFT za pieniądze w tym panelu. Kolekcję można osobno dopuścić do istniejącego marketplace kontraktowego; sam panel uzbrojenia tego nie robi.

Testy lokalne obejmują uprawnienia, import i transfer własności, działanie statystyk, wymagany poziom, wyłączenie przedmiotu, odrzucenie podrobionych danych, awarię RPC, mint i unikalność tokenów w lokalnej maszynie EVM. Publikacja funkcji nie oznacza przetestowania transakcji Twoim portfelem w Base Sepolia.
