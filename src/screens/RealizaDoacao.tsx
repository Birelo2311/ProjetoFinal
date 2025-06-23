import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

interface ItemDoacao {
  id: string;
  tipo: string;
  item: string;
  quantidade: number;
  genero: string;
  tamanho?: string | null;
  tamcalcado?: string | null;
}

interface ItemSelecionado extends ItemDoacao {
  quantidadeSelecionada: number;
  quantidadeInput: string;
}

export function RealizaDoacao() {
  const navigation = useNavigation();
  const [itensEstoque, setItensEstoque] = useState<ItemDoacao[]>([]);
  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);

  const [buscaNome, setBuscaNome] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroGenero, setFiltroGenero] = useState<string>('');
  const [filtroTamanho, setFiltroTamanho] = useState<string>('');

  const [destinos, setDestinos] = useState<any[]>([]);
  const [destinoSelecionado, setDestinoSelecionado] = useState<string | null>(null);

  useEffect(() => {
  const user = auth().currentUser;

  if (!user) return;

  const unsubscribe = firestore()
    .collection('doacoes')
    .where('userId', '==', user.uid)
    .onSnapshot(querySnapshot => {
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
    });

  return unsubscribe;
}, []);

  useEffect(() => {
    const fetchDestinos = async () => {
      const snapshot = await firestore().collection('ongs').get();
      const lista: any[] = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setDestinos(lista);
    };

    fetchDestinos();
  }, []);

  const itensFiltrados = useMemo(() => {
    return itensEstoque.filter(i => {
      const nomeItem = i.item ? i.item.toLowerCase() : '';
      const busca = buscaNome.toLowerCase();

      const nomeOk = nomeItem.includes(busca);
      const tipoOk = filtroTipo ? i.tipo === filtroTipo : true;
      const generoOk = filtroGenero ? i.genero === filtroGenero : true;
      const tamanhoOk =
        filtroTamanho && filtroTipo !== 'Calçado' ? i.tamanho === filtroTamanho : true;

      return nomeOk && tipoOk && generoOk && tamanhoOk;
    });
  }, [itensEstoque, buscaNome, filtroTipo, filtroGenero, filtroTamanho]);

  const toggleSelecionado = (item: ItemDoacao) => {
    const existe = itensSelecionados.find(i => i.id === item.id);
    if (existe) {
      setItensSelecionados(itensSelecionados.filter(i => i.id !== item.id));
    } else {
      setItensSelecionados([...itensSelecionados, { ...item, quantidadeSelecionada: 1, quantidadeInput: '1' }]);
    }
  };

  const atualizarQuantidadeInput = (itemId: string, texto: string) => {
    setItensSelecionados((sel) =>
      sel.map((i) => {
        if (i.id === itemId) {
          const novaQtd = parseInt(texto, 10);
          return {
            ...i,
            quantidadeInput: texto,
            quantidadeSelecionada:
              texto === '' || isNaN(novaQtd)
                ? i.quantidadeSelecionada
                : novaQtd > i.quantidade
                ? i.quantidade
                : novaQtd,
          };
        }
        return i;
      })
    );
  };

  const realizarDoacao = async () => {
    if (itensSelecionados.length === 0 || !destinoSelecionado) {
      Alert.alert('Erro', 'Preencha todos os campos antes de confirmar.');
      return;
    }

    try {
      for (const selItem of itensSelecionados) {
        let qtdRestante = selItem.quantidadeSelecionada;

        const snapshot = await firestore().collection('doacoes').get();

        for (const doc of snapshot.docs) {
          if (qtdRestante <= 0) break;

          const data = doc.data();
          if (!data.itens || !Array.isArray(data.itens)) continue;

          const itensDoDoc = [...data.itens];
          let alterou = false;

          for (let i = 0; i < itensDoDoc.length; i++) {
            const item = itensDoDoc[i];
            if (
              item.item === selItem.item &&
              item.tipo === selItem.tipo &&
              item.genero === selItem.genero &&
              ((item.tipo === 'Calçado' && item.tamcalcado === selItem.tamcalcado) ||
                (item.tipo !== 'Calçado' && item.tamanho === selItem.tamanho))
            ) {
              const qtdDisponivelNoDoc = item.quantidade;
              if (qtdDisponivelNoDoc >= qtdRestante) {
                itensDoDoc[i].quantidade = qtdDisponivelNoDoc - qtdRestante;
                qtdRestante = 0;
                alterou = true;
                break;
              } else {
                itensDoDoc[i].quantidade = 0;
                qtdRestante -= qtdDisponivelNoDoc;
                alterou = true;
              }
            }
          }

          if (alterou) {
            const itensFiltrados = itensDoDoc.filter((it: any) => it.quantidade > 0);
            await firestore().collection('doacoes').doc(doc.id).update({ itens: itensFiltrados });
          }
        }

        if (qtdRestante > 0) {
          Alert.alert('Aviso', `Não havia quantidade suficiente para doar ${selItem.item}`);
        }
      }

      await firestore().collection('doacoesRealizadas').add({
  destinoId: destinoSelecionado,
  destinoTipo: 'ONG',
  data: firestore.FieldValue.serverTimestamp(),
  itens: itensSelecionados.map(i => ({
    item: i.item,
    tipo: i.tipo,
    genero: i.genero,
    tamanho: i.tamanho,
    tamcalcado: i.tamcalcado,
    quantidade: i.quantidadeSelecionada,
  })),
});

Alert.alert('Sucesso', 'Doação realizada e registrada!', [
  {
    text: 'OK',
    onPress: () => navigation.goBack(),
  },
]);

setItensSelecionados([]);
setDestinoSelecionado(null);
setDestinos([]);

    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao realizar a doação: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Realizar Doação</Text>

      <TextInput
        placeholder="Buscar por nome"
        value={buscaNome}
        onChangeText={setBuscaNome}
        style={styles.inputFiltro}
      />

      <View style={styles.filtrosContainer}>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={filtroTipo} onValueChange={setFiltroTipo} style={styles.picker}>
            <Picker.Item label="Tipo (todos)" value="" />
            <Picker.Item label="Acessório" value="Acessório" />
            <Picker.Item label="Roupa" value="Roupa" />
            <Picker.Item label="Calçado" value="Calçado" />
            <Picker.Item label="Outros" value="Outros" />
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Picker selectedValue={filtroGenero} onValueChange={setFiltroGenero} style={styles.picker}>
            <Picker.Item label="Sexo (todos)" value="" />
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Feminino" value="Feminino" />
            <Picker.Item label="Unissex" value="Unissex" />
          </Picker>
        </View>

        {filtroTipo !== 'Calçado' && (
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={filtroTamanho} onValueChange={setFiltroTamanho} style={styles.picker}>
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

      <FlatList
        data={itensFiltrados}
        keyExtractor={item => item.id}
        style={{ marginTop: 10 }}
        renderItem={({ item }) => {
          const marcado = itensSelecionados.some(i => i.id === item.id);
          const itemSelecionado = itensSelecionados.find(i => i.id === item.id);

          return (
            <TouchableOpacity
              onPress={() => toggleSelecionado(item)}
              style={[styles.item, marcado && styles.itemSelecionado]}
            >
              <Text>{item.item} ({item.quantidade})</Text>
              {marcado && (
                <>
                  <Text style={{ marginTop: 10 }}>Quantidade a enviar:</Text>
                  <TextInput
                    keyboardType="number-pad"
                    style={styles.inputQtd}
                    value={itemSelecionado?.quantidadeInput}
                    onChangeText={(text) => {
                      if (text === '' || /^\d+$/.test(text)) {
                        atualizarQuantidadeInput(item.id, text);
                      }
                    }}
                    maxLength={3}
                  />
                </>
              )}
            </TouchableOpacity>
          );
        }}
        keyboardShouldPersistTaps="handled"
      />

      <Text style={styles.section}>Selecione a ONG destino:</Text>
      <FlatList
        data={destinos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setDestinoSelecionado(item.id)}
            style={[styles.item, destinoSelecionado === item.id && styles.itemSelecionado]}
          >
            <Text>{item.nome}</Text>
          </TouchableOpacity>
        )}
        keyboardShouldPersistTaps="handled"
      />

      <TouchableOpacity style={styles.botaoConfirmar} onPress={realizarDoacao}>
        <Text style={styles.botaoTexto}>Enviar Itens</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#000' },
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
  filtrosContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pickerWrapper: { flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: '#aaa', borderRadius: 6, overflow: 'hidden', height: 40, justifyContent: 'center', backgroundColor: '#fff' },
  picker: { height: 55, width: '100%', color: '#000' },
  item: { backgroundColor: '#f9f9f9', padding: 15, marginVertical: 6, borderRadius: 6 },
  itemSelecionado: { backgroundColor: '#d4edda' },
  inputQtd: { borderWidth: 1, borderColor: '#999', borderRadius: 6, width: 70, height: 40, paddingHorizontal: 10, textAlign: 'center', marginTop: 10 },
  section: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  botaoConfirmar: { marginTop: 30, backgroundColor: '#28a745', padding: 15, borderRadius: 6, alignItems: 'center', marginBottom: 40 },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
});
