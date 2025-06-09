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

export function TelaInicial() {
  const navigation = useNavigation<NavProps>();
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
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

    const unsubscribe = firestore()
      .collection('doacoes')
      .where('userId', '==', user.uid)
      .orderBy('data', 'desc')
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

  const excluirDoacao = (id: string) => {
    Alert.alert('Excluir Doação', 'Tem certeza que deseja excluir essa doação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('doacoes').doc(id).delete();
            if (itemSelecionado === id) setItemSelecionado(null);
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir a doação.');
            console.error('Erro ao excluir:', error);
          }
        },
      },
    ]);
  };

  const editarDoacao = (id: string) => {
    navigation.navigate('EditarDoacao', { id });
  };

  const formatarData = (data: Date) => {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Doações</Text>

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

      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginBottom: 10 }} />}

      <FlatList
        data={doacoes}
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

            {itemSelecionado === item.id && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
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
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
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
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
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
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#28a745',
    width: 110,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
});
