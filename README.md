# VLV Tech Pack Builder v2
### Cross-Platform Desktop App — Setup & Deployment Guide

> **Vive le Vélo** | Intern gebruik — niet publiek distribueren

---

## Inhoudsopgave

1. [Vereisten](#1-vereisten)
2. [Supabase instellen](#2-supabase-instellen)
3. [Environment variabelen](#3-environment-variabelen)
4. [Project installeren](#4-project-installeren)
5. [Lokaal ontwikkelen](#5-lokaal-ontwikkelen)
6. [Builden voor Windows & macOS](#6-builden-voor-windows--macos)
7. [Socket.IO server deployen](#7-socketio-server-deployen)
8. [Eerste login & gebruikersbeheer](#8-eerste-login--gebruikersbeheer)
9. [Probleemoplossing](#9-probleemoplossing)

---

## 1. Vereisten

Zorg dat de volgende software geïnstalleerd is voordat je begint:

| Software | Minimum versie | Download |
|---|---|---|
| **Node.js** | v20 LTS | [nodejs.org](https://nodejs.org) |
| **npm** | v10 | Meegeleverd met Node.js |
| **Git** | v2.40 | [git-scm.com](https://git-scm.com) |
| **Supabase account** | — | [supabase.com](https://supabase.com) |

> **macOS extra:** Xcode Command Line Tools zijn vereist voor de Electron build.
> Installeer via: `xcode-select --install`
>
> **Windows extra:** Installeer [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (selecteer "Desktop development with C++").

---

## 2. Supabase instellen

### 2.1 Nieuw project aanmaken

1. Ga naar [supabase.com](https://supabase.com) en log in.
2. Klik op **"New project"**.
3. Kies een naam (bijv. `vlv-tech-pack`), regio (**West Europe**) en een sterk wachtwoord.
4. Wacht tot het project klaar is (~2 minuten).

### 2.2 Database schema uitvoeren

1. Ga in je Supabase dashboard naar **SQL Editor**.
2. Klik op **"New query"**.
3. Open het bestand `supabase/schema.sql` uit dit project.
4. Plak de volledige inhoud in de SQL Editor.
5. Klik on **"Run"** (of `Ctrl+Enter` / `Cmd+Enter`).
6. Controleer of alle tabellen verschijnen onder **Table Editor**.

### 2.3 Storage bucket controleren

1. Ga naar **Storage** in het Supabase dashboard.
2. Controleer of de bucket **`tech-pack-assets`** bestaat.
3. Als die er niet is: klik op **"New bucket"**, naam = `tech-pack-assets`, zet op **Public**.

### 2.4 Realtime activeren

1. Ga naar **Database > Replication**.
2. Zorg dat de volgende tabellen aangevinkt staan onder **"Source"**:
   - `articles`, `collections`, `sizes`, `artwork_placements`, `pantone_colors`, `field_locks`

---

## 3. Environment variabelen

```bash
# Kopieer het voorbeeld-bestand
cp .env.example .env.local
```

---

## 4. Project installeren

```bash
# Kloon het project
git clone https://github.com/vlv/tech-pack-builder.git
cd tech-pack-builder

# Installeer alle dependencies
npm install
```

---

## 5. Lokaal ontwikkelen

```bash
# Start Next.js, Socket.IO server én Electron tegelijk
npm run electron:dev
```

---

## 6. Builden voor Windows & macOS

```bash
# Maak eerst een productie build van Next.js
npm run build

# Windows
npm run build:win

# macOS
npm run build:mac
```
