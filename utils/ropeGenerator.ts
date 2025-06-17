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

// Generate a random point within bounds with optional bias
function getRandomPoint(bounds: GameBounds, biasX?: number, biasY?: number, variance = 1.0): RopeEndpoint {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  
  let x, y;
  
  if (biasX !== undefined && biasY !== undefined) {
    // Generate point with bias towards a specific location
    const maxOffset = Math.min(width, height) * 0.3 * variance;
    x = biasX + (Math.random() - 0.5) * maxOffset;
    y = biasY + (Math.random() - 0.5) * maxOffset;
  } else {
    // Pure random generation
    x = bounds.minX + Math.random() * width;
    y = bounds.minY + Math.random() * height;
  }
  
  // Clamp to bounds
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
  };
}

// Generate random angle with optional constraints
function getRandomAngle(baseAngle?: number, variance = Math.PI): number {
  if (baseAngle !== undefined) {
    return baseAngle + (Math.random() - 0.5) * variance;
  }
  return Math.random() * 2 * Math.PI;
}

// Generate ropes that are guaranteed to intersect with randomization and 40% longer length
export function generateCrossedRopes(ropeCount: number, bounds: GameBounds): Rope[] {
  const ropes: Rope[] = [];
  
  // Calculate center and adjusted bounds for better rope positioning
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  
  // Make the play area larger for 40% longer ropes
  const playAreaWidth = (bounds.maxX - bounds.minX) * 0.95; // Increased from 0.85
  const playAreaHeight = (bounds.maxY - bounds.minY) * 0.85; // Increased from 0.75
  
  // Shift the center up by 10% of the height for better positioning
  const adjustedCenterY = centerY - (bounds.maxY - bounds.minY) * 0.05;
  
  // Increased radius for 40% longer ropes
  const maxRadius = Math.min(playAreaWidth, playAreaHeight) * 0.63; // Increased from 0.45 (40% increase)

  // Add randomization seed based on current time and rope count
  const randomSeed = Date.now() + ropeCount * 1000;
  Math.random = (() => {
    let seed = randomSeed;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  })();

  // Create ropes with randomized patterns that ensure they cross each other
  for (let i = 0; i < ropeCount; i++) {
    const color = ROPE_COLORS[i % ROPE_COLORS.length];
    
    let start: RopeEndpoint;
    let end: RopeEndpoint;

    if (ropeCount === 2) {
      // Enhanced X pattern with randomization and longer ropes
      const randomOffset = (Math.random() - 0.5) * 0.4; // Random offset for variation
      const lengthVariation = 0.9 + Math.random() * 0.2; // 90-110% of max length
      
      if (i === 0) {
        const angle1 = Math.PI * 0.25 + randomOffset; // ~45 degrees with variation
        const angle2 = angle1 + Math.PI; // Opposite direction
        start = {
          x: centerX + Math.cos(angle1) * maxRadius * lengthVariation,
          y: adjustedCenterY + Math.sin(angle1) * maxRadius * 0.8 * lengthVariation,
        };
        end = {
          x: centerX + Math.cos(angle2) * maxRadius * lengthVariation,
          y: adjustedCenterY + Math.sin(angle2) * maxRadius * 0.8 * lengthVariation,
        };
      } else {
        const angle1 = Math.PI * 0.75 + randomOffset; // ~135 degrees with variation
        const angle2 = angle1 + Math.PI; // Opposite direction
        start = {
          x: centerX + Math.cos(angle1) * maxRadius * lengthVariation,
          y: adjustedCenterY + Math.sin(angle1) * maxRadius * 0.8 * lengthVariation,
        };
        end = {
          x: centerX + Math.cos(angle2) * maxRadius * lengthVariation,
          y: adjustedCenterY + Math.sin(angle2) * maxRadius * 0.8 * lengthVariation,
        };
      }
    } else if (ropeCount === 3) {
      // Randomized triangle with crossing lines - longer ropes
      const baseAngle = (i * 2 * Math.PI) / 3;
      const angleVariation = (Math.random() - 0.5) * 0.6; // ±30 degree variation
      const lengthVariation = 0.85 + Math.random() * 0.3; // 85-115% of max length
      
      const angle = baseAngle + angleVariation;
      const oppositeAngle = angle + Math.PI + (Math.random() - 0.5) * 0.4; // Slight variation in opposite angle
      
      start = {
        x: centerX + Math.cos(angle) * maxRadius * lengthVariation,
        y: adjustedCenterY + Math.sin(angle) * maxRadius * 0.8 * lengthVariation,
      };
      end = {
        x: centerX + Math.cos(oppositeAngle) * maxRadius * (0.8 + Math.random() * 0.3),
        y: adjustedCenterY + Math.sin(oppositeAngle) * maxRadius * (0.7 + Math.random() * 0.2),
      };
    } else {
      // Enhanced complex crossing pattern with more randomization and longer ropes
      const baseAngle = (i * 2 * Math.PI) / ropeCount;
      const angleVariation = (Math.random() - 0.5) * 0.8; // ±40 degree variation
      const lengthVariation = 0.8 + Math.random() * 0.4; // 80-120% of max length
      
      // More random offset angle calculation
      const offsetAngle = baseAngle + Math.PI * (0.5 + (Math.random() - 0.5) * 0.6) + angleVariation;
      
      // Randomize radius for each endpoint
      const startRadius = maxRadius * (0.7 + Math.random() * 0.4) * lengthVariation;
      const endRadius = maxRadius * (0.6 + Math.random() * 0.5) * lengthVariation;
      
      // Add some randomness to the compression factor
      const compressionFactor = 0.75 + Math.random() * 0.2; // 75-95% compression
      
      start = {
        x: centerX + Math.cos(baseAngle + angleVariation) * startRadius,
        y: adjustedCenterY + Math.sin(baseAngle + angleVariation) * startRadius * compressionFactor,
      };
      end = {
        x: centerX + Math.cos(offsetAngle) * endRadius,
        y: adjustedCenterY + Math.sin(offsetAngle) * endRadius * compressionFactor,
      };
    }

    // Add additional randomization to final positions
    const finalRandomization = 20; // Pixels of final random adjustment
    start.x += (Math.random() - 0.5) * finalRandomization;
    start.y += (Math.random() - 0.5) * finalRandomization;
    end.x += (Math.random() - 0.5) * finalRandomization;
    end.y += (Math.random() - 0.5) * finalRandomization;

    // Ensure points are within bounds with padding
    const padding = 20; // Increased padding for longer ropes
    start.x = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, start.x));
    start.y = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, start.y));
    end.x = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, end.x));
    end.y = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, end.y));

    ropes.push({
      id: `rope_${i}_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Unique ID with randomization
      start,
      end,
      color,
    });
  }

  // Enhanced verification and adjustment system
  let attempts = 0;
  const maxAttempts = 15; // Increased attempts for better results
  
  while (!hasIntersections(ropes) && attempts < maxAttempts) {
    console.log(`Attempt ${attempts + 1}: Adjusting ropes to ensure crossings`);
    
    // More sophisticated adjustment algorithm
    for (let i = 0; i < ropes.length; i++) {
      const rope = ropes[i];
      
      // Calculate adjustment based on rope length and position
      const ropeLength = Math.sqrt(
        Math.pow(rope.end.x - rope.start.x, 2) + 
        Math.pow(rope.end.y - rope.start.y, 2)
      );
      
      const adjustmentFactor = Math.min(ropeLength * 0.1, 25); // Proportional to rope length
      
      // Apply random adjustments
      rope.start.x += (Math.random() - 0.5) * adjustmentFactor;
      rope.start.y += (Math.random() - 0.5) * adjustmentFactor;
      rope.end.x += (Math.random() - 0.5) * adjustmentFactor;
      rope.end.y += (Math.random() - 0.5) * adjustmentFactor;

      // Keep within bounds with padding
      const padding = 20;
      rope.start.x = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, rope.start.x));
      rope.start.y = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, rope.start.y));
      rope.end.x = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, rope.end.x));
      rope.end.y = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, rope.end.y));
    }
    attempts++;
  }

  // If still no intersections after all attempts, force create intersections
  if (!hasIntersections(ropes) && ropes.length >= 2) {
    console.log('Forcing intersections by repositioning ropes');
    
    // Force the first two ropes to cross in the center area
    const centerRegionSize = Math.min(playAreaWidth, playAreaHeight) * 0.3;
    
    ropes[0].start = {
      x: centerX - centerRegionSize,
      y: adjustedCenterY - centerRegionSize * 0.5,
    };
    ropes[0].end = {
      x: centerX + centerRegionSize,
      y: adjustedCenterY + centerRegionSize * 0.5,
    };
    
    ropes[1].start = {
      x: centerX - centerRegionSize,
      y: adjustedCenterY + centerRegionSize * 0.5,
    };
    ropes[1].end = {
      x: centerX + centerRegionSize,
      y: adjustedCenterY - centerRegionSize * 0.5,
    };
  }

  // Reset Math.random to default behavior
  delete Math.random;

  const finalIntersections = countIntersections(ropes);
  console.log(`Generated ${ropeCount} ropes with ${finalIntersections} intersections (40% longer with randomization)`);

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