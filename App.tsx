import React, { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/routes/types';

import { SignInScreen } from './src/screens/SignInScreen';
import AdicionarDoacao from './src/screens/AdicionarDoacao';
import { EditarDoacao } from './src/screens/EditarDoacao';
import { Main } from './src/routes/Main';
import { DetalhesDoacao } from './src/screens/DetalhesDoacao';
import CadastroVoluntario from './src/screens/CadastroVoluntario';
import EditarVoluntario from './src/screens/EditarVoluntario';
import AdicionarVoluntario from './src/screens/AdicionarVoluntario';
import { DetalhesVoluntario } from './src/screens/DetalhesVoluntario';

import { colors } from './src/colors';
import { CadastroONG } from './src/screens/CadastroONG';
import { AdicionarONG } from './src/screens/AdicionarONG';
import { DetalhesONG } from './src/screens/DetalhesONG';
import { EditarONG } from './src/screens/EditarONG';
import { RealizaDoacao } from './src/screens/RealizaDoacao';
import AdicionarPonto from './src/screens/AdicionarPonto';
import EditarPonto from './src/screens/EditarPonto';
import DetalhesPonto from './src/screens/DetalhesPonto';
import { CadastroDoacao } from './src/screens/CadastroDoacao';
import ManualUsuario from './src/screens/ManualUsuario';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((_user) => {
      setUser(_user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Main" component={Main} />
              <Stack.Screen name="AdicionarDoacao" component={AdicionarDoacao} />
              <Stack.Screen name="EditarDoacao" component={EditarDoacao} />
              <Stack.Screen name="DetalhesDoacao" component={DetalhesDoacao} />
              <Stack.Screen name="CadastroVoluntario" component={CadastroVoluntario} />
              <Stack.Screen name="AdicionarVoluntario" component={AdicionarVoluntario} />
              <Stack.Screen name="EditarVoluntario" component={EditarVoluntario} />
              <Stack.Screen name="DetalhesVoluntario" component={DetalhesVoluntario} />
              <Stack.Screen name="CadastroONG" component={CadastroONG} />
              <Stack.Screen name="AdicionarONG" component={AdicionarONG} />
              <Stack.Screen name="DetalhesONG" component={DetalhesONG} />
              <Stack.Screen name="EditarONG" component={EditarONG} />
              <Stack.Screen name="RealizaDoacao" component={RealizaDoacao} />
              <Stack.Screen name="AdicionarPonto" component={AdicionarPonto} />
              <Stack.Screen name="EditarPonto" component={EditarPonto} />
              <Stack.Screen name="DetalhesPonto" component={DetalhesPonto} />
              <Stack.Screen name="CadastroDoacao" component={CadastroDoacao} />
              <Stack.Screen name="ManualUsuario" component={ManualUsuario} />
            </>
          ) : (
            <Stack.Screen name="SignIn" component={SignInScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default App;
