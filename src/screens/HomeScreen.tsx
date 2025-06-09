import React from 'react';
import {View, Text} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../routes/types';

import {MyButton} from '../components/MyButton';
import {styles} from './styles';

<<<<<<< HEAD
type HomeScreenProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
=======
type HomeScreenProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenProp>();

  function signOut() {
    auth().signOut();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Essa tela só pode ser vista por usuários autenticados
      </Text>
      <MyButton onPress={signOut} title="Sair" />
      <MyButton
        onPress={() => navigation.navigate('TelaInicial')}
        title="Ir para Tela Inicial"
      />
      <Text>
        by <Text style={styles.coffText}>ProjetoEG</Text>
      </Text>
    </View>
  );
}
