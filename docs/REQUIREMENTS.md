# TRASH PANDA UNITED — WEB3 GAME MASTER REQUIREMENTS V2

Wszystkie poniższe wymagania są OBOWIĄZKOWE i mają pierwszeństwo przed wcześniejszymi instrukcjami, jeżeli występuje między nimi konflikt.

Trash Panda United od pierwszej działającej wersji ma być:

- grywalną pixel-artową grą online,
- aplikacją Web3,
- projektem działającym na Base Sepolia,
- przygotowanym do łatwego przełączenia na Base Mainnet,
- posiadającym własną ekonomię,
- systemem własności ziemi,
- systemem domów,
- marketplace,
- systemem płatności kryptowalutami,
- portalem społecznościowym gry,
- stroną landingową utrzymaną w stylistyce świata gry.

Blockchain NIE może być jedynie atrapą UI.

Wszystkie pokazane użytkownikowi funkcje Web3 mają faktycznie wykonywać transakcje na Base Sepolia.

---

# 1. LANDING PAGE OD PIERWSZEJ WERSJI

Razem z grą utwórz kompletny landing page:

**Trash Panda United**

Landing page musi być integralną częścią produktu.

Nie twórz zwykłej strony SaaS.

Design:

**PIXEL ART + CYBERPUNK + POST APOCALYPTIC**

Klimat:

- nocne miasto,
- śmieciowe zaułki,
- neony,
- billboardy,
- migające znaki,
- stare terminale,
- graffiti,
- toksyczne beczki,
- rury,
- para,
- deszcz,
- opuszczone budynki,
- pixelowe animacje,
- industrialne konstrukcje,
- futurystyczne urządzenia zbudowane ze złomu.

Dominujące wrażenie:

ciemny cyberpunkowy pixel-art.

Interfejs strony może przypominać terminal / HUD gry.

Nie twórz korporacyjnego landing page.

---

# 2. HERO

Hero ma zajmować prawie cały pierwszy ekran.

Logo:

# TRASH PANDA UNITED

Tagline przykładowy:

**Own the Wasteland. Build. Fight. Trade. Survive.**

CTA:

PLAY NOW

CONNECT WALLET

EXPLORE WORLD

BUY LAND

W tle:

animowany pixel-artowy fragment świata gry.

Powinny występować:

- poruszające się neony,
- para,
- deszcz,
- NPC,
- przejeżdżające pojazdy,
- billboardy,
- panda bohater,
- cyberpunkowe miasto.

Dodaj subtelny parallax.

---

# 3. LANDING PAGE — SEKCJE

Landing musi posiadać:

HOME

GAME

WORLD

LAND

ECONOMY

MARKETPLACE

NFT

ROADMAP

COMMUNITY

PLAY NOW

CONNECT WALLET

---

# 4. GAME PREVIEW

Na stronie pokaż interaktywny fragment mapy lub animowaną scenę gameplayową.

Sekcja:

## ENTER THE WASTELAND

Pokazuj:

- eksplorację,
- combat,
- loot,
- crafting,
- miasta,
- domy,
- multiplayer.

---

# 5. WORLD MAP

Landing page powinien posiadać pixelową mapę świata.

Regiony między innymi:

Trash Town
Rusty Woods
Junkyard Valley
Neon District
Dead Metro
Toxic Sewers
Forgotten Factory
The Wasteland
Black Laboratory

Kliknięcie regionu pokazuje:

- nazwę,
- level,
- opis,
- zasoby,
- przeciwników,
- dostępność ziemi,
- kontrolującą frakcję.

---

# 6. WEB3 OD PIERWSZEGO BUILD'A

Blockchain implementuj OD RAZU.

Środowisko development:

**Base Sepolia**

CHAIN\_ID:

84532

Produkcja:

**Base Mainnet**

CHAIN\_ID:

8453

Cała konfiguracja sieci musi znajdować się poza gameplay code.

Przykład:

NETWORK\_ENV=testnet

lub:

BLOCKCHAIN\_NETWORK=base-sepolia

Konfiguracja:

chainId
rpcUrl
explorerUrl
contractAddresses
supportedTokens
marketplaceAddress
landContractAddress
propertyContractAddress

---

# 7. TESTNET -> MAINNET

Przełączenie na Mainnet NIE może wymagać zmian w kodzie gameplay.

Powinno wymagać:

zmiany konfiguracji ENV

-

deploymentu kontraktów

-

ustawienia nowych contract addresses.

Przygotuj:

.env.development

.env.testnet

.env.production

Przykład:

BASE\_CHAIN\_ID

