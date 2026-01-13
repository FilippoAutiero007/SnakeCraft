# 🐍 SnakeCraft - Gioco Snake Avanzato 2.5D

## 🎮 Panoramica

**SnakeCraft** è un gioco Snake  con grafica 2.5D, sistema di chunk infiniti, biomi dinamici, boss progressivi e un sistema di progressione RPG completo. Il gioco è ottimizzato per funzionare a **60 FPS** con movimento fluido e supporta sia desktop che mobile.

---

## ✨ Funzionalità Principali

### 🗺️ **Mappa Infinita con Sistema Chunk**
- Sistema di chunk in stile Minecraft (16x16 blocchi per chunk)
- Caricamento dinamico dei chunk basato sulla posizione del giocatore
- Scaricamento automatico dei chunk lontani per ottimizzare la memoria
- Generazione procedurale del terreno con seed deterministico

### 🌍 **Biomi Dinamici**
Il gioco presenta **4 biomi distinti**, ognuno con caratteristiche uniche:

1. **GRASSLAND** (Prateria)
   - Bioma base sicuro
   - Decorazioni: erba, fiori, stagni
   - Nessun pericolo ambientale

2. **DESERT** (Deserto)
   - **LAVA**: Causa danno istantaneo (30 HP) + effetto bruciatura continua
   - **MAGMA**: Danno ridotto (3 HP) al contatto
   - Colore: tonalità sabbia scura

3. **TUNDRA** (Ghiaccio)
   - **ICE**: Rallenta il serpente (tick rate aumentato a 160ms)
   - Danno ridotto rispetto alla lava
   - Colore: tonalità blu ghiacciate

4. **OBSIDIAN_WASTE** (Terre Oscure)
   - Bioma più pericoloso
   - Presenza di BEDROCK (indistruttibile)
   - Maggiore frequenza di ostacoli

### 👾 **Boss Progressivi Infiniti**
- **5 tipi di boss** che si alternano ciclicamente:
  - **GOLEM** (Livello 1, 6, 11...)
  - **CYBER_WORM** (Livello 2, 7, 12...)
  - **PUMPKIN_KING** (Livello 3, 8, 13...)
  - **SHADOW** (Livello 4, 9, 14...)
  - **PHOENIX** (Livello 5, 10, 15...)

- **Scaling progressivo**:
  - HP aumenta con il livello: `200 + (livello * 50) + (ciclo * 100)`
  - Danno aumenta con il ciclo: `danno_base * (1 + ciclo * 0.2)`
  - Difficoltà crescente infinita

### 🏆 **Sistema Livelli Infiniti**
- Livelli sbloccabili all'infinito
- Ogni boss sconfitto sblocca il livello successivo
- **Ricompense progressive**:
  - **Ogni 10 livelli**: 1000 cioccolate
  - **Ogni 5 livelli**: 500 cioccolate
  - **Boss standard**: 200 cioccolate

### 🛒 **Negozio Completo**

#### **Power-Up Permanenti**
1. **Void Magnet** - Aumenta raggio raccolta oggetti
2. **Choco Greed** - Bonus punti per cioccolata
3. **Iron Scales** - Riduce danno da trappole e muri
4. **Treasure Hunter** - Aumenta spawn oro
5. **Battery Pack** - Power-up durano più a lungo

#### **Consumabili**
- **Head Start**: Inizia con lunghezza 10
- **Score Booster**: 2x punti per 60 secondi

#### **Skin e Sfondi**
- 6 skin per il serpente
- 6 sfondi tematici
- Sistema di equipaggiamento

### ⏸️ **Menu Pausa Migliorato**
- Accesso al **negozio durante la partita** (premere ESC)
- Opzioni audio
- Uscita al menu principale
- Riprendi partita

### 🎯 **Ottimizzazioni 60 FPS**
- Interpolazione fluida del movimento (lerp 0.35)
- Culling ottimizzato per rendering
- Decorazioni renderizzate ogni 2 frame
- Throttling UI (aggiornamento ogni 3 frame)
- Tick rate ottimizzato: 120ms normale, 80ms con speed boost, 160ms su ghiaccio

