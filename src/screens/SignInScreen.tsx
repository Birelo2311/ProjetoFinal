import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';
import { TextInputMask } from 'react-native-masked-text';

type NavProps = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<NavProps>();

  const [showModal, setShowModal] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [celular, setCelular] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const validarSenhaForte = (senha: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    return regex.test(senha);
  };

  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    auth()
      .signInWithEmailAndPassword(email, senha)
      .then(() => {
        console.log('Usuário autenticado');
        navigation.navigate('Main');
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Erro ao autenticar', 'Verifique seu e-mail e senha.');
      });
  };

  const handleCadastro = () => {
    if (!emailCadastro || !nomeCompleto || !senhaCadastro || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (!validarSenhaForte(senhaCadastro)) {
      Alert.alert('Senha Fraca', 'A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial.');
      return;
    }

    if (senhaCadastro !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(emailCadastro, senhaCadastro)
      .then(userCredential => {
        const uid = userCredential.user.uid;

        return firestore().collection('usuarios').doc(uid).set({
          userId: uid,
          nomeCompleto,
          telefone,
          celular,
          email: emailCadastro,
          criadoEm: firestore.FieldValue.serverTimestamp(),
        });
      })
      .then(() => {
        Alert.alert('Cadastro realizado', 'Usuário criado com sucesso!');
        setShowModal(false);

        
        setNomeCompleto('');
        setTelefone('');
        setCelular('');
        setEmailCadastro('');
        setSenhaCadastro('');
        setConfirmarSenha('');

        navigation.navigate('Main');
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Erro ao cadastrar', 'Verifique os dados informados.');
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerButton} onPress={() => setShowModal(true)}>
          <Text style={styles.registerText}>Cadastrar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Cadastro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Cadastro</Text>

              <TextInput
                style={styles.input}
                placeholder="Nome Completo *"
                value={nomeCompleto}
                onChangeText={setNomeCompleto}
              />

              <TextInputMask
                type={'custom'}
                options={{ mask: '(99) 9999-9999' }}
                style={styles.input}
                placeholder="Telefone (Opcional)"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
              />

              <TextInputMask
                type={'custom'}
                options={{ mask: '(99) 99999-9999' }}
                style={styles.input}
                placeholder="Celular (Opcional)"
                value={celular}
                onChangeText={setCelular}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="E-mail *"
                value={emailCadastro}
                onChangeText={setEmailCadastro}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Senha *"
                value={senhaCadastro}
                onChangeText={setSenhaCadastro}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmar Senha *"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.loginButton, { flex: 1, marginRight: 8 }]}
                  onPress={handleCadastro}
                >
                  <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton, { flex: 1, backgroundColor: '#ccc' }]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={[styles.buttonText, { color: '#000' }]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  logo: { width: 200, height: 120, alignSelf: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 16 },
  loginButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  registerButton: { marginTop: 32, alignItems: 'center' },
  registerText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 },
  modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});