BASE\_RPC\_URL

BASE\_EXPLORER

LAND\_CONTRACT

PROPERTY\_CONTRACT

MARKETPLACE\_CONTRACT

PAYMENT\_ROUTER

NFT\_CONTRACT

TREASURY\_ADDRESS

---

# 8. CONTRACT ADDRESS REGISTRY

Stwórz centralny:

ContractRegistry

Frontend NIE może posiadać hardcoded contract addresses w wielu plikach.

Wszystkie adresy powinny pochodzić z jednej konfiguracji.

---

# 9. BLOCKCHAIN PROVIDER

Na development można korzystać z Base Sepolia RPC.

Architektura musi jednak pozwalać użyć produkcyjnego RPC providera.

Nie uzależniaj całego projektu od jednego providera.

Implementuj fallback / provider abstraction.

---

# 10. WALLET

Obsłuż:

Base Account / nowoczesny Base-compatible wallet flow

oraz standardowe EVM wallets.

Przykładowe możliwości:

Sign in with Base
wallet connection
passkey compatible account
MetaMask
WalletConnect-compatible wallets

Przed implementacją sprawdź aktualną oficjalną dokumentację Base.

Nie używaj przestarzałych bibliotek tylko dlatego, że znajdują się w pamięci modelu.

---

# 11. WEB2 + WEB3 ACCOUNT

Gracz może mieć konto gry bez portfela.

User:

email
username
character

Wallet jest do niego przypisywany.

Tabela:

UserWallet

userId
walletAddress
chainId
verified
createdAt

Powiązanie portfela wymaga podpisania challenge.

Nie uznawaj samego przesłania address za dowód własności.

---

# 12. SIGNATURE AUTHENTICATION

Proces:

backend generuje nonce

↓

frontend prosi użytkownika o podpis

↓

backend sprawdza signature

↓

wallet zostaje powiązany z kontem.

Nonce:

jednorazowe
krótkotrwałe
usuwane po użyciu.

---

# 13. LAND SYSTEM

Jednym z głównych systemów Trash Panda United ma być:

# LAND OWNERSHIP

Świat dzieli się na działki.

Każda działka posiada:

landId
regionId
x
y
width
height
rarity
terrainType
owner
price
status
buildingSlots
resourceModifier
metadata

---

# 14. LAND NFT

Każda kupiona działka może być reprezentowana jako:

ERC-721 LAND NFT.

NFT oznacza ownership działki.

Nie mintuj NFT dla niekupionej ziemi bez potrzeby.

Przy zakupie można:

mintować LAND NFT

lub

transferować już utworzony parcel NFT.

Wybierz architekturę najbardziej efektywną kosztowo.

---

# 15. LAND PARCELS

Działki występują w różnych rozmiarach.

Przykład:

Small Plot

16x16

Medium Plot

32x32

Large Plot

64x64

Estate

128x128.

Rozmiary dostosuj do mapy gry.

---

# 16. LAND RARITY

Typy:

COMMON

RARE

EPIC

LEGENDARY.

Rarity może wynikać między innymi z:

- lokalizacji,
- wielkości,
- bliskości miasta,
- surowców,
- atrakcyjności terenu.

Nie może jednak automatycznie oznaczać ekstremalnej przewagi combatowej.

---

# 17. LAND MAP

Stwórz interaktywną mapę dostępnych działek.

Kolory/statusy:

AVAILABLE

OWNED

LISTED

NOT FOR SALE

PUBLIC

SYSTEM.

Kliknięcie działki:

parcel number
region
size
owner
price
build slots
history.

Przycisk:

BUY LAND.

---

# 18. KUPOWANIE DZIAŁEK ZA CRYPTO

Użytkownik może kupować działki kryptowalutami.

Na początek obsłuż:

native ETH na Base

oraz

konfigurowalne ERC-20.

Przygotuj allowlistę tokenów.

Np.:

ETH

USDC

oraz później:

$TPU.

Nie hardcoduj adresów tokenów.

Adresy tokenów muszą być osobne dla:

testnet

oraz:

mainnet.

---

# 19. PAYMENT ROUTER

Stwórz:

PaymentRouter smart contract.

Powinien obsługiwać:

native currency payments

oraz:

allowlisted ERC20.

Przykład:

buyLand()

buyProperty()

buyMarketplaceItem().

---

# 20. PRICE SYSTEM

Cena działki może być ustalana:

w ETH

lub w określonym ERC20.

Każdy listing posiada:

currency

price.

Nie dokonuj niewidocznej konwersji kursów.

Gracz przed transakcją dokładnie widzi:

