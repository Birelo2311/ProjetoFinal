import React, { useState, useEffect } from 'react';
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
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../routes/types';

type EditarPontoRouteProp = RouteProp<RootStackParamList, 'EditarPonto'>;
type EditarPontoNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditarPonto'>;

export default function EditarPonto() {
  const route = useRoute<EditarPontoRouteProp>();
  const navigation = useNavigation<EditarPontoNavigationProp>();
  const { id } = route.params;

  const [codigo, setCodigo] = useState('');
  const [nomePonto, setNomePonto] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [loading, setLoading] = useState(true);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);

  const user = auth().currentUser;

  useEffect(() => {
    async function carregarDados() {
      try {
        const doc = await firestore().collection('pontosDeColeta').doc(id).get();
        const data = doc.data();

        if (data) {
          setCodigo(data.codigo || '');
          setNomePonto(data.nomePonto || '');
          setCep(data.cep || '');
          setNumero(data.numero || '');
          setEnderecoCompleto(data.enderecoCompleto || '');
        } else {
          Alert.alert('Erro', 'Ponto de coleta não encontrado.');
          navigation.goBack();
        }
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id, navigation]);

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

  const handleAlterar = async () => {
    if (!nomePonto.trim() || !cep.trim() || !numero.trim() || !enderecoCompleto.trim()) {
      return Alert.alert('Erro', 'Preencha todos os campos.');
    }

    setLoading(true);

    try {
      await firestore().collection('pontosDeColeta').doc(id).update({
        nomePonto,
        cep,
        numero,
        enderecoCompleto,
        userId: user?.uid,
        dataAtualizacao: firestore.Timestamp.now(),
      });

      Alert.alert('Sucesso', `Ponto de coleta alterado com sucesso!`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao alterar ponto de coleta.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar Ponto de Coleta</Text>

        <View style={[styles.input, { backgroundColor: '#f0f0f0', justifyContent: 'center' }]}>
          <Text>{codigo}</Text>
        </View>

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

        <TouchableOpacity style={styles.button} onPress={handleAlterar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Alterar</Text>}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
