import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Image } from 'react-native';
import auth from '@react-native-firebase/auth';

import { CadastroDoacao } from '../screens/CadastroDoacao';
import { CadastroONG } from '../screens/CadastroONG';
import ManualUsuario from '../screens/ManualUsuario';
import { PontosDeColeta } from '../screens/PontosDeColeta';
import { HomeScreen } from '../screens/HomeScreen';

import TabBarButton from '../components/TabBarButton';

const Tab = createBottomTabNavigator();

export const Main = () => {
  const confirmarSair = () => {
    Alert.alert(
      'Confirmação',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth().signOut();
            } catch (error) {
              console.error('Erro ao sair:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const icons: Record<string, any> = {
    HomeScreen: require('../assets/homepage.png'),
    CadastroONG: require('../assets/home.png'),
    ManualUsuario: require('../assets/manual.png'),
    PontosDeColeta: require('../assets/location.png'),
    CadastroDoacao: require('../assets/t-shirt.png'),
    Sair: require('../assets/logout.png'),
  };

  const labels: Record<string, string> = {
    HomeScreen: 'Início',
    CadastroONG: 'ONGs',
    ManualUsuario: 'Manual',
    PontosDeColeta: 'Pontos',
    CadastroDoacao: 'Doações',
    Sair: 'Sair',
  };

  const tabBarColor = '#007AFF';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tabBarColor,
        tabBarInactiveTintColor: '#8e8e93',
        tabBarLabel: labels[route.name],
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Sair') return null; 
          return (
            <Image
              source={icons[route.name]}
              style={{ width: size, height: size, tintColor: color }}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="CadastroONG" component={CadastroONG} />
      <Tab.Screen name="ManualUsuario" component={ManualUsuario} />
      <Tab.Screen name="PontosDeColeta" component={PontosDeColeta} />
      <Tab.Screen name="CadastroDoacao" component={CadastroDoacao} />
      <Tab.Screen
        name="Sair"
        component={() => null}
        options={{
          tabBarButton: (props) => {
            const focused = props.accessibilityState?.selected ?? false;
            return (
              <TabBarButton
                {...props}
                focused={focused}
                icon={icons['Sair']}
                label={labels['Sair']}
                color={tabBarColor}
                size={24}
                onPress={confirmarSair}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};
