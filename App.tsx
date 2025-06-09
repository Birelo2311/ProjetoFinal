<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/routes/types';

import { SignInScreen } from './src/screens/SignInScreen';
import { AdicionarDoacao } from './src/screens/AdicionarDoacao';
import { EditarDoacao } from './src/screens/EditarDoacao';
import { Main } from './src/routes/Main';
import { DetalhesDoacao } from './src/screens/DetalhesDoacao';
import  CadastroVoluntario  from './src/screens/CadastroVoluntario';
import  EditarVoluntario  from './src/screens/EditarVoluntario';
import  AdicionarVoluntario  from './src/screens/AdicionarVoluntario';
import  { DetalhesVoluntario }   from './src/screens/DetalhesVoluntario';

import { colors } from './src/colors';
import { CadastroONG } from './src/screens/CadastroONG';
import  { AdicionarONG }  from './src/screens/AdicionarONG';
import { DetalhesONG } from './src/screens/DetalhesONG';
import { EditarONG } from './src/screens/EditarONG';
import { RealizaDoacao } from './src/screens/RealizaDoacao';
=======
import React, {useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './src/routes/types';

import {HomeScreen} from './src/screens/HomeScreen';
import {SignInScreen} from './src/screens/SignInScreen';
import {TelaInicial} from './src/screens/telainicial';
import {AdicionarDoacao} from './src/screens/AdicionarDoacao';
import { EditarDoacao } from './src/screens/EditarDoacao';

import {colors} from './src/colors';
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
<<<<<<< HEAD
    const unsubscribe = auth().onAuthStateChanged((_user) => {
=======
    const unsubscribe = auth().onAuthStateChanged(_user => {
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
      setUser(_user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return (
<<<<<<< HEAD
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
=======
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
<<<<<<< HEAD
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

          </>
        ) : (
          <Stack.Screen name="SignIn" component={SignInScreen} />
=======
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="TelaInicial"
              component={TelaInicial}
              options={{title: 'Tela Inicial'}}
            />
            <Stack.Screen
              name="AdicionarDoacao"
              component={AdicionarDoacao}
              options={{title: 'Tela Doação'}}
            />
            <Stack.Screen 
              name="EditarDoacao"
              component={EditarDoacao} 
             />
          </>
        ) : (
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{headerShown: false}}
          />         
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
