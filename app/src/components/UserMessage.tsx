import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { T, FONTS } from '../constants/theme';

interface Props {
  text: string;
}

export function UserMessage({ text }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.dashes} numberOfLines={1}>
        {'─'.repeat(60)}
      </Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-end',
  },
  dashes: {
    flex: 1,
    color: T.accent,
    opacity: 0.15,
    fontSize: 8.5,
    letterSpacing: -1,
    fontFamily: FONTS.regular,
  },
  text: {
    color: T.accent,
    fontSize: 10.5,
    textAlign: 'right',
    maxWidth: '70%',
    lineHeight: 16,
    flexShrink: 0,
    fontFamily: FONTS.regular,
    ...T.accentShadow,
  },
});
