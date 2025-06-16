import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalhesPonto'>;

type Ponto = {
  nomePonto: string;
  cep: string;
  numero: string;
  enderecoCompleto: string;
};

export default function DetalhesPonto({ route, navigation }: Props) {
  const { id } = route.params;

  const [ponto, setPonto] = useState<Ponto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPonto() {
      try {
        const doc = await firestore().collection('pontosDeColeta').doc(id).get();
        const data = doc.data();
        if (data) {
          setPonto({
            nomePonto: data.nomePonto || '',
            cep: data.cep || '',
            numero: data.numero || '',
            enderecoCompleto: data.enderecoCompleto || '',
          });
        } else {
          Alert.alert('Erro', 'Ponto de coleta não encontrado.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro ao carregar ponto de coleta.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
    carregarPonto();
  }, [id, navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!ponto) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{ponto.nomePonto}</Text>
      <Text style={styles.text}>CEP: {ponto.cep}</Text>
      <Text style={styles.text}>Número: {ponto.numero}</Text>
      <Text style={styles.text}>Endereço: {ponto.enderecoCompleto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
});
