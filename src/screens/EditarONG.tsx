import React, { useEffect, useState } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../routes/types';

import {
  aplicarMascaraTelefone,
  aplicarMascaraCEP,
  aplicarMascaraCNPJ,
  validarCNPJ,
} from '../utils/mascaras';

type EditarONGRouteProp = RouteProp<RootStackParamList, 'EditarONG'>;

export function EditarONG() {
  const route = useRoute<EditarONGRouteProp>();
  const navigation = useNavigation();

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

  const { id } = route.params;

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const doc = await firestore().collection('ongs').doc(id).get();

        if (!doc.exists) {
          Alert.alert('Erro', 'ONG não encontrada.');
          navigation.goBack();
          return;
        }

        const data = doc.data();
        if (data) {
          setNome(data.nome || '');
          setTelefone(aplicarMascaraTelefone(data.telefone || ''));
          setCnpj(aplicarMascaraCNPJ(data.cnpj || ''));
          setCep(aplicarMascaraCEP(data.cep || ''));
          setEndereco(data.endereco || '');
          setBairro(data.bairro || '');
          setCidade(data.cidade || '');
          setEstado(data.estado || '');
          setNumero(data.numero || '');
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro ao carregar os dados da ONG.');
        console.error(error);
      }
    };

    carregarDados();
  }, [id, navigation]);

  const buscarEnderecoPorCEP = async (cepSemMascara: string) => {
    if (cepSemMascara.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepSemMascara}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado.');
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

  const handleAtualizar = async () => {
    const cnpjSemMascara = cnpj.replace(/\D/g, '');
    const cepSemMascara = cep.replace(/\D/g, '');

    if (!nome.trim()) return Alert.alert('Erro', 'Informe o nome.');
    if (telefone.length < 14) return Alert.alert('Erro', 'Informe um telefone válido.');
    if (!validarCNPJ(cnpjSemMascara)) return Alert.alert('Erro', 'Informe um CNPJ válido.');
    if (cepSemMascara.length !== 8) return Alert.alert('Erro', 'Informe um CEP válido.');
    if (!endereco.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim()) {
      return Alert.alert('Erro', 'Preencha todos os campos de endereço.');
    }

    setLoading(true);

    try {
      await firestore().collection('ongs').doc(id).update({
        nome,
        telefone,
        cnpj: cnpjSemMascara,
        cep: cepSemMascara,
        endereco,
        numero,
        bairro,
        cidade,
        estado,
      });

      Alert.alert('Sucesso', 'ONG atualizada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar ONG.');
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
        <Text style={styles.title}>Editar ONG</Text>

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
          onChangeText={(text) => {
            const apenasNumeros = text.replace(/\D/g, '');
            if (apenasNumeros.length <= 14) {
              setCnpj(aplicarMascaraCNPJ(apenasNumeros));
            }
          }}
          maxLength={18}
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

        <TouchableOpacity style={styles.button} onPress={handleAtualizar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Atualizar</Text>}
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
    backgroundColor: '#388E3C',
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
