# 🚀 Guida Deploy SnakeCraft su Vercel

## ✅ Cosa è stato implementato

### 🔐 Autenticazione Clerk
- ✅ Login con Google OAuth integrato
- ✅ AuthButton sempre visibile (top-right)
- ✅ Profilo utente con nome e foto Google
- ✅ SignInButton modal per accesso rapido
- ✅ UserButton con gestione profilo

### 📱 Controlli Cross-Device
- ✅ **Desktop**: WASD/Frecce + Spazio (power) + M (gadget) + ESC (pausa)
- ✅ **Mobile**: JoystickMobile canvas-based + pulsanti overlay
- ✅ Orientamento orizzontale ottimizzato per mobile
- ✅ Hook unificato `useGameInput` per input PC/mobile
- ✅ Haptic feedback per azioni touch

### 🎨 Effetti Bioma Vivaci
- ✅ Sistema particelle bioma-specifiche
- ✅ **Grassland**: Particelle verdi leggere
- ✅ **Desert**: Sabbia volante + glow lava arancione
- ✅ **Tundra**: Neve che cade + effetto blur
- ✅ **Obsidian Waste**: Scintille viola + effetti oscuri

### 🏆 Classifica e Impostazioni
- ✅ Modal classifica con tab Locale/Mondiale
- ✅ Salvataggio automatico punteggi Clerk user
- ✅ Top 10 con medaglie oro/argento/bronzo
- ✅ Modal impostazioni con:
  - Lingua (Italiano/English)
  - Audio (musica, SFX, volume)
  - Controlli mobile (dimensione pulsanti)

### 🐛 Bug Fix
- ✅ **Lava spawn iniziale**: Safe zone 20 blocchi da origin
- ✅ **Lava threshold**: Aumentato per GRASSLAND (2.6) e OBSIDIAN (1.0)
- ✅ **Distance check**: Assicura spawn sicuro in grassland

### 📁 Struttura Modulare
```
src/
├── components/
│   ├── auth/           # AuthButton con Clerk
│   ├── controls/       # JoystickMobile, MobileButtons
│   ├── ui/             # Leaderboard, SettingsModal
│   └── game/           # (future modular game logic)
├── hooks/              # useGameInput, useSettings
├── lib/                # biomeEffects, utils
└── contexts/           # ClerkProvider
```

---

## 🔧 Setup Locale

### 1. Installa Dipendenze
```bash
npm install
```

