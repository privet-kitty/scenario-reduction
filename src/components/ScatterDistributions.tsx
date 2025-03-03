"use client";

import { DiscreteDistribution } from "@/lib/interface";
import { Bounds } from "@/lib/pointDistribution";
import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
} from "recharts";

type VisualizerProps = {
  distribution1: DiscreteDistribution;
  distribution2?: DiscreteDistribution;
  bounds: Bounds;
  width: number;
  height: number;
};

type DataPoint = { x: number; y: number; z: number };

// HACK: Force "absolute" radius to Scattered points
const MIN_MAX_DATA_POINTS = [
  { x: 2, y: 2, z: 0 },
  { x: 100, y: 100, z: 1 },
];

export const ScatterDistributions: React.FC<VisualizerProps> = ({
  distribution1,
  distribution2,
  bounds,
  width,
  height,
}) => {
  // HACK: Workaround for a problem in recharts that causes an error on the first render
  const [mounted, setMounted] = useState(false);
  const [data1, setData1] = useState<DataPoint[]>([]);
  const [data2, setData2] = useState<DataPoint[]>([]);

  useEffect(() => {
    setMounted(true);
    setData1(
      MIN_MAX_DATA_POINTS.concat(
        (distribution1.points || []).map((p, i) => ({
          x: p.x,
          y: p.y,
          z: distribution1.weights[i] || 0,
        }))
      )
    );
    setData2(
      MIN_MAX_DATA_POINTS.concat(
        (distribution2?.points || []).map((p, i) => ({
          x: p.x,
          y: p.y,
          z: distribution2?.weights[i] || 0,
        }))
      )
    );
    console.log(distribution2?.weights);
  }, [distribution1, distribution2]);

  if (!mounted) return null;

  return (
    <ScatterChart
      width={width}
      height={height}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    >
      <CartesianGrid />
      <XAxis
        type="number"
        dataKey="x"
        domain={[bounds.xMin, bounds.xMax]}
        allowDataOverflow={true}
      />
      <YAxis
        type="number"
        dataKey="y"
        domain={[bounds.yMin, bounds.yMax]}
        allowDataOverflow={true}
      />
      <ZAxis
        dataKey="z"
        range={[100, 100 * distribution1.points.length]}
        zAxisId={1}
      />
      <ZAxis
        dataKey="z"
        range={[100, 100 * distribution1.points.length]}
        zAxisId={2}
      />
      <Tooltip />

      <Scatter
        name="Distribution 1"
        data={data1}
        fill="#8884d8"
        fillOpacity={0.4}
        shape="circle"
        zAxisId={1}
      />

      {distribution2 && (
        <Scatter
          name="Distribution 2"
          data={data2}
          // reddish
          fill="#E57373"
          fillOpacity={0.6}
          shape="circle"
          zAxisId={2}
        />
      )}
    </ScatterChart>
  );
};
