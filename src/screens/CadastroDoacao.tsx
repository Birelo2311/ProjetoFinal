import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  Image,
  Modal,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';
import auth from '@react-native-firebase/auth';


import inboxIcon from '../assets/inbox.png';
import outboxIcon from '../assets/outbox.png';

import { Picker } from '@react-native-picker/picker';

interface ItemDoacao {
  id: string; 
  tipo: 'Acessório' | 'Roupa' | 'Calçado' | 'Outros';
  item: string;
  quantidade: number;
  genero: 'Masculino' | 'Feminino' | 'Unissex';
  tamanho?: string | null;
  tamcalcado?: string | null;
  doacaoId: string; 
  itemId: string;   
}


type NavProps = NativeStackNavigationProp<RootStackParamList, 'CadastroDoacao'>;

export function CadastroDoacao() {
  const navigation = useNavigation<NavProps>();
  const [itensEstoque, setItensEstoque] = useState<ItemDoacao[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [buscaNome, setBuscaNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroGenero, setFiltroGenero] = useState<string>('');
  const [filtroTamanho, setFiltroTamanho] = useState<string>('');

  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);

  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);
  const [quantidadeExcluir, setQuantidadeExcluir] = useState('');
  const [itemExcluir, setItemExcluir] = useState<ItemDoacao | null>(null);

  useEffect(() => {
  setLoading(true);
  const user = auth().currentUser;

  if (!user) return;

  const unsubscribe = firestore()
    .collection('doacoes')
    .where('userId', '==', user.uid) 
    .onSnapshot(
      querySnapshot => {
        const itensMap: { [key: string]: ItemDoacao & { quantidadeTotal: number } } = {};

        querySnapshot.forEach(doc => {
          const data = doc.data();

          if (Array.isArray(data.itens)) {
            data.itens.forEach((i: any) => {
              if (!i.item) return;

              const chave = `${doc.id}_${i.id}`;

if (!itensMap[chave]) {
  itensMap[chave] = {
    id: chave, 
    item: i.item,
    tipo: i.tipo,
    genero: i.genero,
    tamanho: i.tipo === 'Calçado' ? null : i.tamanho ?? null,
    tamcalcado: i.tipo === 'Calçado' ? i.tamcalcado ?? null : null,
    quantidade: 0,
    quantidadeTotal: 0,
    doacaoId: doc.id,
    itemId: i.id, 
  };
}
itensMap[chave].quantidadeTotal += i.quantidade || 0;

              });
            }
          });

          const itensArray = Object.values(itensMap).map(i => ({
            ...i,
            quantidade: i.quantidadeTotal,
          }));

          setItensEstoque(itensArray);
          setLoading(false);
        },
        error => {
          Alert.alert('Erro', 'Não foi possível carregar o estoque.');
          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  const itensFiltrados = useMemo(() => {
    return itensEstoque.filter(i => {
      const nomeItem = i.item ? i.item.toString().toLowerCase() : '';
      const busca = buscaNome.toLowerCase();

      const nomeOk = nomeItem.includes(busca);
      const tipoOk = filtroTipo ? i.tipo === filtroTipo : true;
      const generoOk = filtroGenero ? i.genero === filtroGenero : true;
      const tamanhoOk =
        filtroTamanho && filtroTipo !== 'Calçado'
          ? i.tamanho === filtroTamanho
          : true;

      return nomeOk && tipoOk && generoOk && tamanhoOk;
    });
  }, [itensEstoque, buscaNome, filtroTipo, filtroGenero, filtroTamanho]);

  
  const editarItem = (item: ItemDoacao) => {
  navigation.navigate('EditarDoacao', { doacaoId: item.doacaoId, itemId: item.itemId });
};


  const confirmarExcluirItem = (item: ItemDoacao) => {
    Alert.alert(
      'Excluir Item',
      `Tem certeza que deseja excluir o item "${item.item}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setItemExcluir(item);
            setQuantidadeExcluir('');
            setModalExcluirVisible(true);
          },
        },
      ]
    );
  };

  const excluirItem = async () => {
    if (!itemExcluir) return;

    const quantidadeNumber = Number(quantidadeExcluir);
    if (
      isNaN(quantidadeNumber) ||
      quantidadeNumber <= 0 ||
      quantidadeNumber > itemExcluir.quantidade
    ) {
      Alert.alert(
        'Quantidade inválida',
        `Informe uma quantidade válida entre 1 e ${itemExcluir.quantidade}.`
      );
      return;
    }

    try {
      const todosDocs = await firestore().collection('doacoes').get();

      let quantidadeParaRemover = quantidadeNumber;

      for (const doc of todosDocs.docs) {
        const data = doc.data();
        if (!Array.isArray(data.itens)) continue;

        const itensAtualizados = [...data.itens];
        let alterou = false;

        for (let idx = 0; idx < itensAtualizados.length; idx++) {
          const i = itensAtualizados[idx];

          const mesmaIdentificacao =
            i.item === itemExcluir.item &&
            i.tipo === itemExcluir.tipo &&
            i.genero === itemExcluir.genero &&
            ((i.tipo === 'Calçado' && i.tamcalcado === itemExcluir.tamcalcado) ||
              (i.tipo !== 'Calçado' && i.tamanho === itemExcluir.tamanho));

          if (mesmaIdentificacao && quantidadeParaRemover > 0) {
            if (i.quantidade > quantidadeParaRemover) {
              itensAtualizados[idx] = {
                ...i,
                quantidade: i.quantidade - quantidadeParaRemover,
              };
              quantidadeParaRemover = 0;
            } else {
              quantidadeParaRemover -= i.quantidade;
              itensAtualizados.splice(idx, 1);
              idx--;
            }
            alterou = true;

            if (quantidadeParaRemover <= 0) break;
          }
        }

        if (alterou) {
          if (itensAtualizados.length === 0) {
            await firestore().collection('doacoes').doc(doc.id).delete();
          } else {
            await firestore()
              .collection('doacoes')
              .doc(doc.id)
              .update({ itens: itensAtualizados });
          }
        }

        if (quantidadeParaRemover <= 0) break;
      }

      if (quantidadeParaRemover > 0) {
        Alert.alert(
          'Atenção',
          'Não foi possível remover toda a quantidade solicitada, pois não havia estoque suficiente.'
        );
      } else {
        Alert.alert(
          'Sucesso',
          `Foram removidas ${quantidadeNumber} unidades do item "${itemExcluir.item}".`
        );
      }

      setModalExcluirVisible(false);
      setItemSelecionado(null);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível excluir a quantidade no banco.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estoque Atual</Text>

      <TextInput
        placeholder="Buscar por nome"
        value={buscaNome}
        onChangeText={setBuscaNome}
        style={styles.inputFiltro}
      />

      <View style={styles.filtrosContainer}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filtroTipo}
            onValueChange={setFiltroTipo}
            style={styles.picker}
          >
            <Picker.Item label="Tipo (todos)" value="" />
            <Picker.Item label="Acessório" value="Acessório" />
            <Picker.Item label="Roupa" value="Roupa" />
            <Picker.Item label="Calçado" value="Calçado" />
            <Picker.Item label="Outros" value="Outros" />
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filtroGenero}
            onValueChange={setFiltroGenero}
            style={styles.picker}
          >
            <Picker.Item label="Sexo (todos)" value="" />
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Feminino" value="Feminino" />
            <Picker.Item label="Unissex" value="Unissex" />
          </Picker>
        </View>

        {filtroTipo !== 'Calçado' && (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filtroTamanho}
              onValueChange={setFiltroTamanho}
              style={styles.picker}
            >
              <Picker.Item label="Tamanho (todos)" value="" />
              <Picker.Item label="PP" value="PP" />
              <Picker.Item label="P" value="P" />
              <Picker.Item label="M" value="M" />
              <Picker.Item label="G" value="G" />
              <Picker.Item label="GG" value="GG" />
            </Picker>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      ) : itensFiltrados.length === 0 ? (
        <Text style={{ marginTop: 20, fontStyle: 'italic' }}>Nenhum item encontrado.</Text>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={item => item.id}
          style={{ marginTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setItemSelecionado(itemSelecionado === item.id ? null : item.id)}
              style={styles.itemContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.itemText}>
                {item.item} ({item.quantidade})
              </Text>

              {itemSelecionado === item.id && (
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonEditar]}
                    onPress={() => editarItem(item)} 
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonExcluir]}
                    onPress={() => confirmarExcluirItem(item)}
                  >
                    <Text style={styles.buttonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AdicionarDoacao')}
        >
          <Image source={inboxIcon} style={styles.fabIcon} />
          <Text style={styles.fabText}>Receber</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('RealizaDoacao')}
        >
          <Image source={outboxIcon} style={styles.fabIcon} />
          <Text style={styles.fabText}>Enviar</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalExcluirVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalExcluirVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Quantidade a excluir do item "{itemExcluir?.item}"
            </Text>

            <TextInput
              keyboardType="numeric"
              placeholder="Informe a quantidade"
              value={quantidadeExcluir}
              onChangeText={setQuantidadeExcluir}
              style={styles.modalInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalExcluirVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={excluirItem}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#000' },
  inputFiltro: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    fontSize: 14,
    marginBottom: 10,
    color: '#000',
  },
  filtrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    overflow: 'hidden',
    height: 40,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  picker: {
    height: 55,
    width: '100%',
    color: '#000',
  },
  itemContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  buttonsContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  buttonEditar: {
    backgroundColor: '#007bff',
  },
  buttonExcluir: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  fab: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  fabIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  fabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    color: '#000',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#888',
  },
  modalButtonConfirm: {
    backgroundColor: '#000',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
