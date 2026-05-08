import React, { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  FiraCode_300Light,
  FiraCode_400Regular,
  FiraCode_500Medium,
  FiraCode_600SemiBold,
} from '@expo-google-fonts/fira-code';
import * as SplashScreen from 'expo-splash-screen';
import { T } from './src/constants/theme';
import { AppNavigator } from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    FiraCode_300Light,
    FiraCode_400Regular,
    FiraCode_500Medium,
    FiraCode_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: T.bg }}>
      <StatusBar style="light" backgroundColor={T.bg} />
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppNavigator />
      </View>
    </GestureHandlerRootView>
  );
}