### 2. Configura Clerk
1. Vai su [dashboard.clerk.com](https://dashboard.clerk.com)
2. Crea progetto nuovo
3. Attiva **Google OAuth** in Configure → Social Connections
4. Copia le chiavi:

```bash
# Crea .env.local dalla template
cp .env.local.example .env.local

# Modifica .env.local con le tue chiavi
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Test Locale
```bash
npm run dev
# Apri http://localhost:5173
```

Verifica:
- ✅ Login Google funziona
- ✅ AuthButton top-right visibile
- ✅ Profilo salva nome/foto
- ✅ Classifica locale salva punteggi
- ✅ Impostazioni persistono in localStorage

---

## 🚀 Deploy su Vercel

### Metodo 1: Vercel Dashboard (Consigliato)

1. **Vai su Vercel**
   - Apri [vercel.com/new](https://vercel.com/new)
   - Connetti GitHub account

2. **Importa Repository**
   - Seleziona repo **SnakeCraft**
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_CLERK_PUBLISHABLE_KEY = pk_test_...
   ```
   (Ottieni da [dashboard.clerk.com](https://dashboard.clerk.com))

4. **Deploy**
   - Click "Deploy"
   - Attendi build (~2-3 min)
   - Verifica URL pubblico generato

### Metodo 2: Vercel CLI

```bash
# Installa Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Aggiungi environment variable
vercel env add VITE_CLERK_PUBLISHABLE_KEY

# Paste la tua chiave Clerk
```

### 3. Configura Clerk per Produzione

1. Vai su [dashboard.clerk.com](https://dashboard.clerk.com)
2. **Settings** → **Domains**
3. Aggiungi il dominio Vercel (es: `snakecraft.vercel.app`)
4. Verifica redirect URLs:
   ```
   https://your-domain.vercel.app
   https://your-domain.vercel.app/*
   ```

---

## ✅ Checklist Post-Deploy

### Test Funzionalità
- [ ] Build Vercel passata senza errori
- [ ] Gioco si carica correttamente
- [ ] **Login Google funziona**
  - Click "Accedi con Google"
  - Redirect a Clerk modal
  - Login completo con email Google
  - Nome e foto visibili in UserButton
- [ ] **Controlli funzionano**
  - Desktop: WASD/Frecce movimento
  - Mobile: Joystick canvas touch
  - Power-up: Spazio/pulsante
- [ ] **Classifica salva dati**
  - Gioca una partita
  - Check tab "Locale" in classifica
  - Nome e foto Google visibili
- [ ] **Impostazioni persistono**
  - Cambia lingua a English
  - Ricarica pagina
  - Check che lingua rimanga English

### Test Cross-Device
- [ ] Desktop Chrome/Firefox/Safari
- [ ] Mobile Android (Chrome)
- [ ] Mobile iOS (Safari)
- [ ] Tablet orientamento landscape
- [ ] Haptic feedback funziona su mobile

### Performance
- [ ] 60 FPS costanti desktop
- [ ] 30+ FPS mobile
- [ ] Particelle bioma non laggano
- [ ] Boss spawn senza freeze
- [ ] Classifica carica velocemente

---

## 🔥 Troubleshooting

### Build Failed
**Errore**: `Module not found: @clerk/clerk-react`
```bash
# Fix: Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Login Google non funziona
**Problema**: Redirect loop o errore OAuth

**Soluzione**:
1. Vercel Dashboard → Settings → Environment Variables
2. Verifica `VITE_CLERK_PUBLISHABLE_KEY` sia corretta
3. Clerk Dashboard → Settings → Domains
4. Aggiungi dominio Vercel esatto
5. Redeploy: `vercel --prod`

### Classifica non salva
**Problema**: Punteggi non appaiono in locale

**Causa**: Clerk user non connesso

**Fix**:
- Assicurati di essere loggato (UserButton visible)
- Controlla localStorage: `snakecraft_local_scores`
- Rigioca una partita dopo login

### Mobile controls non appaiono
**Problema**: Joystick non visibile mobile

**Fix**:
- Verifica orientamento landscape
- Check media query `(max-width: 768px)`
- Test su device reale (non solo emulator)

### Particles bioma crashano
**Problema**: Frame drop con particelle

**Fix**:
- Riduci `maxParticles` in `biomeEffects.ts` (default 100 → 50)
- Disabilita particelle su mobile low-end
- Throttle rendering particelle ogni 2 frame

---

## 📊 Next Steps (TODO)

### Backend API per Classifica Mondiale
```typescript
// app/api/leaderboard/route.ts (Next.js API)
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  // Fetch global scores from DB
  const scores = await db.leaderboard.findMany({
    orderBy: { level: 'desc' },
    take: 100
  });
  return Response.json(scores);
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { score, level } = await req.json();
  await db.leaderboard.create({
    data: { userId, score, level, date: new Date() }
  });
  return Response.json({ success: true });
}
```

### Clerk Metadata per Progressione
```typescript
// Salva upgrade/skin nel profilo Clerk
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    snakecraft: {
      upgrades: {...},
      ownedSkins: [...],
      totalPlaytime: 12345
    }
  }
});
```

### Shop Icons SVG Dinamiche
```tsx
// Genera SVG icons per ogni item
const ShopIcons = {
  lava: <LavaIcon />,
  ice: <IceIcon />,
  magnet: <MagnetIcon />
};
```

---

## 🎉 Deploy Completato!

Il tuo SnakeCraft è ora live su Vercel con:
- ✅ Autenticazione Google via Clerk
- ✅ Controlli cross-device ottimizzati
- ✅ Effetti bioma vivaci
- ✅ Classifica persistente
- ✅ Impostazioni personalizzabili
- ✅ Build ottimizzata e veloce

**URL Vercel**: [https://snakecraft.vercel.app](https://snakecraft.vercel.app) (esempio)

Condividi il link e buon gaming! 🐍🎮🔥
