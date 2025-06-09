import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

type ItemDoacao = {
  item: string;
  quantidade: number;
};

type ItemSelecionado = {
  item: string;
  quantidadeDisponivel: number;
  quantidadeSelecionada: number;
  quantidadeInput: string;
};

export function RealizaDoacao() {
  const [itensDisponiveis, setItensDisponiveis] = useState<ItemDoacao[]>([]);
  const [selecionados, setSelecionados] = useState<ItemSelecionado[]>([]);
  const [tipoDestino, setTipoDestino] = useState<'ong' | 'voluntario' | null>(null);
  const [destinos, setDestinos] = useState<any[]>([]);
  const [destinoSelecionado, setDestinoSelecionado] = useState<string | null>(null);

  useEffect(() => {
    const fetchItens = async () => {
      const snapshot = await firestore().collection('doacoes').get();
      const itensMap: { [key: string]: number } = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.itens && Array.isArray(data.itens)) {
          data.itens.forEach((item: any) => {
            const nome = item.item;
            const qtd = Number(item.quantidade) || 0;
            if (itensMap[nome]) {
              itensMap[nome] += qtd;
            } else {
              itensMap[nome] = qtd;
            }
          });
        }
      });

      const itensArray: ItemDoacao[] = Object.keys(itensMap).map((key) => ({
        item: key,
        quantidade: itensMap[key],
      }));

      setItensDisponiveis(itensArray);
    };

    fetchItens();
  }, []);

  useEffect(() => {
    if (!tipoDestino) return;

    const fetchDestinos = async () => {
      const collection = tipoDestino === 'ong' ? 'ongs' : 'voluntarios';
      const snapshot = await firestore().collection(collection).get();
      const lista: any[] = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setDestinos(lista);
    };

    fetchDestinos();
  }, [tipoDestino]);

  const toggleSelecionado = (item: ItemDoacao) => {
    const existe = selecionados.find((i) => i.item === item.item);
    if (existe) {
      setSelecionados(selecionados.filter((i) => i.item !== item.item));
    } else {
      setSelecionados([
        ...selecionados,
        {
          item: item.item,
          quantidadeDisponivel: item.quantidade,
          quantidadeSelecionada: 1,
          quantidadeInput: '1',
        },
      ]);
    }
  };

  const atualizarQuantidadeInput = (itemNome: string, texto: string) => {
    setSelecionados((sel) =>
      sel.map((i) => {
        if (i.item === itemNome) {
          const novaQtd = parseInt(texto, 10);
          return {
            ...i,
            quantidadeInput: texto,
            quantidadeSelecionada:
              texto === '' || isNaN(novaQtd)
                ? i.quantidadeSelecionada
                : novaQtd > i.quantidadeDisponivel
                ? i.quantidadeDisponivel
                : novaQtd,
          };
        }
        return i;
      })
    );
  };

  const realizarDoacao = async () => {
    if (selecionados.length === 0 || !tipoDestino || !destinoSelecionado) {
      Alert.alert('Erro', 'Preencha todos os campos antes de confirmar.');
      return;
    }

    try {
      for (const selItem of selecionados) {
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
            if (item.item === selItem.item && item.quantidade > 0) {
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

      Alert.alert('Sucesso', 'Doação realizada e estoque atualizado!');
      setSelecionados([]);
      setDestinoSelecionado(null);
      setTipoDestino(null);
      setDestinos([]);

      // Atualiza lista de itens após doação
      const snapshot = await firestore().collection('doacoes').get();
      const itensMap: { [key: string]: number } = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.itens && Array.isArray(data.itens)) {
          data.itens.forEach((item: any) => {
            const nome = item.item;
            const qtd = Number(item.quantidade) || 0;
            if (itensMap[nome]) {
              itensMap[nome] += qtd;
            } else {
              itensMap[nome] = qtd;
            }
          });
        }
      });
      const itensArray: ItemDoacao[] = Object.keys(itensMap).map((key) => ({
        item: key,
        quantidade: itensMap[key],
      }));
      setItensDisponiveis(itensArray);
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao atualizar o estoque: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Realizar Doação</Text>

      <Text style={styles.section}>Selecione os itens:</Text>
      <FlatList
        data={itensDisponiveis}
        keyExtractor={(item) => item.item}
        renderItem={({ item }) => {
          const marcado = selecionados.some((i) => i.item === item.item);
          return (
            <TouchableOpacity
              onPress={() => toggleSelecionado(item)}
              style={[styles.item, marcado && styles.itemSelecionado]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.checkbox,
                    marcado ? styles.checkboxMarcado : styles.checkboxVazio,
                  ]}
                />
                <Text style={{ marginLeft: 8 }}>
                  {item.item} - Qtd: {item.quantidade}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyboardShouldPersistTaps="handled"
      />

      {selecionados.length > 0 && (
        <>
          <Text style={[styles.section, { marginTop: 30 }]}>Itens Selecionados:</Text>
          {selecionados.map((item) => (
            <View key={item.item} style={styles.selecionadoItem}>
              <Text style={{ flex: 1 }}>{item.item}</Text>
              <TextInput
                keyboardType="number-pad"
                style={styles.inputQtd}
                value={item.quantidadeInput}
                onChangeText={(text) => {
                  if (text === '' || /^\d+$/.test(text)) {
                    atualizarQuantidadeInput(item.item, text);
                  }
                }}
                maxLength={3}
              />
              <Text style={{ marginLeft: 8 }}> / {item.quantidadeDisponivel}</Text>
            </View>
          ))}
        </>
      )}

      <View style={styles.opcoesDestino}>
        <TouchableOpacity
          onPress={() => setTipoDestino('ong')}
          style={[styles.botaoDestino, tipoDestino === 'ong' && styles.botaoAtivo]}
        >
          <Text>ONG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTipoDestino('voluntario')}
          style={[styles.botaoDestino, tipoDestino === 'voluntario' && styles.botaoAtivo]}
        >
          <Text>Voluntário</Text>
        </TouchableOpacity>
      </View>

      {tipoDestino && (
        <>
          <Text style={styles.section}>Selecione o destino:</Text>
          <FlatList
            data={destinos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setDestinoSelecionado(item.id)}
                style={[
                  styles.item,
                  destinoSelecionado === item.id && styles.itemSelecionado,
                ]}
              >
                <Text>{item.nome}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}

      <TouchableOpacity style={styles.botaoConfirmar} onPress={realizarDoacao}>
        <Text style={styles.botaoTexto}>Confirmar Doação</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  item: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    marginBottom: 5,
    borderRadius: 6,
  },
  itemSelecionado: {
    backgroundColor: '#d4edda',
  },
  opcoesDestino: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  botaoDestino: {
    padding: 10,
    backgroundColor: '#e2e2e2',
    borderRadius: 6,
  },
  botaoAtivo: {
    backgroundColor: '#bee5eb',
  },
  botaoConfirmar: {
    marginTop: 30,
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 40,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  checkboxVazio: {
    borderColor: '#555',
    backgroundColor: '#fff',
  },
  checkboxMarcado: {
    borderColor: '#28a745',
    backgroundColor: '#28a745',
  },
  selecionadoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputQtd: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    width: 70,  // aumentei largura do campo
    height: 40, // aumentei altura do campo para facilitar digitação
    paddingHorizontal: 10,
    textAlign: 'center',
  },
});
