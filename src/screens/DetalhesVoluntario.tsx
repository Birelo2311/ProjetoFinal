import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalhesVoluntario'>;

type Voluntario = {
  nome: string;
  cpf: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  dataCadastro?: { seconds: number };
};

export function DetalhesVoluntario({ route, navigation }: Props) {
  const { id } = route.params;

  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoluntario = async () => {
      try {
        const doc: FirebaseFirestoreTypes.DocumentSnapshot = await firestore()
          .collection('voluntarios')
          .doc(id)
          .get();

        if (Boolean(doc.exists)) {
          const data = doc.data() as Voluntario;
          setVoluntario(data);
        } else {
          Alert.alert('Erro', 'Voluntário não encontrado.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar os dados.');
        console.error(error);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchVoluntario();
  }, [id, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!voluntario) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Voluntário não encontrado.</Text>
      </View>
    );
  }

  const dataFormatada = voluntario.dataCadastro?.seconds
    ? new Date(voluntario.dataCadastro.seconds * 1000).toLocaleDateString()
    : 'Data inválida';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Voluntário</Text>

      <Info label="Nome" value={voluntario.nome} />
      <Info label="CPF" value={voluntario.cpf} />
      <Info label="Telefone" value={voluntario.telefone} />
      <Info label="CEP" value={voluntario.cep} />
      <Info label="Endereço" value={`${voluntario.endereco}, ${voluntario.numero}`} />
      <Info label="Bairro" value={voluntario.bairro} />
      <Info label="Cidade" value={voluntario.cidade} />
      <Info label="Estado" value={voluntario.estado} />
      <Info label="Data de Cadastro" value={dataFormatada} />
    </View>
  );
}

const Info = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value ?? '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  item: { marginBottom: 15 },
  label: { fontWeight: 'bold', fontSize: 16 },
  value: { fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
