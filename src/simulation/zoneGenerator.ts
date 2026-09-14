import type { Zone, ZoneType } from './cityTypes';
import { SeedRandom } from './seedRandom';

export function generateZones(rng: SeedRandom, width: number, height: number): Zone[] {
  const zones: Zone[] = [];
  const zoneTypes: ZoneType[] = ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'PARK'];
  const colors = {
    RESIDENTIAL: 'rgba(16, 185, 129, 0.08)', // Emerald/Green
    COMMERCIAL: 'rgba(14, 165, 233, 0.08)',  // Sky Blue
    INDUSTRIAL: 'rgba(245, 158, 11, 0.08)',  // Amber/Orange
    PARK: 'rgba(34, 197, 94, 0.08)'         // Green/Park
  };

  const zoneNames = {
    RESIDENTIAL: ['North Heights', 'Eastside Suburbs', 'Sunset Valley', 'Green Meadows'],
    COMMERCIAL: ['Downtown Hub', 'Marina Retail Square', 'Tech Plaza', 'Financial Center'],
    INDUSTRIAL: ['North Industrial Sector', 'Logistic Depot', 'Factory Yards', 'Tech Incubator'],
    PARK: ['Central Gardens', 'Riverside Park', 'Lakeview Reserve', 'Botanical Sanctuary']
  };

  // Generate 6 to 8 zones
  const numZones = rng.intRange(6, 8);

  for (let i = 0; i < numZones; i++) {
    const type = zoneTypes[i % zoneTypes.length];
    const x = rng.range(width * 0.1, width * 0.9);
    const y = rng.range(height * 0.1, height * 0.9);
    const radius = rng.range(120, 220);

    const nameList = zoneNames[type];
    const name = nameList[Math.floor(rng.range(0, nameList.length))];

    zones.push({
      id: `z${i + 1}`,
      name: `${name} (${type.substring(0, 3)})`,
      type,
      x,
      y,
      radius,
      color: colors[type]
    });
  }

  return zones;
}
