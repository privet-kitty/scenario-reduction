import seedrandom from "seedrandom";
import { Point } from "./interface";

export type DiscreteDistribution = {
  points: Point[];
  weights: number[];
};

export type Bounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export const EMPTY_DISTRIBUTION: DiscreteDistribution = {
  points: [],
  weights: [],
};

const isInBounds = (point: Point, bounds: Bounds): boolean => {
  return (
    point.x >= bounds.xMin &&
    point.x <= bounds.xMax &&
    point.y >= bounds.yMin &&
    point.y <= bounds.yMax
  );
};

const sampleGaussian = (
  rng: seedrandom.PRNG,
  mean: number = 0,
  sigma: number = 1
): number => {
  const u1 = rng();
  const u2 = rng();
  return (
    mean + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  );
};

export const generateUniformDistribution = (
  seed: string,
  n: number,
  bounds: Bounds
): DiscreteDistribution => {
  const rng = seedrandom(seed);
  const points: Point[] = [];

  for (let i = 0; i < n; i++) {
    points.push({
      x: bounds.xMin + rng() * (bounds.xMax - bounds.xMin),
      y: bounds.yMin + rng() * (bounds.yMax - bounds.yMin),
    });
  }

  const weights = Array(n).fill(1 / n);
  return { points, weights };
};

export const generateGaussianDistribution = (
  seed: string,
  n: number,
  center: Point,
  sigma: number,
  bounds: Bounds
): DiscreteDistribution => {
  const rng = seedrandom(seed);
  const points: Point[] = [];

  while (points.length < n) {
    const point = {
      x: sampleGaussian(rng, center.x, sigma),
      y: sampleGaussian(rng, center.y, sigma),
    };
    if (isInBounds(point, bounds)) {
      points.push(point);
    }
  }

  const weights = Array(n).fill(1 / n);
  return { points, weights };
};

export const generateCircularDistribution = (
  seed: string,
  n: number,
  center: Point,
  radius: number
): DiscreteDistribution => {
  const rng = seedrandom(seed);
  const points: Point[] = [];

  for (let i = 0; i < n; i++) {
    const angle = rng() * 2 * Math.PI;
    const r = radius * Math.sqrt(rng());

    points.push({
      x: center.x + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle),
    });
  }

  const weights = Array(n).fill(1 / n);
  return { points, weights };
};