ITEM PRICE

NETWORK

CURRENCY

ESTIMATED GAS

TOTAL.

---

# 21. LAND PURCHASE

Proces:

SELECT LAND

↓

VIEW DETAILS

↓

CONNECT WALLET

↓

CONFIRM PRICE

↓

APPROVE TOKEN

jeżeli ERC20

↓

BUY

↓

TRANSACTION PENDING

↓

CONFIRMATION

↓

NFT OWNERSHIP UPDATE

↓

GAME DATABASE SYNC

↓

LAND BECOMES OWNED.

---

# 22. DOMY

Na działkach gracze mogą budować:

Small Shack

Scrap House

Neon Apartment

Workshop

Garage

Trading Post

Cyber Villa

Clan Headquarters.

---

# 23. PROPERTY SYSTEM

Dom posiada:

propertyId
landId
ownerId
buildingType
level
storageSlots
craftingSlots
decorationSlots
createdAt.

Dom jest powiązany z działką.

---

# 24. BUILDING

Budowanie wymaga:

in-game materials

-

Scrap

i w wybranych przypadkach opcjonalnie komponentów premium.

Nie wymagaj kryptowaluty do każdej podstawowej konstrukcji.

---

# 25. HOUSE NFT

W przypadku wartościowych / handlowalnych budynków przygotuj możliwość tokenizacji.

Property może być reprezentowane przez:

ERC-721

lub system powiązania właściwości z LAND NFT.

Najpierw zaprojektuj rozwiązanie tak, aby nie powodować problemów, gdy LAND zmienia właściciela.

Nie twórz dwóch niezależnych ownership systems mogących sobie przeczyć.

---

# 26. PROPERTY OWNERSHIP

Najbezpieczniejszy model:

LAND jest głównym aktywem.

Budynki są częścią stanu działki.

Przy sprzedaży działki system jasno określa, które budynki i ulepszenia przechodzą na kupującego.

Informacja musi zostać wyświetlona PRZED sprzedażą.

---

# 27. PLAYER HOUSING

Gracz może wejść na swoją działkę.

Może:

budować
przesuwać obiekty
dekorować
craftować
przechowywać przedmioty
zapraszać graczy.

Tryby:

PRIVATE

FRIENDS

GUILD

PUBLIC.

---

# 28. BUILD MODE

Po wejściu w:

BUILD MODE

pokaż grid.

Gracz wybiera obiekt.

Może:

place
rotate
move
remove.

Backend sprawdza:

ownership
collision
building slots
required resources.

---

# 29. UPGRADES

Budynki mogą mieć poziomy.

Przykład:

Workshop LVL 1

↓

Workshop LVL 2

↓

Workshop LVL 3.

Upgrade może zwiększać:

crafting speed
recipe access
storage.

Nie buduj agresywnego pay-to-win.

---

# 30. LAND RESOURCES

Wybrane działki mogą posiadać zasoby.

Przykład:

Scrap Deposit

Water

Energy

Chemicals

Rare Components.

Produkcja musi posiadać limity.

Nie twórz systemu:

kup NFT -> nieskończenie drukuj tokeny.

---

# 31. IN-GAME ECONOMY

Ekonomia gry posiada kilka warstw.

## OFF-CHAIN

Scrap

Podstawowa waluta gameplayowa.

## ON-CHAIN

ETH

USDC

future $TPU.

## ASSETS

LAND

cosmetics

collectibles

selected items.

---

# 32. SCRAP

Scrap zdobywa się:

questing
combat
dungeons
selling loot
crafting orders
events.

Scrap wydaje się:

repairs
crafting
NPC shops
housing
upgrades
travel
fees.

Potrzebne są:

currency sources

oraz:

currency sinks.

---

# 33. ECONOMY BALANCING

Stwórz panel ekonomii.

Admin musi widzieć:

Scrap generated / day

Scrap spent / day

average balance

items generated

items destroyed

marketplace volume

land volume

active listings.

---

# 34. FUTURE $TPU TOKEN

Przygotuj system na:

$TPU

ale implementacja musi być aktywowana feature flagiem.

TOKEN\_ENABLED=false

na początku, chyba że istnieje już kontrakt tokena.

Nie wymyślaj sztucznego tokena wyłącznie po to, aby zwiększyć liczbę elementów Web3.

---

# 35. MARKETPLACE

Marketplace jest obowiązkowy OD PIERWSZEJ WERSJI WEB3.

Kategorie:

LAND

PROPERTIES

SKINS

WEAPONS

ARMOR

PETS

COLLECTIBLES.

---

