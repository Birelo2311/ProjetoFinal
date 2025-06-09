import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { TelaInicial } from '../screens/telainicial';
import { CadastroONG } from '../screens/CadastroONG';
import CadastroVoluntario from '../screens/CadastroVoluntario';
import { PontosDeColeta } from '../screens/PontosDeColeta';

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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Início') {
            iconName = 'home';
          } else if (route.name === 'CadastroONG') {
            iconName = 'business';
          } else if (route.name === 'CadastroVoluntario') {
            iconName = 'groups';
          } else if (route.name === 'PontosDeColeta') {
            iconName = 'location-on';
          } else if (route.name === 'Sair') {
            iconName = 'logout';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen
        name="Início"
        component={TelaInicial}
      />

      <Tab.Screen
        name="CadastroONG"
        component={CadastroONG}
        options={{ tabBarLabel: 'Cad. ONG' }}
      />

      <Tab.Screen
        name="CadastroVoluntario"
        component={CadastroVoluntario}
        options={{ tabBarLabel: 'Cad. Voluntário' }}
      />

      <Tab.Screen
        name="PontosDeColeta"
        component={PontosDeColeta}
        options={{ tabBarLabel: 'Pontos' }}
      />

      <Tab.Screen
        name="Sair"
        component={EmptyScreen}
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              onPress={confirmarSair}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <MaterialIcons name="logout" size={24} color="#007AFF" />
              <Text style={{ color: '#007AFF', fontSize: 12 }}>Sair</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const EmptyScreen = () => null;
