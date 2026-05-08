import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { T, FONTS } from '../constants/theme';

function BatteryIcon() {
  return (
    <View style={styles.batteryWrapper}>
      <View style={styles.batteryBody}>
        <View style={styles.batteryFill} />
      </View>
      <View style={styles.batteryTip} />
    </View>
  );
}

function SignalBars() {
  return (
    <View style={styles.signalBars}>
      {[4, 6, 9, 12].map((h, i) => (
        <View
          key={i}
          style={[
            styles.signalBar,
            { height: h, backgroundColor: i < 3 ? T.statusMuted : T.muted2 },
          ]}
        />
      ))}
    </View>
  );
}

function WifiIcon() {
  return (
    <Svg width={12} height={9} viewBox="0 0 14 10" fill="none" opacity={0.5}>
      <Path d="M7 8.5a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z" fill={T.statusMuted} />
      <Path d="M4.5 6.5C5.3 5.7 6.1 5.3 7 5.3s1.7.4 2.5 1.2" stroke={T.statusMuted} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M2.2 4.2A6.7 6.7 0 0 1 7 2c1.9 0 3.5.8 4.8 2.2" stroke={T.statusMuted} strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

export function AppStatusBar() {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    }, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.icons}>
        <SignalBars />
        <WifiIcon />
        <BatteryIcon />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: T.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  time: {
    color: T.statusMuted,
    fontSize: 10,
    fontFamily: FONTS.regular,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 2.5,
    borderRadius: 1,
  },
  batteryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.55,
  },
  batteryBody: {
    width: 18,
    height: 9,
    borderWidth: 1,
    borderColor: T.statusMuted,
    borderRadius: 2,
    padding: 1.5,
    justifyContent: 'center',
  },
  batteryFill: {
    width: '72%',
    height: '100%',
    backgroundColor: T.statusMuted,
    borderRadius: 1,
  },
  batteryTip: {
    width: 2,
    height: 4,
    backgroundColor: T.statusMuted,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    opacity: 0.5,
  },
});
