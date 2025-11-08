import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import RootNavigator from './navigation';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './styles/ThemeProvider';

/**
 * Componente responsável por inicializar providers globais (tema, autenticação e navegação).
 * O carregamento de fontes/assets pode ser configurado aqui — quando houver fontes personalizadas
 * basta utilizar `Font.loadAsync` (expo-font) antes de liberar a interface.
 */
const AppRoot: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const bootstrapAsync = async () => {
      try {
        // TODO: Carregar fontes personalizadas com expo-font quando disponíveis.
        // await Font.loadAsync({ ... });
      } catch (error) {
        console.warn('Falha ao preparar recursos iniciais', error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    bootstrapAsync();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      {/* AuthProvider será implementado em src/hooks/useAuth.tsx */}
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRoot;