# 36. MARKETPLACE TRANSACTIONS

Obsłuż:

LIST

BUY

CANCEL

MAKE OFFER

ACCEPT OFFER.

Dla MVP:

LIST

BUY

CANCEL

są obowiązkowe.

---

# 37. LAND MARKETPLACE

Osobna sekcja:

# LAND MARKET

Filtry:

Region
Price
Currency
Size
Rarity
Available
For Sale.

Sortowanie:

Lowest Price
Highest Price
Newest
Largest.

---

# 38. SECONDARY SALES

Gracz może sprzedać swoją działkę innemu graczowi.

Proces:

OWNER

↓

LIST PROPERTY

↓

SET PRICE

↓

SIGN / CONFIRM

↓

LISTING CREATED

↓

BUYER PURCHASE

↓

PAYMENT

↓

NFT TRANSFER

↓

DATABASE SYNC.

---

# 39. MARKETPLACE FEE

Przygotuj konfigurowalny:

marketplace fee.

Przykładowo:

MARKETPLACE\_FEE\_BPS

Nie hardcoduj procentu.

Treasury address w ENV/config.

---

# 40. TREASURY

Nie umieszczaj prywatnego klucza treasury w frontendzie.

Treasury:

address only.

Jeżeli backend wykonuje operacje uprzywilejowane:

użyj bezpiecznego secret management.

---

# 41. WEB3 TRANSACTION STATUS

UI musi pokazywać:

Waiting for wallet

Transaction submitted

Pending

Confirmed

Failed.

Nie pokazuj:

"SUCCESS"

zanim blockchain faktycznie potwierdzi transakcję.

---

# 42. BLOCK EXPLORER

Po transakcji:

VIEW TRANSACTION

otwiera odpowiedni explorer:

Base Sepolia

lub

Base Mainnet

zgodnie z aktualną konfiguracją.

---

# 43. BLOCKCHAIN INDEXER

Nie odpytuj chaina przy każdym renderze UI.

Stwórz:

Blockchain Indexer / Sync Service.

Nasłuchuje wydarzeń:

LandPurchased

LandTransferred

ListingCreated

ListingCancelled

ItemPurchased

PropertyUpdated.

Synchronizuje dane do PostgreSQL.

Blockchain pozostaje źródłem prawdy dla własności aktywa on-chain.

DB jest zoptymalizowaną projekcją do szybkiej gry.

---

# 44. EVENT PROCESSING

Każdy event zapisuj z:

chainId
contractAddress
transactionHash
blockNumber
logIndex.

Wprowadź idempotency.

Ten sam event nie może zostać zapisany dwukrotnie.

---

# 45. REORG HANDLING

Indexer musi posiadać możliwość obsługi:

block confirmations

oraz potencjalnych chain reorgs.

Nie zakładaj natychmiastowej finalności.

---

# 46. SMART CONTRACTS

Przygotuj osobny workspace:

/packages/contracts

Preferowane narzędzia:

Solidity

-

Foundry

lub Hardhat, jeżeli cały projekt już na nim bazuje.

Nie mieszaj dwóch frameworków bez potrzeby.

---

# 47. CONTRACTS

Przygotuj przynajmniej:

TrashPandaLand.sol

TrashPandaAssets.sol

TrashPandaMarketplace.sol

TrashPandaPaymentRouter.sol.

Opcjonalnie:

TrashPandaProperty.sol.

---

# 48. LAND CONTRACT

LAND contract:

ERC-721.

Funkcje:

mintLand()

ownerOf()

transferFrom()

safeTransferFrom().

Dodaj:

AccessControl

Pausable

oraz poprawne permissions.

---

# 49. MARKETPLACE CONTRACT

Marketplace musi poprawnie obsługiwać:

seller

buyer

asset

tokenId

currency

price

fee

treasury.

Nie implementuj systemu pozwalającego adminowi zabrać cudzy NFT.

---

# 50. PAYMENT SECURITY

ERC20:

użyj SafeERC20.

Uwzględnij:

approval

allowance

transferFrom.

Native ETH:

poprawna obsługa msg.value.

Zabezpiecz:

reentrancy

double purchase

stale listing

wrong owner

zero address

invalid price.

---

# 51. CONTRACT TESTS

Testuj:

mint land

purchase

listing

cancel

transfer

marketplace fee

ERC20 payments

ETH payments

unauthorized actions

double purchase

invalid listing

paused contract.

---

# 52. BASE SEPOLIA DEPLOYMENT

Po przygotowaniu kontraktów agent ma NATYCHMIAST przygotować deployment na:

Base Sepolia.

