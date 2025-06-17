export interface RopeEndpoint {
  x: number;
  y: number;
}

export interface Rope {
  id: string;
  start: RopeEndpoint;
  end: RopeEndpoint;
  color: string;
}

export interface GameBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// Predefined colors for ropes
const ROPE_COLORS = [
  '#E74C3C', // Red
  '#3498DB', // Blue
  '#2ECC71', // Green
  '#F39C12', // Orange
  '#9B59B6', // Purple
  '#E67E22', // Dark Orange
  '#1ABC9C', // Turquoise
  '#34495E', // Dark Blue
  '#F1C40F', // Yellow
  '#E91E63', // Pink
];

// Check if two line segments intersect
export function doLinesIntersect(
  line1Start: RopeEndpoint,
  line1End: RopeEndpoint,
  line2Start: RopeEndpoint,
  line2End: RopeEndpoint
): boolean {
  const x1 = line1Start.x;
  const y1 = line1Start.y;
  const x2 = line1End.x;
  const y2 = line1End.y;
  const x3 = line2Start.x;
  const y3 = line2Start.y;
  const x4 = line2End.x;
  const y4 = line2End.y;

  // Calculate the direction of the lines
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  // Lines are parallel
  if (Math.abs(denom) < 0.0001) {
    return false;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  // Check if intersection point is within both line segments
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// Check if all ropes are untangled (no intersections)
export function areRopesUntangled(ropes: Rope[]): boolean {
  for (let i = 0; i < ropes.length; i++) {
    for (let j = i + 1; j < ropes.length; j++) {
      if (doLinesIntersect(ropes[i].start, ropes[i].end, ropes[j].start, ropes[j].end)) {
        return false;
      }
    }
  }
  return true;
}

// Generate a random point within bounds
function getRandomPoint(bounds: GameBounds): RopeEndpoint {
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}

// Generate ropes that are guaranteed to intersect with better positioning
export function generateCrossedRopes(ropeCount: number, bounds: GameBounds): Rope[] {
  const ropes: Rope[] = [];
  
  // Calculate center and adjusted bounds for better rope positioning
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  
  // Make the play area more centered and higher up
  const playAreaWidth = (bounds.maxX - bounds.minX) * 0.7; // Reduced from 0.8
  const playAreaHeight = (bounds.maxY - bounds.minY) * 0.6; // Reduced from 0.8
  
  // Shift the center up by 20% of the height
  const adjustedCenterY = centerY - (bounds.maxY - bounds.minY) * 0.1;
  
  const maxRadius = Math.min(playAreaWidth, playAreaHeight) * 0.4;

  // Create ropes in a pattern that ensures they cross each other
  for (let i = 0; i < ropeCount; i++) {
    const color = ROPE_COLORS[i % ROPE_COLORS.length];
    
    // Create ropes in different crossing patterns based on count
    let start: RopeEndpoint;
    let end: RopeEndpoint;

    if (ropeCount === 2) {
      // Simple X pattern
      if (i === 0) {
        start = { x: centerX - maxRadius * 0.8, y: adjustedCenterY - maxRadius * 0.6 };
        end = { x: centerX + maxRadius * 0.8, y: adjustedCenterY + maxRadius * 0.6 };
      } else {
        start = { x: centerX - maxRadius * 0.8, y: adjustedCenterY + maxRadius * 0.6 };
        end = { x: centerX + maxRadius * 0.8, y: adjustedCenterY - maxRadius * 0.6 };
      }
    } else if (ropeCount === 3) {
      // Triangle with crossing lines
      const angle = (i * 2 * Math.PI) / 3;
      const oppositeAngle = angle + Math.PI;
      start = {
        x: centerX + Math.cos(angle) * maxRadius * 0.8,
        y: adjustedCenterY + Math.sin(angle) * maxRadius * 0.6,
      };
      end = {
        x: centerX + Math.cos(oppositeAngle) * maxRadius * 0.6,
        y: adjustedCenterY + Math.sin(oppositeAngle) * maxRadius * 0.5,
      };
    } else {
      // For 4+ ropes, create a more complex crossing pattern
      const baseAngle = (i * 2 * Math.PI) / ropeCount;
      const offsetAngle = baseAngle + Math.PI * (0.6 + (i % 3) * 0.2);
      
      const startRadius = maxRadius * (0.7 + (i % 2) * 0.2);
      const endRadius = maxRadius * (0.6 + ((i + 1) % 2) * 0.3);
      
      start = {
        x: centerX + Math.cos(baseAngle) * startRadius,
        y: adjustedCenterY + Math.sin(baseAngle) * startRadius * 0.7, // Compress vertically
      };
      end = {
        x: centerX + Math.cos(offsetAngle) * endRadius,
        y: adjustedCenterY + Math.sin(offsetAngle) * endRadius * 0.7, // Compress vertically
      };
    }

    // Ensure points are within bounds with some padding
    const padding = 20;
    start.x = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, start.x));
    start.y = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, start.y));
    end.x = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, end.x));
    end.y = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, end.y));

    ropes.push({
      id: `rope_${i}`,
      start,
      end,
      color,
    });
  }

  // Verify that ropes are actually crossed - if not, adjust them
  let attempts = 0;
  while (!hasIntersections(ropes) && attempts < 10) {
    // Slightly adjust rope positions to ensure crossings
    for (let i = 0; i < ropes.length; i++) {
      const rope = ropes[i];
      const adjustment = 15; // Reduced adjustment for more stable positioning
      rope.start.x += (Math.random() - 0.5) * adjustment;
      rope.start.y += (Math.random() - 0.5) * adjustment;
      rope.end.x += (Math.random() - 0.5) * adjustment;
      rope.end.y += (Math.random() - 0.5) * adjustment;

      // Keep within bounds with padding
      const padding = 20;
      rope.start.x = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, rope.start.x));
      rope.start.y = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, rope.start.y));
      rope.end.x = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, rope.end.x));
      rope.end.y = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, rope.end.y));
    }
    attempts++;
  }

  return ropes;
}

// Check if ropes have intersections
function hasIntersections(ropes: Rope[]): boolean {
  for (let i = 0; i < ropes.length; i++) {
    for (let j = i + 1; j < ropes.length; j++) {
      if (doLinesIntersect(ropes[i].start, ropes[i].end, ropes[j].start, ropes[j].end)) {
        return true;
      }
    }
  }
  return false;
}

// Count total intersections
export function countIntersections(ropes: Rope[]): number {
  let count = 0;
  for (let i = 0; i < ropes.length; i++) {
    for (let j = i + 1; j < ropes.length; j++) {
      if (doLinesIntersect(ropes[i].start, ropes[i].end, ropes[j].start, ropes[j].end)) {
        count++;
      }
    }
  }
  return count;
}