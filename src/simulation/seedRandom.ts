// Deterministic pseudo-random number generator (Mulberry32)
export class SeedRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  // Returns a number between 0 (inclusive) and 1 (exclusive)
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns a float between min and max
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Returns an integer between min and max (inclusive)
  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  // Picks a random element from an array
  pick<T>(array: T[]): T {
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }
}
