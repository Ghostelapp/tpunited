# Leaderboard sezonowy — instrukcja administratora

1. Zaloguj się zarejestrowanym portfelem administratora.
2. Otwórz Admin → Leaderboard.
3. Formularz proponuje sezon testowy na 30 dni. Ustaw nazwę, punktację, limity dobowe oraz próg kwalifikacji.
4. Kliknij SAVE DRAFT. Szkic pozostaje niewidoczny publicznie; EDIT RULES pozwala go zmienić.
5. Kliknij START & LOCK RULES. Od tej chwili sezon jest widoczny pod /leaderboard, a zasady są zablokowane. Jednocześnie może działać jeden sezon. Dotychczasowe osiągnięcia nie są importowane.
6. Gracze zdobywają punkty przez rzeczywiste akcje gry. Zgłoszenia social quests zatwierdzaj w Proof review. Samo otwarcie linku nie przyznaje punktów.
7. W przypadku potwierdzonego oszustwa wpisz nazwę gracza i powód wykluczenia. RESTORE przywraca wcześniejsze punkty; aktywność podczas wykluczenia nie jest naliczana.
8. Po upływie terminu punktacja zatrzymuje się automatycznie. Sprawdź wyniki i wykluczenia, następnie wybierz FREEZE RESULTS i potwierdź. Możesz też zakończyć sezon wcześniej. Zamrożenie jest nieodwracalne.
9. EXPORT FINAL CSV pobiera końcowe pozycje, nazwy, portfele, punkty, aktywne dni, kwalifikację i procent udziału. Eksport obsługuje do 10 000 uczestników. Przy większym sezonie operator musi przygotować eksport stronicowany.
10. Utwórz następny sezon. Poprzednie wyniki pozostają dostępne w selektorze sezonów.

## Domyślne zasady

| Aktywność | Punkty | Maksymalnie na dzień UTC |
|---|---:|---:|
| Odebrana nagroda daily quest | 20 | 60 |
| Zebrana skrytka | 10 | 30 |
| Ukończony dungeon | 75 | 75 |
| Zatwierdzone social quest | 20 | 40 |

Kwalifikacja: 300 punktów i 3 różne dni UTC z dodatnim wynikiem. Limity resetują się o 00:00 UTC. Ostatnie naliczenie może zostać obcięte do pozostałego limitu. Zatwierdzenie social quest daje stałą liczbę punktów sezonowych niezależnie od dotychczasowej punktacji kampanii.

Udział poglądowy: 40% hipotetycznej puli dzieli się po równo między zakwalifikowanych, a 60% proporcjonalnie do ich punktów. Suma udziałów wynosi 100%, gdy ktoś się kwalifikuje. Nie jest to obietnica tokenów, wycena ani uruchomienie wypłat. Przy remisie decyduje czas pierwszego dodatniego naliczenia, następnie identyfikator konta. Zmiana pozycji porównuje aktualny ranking z wynikiem na początek bieżącego dnia UTC przy obecnym stanie wykluczeń. Brak poprzedniego wyniku oznacza kreskę.

## Co działa

- Publiczny ranking po 50 pozycji na stronę, własna pozycja niezależna od strony, odświeżanie co 30 sekund, progi i dobowe postępy.
- Konto i zweryfikowany portfel wymagane do naliczania; brak publicznego ujawniania adresów portfeli.
- Rejestr zdarzeń po stronie serwera, unikalne źródła naliczeń, atomowe limity i powiązanie z zatwierdzonym zapisem gry.
- Role administratorów, audyt zmian sezonu, wykluczenia, zamrożona kopia rankingu i portfeli, eksport CSV.
- Nowa migracja wyłącznie dodaje tabele sezonów i nie usuwa istniejących kont ani zapisów.

## Co pozostaje przed właściwym airdropem

- Ustalenie tokena, sieci, budżetu, warunków uczestnictwa i dat dystrybucji.
- Połączenie zatwierdzonego eksportu z mechanizmem wypłat; istniejące kampanie test ETH nadal mają odrębne zasady i nie pobierają automatycznie wyników leaderboardu.
- Mocniejsze wykrywanie botów i wielu kont. Jeden portfel na konto nie dowodzi jednej osoby.
- Próba obciążeniowa przy dużej liczbie graczy; obecnie ranking agreguje rejestr zdarzeń.
- Praktyczna kontrola widoku na urządzeniach mobilnych i próba pełnego sezonu z prawdziwymi graczami.

Sezon nie startuje automatycznie przy publikacji aplikacji. Administrator świadomie uruchamia go po przejrzeniu zasad.
