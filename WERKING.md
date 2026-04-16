# VLV Tech Pack Builder v2 - Systeem & Werking Documentatie

Dit document beschrijft de technische architectuur, de datastroom en de werking van de VLV Tech Pack applicatie. Het is ontworpen als vangnet, mochten er later aanpassingen nodig zijn of bugs optreden.

## 1. Technologische Stack

De applicatie is gebouwd met moderne, schaalbare webtechnologieën:
- **Framework:** Next.js 16 (App Router)
- **State Management:** Zustand (`useTechPackStore`, `useDataStore`, `useUIStore`)
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS met `framer-motion` voor animaties en `lucide-react` voor iconen.
- **PDF Generatie:** `@react-pdf/renderer` (volledig client-side).

---

## 2. Architectuur & Componenten

### 2.1 Hoofdlagen van de applicatie
De app bestaat uit de volgende hoofdlagen:
1. **PWA & Layout (`Shell.tsx`)**: Het globaal omhulsel van de app. Beheert de Sidebar, de navigatiestatus en globale modals (zoals de `CollectionModal` en `DataManagement` pop-ups).
2. **Dashboard (`Dashboard.tsx`)**: Zichtbaar wanneer er **geen** product of artikel geselecteerd is. Hier kunnen collecties en artikelen worden aangemaakt, gedupliceerd of verwijderd.
3. **Wizard Engine (`WizardEngine.tsx`)**: De motor van het systeem. Zodra je in het Dashboard een product selecteert, verbergt het Dashboard zich en neemt de Wizard Engine het over. Dit laadt dynamisch `Step1` t/m `Step8`.

### 2.2 Opslaglaag (Supabase & Zustand)
In plaats van React `useState` prop-drilling, leeft alle data centraal in **Zustand** stores in de map `src/store/`:
- `useDataStore.ts`: Bevat alle Supabase logica (fetches, inserts, updates) en bewaart de ruwe datalijsten (`collections`, `organization`, `user`).
- `useUIStore.ts`: Bewaart welke schermen open staan (`isSettingsOpen`, `activeStep`, navigatie ID's). Dit controleert letterlijk wat de gebruiker op zijn scherm ziet.

---

## 3. Belangrijke Workflows

### 3.1 Caching & Incognito Beveiliging
Om te voorkomen dat de app crasht in 'strikte omgevingen' zoals Safari Incognito (waar `localStorage` geblokkeerd wordt), hebben we een **safeStorage wrapper** gebouwd (`src/lib/supabase.ts`). Als een browser de opslag blokkeert, valt het systeem terug op werkgeheugen (`inMemoryStorage`) en boot de site foutloos op.

### 3.2 Product Creatie & Wizard Stappen
Wanneer een product wordt geopend, krijgt de `WizardEngine` de variabelen `activeCollectionId` en `activeArticleId`. 
- Gegevens worden aangepast via het aanroepen van `updateProduct(collectionId, productId, { veld: waarde })`.
- Bij elke typering of wijziging verstuurt Zustand de data direct naar de component en markeert een 'SaveStatus' balkje bovenaan.
- **Rule of Hooks Beveiliging:** Zorg dat binnen de `StepX` bestanden (zoals `page.tsx` en `Step1Basis`) *alle* hooks (zoals `useDataStore`) áltijd strak bovenaan gedeclareerd staan, en nooit gepauzeerd worden achter een `if()`-statement.

### 3.3 Afbeeldingen & Opslag
- In **Stap 2 (Afbeeldingen)** worden bestanden klaargemaakt. 
- Componenten uploaden afbeeldingen via `uploadProductImage` rechtstreeks naar de `tech-pack-assets` bucket in Supabase en vervangen het object daarna met de openbare `public_url`.
- Let op: Oude data of lege velden worden lokaal via memory-caching opgeroepen om traagheid te voorkomen.

### 3.4 De PDF Generator (`TechPackDocument.tsx`)
In **Stap 8 (Export / Controle)** roepen we `@react-pdf/renderer` aan. 
- Het bestand `src/components/pdf/TechPackDocument.tsx` 'schildert' visueel het text-document. 
- Het haalt zijn informatie *direct* uit `activeArticle`.
- **Veiligheid:** We gebruiken uitgebreid `safeText()` abstracties. Als er per ongeluk data mist (zoals een lege prijs of geen foto), tekent de PDF gewoon veilig een witruimte in plaats van de webpagina te laten crashen.

---

## 4. Rollen en Beveiliging (RLS)

### 4.1 RLS (Row Level Security)
Supabase beveiligt wie wat mag zien:
- Een gebruiker moet behoren tot een organisatie (gekoppeld via `organization_members`).
- `Dashboard.tsx` en state managers filteren queries automatisch op `organization_id`.
- Als een gebruiker zich aanmeldt zonder organisatie, draait onder de motorkap de abstractie `repairOrganization()` om dit in database stilzwijgend te repareren zodat hij nooit geblokkeerd raakt.

### 4.2 Bevoegdheden
Binnen de applicatie kijken componenten naar `userRole`:
- `admin`: Mag data exporteren, collecties aanmaken en instellingen beheren.
- `viewer`: Knopklikken worden gedisabled ("grijs gemaakt"), PDF export toont een slotje en tekstvelden zijn read-only. We controleren dit op simpele wijzen zoals `disabled={isViewer}` op componenten.

---

## 5. Hoe verder ontwikkelen?

Als je in de toekomst velden wilt toevoegen:
1. Controleer `src/types/tech-pack.ts` om TypeScript de namen van de nieuwe velden te leren als die strict zijn.
2. Voeg in de juiste `<StepX>` een veld toe, bijvoorbeeld met de standaard `Input` componenten.
3. Koppel de `onChange` direct aan `updateProduct(colId, productId, { nieuwVeld: value })`.
4. Zet het visueel in het PDF formulier (`TechPackDocument.tsx`) als je wil dat de fabrikant het ook leest.

> Dit systeem is robuust ontworpen, maar React vereist discipline in hoe je objecten afleest en opslaat. Raadpleeg dit document bij toekomstige uitbreidingen om de basispatronen niet te verbreken!
