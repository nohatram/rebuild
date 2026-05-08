import React, { useState, useRef } from 'react';
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
import { RouteProp } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { T, FONTS } from '../constants/theme';
import { MouseLogo } from '../components/MouseLogo';
import { api } from '../services/api';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'>;
};

export function OTPScreen({ navigation, route }: Props) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('enter the 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { token } = await api.verifyCode(phone, code);
      await SecureStore.setItemAsync('auth_token', token);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      setError('incorrect code — try again');
      setCode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const masked = phone.replace('+1', '').replace(/(\d{3})(\d{3})(\d{4})/, '(***) ***-$3');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.logoRow}>
          <MouseLogo size={36} />
        </View>

        <Text style={styles.label}>{'// code sent to ' + masked}</Text>
        <View style={styles.inputRow}>
          <Text style={styles.prompt}>{'>'}</Text>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            placeholderTextColor={T.phColor}
            keyboardType="number-pad"
            style={styles.input}
            autoFocus
            selectionColor={T.accent}
            onSubmitEditing={handleVerify}
            maxLength={6}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading || code.length < 6}
          activeOpacity={0.8}
          style={[styles.btn, code.length < 6 && styles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#0a0a0a" size="small" />
          ) : (
            <Text style={styles.btnText}>verify →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>{'← wrong number?'}</Text>
        </TouchableOpacity>
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
    fontSize: 28,
    letterSpacing: 8,
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
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: '#0a0a0a',
    fontFamily: FONTS.medium,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  back: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backText: {
    color: T.muted,
    fontSize: 9,
    fontFamily: FONTS.regular,
  },
});
