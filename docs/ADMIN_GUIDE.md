# Panel administracyjny i kampanie

## Dostęp
Wejdź na `/admin` po podpisaniu wiadomości portfelem konta z rolą ADMIN lub SUPER_ADMIN w bazie. Link ADMIN pochodzi z `/api/auth/me`; każda operacja API niezależnie sprawdza rolę. `AUTH_ADMIN_WALLET` może wskazywać jeden zweryfikowany portfel do początkowego nadania ADMIN. Nie ma reguły „pierwszy użytkownik jest adminem”. Po pierwszym skutecznym logowaniu administratora usuń zmienną bootstrap i wdroż ponownie; rola pozostaje w bazie. Prywatność Site nie została zmieniona.

## Konto gracza
`/register`: połącz portfel, podpisz wiadomość i wybierz nazwę. Jedna transakcja tworzy konto, przypisuje jeden portfel i zakłada postać. Istniejący zweryfikowany portfel przywraca tę samą nazwę i postęp. Od tego momentu strona, profil, gra i panel współdzielą cookie. Wylogowanie w terminalu portfela kończy tę sesję we wszystkich kartach.

## Landing, ogłoszenia i gra
Landing page: edytuj teksty i widoczność sekcji. Save draft nie zmienia opublikowanej strony. Text preview pokazuje teksty; Publish landing zapisuje wersję widoczną po odświeżeniu. Konflikt wersji oznacza, że inny zapis nastąpił wcześniej — skopiuj własne zmiany, odśwież i porównaj.
Announcements: zapisz wiadomość jako ukrytą lub opublikowaną. Opublikowane ogłoszenia pojawiają się na stronie i w grze; gra odczytuje je co minutę.
Game: maintenance blokuje akcje gry, nie kasuje zapisów. Registration controls włącza/wyłącza nowe rejestracje. Users pozwala wyszukiwać i zawieszać/przywracać konta.

## Zadanie społecznościowe
W Social & airdrops wybierz Social quest. Wpisz opis wymaganej czynności i dowodu, link HTTPS, punkty, początek i koniec. Zapisz szkic i wybierz Launch. Daty formularza są w lokalnym czasie przeglądarki. Po publikacji warunki są zamrożone; dla innych warunków utwórz nową kampanię.
Gracz przesyła dowód na `/campaigns`. W Proof review sprawdź go samodzielnie i zaakceptuj lub odrzuć z powodem. Odrzucone zgłoszenie można poprawić. Zatwierdzone nalicza punkty raz. Punkty nie są tokenami. Nie ma automatycznego potwierdzania follow/repost przez API X ani członkostwa Discord.

## Airdrop
Obsługiwany jest zwykły transfer natywnego testowego ETH na Base Sepolia (84532), nie token ERC-20 ani mainnet. Przygotuj zweryfikowany portfel administratora typu EOA, np. MetaMask, i testowe ETH na wypłaty oraz gaz.
1. Utwórz Airdrop, ustaw kwotę na osobę, minimalne zatwierdzone punkty, limit odbiorców i okno zgłoszeń.
2. Launch & freeze list zamraża listę aktywnych kont z portfelem Base Sepolia. Kolejność: czas rejestracji, następnie ID. Późniejsze konta lub punkty nie zmieniają tej listy.
3. Gracz klika Claim allocation w czasie trwania kampanii. To zgłoszenie do wypłaty, nie transfer.
4. W Payouts połącz i zweryfikuj portfel admina. Send exact amount rezerwuje wypłatę, a następnie prosi portfel o podpisanie transakcji.
5. Po wysłaniu hash zostaje zapisany. Poczekaj na dwie konfirmacje i wybierz Verify transaction.
6. Serwer sprawdzi status, odbiorcę, dokładną kwotę, nadawcę powiązanego z adminem, datę i unikalność hasha. Dopiero wtedy pokaże paid.

Jeśli odpowiedź portfela jest niejednoznaczna, nie wysyłaj ponownie. Sprawdź transakcję nadawcy w explorerze i uzupełnij hash rezerwacji. Odrzucona przez użytkownika prośba o podpis (kod 4001) zwalnia rezerwację. Inne nieznane wyniki pozostają zablokowane do wyjaśnienia. System nie trzyma klucza prywatnego i nie wykonuje automatycznej masowej dystrybucji. Przepływ nie obsługuje rozpoznawania wewnętrznych transferów smart account; do wypłat użyj bezpośredniego transferu EOA.

CSV obejmuje wyświetlone, maksymalnie 1000 najnowszych alokacji. Listy zadań/ogłoszeń są ograniczone do 100 najnowszych, zgłoszenia do 200 z oczekującymi na początku. Użytkownicy mają strony po 50. Dla większych kampanii należy rozszerzyć paginację operacyjną przed ich startem.

## Testy i ograniczenia
`node --test scripts/admin.test.mjs` sprawdza API i SQLite z podstawioną tożsamością i odpowiedziami RPC. To nie test prawdziwego podpisu w portfelu ani transmisji środków. Testy gry: `npm run game:test`; typy: `npm run typecheck`. Przed kampanią z odbiorcami wykonaj małą próbę na dwóch własnych kontach/portfelach. Ta aktualizacja nie uruchamia żadnej kampanii i nie wypłaca środków automatycznie.
