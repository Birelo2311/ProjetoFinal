import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { RadioButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

// Tipagem de navegação
type AdicionarDoacaoNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdicionarDoacao'>;

type Props = {
  navigation: AdicionarDoacaoNavigationProp;
};

// Tipagem dos estados
interface PontoColeta {
  id: string;
  codigo: string;
  nomePonto: string;
}

interface Destinatario {
  id: string;
  nome: string;
}

interface Item {
  nome: string;
  quantidade: string;
  tamanho: string;
  sexo: string;
}

export default function AdicionarDoacao({ navigation }: Props) {
  const [pontos, setPontos] = useState<PontoColeta[]>([]);
  const [pontoSelecionado, setPontoSelecionado] = useState<PontoColeta | null>(null);
  const [showPontoModal, setShowPontoModal] = useState(true);

  const [destino, setDestino] = useState<'ONG' | 'Voluntario' | ''>('');
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [destinatarioSelecionado, setDestinatarioSelecionado] = useState<Destinatario | null>(null);

  const [itens, setItens] = useState<Item[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);

  const [novoItem, setNovoItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [sexo, setSexo] = useState('');

  const [loading, setLoading] = useState(false);

  const user = auth().currentUser;

  useEffect(() => {
    const fetchPontos = async () => {
      const snapshot = await firestore().collection('pontosDeColeta').get();
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PontoColeta));
      setPontos(lista);
    };
    fetchPontos();
  }, []);

  const fetchDestinatarios = async (tipo: 'ONG' | 'Voluntario') => {
    const snapshot = await firestore().collection(tipo === 'ONG' ? 'ongs' : 'voluntarios').get();
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Destinatario));
    setDestinatarios(lista);
  };

  const handleAdicionarItem = () => {
    if (!novoItem.trim() || !quantidade.trim()) {
      return Alert.alert('Erro', 'Preencha todos os campos do item.');
    }

    const item: Item = { nome: novoItem, quantidade, tamanho, sexo };
    setItens([...itens, item]);
    setNovoItem('');
    setQuantidade('');
    setTamanho('');
    setSexo('');
    setShowItemModal(false);
  };

  const handleSalvar = async () => {
    if (!pontoSelecionado || !destinatarioSelecionado || itens.length === 0) {
      return Alert.alert('Erro', 'Preencha todos os campos antes de salvar.');
    }

    setLoading(true);
    try {
      await firestore().collection('doacoes').add({
        pontoId: pontoSelecionado.id,
        destino,
        destinatarioId: destinatarioSelecionado.id,
        itens,
        userId: user?.uid,
        dataCadastro: firestore.Timestamp.now(),
      });

      Alert.alert('Sucesso', 'Doação cadastrada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar doação.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Modal visible={showPontoModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Selecione o Ponto de Coleta</Text>
            {pontos.map((ponto) => (
              <TouchableOpacity key={ponto.id} style={styles.optionButton} onPress={() => setPontoSelecionado(ponto)}>
                <Text style={styles.optionText}>{`Ponto ${ponto.codigo}: ${ponto.nomePonto}`}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => pontoSelecionado ? setShowPontoModal(false) : Alert.alert('Selecione um ponto')}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {pontoSelecionado && (
          <View>
            <Text style={styles.subtitle}>Destino</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <RadioButton value="ONG" status={destino === 'ONG' ? 'checked' : 'unchecked'} onPress={() => { setDestino('ONG'); fetchDestinatarios('ONG'); }} />
              <Text>ONG</Text>
              <RadioButton value="Voluntario" status={destino === 'Voluntario' ? 'checked' : 'unchecked'} onPress={() => { setDestino('Voluntario'); fetchDestinatarios('Voluntario'); }} />
              <Text>Voluntário</Text>
            </View>

            {destinatarios.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                {destinatarios.map(dest => (
                  <TouchableOpacity key={dest.id} style={styles.optionButton} onPress={() => setDestinatarioSelecionado(dest)}>
                    <Text style={styles.optionText}>{dest.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.subtitle}>Itens</Text>
            {itens.length === 0 ? (
              <Text style={{ marginBottom: 15 }}>Nenhum item adicionado</Text>
            ) : (
              itens.map((item, index) => (
                <Text key={index}>{`${item.nome} - ${item.quantidade} un.`}</Text>
              ))
            )}

            <TouchableOpacity style={styles.button} onPress={() => setShowItemModal(true)}>
              <Text style={styles.buttonText}>Adicionar novo item</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={showItemModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Adicionar Item</Text>

          <TextInput style={styles.input} placeholder="Item" value={novoItem} onChangeText={setNovoItem} />
          <TextInput style={styles.input} placeholder="Quantidade" keyboardType="numeric" value={quantidade} onChangeText={setQuantidade} />
          <TextInput style={styles.input} placeholder="Tamanho" value={tamanho} onChangeText={setTamanho} />
          <TextInput style={styles.input} placeholder="Sexo" value={sexo} onChangeText={setSexo} />

          <TouchableOpacity style={styles.button} onPress={handleAdicionarItem}>
            <Text style={styles.buttonText}>Incluir</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={() => setShowItemModal(false)}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#1976D2',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#1976D2',
    borderRadius: 6,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
  },
});