### 🎨 **Grafica 2.5D**
- Effetti particellari avanzati
- Ombre e illuminazione dinamica
- Animazioni fluide con interpolazione
- Asset grafici generati con AI

---

## 🎮 Controlli

### Desktop
- **Frecce direzionali** o **WASD**: Movimento
- **SPAZIO**: Attiva power-up
- **ESC**: Pausa / Menu

### Mobile
- **Swipe**: Movimento direzionale
- **Pulsante abilità**: Attiva power-up
- Touch controls ottimizzati

---

## 🚀 Installazione e Avvio

```bash
# Installa dipendenze
pnpm install

# Avvia in modalità sviluppo
pnpm dev

# Build per produzione
pnpm build

# Anteprima build
pnpm preview
```

---

## 📁 Struttura Progetto

```
snakecraft/
├── assets/               # Asset grafici generati
│   ├── boss_*.png       # Sprite dei boss
│   ├── powerup_*.png    # Icone power-up
│   └── *.png            # Altri asset
├── components/          # Componenti React
│   ├── Game.tsx         # Componente principale gioco
│   ├── GameUI.tsx       # UI di gioco
│   ├── MainMenu.tsx     # Menu principale
│   ├── Shop.tsx         # Negozio
│   └── ui/              # Componenti UI
├── utils/               # Logica di gioco
│   ├── chunkManager.ts  # Sistema chunk infiniti
│   ├── gameLogic.ts     # Generazione terreno
│   ├── engine/          # Game engine
│   │   ├── core.ts      # Loop principale
│   │   ├── collision.ts # Gestione collisioni
│   │   ├── entities.ts  # Boss e proiettili
│   │   └── world.ts     # Gestione mondo
│   └── rendering/       # Sistema rendering
├── constants.ts         # Configurazioni
├── types.ts            # Definizioni TypeScript
└── App.tsx             # Entry point

```

---

## 🎨 Asset Grafici

Tutti gli asset sono stati generati con intelligenza artificiale e sono inclusi nella cartella `assets/`:
- boss unici (GOLEM, PHOENIX, CYBER_WORM, PUMPKIN_KING, SHADOW)
- 3 power-up riconoscibili (LASER, SHIELD, SPEED)
- Blocchi cioccolata e monete d'oro
- Stile pixel art coerente

---

## 🔧 Tecnologie Utilizzate

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool veloce
- **Canvas API** - Rendering 2D
- **Lucide React** - Icone
- **TailwindCSS** - Styling

---

## 📝 Note Tecniche

### Sistema Chunk
- Render distance: 3 chunk in ogni direzione
- Unload distance: 5 chunk
- Dimensione chunk: 16x16 blocchi
- Generazione deterministica basata su coordinate

### Biomi
- Generazione basata su hash delle coordinate chunk
- Distribuzione: 40% Grassland, 25% Desert, 20% Tundra, 15% Obsidian Waste

### Performance
- Target: 60 FPS costanti
- Ottimizzazioni: culling, interpolazione, throttling UI
- Memoria: gestione automatica chunk

---

## 🐛 Correzioni Implementate


  Tutorial funzionante  
✅ Boss con comportamento corretto  
✅ Negozio accessibile in pausa  
✅ Power-up riconoscibili  
✅ Movimento fluido 2.5D  
✅ Ottimizzazione 60 FPS  
✅ Sistema chunk infiniti  
✅ Biomi con effetti specifici  

---

## 📄 Licenza

Progetto personale - Tutti i diritti riservati

---

## 🎯 Roadmap Future

- [ ] Multiplayer online
- [ ] Modalità endless con classifica
- [ ] Più power-up e abilità
- [ ] Sistema achievement
- [ ] Sound effects migliorati
- [ ] Modalità storia

---

**Buon divertimento con SnakeCraft! 🐍🎮**
