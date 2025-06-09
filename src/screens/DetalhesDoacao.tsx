import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalhesDoacao'>;

export function DetalhesDoacao({ route }: Props) {
  const { itens } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes da Doação</Text>
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemTitle}>{item.item}</Text>
            <Text style={styles.detail}>Quantidade: <Text style={styles.bold}>{item.quantidade}</Text></Text>
            <Text style={styles.detail}>Tamanho: <Text style={styles.bold}>{item.tamanho}</Text></Text>
            <Text style={styles.detail}>Sexo: <Text style={styles.bold}>{item.sexo}</Text></Text>
            <Text style={styles.detail}>Data: <Text style={styles.bold}>{item.data}</Text></Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum item encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#343a40' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 20,
  },
});