Stwórz:

deploy scripts

verify scripts

deployment JSON.

Przykład:

/deployments/base-sepolia.json

oraz:

/deployments/base-mainnet.json.

---

# 53. DEPLOYMENT FILE

Przechowuj:

network
chainId
deployedAt
deployer
contracts.

Każdy contract:

address
deploymentTx
version.

---

# 54. MAINNET SAFETY

Mainnet musi posiadać osobny proces deploymentu.

Nie wolno przypadkiem wykonać Mainnet deploy podczas development.

Wymagaj:

NETWORK=base-mainnet

-

osobnego potwierdzenia/config guard.

---

# 55. NETWORK INDICATOR

Cały interface developmentowy musi pokazywać:

BASE SEPOLIA

np. przy wallet button.

Użytkownik musi jasno wiedzieć, że korzysta z testnetu.

---

# 56. FAUCET / TEST MODE

W testnecie dodaj sekcję:

GET TEST FUNDS

prowadzącą użytkownika do aktualnie dostępnego oficjalnego lub rekomendowanego Base Sepolia faucet.

Nie twórz własnego fauceta bez potrzeby.

---

# 57. CYBERPUNK WALLET UI

Wallet window ma wyglądać jak element gry.

Przykład:

┌─────────────────────────────┐
│ WALLET // CONNECTED │
│ │
│ 0x71...A92 │
│ BASE SEPOLIA │
│ │
│ ETH 0.421 │
│ USDC 120.00 │
│ │
│ [ASSETS] [ACTIVITY] │
└─────────────────────────────┘

W pixel/cyberpunk stylistyce.

---

# 58. LAND TERMINAL

Marketplace ziemi może wyglądać jak futurystyczny terminal.

Nagłówek:

PROPERTY NETWORK // TRASH TOWN

Pokazuj pixelową mapę z parcelami.

---

# 59. GAME + WEBSITE TRANSITION

PLAY NOW nie może przenosić użytkownika do zupełnie innej stylistycznie aplikacji.

Landing:

pixel cyberpunk.

Gra:

pixel cyberpunk.

Inventory:

pixel cyberpunk.

Marketplace:

pixel cyberpunk.

Wallet:

pixel cyberpunk.

Admin może być bardziej funkcjonalny, ale nadal stylistycznie związany z marką.

---

# 60. ECONOMY PAGE

Landing page musi posiadać:

# ECONOMY

Wyjaśniające:

SCRAP

LAND

MARKETPLACE

CRAFTING

PLAYER TRADE

OWNERSHIP.

Nie skupiaj marketingu wyłącznie na zarabianiu.

Gra ma być prezentowana jako świat online z ekonomią graczy.

---

# 61. LAND PAGE

Osobna publiczna strona:

/land

Powinna pokazywać:

interactive map

owned parcels

available parcels

floor prices

regions

land information.

---

# 62. MARKETPLACE PAGE

/marketplace

Kategorie:

ALL

LAND

PROPERTY

WEAPONS

SKINS

PETS

COLLECTIBLES.

---

# 63. PLAYER PROFILE

/profile/[username]

Pokazuj:

character

level

guild

achievements

public cosmetics

owned land — jeżeli gracz oznaczy ownership jako publiczne.

Nie wyświetlaj danych prywatnych.

---

# 64. OWNED LAND DASHBOARD

MY LAND.

Gracz widzi:

Owned parcels

Buildings

Value / purchase history

Permissions

Visitors

Marketplace status.

Przycisk:

ENTER LAND

BUILD

SELL

MANAGE.

---

# 65. LAND VISITING

Gracz może odwiedzać publiczne działki innych osób.

Daje to podstawę pod:

shops

guild bases

social hubs

player cities.

---

# 66. PLAYER SHOPS

W przyszłości właściciel land może postawić:

Trading Post.

Może wystawiać tam towary.

Przygotuj architekturę danych teraz, nawet jeśli pełny system sklepu będzie implementowany później.

---

# 67. WORLD ECONOMY

Regiony mogą posiadać różne zapotrzebowanie na:

resources

items

crafting materials.

W przyszłości może to stworzyć realną gospodarkę graczy.

Nie implementuj sztucznego dynamicznego marketu bez kontroli admina.

---

# 68. NO PAY TO WIN

Zakup land nie może oznaczać:

"zapłać najwięcej i wygrywaj PvP".

Land powinien oferować:

social

building

crafting

storage

commerce

customization

status

guild functionality.

Combat balance musi pozostać przede wszystkim gameplay-driven.

---

# 69. GENESIS LAND

