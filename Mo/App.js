import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/home/HomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

export default function App() {
  const [authScreen, setAuthScreen] = useState('login');

  return (
    <SafeAreaProvider>
      {authScreen === 'register' && (
        <RegisterScreen onNavigateLogin={() => setAuthScreen('login')} />
      )}

      {authScreen === 'home' && <HomeScreen />}

      {authScreen === 'login' && (
        <LoginScreen
          onLogin={() => setAuthScreen('home')}
          onNavigateRegister={() => setAuthScreen('register')}
        />
      )}
    </SafeAreaProvider>
  );
}
