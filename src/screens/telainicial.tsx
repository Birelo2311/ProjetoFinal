import React from 'react';
import {View, Text} from 'react-native';
import {styles} from './styles';
import {MyButton} from '../components/MyButton';

export function TelaInicial() {
  function handleTest() {
    console.log('Botão Teste foi pressionado');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste123</Text>
      <MyButton onPress={handleTest} title="Teste" />
      <Text>
        by <Text style={styles.coffText}>Coffstack</Text>
      </Text>
    </View>
  );
}