Przygotuj możliwość utworzenia limitowanej kolekcji:

GENESIS LAND.

Nie uruchamiaj jej na mainnet automatycznie.

Admin określa:

supply

regions

parcel ids

sale status

prices.

---

# 70. LAND SALE ADMIN

Admin panel:

LAND MANAGEMENT.

Admin może:

create parcels

disable parcels

set initial sale price

set accepted currency

preview parcel

open sale

pause sale.

Wszystkie działania wpływające na blockchain muszą wymagać odpowiednich permissions.

---

# 71. WORLD EDITOR DATA

Mapy muszą korzystać ze wspólnego systemu:

World Region

↓

Parcel

↓

Tile

↓

Building.

Dzięki temu ownership land będzie faktycznie powiązany ze światem gry.

Nie twórz LAND jako osobnej tabeli bez związku z mapą.

---

# 72. REAL LAND BOUNDARIES

W grze działki mają być widoczne.

W build mode pokaż granice działki.

Gracz NIE może budować poza swoim terenem.

Server validates:

parcel bounds.

---

# 73. OWNERSHIP CHECK

Przy wejściu do BUILD MODE backend sprawdza aktualnego właściciela.

Dla aktywów on-chain ownership musi zostać zweryfikowany z zsynchronizowanym stanem blockchain.

---

# 74. OFFCHAIN / ONCHAIN SYNCHRONIZATION

Nigdy nie wykonuj każdej akcji budowania jako transakcji blockchain.

On-chain:

ownership.

Off-chain:

building position

decorations

storage

NPC configuration

building progress.

To zapewni płynną rozgrywkę.

---

# 75. EKONOMIA — TRANSACTION HISTORY

Gracz powinien widzieć historię:

PURCHASES

SALES

CRAFTING

LAND

MARKETPLACE.

Oddziel:

GAME TRANSACTIONS

od:

BLOCKCHAIN TRANSACTIONS.

---

# 76. SECURITY

Nigdy nie:

request seed phrase

store private key

log signed secret

auto-approve unlimited token spending bez wyjaśnienia.

Approval UI musi jasno pokazywać co użytkownik zatwierdza.

Preferuj minimalne wymagane allowance tam, gdzie UX na to pozwala.

---

# 77. CONTRACT OWNERSHIP

Admin privileges muszą być minimalne.

Preferuj:

role-based permissions

multisig-ready ownership

timelock-ready upgrades

dla przyszłego production deployment.

Testnet może używać dev walleta, ale architektura musi przewidywać bezpieczną produkcję.

---

# 78. UPGRADEABILITY

Nie używaj proxy tylko dlatego, że "Web3 project powinien mieć proxy".

Najpierw oceń potrzebę upgradeability.

Jeżeli contracts będą upgradeable:

dokładnie dokumentuj:

proxy

implementation

admin

upgrade permissions.

---

# 79. CONTRACT VERSIONING

Każdy deployment:

version.

Przykład:

Land v1.0.0

Marketplace v1.0.0.

Backend musi wiedzieć, którego contract deploymentu używa.

---

# 80. DEVELOPMENT SEED

Na Base Sepolia przygotuj testowy world seed.

Przykład:

100 parcels.

Z tego:

60 available

20 system

10 reserved

10 test-owned.

Dzięki temu marketplace i land map można testować od razu.

---

# 81. TESTNET MARKETPLACE

Na Base Sepolia musi być możliwe faktyczne:

connect wallet

buy test land

mint NFT

list land

buy land from another wallet

transfer NFT

see transaction

enter purchased parcel.

To jest obowiązkowy END-TO-END FLOW.

---

# 82. END-TO-END TEST

Stwórz test:

Wallet A

↓

buys LAND #15

↓

LAND #15 belongs to Wallet A

↓

Wallet A lists LAND #15

↓

Wallet B buys LAND #15

↓

payment transferred

↓

marketplace fee transferred

↓

NFT transferred

↓

backend detects event

↓

database updates owner

↓

game shows Wallet B as owner

↓

Wallet B enters build mode.

Jeżeli którykolwiek element nie działa, LAND SYSTEM nie jest ukończony.

---

# 83. STRUKTURA

Projekt:

/apps

/web
/game
/server
/admin
/indexer

/packages

/contracts
/blockchain
/game-core
/shared
/ui
/config
/database

/deployments

/base-sepolia.json
/base-mainnet.json

/docs

GAME\_DESIGN.md
BLOCKCHAIN.md
LAND\_SYSTEM.md
ECONOMY.md
CONTRACTS.md
DEPLOYMENT.md
SECURITY.md

