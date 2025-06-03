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
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

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
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // 🔥 Estado para loading
  const user = auth().currentUser;

  // 🔥 Listener em tempo real
  useEffect(() => {
    if (!user) {
      console.log('Usuário não autenticado no listener');
      return;
    }

    const unsubscribe = firestore()
      .collection('doacoes')
      .where('userId', '==', user.uid)
      .orderBy('data', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const lista: Doacao[] = [];
          querySnapshot?.forEach((doc) => {
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
        },
        (error) => {
          console.log('Erro no listener:', error);
        }
      );

    return unsubscribe;
  }, [user]);

  // 🔄 Atualização manual
  const atualizarLista = async () => {
    console.log('Botão Atualizar pressionado');
    if (!user) {
      console.log('Usuário não autenticado');
      return;
    }

    setLoading(true); // 🔥 Ativa loading

    try {
      const snapshot = await firestore()
        .collection('doacoes')
        .where('userId', '==', user.uid)
        //.orderBy('data', 'desc') 🔥 Removido para evitar erro se algum documento não tiver "data"
        .get();

      const lista: Doacao[] = [];
      snapshot.forEach((doc) => {
        const { genero, estacao, tamanho, data } = doc.data();
        lista.push({
          id: doc.id,
          genero,
          estacao,
          tamanho,
          data: data ? data.toDate() : new Date(),
        });
      });

      // 🔥 Ordenação manual após buscar, para substituir o orderBy
      lista.sort((a, b) => b.data.getTime() - a.data.getTime());

      setDoacoes(lista);
      console.log('Lista atualizada manualmente com sucesso');
    } catch (error) {
      console.log('Erro ao atualizar lista manualmente:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a lista.');
    } finally {
      setLoading(false); // 🔥 Desativa loading
    }
  };

  // 🔴 Excluir
  const excluirDoacao = (id: string) => {
    Alert.alert('Excluir Doação', 'Tem certeza que deseja excluir essa doação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('doacoes').doc(id).delete();
            if (itemSelecionado === id) {
              setItemSelecionado(null);
            }
          } catch (error) {
            console.log('Erro ao excluir:', error);
          }
        },
      },
    ]);
  };

  // 🔵 Editar
  const editarDoacao = (id: string) => {
    navigation.navigate('EditarDoacao', { id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Doações</Text>

      {/* 🔄 Botão Atualizar */}
      <TouchableOpacity style={styles.refreshButton} onPress={atualizarLista}>
        <Text style={styles.refreshButtonText}>Atualizar Lista</Text>
      </TouchableOpacity>

      {/* 🔥 Loading indicador */}
      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginBottom: 10 }} />}

      <FlatList
        data={doacoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setItemSelecionado(itemSelecionado === item.id ? null : item.id)}
            style={styles.item}
          >
            <Text style={styles.itemText}>
              {`${item.genero} - ${item.estacao} - ${item.tamanho}`}
            </Text>
            <Text>Data: {item.data.toLocaleDateString()}</Text>

            {itemSelecionado === item.id && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.buttonExcluir}
                  onPress={() => excluirDoacao(item.id)}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonEditar}
                  onPress={() => editarDoacao(item.id)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Você ainda não fez nenhuma doação.</Text>}
      />

      {/* 🔘 Botão flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarDoacao')}
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
  buttonExcluir: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  buttonEditar: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
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
