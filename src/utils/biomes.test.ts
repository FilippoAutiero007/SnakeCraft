import { describe, it, expect } from "vitest";
import {
  getRandomBiome,
  getBiomeByLevel,
  biomeConfigs,
  type BiomeType,
} from "./biomes";

describe("Biomes", () => {
  it("should return valid random biome", () => {
    const biome = getRandomBiome();
    const validBiomes: BiomeType[] = ["grass", "ice", "lava", "cactus", "sand"];

    expect(validBiomes).toContain(biome);
  });

  it("should return biome by level", () => {
    const biome0 = getBiomeByLevel(0);
    const biome1 = getBiomeByLevel(1);
    const biome2 = getBiomeByLevel(2);

    expect(biome0).toBe("grass");
    expect(biome1).toBe("ice");
    expect(biome2).toBe("lava");
  });

  it("should cycle through biomes", () => {
    const biome5 = getBiomeByLevel(5);
    const biome0 = getBiomeByLevel(0);

    expect(biome5).toBe(biome0); // Dovrebbe ricominciare
  });

  it("should have valid config for each biome", () => {
    const biomes: BiomeType[] = ["grass", "ice", "lava", "cactus", "sand"];

    biomes.forEach((biome) => {
      const config = biomeConfigs[biome];

      expect(config).toBeDefined();
      expect(config.name).toBeDefined();
      expect(config.color).toBeDefined();
      expect(config.backgroundColor).toBeDefined();
      expect(config.effects).toBeDefined();
      expect(config.speedModifier).toBeGreaterThan(0);
      expect(config.damageModifier).toBeGreaterThan(0);
    });
  });

  it("should have correct speed modifiers", () => {
    expect(biomeConfigs.grass.speedModifier).toBe(1);
    expect(biomeConfigs.ice.speedModifier).toBeLessThan(1);
    expect(biomeConfigs.lava.speedModifier).toBeGreaterThan(1);
  });

  it("should have correct damage modifiers", () => {
    expect(biomeConfigs.grass.damageModifier).toBe(1);
    expect(biomeConfigs.cactus.damageModifier).toBeGreaterThan(1);
    expect(biomeConfigs.lava.damageModifier).toBeGreaterThan(1);
  });
});
