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
 * @param targetN  選択したい点の数 (<= n)
 * @param metric 距離関数 d(ω_i, ω_j) を返す関数
 * @param probMasses      p_k を格納した長さ n の重み（確率質量）配列
 * @returns        選択されたインデックス（長さ targetN）
 *
 */
export const forwardSelection = (
  targetN: number,
  metric: (i: number, j: number) => number,
  probMasses: number[]
): number[] => {
  const n = probMasses.length;
  // 距離行列をコピーして c_{k,u} を逐次更新可能にしておく
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

  return selected.sort((a, b) => a - b);
};

export const redistribute = (
  elements: number[],
  metric: (i: number, j: number) => number,
  probMasses: number[]
): number[] => {
  const n = probMasses.length;
  const targetN = elements.length;
  const newProbMasses = elements.map((elem) => probMasses[elem]);
  const chosen = new Set(elements);

  for (let elm = 0; elm < n; elm++) {
    if (!chosen.has(elm)) {
      let minDist = Number.POSITIVE_INFINITY;
      let closestIndex = -1;
      for (let j = 0; j < targetN; j++) {
        const dist = metric(elm, elements[j]);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = j;
        }
      }
      newProbMasses[closestIndex] += probMasses[elm];
    }
  }

  return newProbMasses;
};
