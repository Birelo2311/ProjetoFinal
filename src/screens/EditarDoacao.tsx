import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../routes/types';
import { Picker } from '@react-native-picker/picker';

type EditarDoacaoRouteProp = RouteProp<RootStackParamList, 'EditarDoacao'>;

export function EditarDoacao() {
  const route = useRoute<EditarDoacaoRouteProp>();
  const navigation = useNavigation();

  const { doacaoId, itemId } = route.params;

  const [tipo, setTipo] = useState<'Acessório' | 'Roupa' | 'Calçado' | 'Outros'>('Acessório');
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [genero, setGenero] = useState<'Masculino' | 'Feminino' | 'Unissex'>('Masculino');
  const [tamanho, setTamanho] = useState('');
  const [tamcalcado, setTamcalcado] = useState('');

  useEffect(() => {
    const carregarItem = async () => {
      try {
        const doc = await firestore().collection('doacoes').doc(doacaoId).get();
        const data = doc.data();

        if (!data) {
          Alert.alert('Erro', 'Doação não encontrada.');
          navigation.goBack();
          return;
        }

        const itemSelecionado = data.itens.find((i: any) => i.id === itemId);

        if (!itemSelecionado) {
          Alert.alert('Erro', 'Item não encontrado na doação.');
          navigation.goBack();
          return;
        }

        setTipo(itemSelecionado.tipo);
        setItem(itemSelecionado.item);
        setQuantidade(itemSelecionado.quantidade.toString());
        setGenero(itemSelecionado.genero);
        setTamanho(itemSelecionado.tamanho || '');
        setTamcalcado(itemSelecionado.tamcalcado || '');

      } catch (error) {
        console.error('Erro ao carregar item:', error);
        Alert.alert('Erro', 'Falha ao carregar o item para edição.');
        navigation.goBack();
      }
    };

    carregarItem();
  }, [doacaoId, itemId, navigation]);

  const salvarEdicao = async () => {
    if (!item.trim() || Number(quantidade) <= 0 || isNaN(Number(quantidade))) {
      Alert.alert('Erro', 'Preencha todos os campos corretamente.');
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

    try {
      const doc = await firestore().collection('doacoes').doc(doacaoId).get();
      const data = doc.data();

      if (!data) {
        Alert.alert('Erro', 'Doação não encontrada.');
        return;
      }

      if (!data.itens || !Array.isArray(data.itens)) {
        Alert.alert('Erro', 'Itens da doação inválidos.');
        return;
      }

      const itensAtualizados = data.itens.map((i: any) => {
        if (i.id === itemId) {
          return {
            ...i,
            tipo,
            item,
            quantidade: Number(quantidade),
            genero,
            tamanho: tipo !== 'Calçado' ? tamanho : null,
            tamcalcado: tipo === 'Calçado' ? tamcalcado : null,
          };
        }
        return i;
      });

      await firestore().collection('doacoes').doc(doacaoId).update({
        itens: itensAtualizados,
      });

      Alert.alert('Sucesso', 'Item atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      Alert.alert('Erro', 'Falha ao atualizar o item.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Item</Text>

      <Text style={styles.label}>Tipo de Item</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={value => setTipo(value)}
          style={styles.picker}
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

      <TouchableOpacity style={styles.btnSalvar} onPress={salvarEdicao}>
        <Text style={styles.btnSalvarText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
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
  btnSalvar: {
    backgroundColor: '#388E3C',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  btnSalvarText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
});
