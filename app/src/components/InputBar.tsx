import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { T, FONTS } from '../constants/theme';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function InputBar({ value, onChangeText, onSend, disabled }: Props) {
  const inputRef = useRef<TextInput>(null);
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.hint}>
        <Text style={styles.hintSlash}>{'//'}</Text>
        <Text style={styles.hintText}>type to chat or change your workout</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.prompt}>{'>'}</Text>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSend}
          placeholder="bench press 185lb 4×8"
          placeholderTextColor={T.phColor}
          style={styles.input}
          editable={!disabled}
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          returnKeyType="send"
          selectionColor={T.accent}
        />
        <TouchableOpacity
          onPress={onSend}
          disabled={!canSend}
          activeOpacity={0.7}
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
        >
          <Svg width={18} height={18} viewBox="0 0 16 16" fill="none">
            <Path
              d="M3 8h10M9 4l4 4-4 4"
              stroke={canSend ? '#0a0a0a' : T.muted}
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: T.bgIn,
    borderTopWidth: 1,
    borderTopColor: T.muted2,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  hintSlash: {
    color: T.accent,
    opacity: 0.65,
    fontSize: 10,
    fontFamily: FONTS.regular,
  },
  hintText: {
    color: T.muted,
    fontSize: 10,
    fontFamily: FONTS.regular,
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 16,
    paddingLeft: 18,
    paddingRight: 12,
  },
  prompt: {
    color: T.accent,
    fontSize: 16,
    fontFamily: FONTS.medium,
    ...T.accentShadow,
  },
  input: {
    flex: 1,
    color: T.accent,
    fontFamily: FONTS.regular,
    fontSize: 14,
    padding: 0,
    ...T.accentShadow,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: T.muted2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  sendBtnActive: {
    borderColor: T.accent,
    backgroundColor: T.accent,
    opacity: 1,
  },
});
