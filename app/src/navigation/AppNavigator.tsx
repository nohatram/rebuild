import React, { useRef } from 'react';
import { Animated, View, useWindowDimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { T } from '../constants/theme';
import { AuthScreen } from '../screens/AuthScreen';
import { OTPScreen } from '../screens/OTPScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AppStatusBar } from '../components/AppStatusBar';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainView() {
  const { width } = useWindowDimensions();
  const translateX = useRef(new Animated.Value(0)).current;

  const goToDashboard = () => {
    Animated.spring(translateX, {
      toValue: -width,
      useNativeDriver: true,
      overshootClamping: true,
    }).start();
  };

  const goToChat = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      overshootClamping: true,
    }).start();
  };

  return (
    <View style={styles.mainContainer}>
      <AppStatusBar />
      <Animated.View
        style={[
          styles.slideContainer,
          { width: width * 2, transform: [{ translateX }] },
        ]}
      >
        <View style={{ width }}>
          <ChatScreen onDashboard={goToDashboard} />
        </View>
        <View style={{ width }}>
          <DashboardScreen onChat={goToChat} />
        </View>
      </Animated.View>
    </View>
  );
}

export function AppNavigator() {
  const [initialRoute, setInitialRoute] = React.useState<
    keyof RootStackParamList | null
  >(null);

  React.useEffect(() => {
    SecureStore.getItemAsync('auth_token').then((token) => {
      setInitialRoute(token ? 'Main' : 'Auth');
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Main" component={MainView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: T.bg,
    overflow: 'hidden',
  },
  slideContainer: {
    flex: 1,
    flexDirection: 'row',
  },
});
