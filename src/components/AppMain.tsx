"use client";

import { ScatterDistributions } from "@/components/ScatterDistributions";
import {
  generateUniformDistribution,
  generateGaussianDistribution,
  generateCircularDistribution,
} from "@/lib/pointDistribution";
import { forwardSelection, redistribute } from "@/lib/scenarioReduction";
import { useState, useEffect, useCallback } from "react";
import { DiscreteDistribution, EMPTY_DISTRIBUTION } from "@/lib/interface";
import styles from "@/app/page.module.css";

export enum DistributionType {
  UNIFORM = "uniform",
  GAUSSIAN = "gaussian",
  CIRCULAR = "circular",
}

const UNIT_BOUNDS = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

const generateSampleDistribution = (
  type: DistributionType,
  seed: string,
  n: number
): DiscreteDistribution => {
  switch (type) {
    case DistributionType.UNIFORM:
      return generateUniformDistribution(seed, n, UNIT_BOUNDS);
    case DistributionType.GAUSSIAN:
      return generateGaussianDistribution(
        seed,
        n,
        { x: 0.5, y: 0.5 },
        0.3,
        UNIT_BOUNDS
      );
    case DistributionType.CIRCULAR:
      return generateCircularDistribution(seed, n, { x: 0.5, y: 0.5 }, 0.5);
  }
};

const calculateMetric = (points: DiscreteDistribution["points"]) => {
  return (i: number, j: number) => {
    const p1 = points[i];
    const p2 = points[j];
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };
};

export const AppMain = () => {
  const [numberOfPoints, setNumberOfPoints] = useState(50);
  const [seed, setSeed] = useState("42");
  const [distributionType, setDistributionType] = useState<DistributionType>(
    DistributionType.UNIFORM
  );
  const [originalDist, setOriginalDist] =
    useState<DiscreteDistribution>(EMPTY_DISTRIBUTION);
  const [selectedPoints, setSelectedPoints] = useState<number[]>([]);
  const [currentApproximation, setCurrentApproximation] =
    useState<DiscreteDistribution>(EMPTY_DISTRIBUTION);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerateClick = useCallback(() => {
    const dist = generateSampleDistribution(
      distributionType,
      seed,
      numberOfPoints
    );
    setOriginalDist(dist);

    const selected = forwardSelection(
      dist.points.length,
      calculateMetric(dist.points),
      dist.weights
    );
    setSelectedPoints(selected);
    setCurrentStep(0);
    setIsPlaying(false);
    setCurrentApproximation(EMPTY_DISTRIBUTION);
  }, [seed, distributionType, numberOfPoints]);

  const togglePlay = () => {
    if (currentStep >= selectedPoints.length) {
      setCurrentStep(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStep(Number(e.target.value));
    setIsPlaying(false);
  };

  const calculateCurrentApproximation = useCallback(
    (step: number) => {
      if (step === 0 || !originalDist.points.length) {
        return EMPTY_DISTRIBUTION;
      }

      const points = selectedPoints.slice(0, step);
      const newWeights = redistribute(
        points,
        calculateMetric(originalDist.points),
        originalDist.weights
      );

      return {
        points: points.map((i) => originalDist.points[i]),
        weights: newWeights,
      };
    },
    [originalDist, selectedPoints]
  );

  useEffect(() => {
    const newApproximation = calculateCurrentApproximation(currentStep);
    setCurrentApproximation(newApproximation);
  }, [currentStep, calculateCurrentApproximation]);

  useEffect(() => {
    if (!isPlaying || !originalDist.points.length) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= selectedPoints.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(timer);
  }, [isPlaying, selectedPoints.length, originalDist.points.length]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Scenario Reduction Visualizer</h1>

        <div className={styles.controlsContainer}>
          <div className={styles.topControls}>
            <div className={styles.pointsInput}>
              <label htmlFor="numberOfPoints">N:</label>
              <input
                type="number"
                id="numberOfPoints"
                value={numberOfPoints}
                onChange={(e) => setNumberOfPoints(Number(e.target.value))}
                min="10"
                max="1000"
                className={styles.numberField}
              />
            </div>
            <div className={styles.seedInput}>
              <label htmlFor="seed">Seed:</label>
              <input
                type="text"
                id="seed"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className={styles.seedField}
              />
            </div>
            <div className={styles.distributionSelect}>
              <label htmlFor="distribution-type">Base Distribution:</label>
              <select
                id="distribution-type"
                value={distributionType}
                onChange={(e) =>
                  setDistributionType(e.target.value as DistributionType)
                }
                className={styles.distributionField}
              >
                <option value={DistributionType.UNIFORM}>Uniform</option>
                <option value={DistributionType.GAUSSIAN}>Gaussian</option>
                <option value={DistributionType.CIRCULAR}>
                  Circular Uniform
                </option>
              </select>
            </div>
            <button
              onClick={handleGenerateClick}
              className={styles.generateButton}
            >
              Generate
            </button>
          </div>

          {originalDist.points.length > 0 && (
            <div className={styles.playControls}>
              <button onClick={togglePlay} className={styles.playButton}>
                {isPlaying ? "Pause" : "Play"}
              </button>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min="0"
                  max={selectedPoints.length}
                  value={currentStep}
                  onChange={handleSliderChange}
                  className={styles.slider}
                />
                <span className={styles.stepCount}>
                  {currentStep}/{selectedPoints.length}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.currentVisualization}>
          <h3>Using {currentStep} point(s)</h3>
          <ScatterDistributions
            distribution1={originalDist}
            distribution2={currentApproximation}
            bounds={{ xMin: 0, xMax: 1, yMin: 0, yMax: 1 }}
            width={600}
            height={600}
          />
        </div>
      </main>
    </div>
  );
};
