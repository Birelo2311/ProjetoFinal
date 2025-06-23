import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [qtdPontos, setQtdPontos] = useState(0);
  const [qtdOngs, setQtdOngs] = useState(0);
  const [qtdItensRecebidos, setQtdItensRecebidos] = useState(0);
  const [qtdItensEnviados, setQtdItensEnviados] = useState(0);
  const [ongTop, setOngTop] = useState('');
  const [ultimasMovimentacoes, setUltimasMovimentacoes] = useState<any[]>([]);

  async function carregarDados() {
    const user = auth().currentUser;
    if (!user) return;

    setLoading(true);

    try {
      const userDoc = await firestore().collection('usuarios').doc(user.uid).get();
      setNomeUsuario(Boolean(userDoc.exists) ? userDoc.data()?.nomeCompleto || 'Usuário' : 'Usuário');

      const pontosSnapshot = await firestore()
        .collection('pontosDeColeta')
        .where('userId', '==', user.uid)
        .get();
      setQtdPontos(pontosSnapshot.size);

      const ongsSnapshot = await firestore()
        .collection('ongs')
        .where('userId', '==', user.uid)
        .get();
      setQtdOngs(ongsSnapshot.size);

      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const recebidosSnapshot = await firestore()
        .collection('doacoesRecebidas')
        .where('userId', '==', user.uid)
        .where('data', '>=', firestore.Timestamp.fromDate(dataLimite))
        .get();

      let totalRecebidos = 0;
      recebidosSnapshot.forEach(doc => {
        const itens = doc.data().itens || [];
        itens.forEach((item: any) => {
          totalRecebidos += item.quantidade || 0;
        });
      });
      setQtdItensRecebidos(totalRecebidos);

      const enviosSnapshot = await firestore()
        .collection('doacoesRealizadas')
        .where('userId', '==', user.uid)
        .where('data', '>=', firestore.Timestamp.fromDate(dataLimite))
        .get();

      let totalEnviados = 0;
      const ongEnviosMap: { [key: string]: number } = {};
      const movimentacoes: any[] = [];

      enviosSnapshot.forEach(doc => {
        const envio = doc.data();
        movimentacoes.push({ tipo: 'Envio', data: envio.data.toDate(), itens: envio.itens });

        const itens = envio.itens || [];
        let totalItensEnvio = 0;
        itens.forEach((item: any) => {
          totalItensEnvio += item.quantidade || 0;
        });

        totalEnviados += totalItensEnvio;

        if (envio.destinoTipo === 'ONG' && envio.destinoId) {
          ongEnviosMap[envio.destinoId] = (ongEnviosMap[envio.destinoId] || 0) + totalItensEnvio;
        }
      });

      setQtdItensEnviados(totalEnviados);

      let maxEnvios = 0;
      let topOngId = '';
      for (const ongId in ongEnviosMap) {
        if (ongEnviosMap[ongId] > maxEnvios) {
          maxEnvios = ongEnviosMap[ongId];
          topOngId = ongId;
        }
      }

      if (topOngId) {
        const ongDoc = await firestore().collection('ongs').doc(topOngId).get();
        setOngTop(Boolean(ongDoc.exists) ? ongDoc.data()?.nome : 'ONG não encontrada');
      } else {
        setOngTop('Nenhuma ONG');
      }

      movimentacoes.sort((a, b) => b.data.getTime() - a.data.getTime());
      setUltimasMovimentacoes(movimentacoes.slice(0, 3));

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bem-vindo, {nomeUsuario}!</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo Geral</Text>
        <Text style={styles.info}>Pontos de Coleta: {qtdPontos}</Text>
        <Text style={styles.info}>ONGs Cadastradas: {qtdOngs}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Movimentação (Últimos 30 dias)</Text>
        <Text style={styles.info}>Itens Recebidos: {qtdItensRecebidos}</Text>
        <Text style={styles.info}>Itens Enviados: {qtdItensEnviados}</Text>
        <Text style={styles.info}>ONG com mais envios: {ongTop}</Text>
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimas Movimentações</Text>
        {ultimasMovimentacoes.length > 0 ? (
          ultimasMovimentacoes.map((mov, index) => (
            <Text key={index} style={styles.info}>
              {mov.tipo} - {mov.data.toLocaleDateString()} - {mov.itens.length} itens
            </Text>
          ))
        ) : (
          <Text style={styles.info}>Nenhuma movimentação recente.</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdicionarONG')}>
          <Text style={styles.buttonText}>Cadastrar ONG</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdicionarDoacao')}>
          <Text style={styles.buttonText}>Registrar Doação</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CadastroDoacao')}>
          <Text style={styles.buttonText}>Visualizar Estoque</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.reloadButton} onPress={carregarDados}>
        <Text style={styles.reloadButtonText}>Atualizar Dados</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  info: { fontSize: 16, marginBottom: 6 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  reloadButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  reloadButtonText: { color: '#007AFF', fontWeight: 'bold' },
});
