# 🐍 SnakeCraft - Gioco Snake Avanzato 2.5D

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/FilippoAutiero007/SnakeCraft)

Un gioco Snake moderno con autenticazione Clerk, controlli cross-device, effetti bioma vivaci, boss infiniti e sistema RPG completo.

## ✨ Nuove Funzionalità

### 🔐 Autenticazione Clerk
- **Login con Google** integrato
- **Profilo utente** con nome e avatar
- **Classifica locale** protetta con dati utente
- **Salvataggio automatico** dei punteggi nel profilo

### 📱 Controlli Cross-Device Migliorati
- **Desktop**: WASD/Frecce + Spazio (power-up) + M (gadget) + ESC (pausa)
- **Mobile**: Joystick canvas touch + pulsanti overlay ottimizzati
- **Orientamento orizzontale** ottimale per mobile
- **Haptic feedback** per azioni touch

### 🎨 Effetti Bioma Vivaci
- **Grassland**: Particelle verdi leggere
- **Desert**: Sabbia volante + effetto lava con glow arancione
- **Tundra**: Neve che cade + effetto blur/rallentamento
- **Obsidian Waste**: Scintille viola + effetti oscuri

### 🏆 Sistema Classifica
- **Tab Locale**: Punteggi personali con nome/foto Google
- **Tab Mondiale**: Classifica globale (TODO: API backend)
- **Top 10** con medaglie oro/argento/bronzo

### ⚙️ Impostazioni Personalizzabili
- **Lingua**: Italiano / English
- **Audio**: Volume, musica, effetti sonori
- **Controlli Mobile**: Dimensione pulsanti (40-100px)
- **Posizione**: Default / Personalizzata (coming soon)

## 🚀 Setup Locale

### Prerequisiti
- Node.js 18+
- Account Clerk (gratis su [clerk.com](https://clerk.com))

### Installazione

```bash
# Clone repository
git clone https://github.com/FilippoAutiero007/SnakeCraft.git
cd SnakeCraft

# Installa dipendenze
npm install

# Configura variabili ambiente
cp .env.local.example .env.local
# Modifica .env.local con le tue chiavi Clerk
```

### Configurazione Clerk

1. Vai su [dashboard.clerk.com](https://dashboard.clerk.com)
2. Crea un nuovo progetto
3. Attiva Google OAuth in **Configure → Social Connections**
4. Copia le chiavi API:
   - **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`
5. Incolla in `.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmFpci1ndXBweS04Ny5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### Avvio Sviluppo

```bash
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) nel browser.

## 📦 Deploy su Vercel

### 1. Setup Repository
```bash
git add .
git commit -m "feat: ready for Vercel deploy"
git push origin main
```

### 2. Deploy su Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project)

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Importa il repo **SnakeCraft** da GitHub
3. **Framework**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - `VITE_CLERK_PUBLISHABLE_KEY`: (da Clerk dashboard)

### 3. Verifica Deploy

- ✅ Check che la build passi
- ✅ Test login Google funzionante
- ✅ Verifica classifica locale salvi i dati
- ✅ Test controlli mobile su device reale

## 🎮 Controlli

### Desktop
| Azione | Tasto |
|--------|-------|
| Movimento | WASD o Frecce |
| Power-Up | Spazio |
| Gadget | M |
| Pausa | ESC |
| Basket | Click Mouse |

### Mobile (Landscape)
| Azione | Controllo |
|--------|-----------|
| Movimento | Joystick destro (canvas touch) |
| Power-Up | Pulsante giallo ⚡ |
| Gadget | Pulsante blu 📦 |
| Pausa | Pulsante grigio ⏸️ |
| Shop | Pulsante verde 🛒 |

## 🛠️ Tecnologie

- **Frontend**: React 19 + TypeScript + Vite
- **Auth**: Clerk (Google OAuth)
- **Styling**: TailwindCSS + Lucide Icons
- **Rendering**: Canvas API 2D
- **Deploy**: Vercel

## 📁 Struttura Progetto

```
snakecraft/
├── src/
│   ├── components/
│   │   ├── auth/           # Clerk authentication
│   │   ├── controls/       # Joystick, mobile buttons
│   │   ├── ui/             # Leaderboard, Settings
│   │   └── game/           # Game logic components
│   ├── hooks/              # useGameInput, useSettings
│   ├── lib/                # biomeEffects, utilities
│   └── contexts/           # ClerkProvider
├── components/             # Legacy components (to migrate)
├── utils/                  # Game logic, engine
├── assets/                 # Boss sprites, icons
└── public/                 # Static files
```

## 🐛 Bug Fixes in Corso

- ✅ Clerk auth integration
- ✅ Mobile controls con joystick canvas
- ✅ Leaderboard locale con Clerk user
- ✅ Settings modal multilingua
- ✅ Biome particle effects
- 🔄 Boss spawn mancanti (fix in progress)
- 🔄 Pallini bianchi da rimuovere
- 🔄 Lava iniziale da eliminare
- 🔄 Shop icons SVG da migliorare

## 🚧 Roadmap

- [ ] API backend per classifica mondiale
- [ ] Clerk metadata per progressione utente
- [ ] Posizione custom pulsanti mobile
- [ ] Achievement system
- [ ] Multiplayer co-op locale
- [ ] Sound effects migliorati
- [ ] Tutorial interattivo

## 📄 Licenza

Progetto personale - Tutti i diritti riservati

---

**Buon divertimento con SnakeCraft! 🐍🎮🔥**