---

# 84. DOCKER

Przygotuj development poprzez Docker Compose dla:

PostgreSQL

Redis

backend

indexer.

Gra/web mogą działać przez lokalny dev server.

---

# 85. LOCAL DEVELOPMENT

Jedną komendą powinno być możliwe uruchomienie core infrastructure.

Przykład:

docker compose up -d

-

pnpm dev.

Utwórz root scripts.

---

# 86. MONOREPO

Preferuj:

pnpm workspace

-

Turborepo

jeżeli projekt rozpoczynany jest od zera.

Nie przebudowuj istniejącego projektu na monorepo tylko dla samego trendu, jeżeli spowoduje to niepotrzebne problemy.

---

# 87. REAL IMPLEMENTATION

Agent ma implementować funkcje, nie tylko wygenerować komponenty.

Przycisk:

BUY LAND

musi kończyć się prawdziwą transakcją Base Sepolia.

CONNECT WALLET:

musi łączyć wallet.

MARKETPLACE:

musi odczytywać prawdziwe listingi.

LAND OWNER:

musi odpowiadać ownership kontraktu.

VIEW TX:

musi wskazywać prawdziwy transaction hash.

---

# 88. NIE UŻYWAJ FAKE BLOCKCHAIN

Zakazane:

fake wallet balance

random transaction hash

fake NFT

setTimeout udający blockchain

hardcoded ownership

localStorage ownership.

Testnet oznacza prawdziwy Base Sepolia.

---

# 89. ERROR STATES

Obsłuż:

wallet rejected

wrong network

insufficient balance

insufficient allowance

RPC unavailable

transaction reverted

transaction pending

listing expired

item already sold

network changed.

Każdy error musi dawać użytkownikowi zrozumiałą informację.

---

# 90. WRONG NETWORK

Jeżeli wallet jest na złej sieci:

pokaż:

SWITCH TO BASE SEPOLIA.

Na produkcji:

SWITCH TO BASE.

Nigdy nie pozwalaj wysłać transakcji do przypadkowej sieci.

---

# 91. LANDING LIVE STATS

Landing może pokazywać:

Players

Land owned

Marketplace listings

Transactions.

Dane muszą pochodzić z API.

Nie umieszczaj fake counters.

Jeżeli brak danych:

pokaż prawdziwe zero albo ukryj sekcję.

---

# 92. PIXEL UI SYSTEM

Stwórz wspólny design system.

Komponenty:

PixelButton

PixelWindow

PixelCard

CyberPanel

GameTooltip

StatBadge

WalletPanel

LandCard

MarketCard

DialogWindow.

---

# 93. TYPOGRAPHY

Nagłówki mogą korzystać z czytelnego pixel font.

Dłuższy tekst musi być czytelny.

Nie używaj maleńkiego pixel fontu do całego UI.

---

# 94. EFFECTS

Wykorzystaj:

CRT scanlines — bardzo subtelnie

pixel glow

neon

glitch

screen noise

animated borders.

Nie przesadzaj.

Gameplay i tekst muszą pozostać czytelne.

---

# 95. PERFORMANCE LANDING PAGE

Pomimo animacji landing musi być szybki.

Lazy loaduj ciężkie elementy.

Respect:

prefers-reduced-motion.

Nie renderuj niepotrzebnie całej mapy świata w pełnej jakości poza viewport.

---

# 96. MOBILE LANDING

Landing musi być w pełni responsywny.

Mobile:

hamburger menu

wallet button

PLAY NOW

land cards

marketplace.

---

# 97. PIERWSZY MILESTONE

Pierwszy duży milestone projektu NIE może być zwykłym mockupem.

Ma zawierać:

1. Pixel cyberpunk landing page.
2. Register/Login.
3. Character creation.
4. Playable Trash Town.
5. Movement.
6. Combat.
7. Inventory.
8. Quest.
9. PostgreSQL save.
10. Wallet connection.
11. Base Sepolia configuration.
12. Deployed LAND contract.
13. Interaktywną mapę działek.
14. Zakup działki na Base Sepolia.
15. LAND NFT.
16. Blockchain indexer.
17. My Land.
18. Podstawowy build mode.
19. Marketplace land.
20. Admin panel.

---

# 98. PRIORYTET IMPLEMENTACJI

Pracuj w tej kolejności:

## PHASE 0 — FOUNDATION

monorepo
database
auth
config
docker
design system.

## PHASE 1 — LANDING

pixel cyberpunk website
responsive UI
animations
game branding.

## PHASE 2 — GAME CORE

map
character
movement
camera
collision
combat.

