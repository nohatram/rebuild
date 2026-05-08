import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { T, FONTS } from '../constants/theme';

interface Props {
  text: string;
}

export function AIMessage({ text }: Props) {
  return (
    <Text style={styles.text}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: T.text,
    fontSize: 10.5,
    lineHeight: 19,
    fontFamily: FONTS.regular,
    ...T.textShadow,
  },
});
