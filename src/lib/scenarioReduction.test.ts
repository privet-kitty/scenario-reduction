import { forwardSelection, redistribute } from "./scenarioReduction";
import seedrandom from "seedrandom";

describe("forwardSelection", () => {
  it("should select correct points for simple 1D case", () => {
    const metric = (i: number, j: number) => Math.abs(i - j);
    const probMasses = [0.25, 0.25, 0.25, 0.25];

    const result = forwardSelection(2, metric, probMasses);
    expect(result).toEqual([1, 2]);
  });

  it("should select correct points for simple 2D case", () => {
    const points = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 0],
    ];
    const metric = (i: number, j: number) => {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      return Math.sqrt(dx * dx + dy * dy);
    };
    const probMasses = [0.2, 0.2, 0.2, 0.2, 0.2];

    const result = forwardSelection(1, metric, probMasses);
    expect(result).toEqual([4]);
  });

  it("should work with random inputs", () => {
    const rng = seedrandom("test-seed-123");
    const n = 20;
    const targetN = 5;
    const points = Array.from({ length: n }, () => ({
      x: rng() * 100,
      y: rng() * 100,
    }));

    const metric = (i: number, j: number) => {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const probMasses = Array.from({ length: n }, () => rng() * 9 + 1);
    const totalMass = probMasses.reduce((a, b) => a + b, 0);
    probMasses.forEach((_, i) => (probMasses[i] /= totalMass));

    const result = forwardSelection(targetN, metric, probMasses);

    expect(result.length).toBe(targetN);
    expect(new Set(result).size).toBe(targetN);
    expect(Math.max(...result)).toBeLessThan(n);
  });
});

describe("redistribute", () => {
  it("should redistribute probabilities correctly for simple case", () => {
    const metric = (i: number, j: number) => Math.abs(i - j);
    const probMasses = [0.2, 0.3, 0.1, 0.4];
    const selected = [1, 3];

    const result = redistribute(selected, metric, probMasses);

    expect(result.length).toBe(2);
    expect(Math.abs(result[0] + result[1] - 1.0) < 1e-10);
    expect(result[0]).toBeCloseTo(0.6); // 0.3 + 0.2 + 0.1
    expect(result[1]).toBeCloseTo(0.4);
  });

  it("should work with random inputs", () => {
    const rng = seedrandom("test-seed-456");
    const n = 20;
    const targetN = 5;
    const points = Array.from({ length: n }, () => ({
      x: rng() * 100,
      y: rng() * 100,
    }));

    const metric = (i: number, j: number) => {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const probMasses = Array.from({ length: n }, () => rng());
    const totalMass = probMasses.reduce((a, b) => a + b, 0);
    probMasses.forEach((_, i) => (probMasses[i] /= totalMass));

    const selected = Array.from({ length: targetN }, (_, i) => i);
    const result = redistribute(selected, metric, probMasses);

    expect(result.length).toBe(targetN);
    expect(Math.abs(result.reduce((a, b) => a + b, 0) - 1.0) < 1e-10);
  });
});
