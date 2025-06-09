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
<<<<<<< HEAD
import { ItemDoacao } from '../types/doacao';

type NavProps = NativeStackNavigationProp<RootStackParamList, 'TelaInicial'>;

interface Doacao {
  id: string;
  destinatarioId: string;
  destino: string;
  data: Date;
  itens: ItemDoacao[];
  nomeDestino: string;
}

=======

interface Doacao {
  id: string;
  genero: string;
  estacao: string;
  tamanho: string;
  data: Date;
}

type NavProps = NativeStackNavigationProp<RootStackParamList, 'TelaInicial'>;

>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
export function TelaInicial() {
  const navigation = useNavigation<NavProps>();
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const user = auth().currentUser;

  const buscarDoacoes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('doacoes')
        .where('userId', '==', user.uid)
        .orderBy('data', 'desc')
        .get();

      const listaTemp: Doacao[] = snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          destinatarioId: data.destinatarioId || '',
          destino: data.destino || '',
          data: data.data ? data.data.toDate() : new Date(),
          itens: data.itens as ItemDoacao[], // <-- ✅ ajuste aqui
          nomeDestino: data.nomeDestino || 'Nome não informado',
        };
      });

      setDoacoes(listaTemp);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as doações.');
      console.error('Erro ao buscar doações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
=======
  const [loading, setLoading] = useState<boolean>(false); // 🔥 Estado para loading
  const user = auth().currentUser;

  // 🔥 Listener em tempo real
  useEffect(() => {
    if (!user) {
      console.log('Usuário não autenticado no listener');
      return;
    }
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c

    const unsubscribe = firestore()
      .collection('doacoes')
      .where('userId', '==', user.uid)
      .orderBy('data', 'desc')
<<<<<<< HEAD
      .onSnapshot(snapshot => {
        const listaTemp: Doacao[] = snapshot.docs.map(doc => {
          const data = doc.data();

          return {
            id: doc.id,
            destinatarioId: data.destinatarioId || '',
            destino: data.destino || '',
            data: data.data ? data.data.toDate() : new Date(),
            itens: data.itens as ItemDoacao[], // <-- ✅ ajuste aqui também
            nomeDestino: data.nomeDestino || 'Nome não informado',
          };
        });

        setDoacoes(listaTemp);
      }, error => {
        console.error('Erro no snapshot:', error);
      });

    return () => unsubscribe();
  }, [user]);

  const onPressAtualizar = () => {
    buscarDoacoes();
  };

=======
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
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
  const excluirDoacao = (id: string) => {
    Alert.alert('Excluir Doação', 'Tem certeza que deseja excluir essa doação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('doacoes').doc(id).delete();
<<<<<<< HEAD
            if (itemSelecionado === id) setItemSelecionado(null);
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir a doação.');
            console.error('Erro ao excluir:', error);
=======
            if (itemSelecionado === id) {
              setItemSelecionado(null);
            }
          } catch (error) {
            console.log('Erro ao excluir:', error);
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
          }
        },
      },
    ]);
  };

<<<<<<< HEAD
=======
  // 🔵 Editar
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
  const editarDoacao = (id: string) => {
    navigation.navigate('EditarDoacao', { id });
  };

<<<<<<< HEAD
  const formatarData = (data: Date) => {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

=======
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Doações</Text>

<<<<<<< HEAD
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={onPressAtualizar}
        activeOpacity={0.7}
        disabled={loading}
      >
        <Text style={styles.refreshButtonText}>
          {loading ? 'Atualizando...' : 'Atualizar Lista'}
        </Text>
      </TouchableOpacity>

=======
      {/* 🔄 Botão Atualizar */}
      <TouchableOpacity style={styles.refreshButton} onPress={atualizarLista}>
        <Text style={styles.refreshButtonText}>Atualizar Lista</Text>
      </TouchableOpacity>

      {/* 🔥 Loading indicador */}
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginBottom: 10 }} />}

      <FlatList
        data={doacoes}
<<<<<<< HEAD
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setItemSelecionado(itemSelecionado === item.id ? null : item.id)}
            style={[
              styles.item,
              itemSelecionado === item.id && styles.itemSelecionado,
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.destinatario}>
              Destinatário: <Text style={styles.nomeDoador}>{item.nomeDestino}</Text> ({item.destino})
            </Text>
            <Text style={styles.data}>Data: {formatarData(item.data)}</Text>
=======
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
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c

            {itemSelecionado === item.id && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
<<<<<<< HEAD
                  style={[styles.actionButton, styles.verButton]}
                  onPress={() => navigation.navigate('DetalhesDoacao', { itens: item.itens })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.excluirButton]}
                  onPress={() => excluirDoacao(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.editarButton]}
                  onPress={() => editarDoacao(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
=======
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
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
<<<<<<< HEAD
        ListEmptyComponent={
          <Text style={styles.emptyText}>Você ainda não fez nenhuma doação.</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarDoacao')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>Receber</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.fab, { bottom: 100, backgroundColor: '#17a2b8' }]}
        onPress={() => navigation.navigate('RealizaDoacao')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>Doar</Text>
=======
        ListEmptyComponent={<Text>Você ainda não fez nenhuma doação.</Text>}
      />

      {/* 🔘 Botão flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarDoacao')}
      >
        <Text style={styles.fabText}>+</Text>
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
<<<<<<< HEAD
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  refreshButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  item: {
    padding: 18,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemSelecionado: {
    backgroundColor: '#e0d4fc',
    borderColor: '#6f42c1',
  },
  destinatario: {
    fontSize: 16,
    color: '#444',
  },
  nomeDoador: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#4b0082',
  },
  data: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verButton: {
    backgroundColor: '#6f42c1',
  },
  excluirButton: {
    backgroundColor: '#dc3545',
  },
  editarButton: {
    backgroundColor: '#007bff',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
=======
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
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#28a745',
<<<<<<< HEAD
    width: 110,
=======
    width: 60,
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
<<<<<<< HEAD
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
=======
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
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
});
