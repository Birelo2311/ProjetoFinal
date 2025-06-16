import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

import addIcon from '../assets/inbox.png';
import realizaIcon from '../assets/outbox.png';

interface Doacao {
  id: string;
  doadorNome: string;
  doadorTipo: string;
  data: Date;
}

type NavProps = NativeStackNavigationProp<RootStackParamList, 'CadastroDoacao'>;

export function CadastroDoacao() {
  const navigation = useNavigation<NavProps>();
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('doacoes')
      .orderBy('data', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const lista: Doacao[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            lista.push({
              id: doc.id,
              doadorNome: data.doadorNome || 'Sem nome',
              doadorTipo: data.doadorTipo || 'Voluntário',
              data: data.data ? (data.data.toDate ? data.data.toDate() : data.data) : new Date(),
            });
          });
          setDoacoes(lista);
        },
        (error) => {
          console.log('Erro no listener:', error);
        }
      );

    return unsubscribe;
  }, []);

  const atualizarLista = async () => {
    setLoading(true);

    try {
      const snapshot = await firestore()
        .collection('doacoes')
        .orderBy('data', 'desc')
        .get();

      const lista: Doacao[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          doadorNome: data.doadorNome || 'Sem nome',
          doadorTipo: data.doadorTipo || 'Voluntário',
          data: data.data ? (data.data.toDate ? data.data.toDate() : data.data) : new Date(),
        });
      });

      setDoacoes(lista);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível atualizar a lista.');
    } finally {
      setLoading(false);
    }
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
            console.log('Erro ao excluir:', error);
          }
        },
      },
    ]);
  };

  const editarDoacao = (id: string) => {
    navigation.navigate('EditarDoacao', { id });
  };

  const verDoacao = (doacao: Doacao) => {
    navigation.navigate('DetalhesDoacao', { itens: [] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doações Cadastradas</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={atualizarLista}>
        <Text style={styles.refreshButtonText}>Atualizar Lista</Text>
      </TouchableOpacity>

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
              Doador: {item.doadorNome} ({item.doadorTipo})
            </Text>
            <Text>
              Data: {item.data instanceof Date ? item.data.toLocaleDateString() : ''}
            </Text>

            {itemSelecionado === item.id && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonVer]}
                  onPress={() => verDoacao(item)}
                >
                  <Text style={styles.buttonText}>Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonExcluir]}
                  onPress={() => excluirDoacao(item.id)}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonEditar]}
                  onPress={() => editarDoacao(item.id)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Você ainda não cadastrou nenhuma doação.</Text>}
      />

      {/* Botões Flutuantes */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AdicionarDoacao')}
        >
          <Image source={addIcon} style={styles.fabImage} />
          <Text style={styles.fabText}>Receber</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('RealizaDoacao')}
        >
          <Image source={realizaIcon} style={styles.fabImage} />
          <Text style={styles.fabText}>Doar</Text>
        </TouchableOpacity>
      </View>
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
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    flexDirection: 'column',
    alignItems: 'center',
  },
  fab: {
    backgroundColor: '#fff', // Fundo branco
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    borderWidth: 2, // Contorno preto
    borderColor: '#000',
  },
  fabImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  fabText: {
    color: '#000', // Texto preto
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
