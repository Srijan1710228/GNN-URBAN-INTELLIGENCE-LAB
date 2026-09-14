import type { Building, Zone } from './cityTypes';
import { SeedRandom } from './seedRandom';

export function generateBuildings(rng: SeedRandom, zones: Zone[]): Building[] {
  const buildings: Building[] = [];
  let buildingIdCounter = 1;

  for (const zone of zones) {
    // Parks don't have heavy commercial or industrial buildings, maybe a few small recreational pavilions
    let count = rng.intRange(15, 25);
    if (zone.type === 'PARK') {
      count = rng.intRange(3, 6);
    }

    for (let i = 0; i < count; i++) {
      // Place building radially within zone radius
      const angle = rng.range(0, Math.PI * 2);
      const dist = rng.range(20, zone.radius * 0.95);

      const x = zone.x + Math.cos(angle) * dist;
      const y = zone.y + Math.sin(angle) * dist;

      // Heights depend on zone type (commercial has skyscrapers, residential has houses/apartment blocks)
      let height = rng.range(10, 30);
      let width = rng.range(12, 24);
      let depth = rng.range(12, 24);
      let population = 0;

      if (zone.type === 'COMMERCIAL') {
        height = rng.range(40, 140); // Skyscrapers
        width = rng.range(20, 35);
        depth = rng.range(20, 35);
        population = Math.round(height * 1.5);
      } else if (zone.type === 'RESIDENTIAL') {
        height = rng.range(12, 45);  // Apartments / houses
        width = rng.range(14, 25);
        depth = rng.range(14, 25);
        population = Math.round(height * 2.2);
      } else if (zone.type === 'INDUSTRIAL') {
        height = rng.range(15, 35);  // Factories / warehouses
        width = rng.range(25, 50);   // Sprawling footprint
        depth = rng.range(25, 50);
        population = Math.round(height * 0.5);
      } else if (zone.type === 'PARK') {
        height = rng.range(5, 10);
        width = rng.range(10, 15);
        depth = rng.range(10, 15);
        population = 0;
      }

      buildings.push({
        id: `bld_${buildingIdCounter++}`,
        x,
        y,
        height: Math.round(height),
        width: Math.round(width),
        depth: Math.round(depth),
        type: zone.type,
        population
      });
    }
  }

  return buildings;
}
