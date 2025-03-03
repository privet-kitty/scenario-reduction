import assert from "assert";

/**
 * Fast forward selection without redistribution
 *
 * Time complexity: O(n^2 * targetN)
 *
 * Reference:
 * - Heitsch, Holger and Werner Römisch. “Scenario Reduction Algorithms in Stochastic Programming.”
 * Computational Optimization and Applications 24 (2003): 187-206.
 * - Dupacová, Jitka, Nicole Gröwe-Kuska and Werner Römisch. “Scenario reduction in stochastic programming.”
 * Mathematical Programming 95 (2003): 493-511.
 *
 * @param targetN Number of scenarios to select
 * @param metric function to calculate the distance between two elements
 * @param probMasses Probability masses of each element
 * @returns Selected indices ordered by the selection order
 *
 */
export const forwardSelection = (
  targetN: number,
  metric: (i: number, j: number) => number,
  probMasses: number[]
): number[] => {
  const n = probMasses.length;
  // Copy the distance matrix and make c_{k,u} updatable sequentially
  const tmpDistMatrix = new Array(n);
  for (let i = 0; i < n; i++) {
    tmpDistMatrix[i] = new Array(n);
    for (let j = 0; j < n; j++) {
      tmpDistMatrix[i][j] = metric(i, j);
    }
  }
  // z_u <- Σ_k p_k * c(ω_k, ω_u)
  const objs = new Array(n).fill(0);
  for (let u = 0; u < n; u++) {
    objs[u] = probMasses.reduce(
      (acc, probMass, k) => acc + probMass * tmpDistMatrix[k][u],
      0
    );
  }

  // u <- argmin_{u} z_u
  let minVal = Number.POSITIVE_INFINITY;
  let u1 = -1;
  for (let i = 0; i < n; i++) {
    if (objs[i] < minVal) {
      minVal = objs[i];
      u1 = i;
    }
  }

  const selected = [u1];
  const notSelected = new Set<number>(Array.from({ length: n }, (_, i) => i));
  notSelected.delete(u1);

  while (selected.length < targetN) {
    const lastElement = selected[selected.length - 1];

    // c_{k,u} <- min( c_{k,u}, c_{k, lastElement} )
    for (const k of notSelected) {
      const lastDist = tmpDistMatrix[k][lastElement];
      const rowK = tmpDistMatrix[k];
      for (const u of notSelected) {
        rowK[u] = Math.min(rowK[u], lastDist);
      }
    }

    // z_u <- Σ_{k in J} p_k c_{k,u}
    for (const u of notSelected) {
      objs[u] = Array.from(notSelected).reduce(
        (sumVal, k) => sumVal + probMasses[k] * tmpDistMatrix[k][u],
        0
      );
    }

    // u_i <- argmin_{u in J} z_u
    let nextElement = -1;
    let minVal = Number.POSITIVE_INFINITY;
    for (const u of notSelected) {
      if (objs[u] < minVal) {
        minVal = objs[u];
        nextElement = u;
      }
    }

    selected.push(nextElement);
    assert(notSelected.delete(nextElement));
  }

  return selected;
};

export const redistribute = (
  selectedElements: number[],
  metric: (i: number, j: number) => number,
  originalProbMasses: number[]
): number[] => {
  const n = originalProbMasses.length;
  const targetN = selectedElements.length;
  const newProbMasses = selectedElements.map(
    (elem) => originalProbMasses[elem]
  );
  const selectedSet = new Set(selectedElements);

  for (let elm = 0; elm < n; elm++) {
    if (!selectedSet.has(elm)) {
      let minDist = Number.POSITIVE_INFINITY;
      let closestIndex = -1;
      for (let j = 0; j < targetN; j++) {
        const dist = metric(elm, selectedElements[j]);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = j;
        }
      }
      newProbMasses[closestIndex] += originalProbMasses[elm];
    }
  }

  return newProbMasses;
};
