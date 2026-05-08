import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { T, FONTS } from '../constants/theme';
import { MouseLogo } from '../components/MouseLogo';
import { api } from '../services/api';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export function AuthScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.sendCode('+1' + cleaned);
      navigation.navigate('OTP', { phone: '+1' + cleaned });
    } catch (e) {
      setError('failed to send code — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.logoRow}>
          <MouseLogo size={36} />
        </View>

        <Text style={styles.label}>{'// phone number'}</Text>
        <View style={styles.inputRow}>
          <Text style={styles.prompt}>{'>'}</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 000-0000"
            placeholderTextColor={T.phColor}
            keyboardType="phone-pad"
            style={styles.input}
            autoFocus
            selectionColor={T.accent}
            onSubmitEditing={handleSend}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleSend}
          disabled={loading}
          activeOpacity={0.8}
          style={styles.btn}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" size="small" />
          ) : (
            <Text style={styles.btnText}>send code →</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footnote}>
          {'we\'ll send a one-time code via sms'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 48,
  },
  label: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: T.muted2,
    paddingBottom: 10,
    marginBottom: 8,
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
    fontSize: 18,
    padding: 0,
    ...T.accentShadow,
  },
  error: {
    color: '#ff5555',
    fontSize: 9,
    fontFamily: FONTS.regular,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: T.accent,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  btnText: {
    color: '#0a0a0a',
    fontFamily: FONTS.medium,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  footnote: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
