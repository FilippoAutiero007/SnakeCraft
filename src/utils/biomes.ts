export type BiomeType = "grass" | "ice" | "lava" | "cactus" | "sand";

export interface BiomeConfig {
  name: string;
  color: string;
  backgroundColor: string;
  effects: string[];
  enemyColor: string;
  playerColor: string;
  speedModifier: number;
  damageModifier: number;
}

export const biomeConfigs: Record<BiomeType, BiomeConfig> = {
  grass: {
    name: "Prateria",
    color: "#00ff00",
    backgroundColor: "#1a3a1a",
    effects: ["none"],
    enemyColor: "#ff0000",
    playerColor: "#00ff00",
    speedModifier: 1,
    damageModifier: 1,
  },
  ice: {
    name: "Ghiaccio",
    color: "#00ccff",
    backgroundColor: "#1a3a4a",
    effects: ["blur", "slowdown"],
    enemyColor: "#0099ff",
    playerColor: "#00ccff",
    speedModifier: 0.7,
    damageModifier: 0.8,
  },
  lava: {
    name: "Lava",
    color: "#ff6600",
    backgroundColor: "#4a2a1a",
    effects: ["glow", "particles"],
    enemyColor: "#ff3300",
    playerColor: "#ffaa00",
    speedModifier: 1.1,
    damageModifier: 1.5,
  },
  cactus: {
    name: "Cactus",
    color: "#00aa00",
    backgroundColor: "#3a3a1a",
    effects: ["spike", "damage"],
    enemyColor: "#cc6600",
    playerColor: "#00dd00",
    speedModifier: 0.9,
    damageModifier: 2,
  },
  sand: {
    name: "Sabbia",
    color: "#ccaa00",
    backgroundColor: "#4a4a2a",
    effects: ["slide", "trail"],
    enemyColor: "#aa6600",
    playerColor: "#ffdd00",
    speedModifier: 0.8,
    damageModifier: 1,
  },
};

export function getRandomBiome(): BiomeType {
  const biomes: BiomeType[] = ["grass", "ice", "lava", "cactus", "sand"];
  return biomes[Math.floor(Math.random() * biomes.length)];
}

export function getBiomeByLevel(level: number): BiomeType {
  const biomeSequence: BiomeType[] = ["grass", "ice", "lava", "cactus", "sand"];
  return biomeSequence[level % biomeSequence.length];
}

export function applyBiomeEffect(
  ctx: CanvasRenderingContext2D,
  biome: BiomeType,
  canvas: HTMLCanvasElement
): void {
  const config = biomeConfigs[biome];

  switch (biome) {
    case "ice":
      // Effetto blur
      ctx.filter = "blur(1px)";
      break;
    case "lava":
      // Effetto glow
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 10;
      break;
    case "cactus":
      // Nessun effetto speciale sul canvas, il danno è gestito dalla logica
      break;
    case "sand":
      // Effetto trail leggero
      ctx.globalAlpha = 0.95;
      break;
    default:
      ctx.filter = "none";
      ctx.globalAlpha = 1;
  }
}

export function resetBiomeEffect(ctx: CanvasRenderingContext2D): void {
  ctx.filter = "none";
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}
