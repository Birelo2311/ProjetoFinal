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
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes/types';

type NavProps = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation<NavProps>();

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
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha e-mail e senha para cadastrar.');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(email, senha)
      .then(() => {
        Alert.alert('Cadastro realizado', 'Usuário criado com sucesso!');
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
          source={require('../assets/logo.png')} // ajuste se necessário
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

        <TouchableOpacity style={styles.registerButton} onPress={handleCadastro}>
          <Text style={styles.registerText}>Cadastrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  registerText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
