import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { T, FONTS } from '../constants/theme';

interface Props {
  text: string;
  onChangeText: (t: string) => void;
  frozen: boolean;
  logged: boolean;
  onLog: () => void;
  estimatedMinutes?: number;
  sessionType?: string;
  sessionNumber?: number;
}

export function WorkoutBlock({
  text,
  onChangeText,
  frozen,
  logged,
  onLog,
  estimatedMinutes = 55,
  sessionType = 'lower body',
  sessionNumber,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={styles.meta}>
        {`// est. ${estimatedMinutes} min · ${sessionType}${sessionNumber != null ? ` · session ${sessionNumber}` : ''}`}
      </Text>
      <View
        style={[
          styles.block,
          focused && !logged && !frozen && styles.blockFocused,
          logged && styles.blockLogged,
          frozen && styles.blockFrozen,
        ]}
      >
        <TextInput
          value={text}
          onChangeText={onChangeText}
          editable={!frozen && !logged}
          multiline
          scrollEnabled={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
          style={[
            styles.textarea,
            { color: logged ? T.muted : T.text },
          ]}
          selectionColor={T.accent}
        />
      </View>
      <View style={styles.footer}>
        {logged ? (
          <Text style={styles.loggedLabel}>✓ logged</Text>
        ) : frozen ? (
          <Text style={styles.frozenLabel}>ai updating…</Text>
        ) : (
          <>
            <Text style={styles.hint}>tap to edit</Text>
            <TouchableOpacity onPress={onLog} activeOpacity={0.7}>
              <Text style={styles.logBtn}>log it</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  meta: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    marginBottom: 7,
    letterSpacing: 0.5,
  },
  block: {
    backgroundColor: T.bgBlock,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  blockFocused: {
    borderColor: T.accent + '55',
  },
  blockLogged: {
    opacity: 0.45,
  },
  blockFrozen: {
    opacity: 0.5,
  },
  textarea: {
    fontFamily: FONTS.regular,
    fontSize: 10.5,
    lineHeight: 19,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 10,
    ...T.textShadow,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },
  hint: {
    color: T.muted,
    fontSize: 8.5,
    fontFamily: FONTS.regular,
  },
  logBtn: {
    color: T.accent,
    fontSize: 11,
    fontFamily: FONTS.regular,
    ...T.accentShadow,
  },
  loggedLabel: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
  },
  frozenLabel: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
  },
});
