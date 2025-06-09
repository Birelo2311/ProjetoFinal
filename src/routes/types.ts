<<<<<<< HEAD
import { ItemDoacao } from '../types/doacao';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type RootStackParamList = {
  Main: undefined;
  TelaInicial: undefined;
  SignIn: undefined;
  AdicionarDoacao: undefined;
  CadastroVoluntario: undefined;
  AdicionarVoluntario: undefined;
  CadastroONG: undefined;
  AdicionarONG: undefined;
  RealizaDoacao: undefined;
  
  EditarVoluntario: { id: string };
  EditarONG: { id: string };
  
  DetalhesVoluntario: {
    id: string;
    nome?: string;
    cpf?: string;
    telefone?: string;
    email?: string;
    dataCadastro?: Date | FirebaseFirestoreTypes.Timestamp;
  };
  
  DetalhesONG: {
    id: string;
    nome?: string;
    cnpj?: string;
    telefone?: string;
    email?: string;
    endereco?: string;
    dataCadastro?: Date | FirebaseFirestoreTypes.Timestamp;
  };
  
  DetalhesDoacao: { itens: ItemDoacao[] };
  EditarDoacao: { id: string };
  
=======
export type RootStackParamList = {
  Home: undefined;
  TelaInicial: undefined;
  SignIn: undefined;
  AdicionarDoacao: undefined;
  EditarDoacao: { id: string };
>>>>>>> dd4e3985f5b7d2d834aaa7c43066d61dbb0dbe6c
};
