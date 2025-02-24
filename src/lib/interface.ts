export type Point = {
  x: number;
  y: number;
};

export type DiscreteDistribution = {
  points: Point[];
  weights: number[];
};

export const EMPTY_DISTRIBUTION: DiscreteDistribution = {
  points: [],
  weights: [],
};
