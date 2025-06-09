import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type EditarDoacaoRouteProp = RouteProp<RootStackParamList, 'EditarDoacao'>;
type NavProps = NativeStackNavigationProp<RootStackParamList, 'EditarDoacao'>;

export function EditarDoacao() {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<EditarDoacaoRouteProp>();
  const { id } = route.params;

  const user = auth().currentUser;

  const [genero, setGenero] = useState('');
  const [estacao, setEstacao] = useState('');
  const [tamanho, setTamanho] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const doc = await firestore().collection('doacoes').doc(id).get();
        if (doc.exists()) {
          const data = doc.data();
          setGenero(data?.genero || '');
          setEstacao(data?.estacao || '');
          setTamanho(data?.tamanho || '');
        }
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, [id]);

  const salvarEdicao = async () => {
    if (!genero || !estacao || !tamanho) {
      Alert.alert('Preencha todos os campos');
      return;
    }

    try {
      await firestore().collection('doacoes').doc(id).update({
        genero,
        estacao,
        tamanho,
      });
      Alert.alert('Doação atualizada com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.log('Erro ao atualizar:', error);
      Alert.alert('Erro ao atualizar a doação.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Doação</Text>

      <Text style={styles.label}>Gênero</Text>
      <TextInput
        style={styles.input}
        value={genero}
        onChangeText={setGenero}
        placeholder="Digite o gênero"
      />

      <Text style={styles.label}>Estação</Text>
      <TextInput
        style={styles.input}
        value={estacao}
        onChangeText={setEstacao}
        placeholder="Digite a estação"
      />

      <Text style={styles.label}>Tamanho</Text>
      <TextInput
        style={styles.input}
        value={tamanho}
        onChangeText={setTamanho}
        placeholder="Digite o tamanho"
      />

      <TouchableOpacity style={styles.button} onPress={salvarEdicao}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
