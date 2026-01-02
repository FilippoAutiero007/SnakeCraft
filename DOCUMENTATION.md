# 📜 SnakeCraft Moderno: Documentazione Ufficiale

Benvenuto in **SnakeCraft Moderno**, un'evoluzione ad alto budget del classico genere Snake, fusa con elementi sandbox (Minecraft-style) e meccaniche da RPG d'azione.

---

## 🎮 1. Visione di Gioco
L'obiettivo non è solo "non toccare le pareti". In SnakeCraft, il mondo è un'arena interattiva. Il giocatore deve sopravvivere a biomi ostili, distruggere ostacoli con abilità speciali, raccogliere risorse (Cioccolato e Oro) e sconfiggere boss epici per avanzare nel Tier di gioco.

---

## 🕹️ 2. Meccaniche Core

### 🐍 Il Serpente (Player)
*   **Movimento:** Basato su griglia, ma con **interpolazione visiva**. A differenza del classico Snake, il rendering avviene tra i tick del motore di gioco, garantendo una fluidità visiva a 60fps mentre la logica gira a frequenze variabili.
*   **Crescita:** Raccogliendo **Dirt (Cioccolato)**, il serpente cresce. La crescita non è istantanea: esiste un "Growth Bucket" che gestisce l'aggiunta dei segmenti in modo armonioso.
*   **Stato di Stordimento (Stun):** Se colpisci un ostacolo senza morire (grazie agli upgrade), il serpente viene stordito per un breve periodo, impedendo il movimento ma permettendo il recupero direzionale.

### 🗺️ Generazione Procedurale (Chunk-based)
Il mondo è infinito e generato proceduralmente tramite algoritmi di **Pseudo-Random Noise**. 
*   **Sistema a Chunk:** La mappa è divisa in quadranti 16x16. Solo i chunk vicini al giocatore sono attivi in memoria, ottimizzando le performance e permettendo esplorazioni virtualmente illimitate.
*   **Biomi:**
    1.  **Grasslands (Pianure):** Erba, alberi e stagni. Il punto di partenza sicuro.
    2.  **Desert (Deserto):** Terreno arido con ostacoli più densi.
    3.  **Tundra:** Presenza di **Ghiaccio (Ice)**, che influenza la velocità.
    4.  **Obsidian Waste:** Zone vulcaniche con Bedrock e Lava.

### 🧱 Blocchi e Interazione
*   **DIRT (Chocolate):** La valuta base e cibo.
*   **GOLD:** Valuta rara (High Score booster).
*   **STONE:** Ostacoli distruttibili solo con abilità o power-up.
*   **BEDROCK:** Muri indistruttibili che delimitano le zone o creano labirinti.
*   **LAVA/MAGMA:** Provocano danni nel tempo o morte istantanea.
*   **TRAP:** Trappole meccaniche che riducono la lunghezza del serpente e infliggono danni.

---

## ⚔️ 3. Combattimento e Abilità

### 🔥 Power-Ups
*   **Laser Eyes:** Permette di sparare un raggio distruttivo frontalmente che pulisce la mappa e danneggia i boss.
*   **Ghost Shield:** Invulnerabilità alle collisioni (muri e te stesso).
*   **Speed Boost:** Aumenta il tick-rate del motore di gioco, permettendo movimenti rapidi.
*   **Instant Heal:** Recupero immediato di 50 HP.

### 👾 Boss Fights
Ogni 500 punti compare un Boss (es. **Golem di Magma**).
*   **IA del Boss:** Alterna fasi di inseguimento, attacchi a distanza (Pyroblast) e attacchi ad area (Stomp).
*   **Collisioni Avanzate:** Utilizziamo algoritmi di "Point-to-Segment distance" per gestire i proiettili del boss, garantendo che anche a velocità elevate le collisioni siano precise.

---

## 📈 4. Sistema RPG e Shop

Il gioco presenta una progressione permanente. Il "Cioccolato" raccolto viene convertito in valuta nel Menu Principale.

### 🛡️ Upgrade Permanenti
*   **Void Magnet:** Aumenta il raggio di raccolta automatica degli oggetti.
*   **Choco Greed:** Moltiplicatore di punti per ogni unità di cibo mangiata.
*   **Iron Scales:** Riduzione del danno ricevuto da trappole e collisioni.
*   **Extended Power:** I Power-Up durano fino al 100% in più.

### 🎒 Consumabili (Pre-Game)
*   **Head Start:** Inizia la partita con lunghezza 10 invece di 3.
*   **Score Booster:** Raddoppia i punti per i primi 60 secondi di gioco.

---

## 🎨 5. AI Studio (Integrazione Gemini)
Il gioco integra le API di Google Gemini per permettere la generazione di asset personalizzati.
*   **Skin Generator:** Descrivi una skin (es. "Serpente meccanico al neon") e l'IA genererà una texture unica.
*   **World Generator:** Genera sfondi tematici basati sui prompt dell'utente.

---

## 💻 6. Architettura Tecnica

### ⚙️ Motore di Gioco (`utils/engine/core.ts`)
Gestisce il loop logico, le collisioni e lo spawn degli oggetti. Separa nettamente la **logica di tick** dal **rendering di frame**.

### 🖌️ Rendering Canvas (`utils/rendering/`)
Un sistema di rendering 2.5D stratificato:
1.  **Background Layer:** Sfondo del bioma e decorazioni (erba, fiori).
2.  **Effect Layer:** Zone AoE (Area of Effect) e ombre.
3.  **Entity Layer:** Blocchi, Serpente, Boss.
4.  **Particle Layer:** Particelle per esplosioni e rottura blocchi.
5.  **Overlay Layer:** Effetti post-processing (Vignette, fumo, bagliore lava).

---

## 🚀 7. Roadmap Futura
*   **Multiplayer Asincrono:** Ombre dei record di altri giocatori sulla mappa.
*   **Dungeon Speciali:** Livelli chiusi con enigmi e premi rari.
*   **Meteo Dinamico:** Tempeste di sabbia o neve che influenzano la visibilità e la fisica.
