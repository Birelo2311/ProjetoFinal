import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type AdicionarPontoNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarPonto'>;

type Props = {
  navigation: AdicionarPontoNavigationProp;
};

export default function AdicionarPonto({ navigation }: Props) {
  const [nomePonto, setNomePonto] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [loading, setLoading] = useState(false);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);

  const user = auth().currentUser;

  const buscarEndereco = async () => {
    if (cep.length !== 8) {
      Alert.alert('Erro', 'Digite um CEP válido com 8 números.');
      return;
    }

    setBuscandoEndereco(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado.');
        setEnderecoCompleto('');
      } else {
        setEnderecoCompleto(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o endereço.');
      console.error(error);
    } finally {
      setBuscandoEndereco(false);
    }
  };

  const gerarCodigo = async (): Promise<string> => {
    try {
      const snapshot = await firestore()
        .collection('pontosDeColeta')
        .where('userId', '==', user?.uid)
        .get();

      const quantidade = snapshot.size + 1;

      return quantidade < 10 ? `0${quantidade}` : `${quantidade}`;
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      return '00';
    }
  };

  const handleSalvar = async () => {
    if (!nomePonto.trim() || !cep.trim() || !numero.trim() || !enderecoCompleto.trim()) {
      return Alert.alert('Erro', 'Preencha todos os campos.');
    }

    setLoading(true);

    try {
      const codigo = await gerarCodigo();

      await firestore().collection('pontosDeColeta').add({
        codigo,
        nomePonto,
        cep,
        numero,
        enderecoCompleto,
        userId: user?.uid,
        dataCadastro: firestore.Timestamp.now(),
      });

      Alert.alert('Sucesso', `Ponto de coleta cadastrado com sucesso!\nCódigo: ${codigo}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar ponto de coleta.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Adicionar Ponto de Coleta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do Ponto"
          value={nomePonto}
          onChangeText={setNomePonto}
        />

        <TextInput
          style={styles.input}
          placeholder="CEP (somente números)"
          keyboardType="numeric"
          maxLength={8}
          value={cep}
          onChangeText={setCep}
          onBlur={buscarEndereco}
        />

        {buscandoEndereco && <ActivityIndicator size="small" color="#1976D2" style={{ marginBottom: 10 }} />}

        <TextInput
          style={styles.input}
          placeholder="Número"
          keyboardType="numeric"
          value={numero}
          onChangeText={setNumero}
        />

        <TextInput
          style={[styles.input, { backgroundColor: '#f0f0f0' }]}
          placeholder="Endereço completo"
          value={enderecoCompleto}
          editable={false}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#1976D2',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
