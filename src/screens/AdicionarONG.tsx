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

import {
  aplicarMascaraTelefone,
  aplicarMascaraCEP,
  aplicarMascaraCNPJ,
  validarCNPJ,
} from '../utils/mascaras'; // aqui você precisa criar aplicarMascaraCNPJ e validarCNPJ

type AdicionarONGNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdicionarONG'
>;

type Props = {
  navigation: AdicionarONGNavigationProp;
};

export function AdicionarONG({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;

  const buscarEnderecoPorCEP = async (cepSemMascara: string) => {
    if (cepSemMascara.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepSemMascara}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado.');
        setEndereco('');
        setBairro('');
        setCidade('');
        setEstado('');
        return;
      }

      setEndereco(data.logradouro || '');
      setBairro(data.bairro || '');
      setCidade(data.localidade || '');
      setEstado(data.uf || '');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao buscar o endereço.');
    }
  };

  const verificarCNPJExistente = async (cnpjSemMascara: string) => {
    const snapshot = await firestore()
      .collection('ongs')
      .where('cnpj', '==', cnpjSemMascara)
      .get();

    return !snapshot.empty;
  };

  const handleSalvar = async () => {
    const cnpjSemMascara = cnpj.replace(/\D/g, '');
    const cepSemMascara = cep.replace(/\D/g, '');

    if (!nome.trim()) return Alert.alert('Erro', 'Informe o nome.');
    if (telefone.length < 14) return Alert.alert('Erro', 'Informe um telefone válido.');
    if (!validarCNPJ(cnpjSemMascara)) return Alert.alert('Erro', 'Informe um CNPJ válido.');
    if (await verificarCNPJExistente(cnpjSemMascara)) {
      return Alert.alert('Erro', 'CNPJ já cadastrado.');
    }
    if (cepSemMascara.length !== 8) return Alert.alert('Erro', 'Informe um CEP válido.');
    if (!endereco.trim()) return Alert.alert('Erro', 'Informe um endereço.');
    if (!numero.trim()) return Alert.alert('Erro', 'Informe o número.');
    if (!bairro || !cidade || !estado) {
      return Alert.alert('Erro', 'Preencha todos os campos de endereço.');
    }

    setLoading(true);

    try {
      await firestore().collection('ongs').add({
        nome,
        telefone,
        cnpj: cnpjSemMascara,
        cep: cepSemMascara,
        endereco,
        bairro,
        cidade,
        estado,
        numero,
        userId: user?.uid,
        dataCadastro: firestore.Timestamp.now(),
      });

      Alert.alert('Sucesso', 'ONG cadastrada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar ONG.');
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
        <Text style={styles.title}>Adicionar ONG</Text>

        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />

        <TextInput
          style={styles.input}
          placeholder="Telefone"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={(text) => setTelefone(aplicarMascaraTelefone(text))}
          maxLength={15}
        />

        <TextInput
          style={styles.input}
          placeholder="CNPJ"
          keyboardType="numeric"
          value={cnpj}
          onChangeText={(text) => setCnpj(aplicarMascaraCNPJ(text))}
          maxLength={18} // 00.000.000/0000-00
        />

        <TextInput
          style={styles.input}
          placeholder="CEP"
          keyboardType="numeric"
          value={cep}
          onChangeText={(text) => {
            const mascara = aplicarMascaraCEP(text);
            setCep(mascara);
            const cepLimpo = mascara.replace(/\D/g, '');
            if (cepLimpo.length === 8) buscarEnderecoPorCEP(cepLimpo);
          }}
          maxLength={9}
        />

        <TextInput style={styles.input} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
        <TextInput style={styles.input} placeholder="Número" value={numero} onChangeText={setNumero} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Bairro" value={bairro} onChangeText={setBairro} />
        <TextInput style={styles.input} placeholder="Cidade" value={cidade} onChangeText={setCidade} />
        <TextInput style={styles.input} placeholder="Estado" value={estado} onChangeText={setEstado} maxLength={2} />

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
