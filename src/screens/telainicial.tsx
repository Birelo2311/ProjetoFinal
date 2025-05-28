import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';
import Icon from 'react-native-vector-icons/Feather';

interface Doacao {
  id: string;
  genero: string;
  estacao: string;
  tamanho: string;
  data: Date;
}

type NavProps = NativeStackNavigationProp<RootStackParamList, 'TelaInicial'>;

export function TelaInicial() {
  const navigation = useNavigation<NavProps>();
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('doacoes')
      .where('userId', '==', user.uid)
      .orderBy('data', 'desc')
      .onSnapshot(querySnapshot => {
        const lista: Doacao[] = [];
        querySnapshot.forEach(doc => {
          const { genero, estacao, tamanho, data } = doc.data();
          lista.push({
            id: doc.id,
            genero,
            estacao,
            tamanho,
            data: data ? data.toDate() : new Date(),
          });
        });
        setDoacoes(lista);
      });

    return unsubscribe;
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Doações</Text>

      <FlatList
        data={doacoes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {`${item.genero} - ${item.estacao} - ${item.tamanho}`}
            </Text>
            <Text>Data: {item.data.toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Você ainda não fez nenhuma doação.</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarDoacao')}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 6,
  },
  itemText: { fontWeight: 'bold', fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#28a745',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
