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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
