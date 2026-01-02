# TODO LIST - SNAKECRAFT MODERNO

## 🔴 PRIORITÀ ALTA (CRITICO / BUG POTENZIALI)

### Bug & Fix
1. **[RISOLTO] Consumabili Infiniti**: Implementata logica di consumo all'avvio partita in `App.tsx`.
2. **[RISOLTO] AI Generator Scollegato**: Aggiunto bottone "AI Studio" nel Menu Principale.
3. **Collisione Boss Incoerente**: I proiettili usano il nuovo sistema Raycasting, ma il "Laser" (Ability) usa ancora un controllo di distanza semplice che potrebbe mancare il boss se si muove velocemente. -> Unificare la logica di collisione.

---

## 🟡 PRIORITÀ MEDIA (GAMEPLAY & FEATURE)

### Gameplay
1. **[DOCUMENTATO] Sistema RPG**: Documentate tutte le abilità e le curve di progressione in `DOCUMENTATION.md`.
2. **Pathfinding Boss**: I boss si muovono in linea retta e si incastrano nei muri. -> Implementare l'algoritmo A* (A-Star).
3. **[PARZIALE] HUD Buff Attivi**: Implementata visualizzazione PowerUp, mancano icone per consumabili Head Start/Score Boost.

---

## 🟢 PRIORITÀ BASSA (POLISH & GRAFICA)

### Grafica & Audio
1. **[RISOLTO] Documentazione**: Creata documentazione tecnica dettagliata.
2. **Audio Reale**: Sostituire `audio.ts` con campionamenti reali (.wav).
3. **Animazione Serpente Fluida**: Perfezionare l'interpolazione per eliminare ogni micro-scatto residuo.

---

## 🔵 NUOVE IDEE (DA VALUTARE)
1. **Modalità Creativa**: Permettere di disegnare mappe o skin personalizzate usando l'AI Generator.
2. **Multiplayer Locale**: Due serpenti sullo stesso schermo.
