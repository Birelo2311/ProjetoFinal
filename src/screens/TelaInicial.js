import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const TelaInicial = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem-vindo à Tela Inicial!</Text>
      
      <Button 
        title="Ir para outra tela"
        onPress={() => navigation.navigate('OutraTela')} // Ajuste para sua próxima tela
      />
    </View>
  );
};

export default TelaInicial;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});
