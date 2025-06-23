
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
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface Voluntario {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  dataCadastro: FirebaseFirestoreTypes.Timestamp | Date;
}

type NavProps = NativeStackNavigationProp<RootStackParamList, 'CadastroVoluntario'>;

export default function CadastroVoluntario() {
  const navigation = useNavigation<NavProps>();
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('voluntarios')
      .where('userId', '==', user.uid)
      .orderBy('dataCadastro', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const lista: Voluntario[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            lista.push({
              id: doc.id,
              nome: data.nome || 'Sem nome',
              cpf: data.cpf || 'Não informado',
              telefone: data.telefone || 'Não informado',
              email: data.email || 'Não informado',
              dataCadastro: data.dataCadastro ? data.dataCadastro.toDate() : new Date(),
            });
          });
          setVoluntarios(lista);
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
        .collection('voluntarios')
        .where('userId', '==', user.uid)
        .get();

      const lista: Voluntario[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({
          id: doc.id,
          nome: data.nome || 'Sem nome',
          cpf: data.cpf || 'Não informado',
          telefone: data.telefone || 'Não informado',
          email: data.email || 'Não informado',
          dataCadastro: data.dataCadastro ? data.dataCadastro.toDate() : new Date(),
        });
      });

      lista.sort((a, b) => {
          const dataA = a.dataCadastro instanceof Date ? a.dataCadastro : a.dataCadastro.toDate();
          const dataB = b.dataCadastro instanceof Date ? b.dataCadastro : b.dataCadastro.toDate();
          return dataB.getTime() - dataA.getTime();
      });


      setVoluntarios(lista);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a lista.');
    } finally {
      setLoading(false);
    }
  };

  const excluirVoluntario = (id: string) => {
    Alert.alert('Excluir Voluntário', 'Tem certeza que deseja excluir esse voluntário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('voluntarios').doc(id).delete();
            if (itemSelecionado === id) setItemSelecionado(null);
          } catch (error) {
            console.log('Erro ao excluir:', error);
          }
        },
      },
    ]);
  };

  const editarVoluntario = (id: string) => {
    navigation.navigate('EditarVoluntario', { id });
  };

  const verVoluntario = (voluntario: Voluntario) => {
    navigation.navigate('DetalhesVoluntario', {
      id: voluntario.id,
      nome: voluntario.nome,
      cpf: voluntario.cpf,
      telefone: voluntario.telefone,
      email: voluntario.email,
      dataCadastro: voluntario.dataCadastro,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voluntários Cadastrados</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={atualizarLista}>
        <Text style={styles.refreshButtonText}>Atualizar Lista</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginBottom: 10 }} />}

      <FlatList
        data={voluntarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setItemSelecionado(itemSelecionado === item.id ? null : item.id)}
            style={styles.item}
          >
            <Text style={styles.itemText}>{item.nome}</Text>
            <Text>CPF: {item.cpf}</Text>
            <Text>Telefone: {item.telefone}</Text>

            {itemSelecionado === item.id && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonVer]}
                  onPress={() => verVoluntario(item)}
                >
                  <Text style={styles.buttonText}>Ver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonExcluir]}
                  onPress={() => excluirVoluntario(item.id)}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonEditar]}
                  onPress={() => editarVoluntario(item.id)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Você ainda não cadastrou nenhum voluntário.</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdicionarVoluntario')}
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