## PHASE 3 — RPG

inventory
items
loot
quests
NPC.

## PHASE 4 — BASE

wallet
Base Sepolia
contracts
deployment
transaction UI.

## PHASE 5 — LAND

parcel map
LAND NFT
land sale
My Land
ownership sync.

## PHASE 6 — HOUSING

build mode
houses
storage
permissions.

## PHASE 7 — ECONOMY

Scrap
shops
crafting
resources
sinks/sources.

## PHASE 8 — MARKETPLACE

land listing
purchase
cancel
player trade.

## PHASE 9 — MULTIPLAYER

presence
party
chat
land visiting.

## PHASE 10 — PRODUCTION PREP

tests
audit preparation
monitoring
production RPC
Base Mainnet config.

---

# 99. WAŻNE — NIE ODKŁADAJ WEB3

Poprzednia zasada:

"nie zaczynaj blockchaina przed ukończeniem gry"

zostaje ANULOWANA.

Nowa zasada:

**GAME CORE I WEB3 FOUNDATION ROZWIJAJ RÓWNOLEGLE.**

Po podstawowym movement/combat musi już działać Base Sepolia.

Nie pozostawiaj blockchain integration jako:

TODO

future feature

phase someday.

---

# 100. MAINNET READY

Projekt musi być od początku przygotowany do:

Base Sepolia

↓

security testing

↓

contract tests

↓

external review / audit przed obsługą realnej wartości

↓

Base Mainnet.

Kod aplikacji nie może wymagać przebudowy przy migracji.

Zmieniają się głównie:

network configuration

RPC

contract deployment

contract addresses

token addresses

explorer.

---

# 101. DEFINITION OF DONE — WEB3

Web3 uważa się za działający dopiero, kiedy można:

uruchomić stronę

↓

założyć konto

↓

uruchomić grę

↓

podłączyć wallet

↓

przełączyć się na Base Sepolia

↓

otworzyć LAND MAP

↓

wybrać działkę

↓

zapłacić testnet crypto

↓

otrzymać LAND NFT

↓

zobaczyć transaction hash

↓

zobaczyć działkę w MY LAND

↓

wejść na nią postacią

↓

postawić budynek

↓

wystawić działkę

↓

kupić ją drugim wallet

↓

zobaczyć zmianę właściciela w grze.

To jest podstawowy wymagany przepływ produktu.

---

# 102. FINALNA WIZJA

Trash Panda United ma być połączeniem:

**PIXEL MMORPG**

-

**CYBERPUNK POST-APOCALYPTIC WORLD**

-

**PLAYER OWNED LAND**

-

**HOUSING**

-

**CRAFTING**

-

**PLAYER ECONOMY**

-

**BASE BLOCKCHAIN**

-

**NFT OWNERSHIP**

-

**CRYPTO MARKETPLACE**

-

**SOCIAL ONLINE WORLD**

Blockchain ma zapewniać własność i handel.

Gameplay ma zapewniać powód, dla którego ludzie chcą tę własność posiadać.

Land nie może być tylko NFT widocznym w wallet.

Gracz musi móc wejść na swoją ziemię, budować na niej, rozwijać ją, zapraszać innych graczy, używać jej jako domu, warsztatu, sklepu lub siedziby gildii.

Najważniejszy cel:

**stworzyć prawdziwy grywalny świat, w którym blockchain Base stanowi działającą warstwę własności cyfrowego świata.**

---

# INSTRUKCJA DLA AGENTA — START

Po otrzymaniu tego promptu nie odpowiadaj jedynie opisem rozwiązania.

Jeżeli masz dostęp do repozytorium:

PRZEJDŹ DO IMPLEMENTACJI.

Najpierw:

1. przeanalizuj obecny projekt,
2. uruchom go,
3. sprawdź build,
4. sprawdź strukturę,
5. zachowaj działające elementy,
6. przygotuj brakującą architekturę.

Następnie rozpocznij implementację:

LANDING PAGE

-

GAME CORE

-

BASE SEPOLIA FOUNDATION.

Przed użyciem Base SDK, wallet SDK, RPC, token addresses lub deployment configuration sprawdź aktualną oficjalną dokumentację.

Nie opieraj implementacji na nieaktualnych tutorialach.

Po każdym etapie uruchamiaj:

build

lint

typecheck

tests.

Nie zgłaszaj ukończenia funkcji, której nie można faktycznie użyć.

Nie kończ pracy na samym UI.

Celem jest działający:

# TRASH PANDA UNITED

## PLAY. BUILD. OWN. TRADE. SURVIVE.