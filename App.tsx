// Instruções: execute `npm install` para instalar as dependências e `expo start` para iniciar o servidor de desenvolvimento.
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppRoot from './src/AppRoot';

/**
 * Componente principal que injeta o provedor de áreas seguras do Expo e
 * renderiza o AppRoot contendo os providers globais e a navegação principal.
 */
const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppRoot />
    </SafeAreaProvider>
  );
};

export default App;
