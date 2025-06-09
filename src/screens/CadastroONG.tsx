import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

interface ONG {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  dataCadastro: FirebaseFirestoreTypes.Timestamp | Date;
}

type NavigationProps = CompositeNavigationProp<
  BottomTabNavigationProp<RootStackParamList, 'CadastroONG'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function CadastroONG() {
  const navigation = useNavigation<NavigationProps>();
  const [ongs, setOngs] = useState<ONG[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('ongs')
      .where('userId', '==', user.uid)
      .orderBy('dataCadastro', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const lista: ONG[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            lista.push({
              id: doc.id,
              nome: data.nome || 'Sem nome',
              cnpj: data.cnpj || 'Não informado',
              telefone: data.telefone || 'Não informado',
              dataCadastro: data.dataCadastro?.toDate?.() || new Date(),
            });
          });
          setOngs(lista);
        },
        (error) => {
          console.log('Erro no listener:', error);
        }
      );

    return unsubscribe;
  }, [user]);

  const atualizarLista = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const snapshot = await firestore()
        .collection('ongs')
        .where('userId', '==', user.uid)
        .get();

      const lista: ONG[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          nome: data.nome || 'Sem nome',
          cnpj: data.cnpj || 'Não informado',
          telefone: data.telefone || 'Não informado',
          dataCadastro: data.dataCadastro?.toDate?.() || new Date(),
        });
      });

      lista.sort((a, b) => {
        const dataA = a.dataCadastro instanceof Date ? a.dataCadastro : a.dataCadastro.toDate();
        const dataB = b.dataCadastro instanceof Date ? b.dataCadastro : b.dataCadastro.toDate();
        return dataB.getTime() - dataA.getTime();
      });

      setOngs(lista);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a lista.');
    } finally {
      setLoading(false);
    }
  };

  const excluirOng = (id: string) => {
    Alert.alert('Excluir ONG', 'Tem certeza que deseja excluir essa ONG?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('ongs').doc(id).delete();
            if (itemSelecionado === id) setItemSelecionado(null);
          } catch (error) {
            console.log('Erro ao excluir:', error);
          }
        },
      },
    ]);
  };

  const editarOng = (id: string) => {
    navigation.navigate('EditarONG', { id });
  };

  const verOng = (ong: ONG) => {
    navigation.navigate('DetalhesONG', {
      id: ong.id,
      nome: ong.nome,
      cnpj: ong.cnpj,
      telefone: ong.telefone,
      dataCadastro: ong.dataCadastro,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ONGs Cadastradas</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={atualizarLista}>
        <Text style={styles.refreshButtonText}>Atualizar Lista</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginBottom: 10 }} />}

      <FlatList
        data={ongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setItemSelecionado(itemSelecionado === item.id ? null : item.id)}
            style={styles.item}
          >
            <Text style={styles.itemText}>{item.nome}</Text>
            <Text>CNPJ: {item.cnpj}</Text>
            <Text>Telefone: {item.telefone}</Text>

            {itemSelecionado === item.id && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonVer]}
                  onPress={() => verOng(item)}
                >
                  <Text style={styles.buttonText}>Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonExcluir]}
                  onPress={() => excluirOng(item.id)}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonEditar]}
                  onPress={() => editarOng(item.id)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Você ainda não cadastrou nenhuma ONG.</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarONG')}
      >
        <Text style={styles.fabText}>+</Text>
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
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonVer: {
    backgroundColor: '#6f42c1',
  },
  buttonExcluir: {
    backgroundColor: '#dc3545',
  },
  buttonEditar: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
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
  fabText: {
    color: '#fff',
    fontSize: 30,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
