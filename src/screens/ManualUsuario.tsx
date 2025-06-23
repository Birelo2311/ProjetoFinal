import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export default function ManualUsuario() {
  const navigation = useNavigation<NavigationProps>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual do Usuário</Text>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Tela de ONGs</Text>
        <Text style={styles.text}>
          Exibe todas as ONGs cadastradas pelo usuário. Possui um botão flutuante verde que permite adicionar uma nova ONG ao sistema.
        </Text>

        <Text style={styles.sectionTitle}>Tela Adicionar ONG</Text>
        <Text style={styles.text}>
          Todos os campos desta tela são obrigatórios. O sistema realiza a validação automática do CNPJ, não permitindo o cadastro de um CNPJ inválido.
        </Text>

        <Text style={styles.sectionTitle}>Tela de Pontos de Coleta</Text>
        <Text style={styles.text}>
          Exibe todos os pontos de coleta cadastrados pelo usuário. Possui um botão flutuante verde para adicionar novos pontos de coleta ao sistema.
        </Text>

        <Text style={styles.sectionTitle}>Tela Adicionar Ponto de Coleta</Text>
        <Text style={styles.text}>
          Todos os campos desta tela são obrigatórios. Ao preencher o CEP, o sistema completa automaticamente o endereço.
        </Text>

        <Text style={styles.sectionTitle}>Tela de Doações</Text>
        <Text style={styles.text}>
          Exibe o estoque atual do usuário logado e permite aplicar filtros por nome, tipo, sexo e tamanho. É possível editar ou excluir um item diretamente da listagem.
        </Text>
        <Text style={styles.text}>
          Na parte inferior da tela, há dois botões:
          {'\n'}• <Text style={styles.bold}>Receber</Text>: permite registrar o recebimento de uma doação.
          {'\n'}• <Text style={styles.bold}>Enviar</Text>: permite registrar o envio de uma doação para uma ONG.
        </Text>

        <Text style={styles.sectionTitle}>Tela Receber Doações</Text>
        <Text style={styles.text}>
          Permite registrar o recebimento de itens. O campo de ponto de coleta é obrigatório. Também é possível adicionar os detalhes de cada item recebido.
        </Text>

        <Text style={styles.sectionTitle}>Tela Adicionar Novo Item</Text>
        <Text style={styles.text}>
          Permite adicionar os itens que estão sendo recebidos. Após salvar, o item será listado na tela anterior.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Observação:</Text> Quando o tipo de item selecionado for "Calçado", o campo de quantidade passa a ser contabilizado em pares e o campo de tamanho se transforma em um campo numérico para informar o tamanho do calçado.
        </Text>

        <Text style={styles.sectionTitle}>Tela Enviar Doações</Text>
        <Text style={styles.text}>
          Permite enviar itens para uma ONG parceira. Possui filtros por nome, tipo, sexo e tamanho.
        </Text>
        <Text style={styles.text}>
          Todos os itens do estoque são listados. Ao selecionar um item, é possível informar a quantidade a ser enviada. O campo de ONG traz todas as ONGs cadastradas e, ao selecionar a ONG de destino, o campo ficará destacado em verde.
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  contentContainer: { paddingBottom: 100 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 10, lineHeight: 22 },
  bold: { fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 6,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
});
