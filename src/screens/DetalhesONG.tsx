import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalhesONG'>;

type ONG = {
  nome: string;
  cnpj: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  dataCadastro?: { seconds: number };
};

export function DetalhesONG({ route, navigation }: Props) {
  const { id } = route.params;

  const [ong, setOng] = useState<ONG | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchONG = async () => {
      try {
        const doc: FirebaseFirestoreTypes.DocumentSnapshot = await firestore()
          .collection('ongs')
          .doc(id)
          .get();

        if (Boolean(doc.exists)) {
          const data = doc.data() as ONG;
          setOng(data);
        } else {
          Alert.alert('Erro', 'ONG não encontrada.', [
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

    fetchONG();
  }, [id, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!ong) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ONG não encontrada.</Text>
      </View>
    );
  }

  const dataFormatada = ong.dataCadastro?.seconds
    ? new Date(ong.dataCadastro.seconds * 1000).toLocaleDateString()
    : 'Data inválida';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes da ONG</Text>

      <Info label="Nome" value={ong.nome} />
      <Info label="CNPJ" value={ong.cnpj} />
      <Info label="Telefone" value={ong.telefone} />
      <Info label="CEP" value={ong.cep} />
      <Info label="Endereço" value={`${ong.endereco}, ${ong.numero}`} />
      <Info label="Bairro" value={ong.bairro} />
      <Info label="Cidade" value={ong.cidade} />
      <Info label="Estado" value={ong.estado} />
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
