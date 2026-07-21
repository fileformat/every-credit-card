type RandomGenerator = {
  nextFloat: () => number;
  nextInt: (min: number, max: number) => number;
};

function SeededRandom(seed: string | number): RandomGenerator {
  // Helper to hash string seeds into a 32-bit integer
  const hashString = (str: string): number => {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  // Internal mutable state captured by the closure
  let state = typeof seed === "string" ? hashString(seed) : seed;

  // Mulberry32 algorithm
  const nextFloat = (): number => {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (min: number, max: number): number => {
    return Math.floor(nextFloat() * (max - min + 1)) + min;
  };

  return { nextFloat, nextInt };
}

export { SeededRandom };
export type { RandomGenerator };