import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Line,
  Path,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import { T, FONTS } from '../constants/theme';
import { WeightEntry } from '../types';

interface Props {
  data: WeightEntry[];
  goal?: number;
  width?: number;
}

export function LineChart({ data, goal, width = 280 }: Props) {
  if (data.length < 2) return null;

  const W = width;
  const H = 88;
  const PAD = { top: 6, right: 14, bottom: 20, left: 30 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const weights = data.map((d) => d.weight);
  const minV = Math.min(...weights, goal ?? Infinity) - 0.4;
  const maxV = Math.max(...weights) + 0.4;

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) =>
    PAD.top + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.weight).toFixed(1)}`)
    .join(' ');

  const areaPath =
    linePath +
    ` L ${toX(data.length - 1).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${PAD.left} ${(PAD.top + chartH).toFixed(1)} Z`;

  const goalY = goal ? toY(goal) : null;
  const yLabels = [Math.ceil(maxV), Math.round((maxV + minV) / 2), Math.floor(minV + 0.5)];

  const current = data[data.length - 1].weight;
  const delta = goal ? (current - goal).toFixed(1) : null;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.currentWeight}>{current.toFixed(1)}</Text>
        {goal && <Text style={styles.goalLabel}>goal {goal.toFixed(1)}</Text>}
        {delta && (
          <Text style={styles.delta}>
            {parseFloat(delta) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(delta))} lb
          </Text>
        )}
      </View>
      <Svg width={W} height={H} style={{ overflow: 'visible' }}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={T.accent} stopOpacity={0.1} />
            <Stop offset="100%" stopColor={T.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {yLabels.map((val) => {
          const y = toY(val);
          return (
            <React.Fragment key={val}>
              <Line
                x1={PAD.left} y1={y} x2={PAD.left + chartW} y2={y}
                stroke={T.muted2} strokeWidth={1} strokeDasharray="3 3"
              />
              <SvgText x={PAD.left - 4} y={y + 3.5} textAnchor="end"
                fontFamily={FONTS.regular} fontSize={8} fill={T.muted}>{val}</SvgText>
            </React.Fragment>
          );
        })}

        {goalY !== null && (
          <>
            <Line
              x1={PAD.left} y1={goalY} x2={PAD.left + chartW} y2={goalY}
              stroke={T.accent} strokeWidth={0.8} strokeDasharray="4 4" opacity={0.45}
            />
            <SvgText x={PAD.left + chartW + 3} y={goalY + 3.5}
              fontFamily={FONTS.regular} fontSize={7.5} fill={T.accent} opacity={0.55}>
              {goal}
            </SvgText>
          </>
        )}

        <Path d={areaPath} fill="url(#areaGrad)" />

        <Path
          d={linePath}
          fill="none"
          stroke={T.accent}
          strokeWidth={1.4}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <Circle cx={toX(0)} cy={toY(data[0].weight)} r={2} fill={T.muted} />
        <Circle cx={toX(data.length - 1)} cy={toY(current)} r={3} fill={T.accent} />

        <Line
          x1={PAD.left} y1={PAD.top + chartH} x2={PAD.left + chartW} y2={PAD.top + chartH}
          stroke={T.muted2} strokeWidth={1}
        />

        <SvgText x={PAD.left} y={H - 4}
          fontFamily={FONTS.regular} fontSize={8} fill={T.muted} textAnchor="middle">
          {data[0].date}
        </SvgText>
        <SvgText x={PAD.left + chartW} y={H - 4}
          fontFamily={FONTS.regular} fontSize={8} fill={T.muted} textAnchor="middle">
          {data[data.length - 1].date}
        </SvgText>
        <SvgText
          x={toX(data.length - 1)}
          y={toY(current) - 7}
          fontFamily={FONTS.regular}
          fontSize={7.5}
          fill={T.accent}
          textAnchor="middle"
          opacity={0.8}
        >
          now
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 12,
  },
  currentWeight: {
    color: T.text,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    ...T.textShadow,
  },
  goalLabel: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
  },
  delta: {
    color: T.accent,
    fontSize: 9,
    fontFamily: FONTS.regular,
    ...T.accentShadow,
  },
});
