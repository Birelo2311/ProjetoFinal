<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { ItemDoacao } from '../types/doacao';

function mascararData(text: string) {
  // Remove tudo que não for número
  const digits = text.replace(/\D/g, '');

  let formatted = '';
  if (digits.length > 0) {
    // Dia
    formatted += digits.substring(0, 2);
    if (digits.length >= 3) formatted += '/';
  }
  if (digits.length > 2) {
    // Mês
    formatted += digits.substring(2, 4);
    if (digits.length >= 5) formatted += '/';
  }
  if (digits.length > 4) {
    // Ano
    formatted += digits.substring(4, 8);
  }

  return formatted;
}

export function AdicionarDoacao() {
  const [doacoes, setDoacoes] = useState<ItemDoacao[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [sexo, setSexo] = useState('');
  const [destino, setDestino] = useState('ONG');

  const [destinatarios, setDestinatarios] = useState<{ id: string; nome: string }[]>([]);
  const [destinatarioSelecionado, setDestinatarioSelecionado] = useState<string>('');

  const [dataItem, setDataItem] = useState(''); // data no formato dd/mm/aaaa

  const navigation = useNavigation();

  // Buscar destinatários (ONGs ou Voluntários) ao mudar o destino
  useEffect(() => {
    const collection = destino === 'ONG' ? 'ongs' : 'voluntarios';

    const fetchDestinatarios = async () => {
      try {
        const snapshot = await firestore().collection(collection).get();
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome || 'Sem nome',
        }));
        setDestinatarios(lista);
        setDestinatarioSelecionado(lista.length > 0 ? lista[0].id : '');
      } catch (error) {
        console.log('Erro ao buscar destinatários:', error);
        setDestinatarios([]);
        setDestinatarioSelecionado('');
      }
    };

    fetchDestinatarios();
  }, [destino]);

  const adicionarItem = () => {
    if (!item || !quantidade || !tamanho || !sexo || !dataItem || isNaN(Number(quantidade))) {
      Alert.alert('Erro', 'Preencha todos os campos corretamente, incluindo a data.');
      return;
    }

    // Validar formato da data (dd/mm/aaaa)
    const regexData = /^([0-2][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regexData.test(dataItem)) {
      Alert.alert('Erro', 'Data inválida. Use o formato dd/mm/aaaa.');
      return;
    }

    const novaDoacao = {
      id: Date.now().toString(),
      item,
      quantidade: parseInt(quantidade, 10),
      tamanho,
      sexo,
      data: dataItem,
    };

    setDoacoes([...doacoes, novaDoacao]);
    setItem('');
    setQuantidade('');
    setTamanho('');
    setSexo('');
    setDataItem('');
    setModalVisible(false);
  };

  const finalizarInclusoes = async () => {
    if (doacoes.length === 0) {
      Alert.alert('Erro', 'Adicione ao menos um item.');
      return;
    }
    if (!destinatarioSelecionado) {
      Alert.alert('Erro', 'Selecione a ONG ou Voluntário para vincular a doação.');
      return;
    }

    try {
      const userId = auth().currentUser?.uid;
      const dataAtual = new Date();
      const dataFormatada = `${dataAtual.getDate().toString().padStart(2, '0')}/${
        (dataAtual.getMonth() + 1).toString().padStart(2, '0')
      }/${dataAtual.getFullYear()}`;

      await firestore().collection('doacoes').add({
        userId,
        destino,
        destinatarioId: destinatarioSelecionado,
        data: firestore.FieldValue.serverTimestamp(),
        dataInclusao: dataFormatada,
        itens: doacoes,
      });

      Alert.alert('Sucesso', 'Doação registrada com sucesso!');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Erro ao salvar doação.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Itens da Doação</Text>

        {doacoes.length === 0 && <Text style={styles.emptyText}>Nenhum item adicionado.</Text>}

        {doacoes.map((d) => (
          <View key={d.id} style={styles.itemCard}>
            <Text style={styles.itemText}>
              {d.item} - {d.quantidade} un - {d.tamanho} - {d.sexo} - Data: {d.data}
            </Text>
          </View>
        ))}

        <Text style={styles.label}>Destinado para</Text>
        <Picker selectedValue={destino} onValueChange={setDestino} style={styles.picker}>
          <Picker.Item label="ONG" value="ONG" />
          <Picker.Item label="Voluntário" value="Voluntário" />
        </Picker>

        {destinatarios.length > 0 ? (
          <>
            <Text style={styles.label}>
              Selecione a {destino === 'ONG' ? 'ONG' : 'Voluntário'}:
            </Text>
            <Picker
              selectedValue={destinatarioSelecionado}
              onValueChange={setDestinatarioSelecionado}
              style={styles.picker}
            >
              {destinatarios.map((d) => (
                <Picker.Item key={d.id} label={d.nome} value={d.id} />
              ))}
            </Picker>
          </>
        ) : (
          <Text style={{ color: 'red', marginVertical: 10 }}>
            Nenhuma {destino === 'ONG' ? 'ONG' : 'voluntário'} encontrada.
          </Text>
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Adicionar Item</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.finishButton} onPress={finalizarInclusoes}>
          <Text style={styles.finishButtonText}>Finalizar inclusões</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Novo Item</Text>

              <TextInput
                placeholder="Item"
                style={styles.input}
                value={item}
                onChangeText={setItem}
              />
              <TextInput
                placeholder="Quantidade"
                keyboardType="numeric"
                style={styles.input}
                value={quantidade}
                onChangeText={setQuantidade}
              />

              <Text style={styles.label}>Tamanho</Text>
              <Picker selectedValue={tamanho} onValueChange={setTamanho} style={styles.picker}>
                <Picker.Item label="Selecione" value="" />
                <Picker.Item label="PP" value="PP" />
                <Picker.Item label="P" value="P" />
                <Picker.Item label="M" value="M" />
                <Picker.Item label="G" value="G" />
                <Picker.Item label="GG" value="GG" />
              </Picker>

              <Text style={styles.label}>Sexo</Text>
              <Picker selectedValue={sexo} onValueChange={setSexo} style={styles.picker}>
                <Picker.Item label="Selecione" value="" />
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Feminino" value="Feminino" />
                <Picker.Item label="Unissex" value="Unissex" />
              </Picker>

              <TextInput
                placeholder="Data (dd/mm/aaaa)"
                style={styles.input}
                value={dataItem}
                onChangeText={text => setDataItem(mascararData(text))}
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                maxLength={10}
              />

              <TouchableOpacity style={styles.modalAddButton} onPress={adicionarItem}>
                <Text style={styles.modalAddText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
=======
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';


export function AdicionarDoacao() {
  const [genero, setGenero] = useState('');
  const [estacao, setEstacao] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [data, setData] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const user = auth().currentUser;
  const navigation = useNavigation();

  const adicionar = async () => {
    if (!genero || !estacao || !tamanho) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const dados = {
      genero,
      estacao,
      tamanho,
      data: firestore.Timestamp.fromDate(data),
      userId: user?.uid,
    };

    try {
      await firestore().collection('doacoes').add(dados);
      Alert.alert('Sucesso', 'Doação cadastrada com sucesso!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  } catch (error) {
    Alert.alert('Erro', 'Ocorreu um erro ao salvar a doação');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Doação</Text>

      <Text style={styles.label}>Gênero:</Text>
      <Picker
        selectedValue={genero}
        onValueChange={setGenero}
        style={styles.picker}
      >
        <Picker.Item label="Selecione" value="" />
        <Picker.Item label="Masculino" value="Masculino" />
        <Picker.Item label="Feminino" value="Feminino" />
        <Picker.Item label="Unissex" value="Unissex" />
      </Picker>

      <Text style={styles.label}>Estação:</Text>
      <Picker
        selectedValue={estacao}
        onValueChange={setEstacao}
        style={styles.picker}
      >
        <Picker.Item label="Selecione" value="" />
        <Picker.Item label="Verão" value="Verão" />
        <Picker.Item label="Outono" value="Outono" />
        <Picker.Item label="Inverno" value="Inverno" />
        <Picker.Item label="Primavera" value="Primavera" />
      </Picker>

      <Text style={styles.label}>Tamanho:</Text>
      <Picker
        selectedValue={tamanho}
        onValueChange={setTamanho}
        style={styles.picker}
      >
        <Picker.Item label="Selecione" value="" />
        <Picker.Item label="P" value="P" />
        <Picker.Item label="M" value="M" />
        <Picker.Item label="G" value="G" />
        <Picker.Item label="GG" value="GG" />
      </Picker>

      <Text style={styles.label}>Data:</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        <Text style={styles.dateText}>{data.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setData(selectedDate);
            }
          }}
        />
      )}

      <Button title="Salvar Doação" onPress={adicionar} />
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 12,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  finishButton: {
    backgroundColor: 'orange',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalAddButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalAddText: {
    color: '#fff',
    fontSize: 16,
  },
=======
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10 },
  picker: {
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    borderRadius: 6,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    marginBottom: 10,
  },
  dateText: { fontSize: 16 },
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
});
