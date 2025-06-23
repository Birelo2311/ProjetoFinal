import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlatList } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export interface ItemDoacao {
  id: string;
  tipo: 'Acessório' | 'Roupa' | 'Calçado' | 'Outros';
  item: string;
  quantidade: number;
  genero: 'Masculino' | 'Feminino' | 'Unissex';
  tamanho?: string | null;
  tamcalcado?: string | null;
}

interface Ponto {
  id: string;
  codigo: string;
  nomePonto: string;
}

export default function AdicionarDoacao() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const navigation = useNavigation();
  const [pontoSelecionado, setPontoSelecionado] = useState<string>('');
  const [dataDoacao, setDataDoacao] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [itens, setItens] = useState<ItemDoacao[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [tipo, setTipo] = useState<ItemDoacao['tipo']>('Acessório');
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [genero, setGenero] = useState<ItemDoacao['genero']>('Masculino');
  const [tamanho, setTamanho] = useState('');
  const [tamcalcado, setTamcalcado] = useState('');

  useEffect(() => {
    const fetchPontos = async () => {
      try {
        const snapshot = await firestore().collection('pontosDeColeta').get();
        const dados: Ponto[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as any;
        setPontos(dados);
        if (dados.length > 0) setPontoSelecionado(dados[0].id);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os pontos de coleta.');
      }
    };
    fetchPontos();
  }, []);

  const resetFormItem = () => {
    setTipo('Acessório');
    setItem('');
    setQuantidade('1');
    setGenero('Masculino');
    setTamanho('');
    setTamcalcado('');
  };

  const salvarItem = () => {
    if (!item.trim()) {
      Alert.alert('Erro', 'Informe o nome do item.');
      return;
    }
    if (Number(quantidade) <= 0 || isNaN(Number(quantidade))) {
      Alert.alert('Erro', 'Quantidade inválida.');
      return;
    }
    if (tipo === 'Calçado' && !tamcalcado.trim()) {
      Alert.alert('Erro', 'Informe o tamanho do calçado.');
      return;
    }
    if (tipo !== 'Calçado' && !tamanho.trim()) {
      Alert.alert('Erro', 'Informe o tamanho.');
      return;
    }

    const novoItem: ItemDoacao = {
      id: Math.random().toString(36).substring(7),
      tipo,
      item,
      quantidade: Number(quantidade),
      genero,
      tamanho: tipo !== 'Calçado' ? tamanho : null,
      tamcalcado: tipo === 'Calçado' ? tamcalcado : null,
    };

    setItens(prev => [...prev, novoItem]);
    setModalVisible(false);
    resetFormItem();
  };

  const removerItem = (id: string) => {
    setItens(prev => prev.filter(i => i.id !== id));
  };

  const salvarDoacao = async () => {
    if (!pontoSelecionado) {
      Alert.alert('Erro', 'Selecione um ponto de coleta.');
      return;
    }
    if (itens.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item.');
      return;
    }

    try {
      const itensSanitizados = itens.map(i => ({
        ...i,
        tamanho: i.tamanho ?? null,
        tamcalcado: i.tamcalcado ?? null,
      }));

      const user = auth().currentUser;

      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      // Salva no estoque
      await firestore().collection('doacoes').add({
        userId: user.uid,
        ponto: pontoSelecionado,
        data: firestore.Timestamp.fromDate(dataDoacao),
        itens: itensSanitizados,
      });

      // Salva no histórico de doações recebidas
      await firestore().collection('doacoesRecebidas').add({
        userId: user.uid,
        ponto: pontoSelecionado,
        data: firestore.Timestamp.fromDate(dataDoacao),
        itens: itensSanitizados,
      });

      Alert.alert('Sucesso', 'Doação salva com sucesso!');
      setItens([]);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a doação.');
      console.error('Erro ao salvar doação:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecione o Ponto de Coleta</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={pontoSelecionado}
          onValueChange={value => setPontoSelecionado(value)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor="#000"
        >
          {pontos.map(ponto => (
            <Picker.Item
              key={ponto.id}
              label={`${ponto.codigo} - ${ponto.nomePonto}`}
              value={ponto.id}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateButtonText}>
          Data: {dataDoacao.toLocaleDateString('pt-BR')}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dataDoacao}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDataDoacao(selectedDate);
          }}
        />
      )}

      <Text style={[styles.label, { marginTop: 20 }]}>Itens da Doação</Text>
      {itens.length === 0 ? (
        <Text style={styles.texto}>Nenhum item adicionado</Text>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={item => item.id}
          style={{ maxHeight: 200 }}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>
                {item.tipo} - {item.item} - {item.quantidade}{' '}
                {item.tipo === 'Calçado' ? 'pares' : 'unidades'} - {item.genero} -{' '}
                {item.tipo === 'Calçado' ? item.tamcalcado : item.tamanho}
              </Text>
              <TouchableOpacity
                onPress={() => removerItem(item.id)}
                style={styles.removerBtn}
              >
                <Text style={{ color: 'white' }}>X</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnAddText}>Adicionar Novo Item</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarDoacao}>
        <Text style={styles.btnSalvarText}>Salvar Doação</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <ScrollView
            contentContainerStyle={styles.modalContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>Adicionar Item</Text>

            <Text style={styles.label}>Tipo de Item</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tipo}
                onValueChange={value => setTipo(value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor="#000"
              >
                <Picker.Item label="Acessório" value="Acessório" />
                <Picker.Item label="Roupa" value="Roupa" />
                <Picker.Item label="Calçado" value="Calçado" />
                <Picker.Item label="Outros" value="Outros" />
              </Picker>
            </View>

            <Text style={styles.label}>Item</Text>
            <TextInput
              style={styles.input}
              placeholder="Descrição do item"
              value={item}
              onChangeText={setItem}
              autoCorrect={false}
            />

            <Text style={styles.label}>
              Quantidade {tipo === 'Calçado' ? '(pares)' : ''}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
            />

            <Text style={styles.label}>Sexo</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={genero}
                onValueChange={value => setGenero(value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor="#000"
              >
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Feminino" value="Feminino" />
                <Picker.Item label="Unissex" value="Unissex" />
              </Picker>
            </View>

            {tipo === 'Calçado' ? (
              <>
                <Text style={styles.label}>Tamanho do Calçado</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Número do calçado"
                  keyboardType="numeric"
                  value={tamcalcado}
                  onChangeText={setTamcalcado}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Tamanho</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tamanho}
                    onValueChange={value => setTamanho(value)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    dropdownIconColor="#000"
                  >
                    <Picker.Item label="PP" value="PP" />
                    <Picker.Item label="P" value="P" />
                    <Picker.Item label="M" value="M" />
                    <Picker.Item label="G" value="G" />
                    <Picker.Item label="GG" value="GG" />
                  </Picker>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              <View style={{ flex: 1, marginRight: 5 }}>
                <TouchableOpacity style={styles.btnSalvar} onPress={salvarItem}>
                  <Text style={styles.btnSalvarText}>Salvar</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, marginLeft: 5 }}>
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={() => {
                    setModalVisible(false);
                    resetFormItem();
                  }}
                >
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    marginBottom: 6,
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 55,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    height: 44,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  dateButtonText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#000',
  },
  texto: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#333',
  },
  removerBtn: {
    backgroundColor: 'red',
    padding: 6,
    borderRadius: 4,
  },
  btnAdd: {
    backgroundColor: '#1976D2',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    marginVertical: 10,
  },
  btnAddText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#fff',
  },
  btnSalvar: {
    backgroundColor: '#388E3C',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnSalvarText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 20,
    minHeight: 450,
  },
  modalTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  btnCancelar: {
    backgroundColor: '#D32F2F',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnCancelarText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#fff',
  },
});
