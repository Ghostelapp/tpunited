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

## Rusty Woods availability

Open **Game → Game availability**, change **Rusty Woods — region enabled**, then **Save game settings**.

The persisted `site_content.game.rustyWoodsEnabled` setting is read by the authoritative realtime server on its next tick. Disabling returns outdoor forest players to the town spawn, closes the east gate, removes forest scenery/routes from the client and pauses forest enemy simulation. Walking, dodging and client prediction cannot cross the closed boundary. Interior/dungeon play continues. Quest progress, inventory, enemy health and respawn timestamps are retained. Re-enabling restores the region without redeployment or a reset.

Existing configurations without the field keep the forest enabled. The admin endpoint's existing role checks, audit log and revision conflict protection apply. Deploy this release once to both the realtime and frontend workers before using the toggle; subsequent setting changes require only Save.

## Anonymous page counters

Statistics now starts with daily page-view totals by site and normalized page category. This counter runs without consent to detailed analytics and sends only the page path, with credentials omitted and no referrer. It stores no per-visit record, browser/session ID, account, network address or fingerprint. It respects DNT/GPC and skips known automated agents. The browser excludes signed-in admins.

These are page loads/navigation counts, not unique people; blocked JavaScript, privacy signals and delivery failures reduce coverage, and a public counter can be inflated by automated requests. Detailed account-linked visits still require explicit consent. Do not add the two totals: consenting visits can appear in both. CSV export includes separate sections. Data starts at deployment and is retained for 90 calendar days.

Apply `drizzle/0019_anonymous_traffic.sql` before deploying the frontend. The existing PowerShell deployment script applies D1 migrations. No existing visitor history is deleted or reclassified.
