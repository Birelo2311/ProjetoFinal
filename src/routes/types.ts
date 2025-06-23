import { ItemDoacao } from '../types/doacao';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type RootStackParamList = {
  Main: undefined;
  TelaInicial: undefined;
  CadastroDoacao: undefined;
  SignIn: undefined;
  AdicionarDoacao: undefined;
  CadastroVoluntario: undefined;
  AdicionarVoluntario: undefined;
  CadastroONG: undefined;
  AdicionarONG: undefined;
  RealizaDoacao: undefined;
  ManualUsuario: undefined;
  
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
  EditarDoacao: { doacaoId: string; itemId: string };

  PontosDeColeta: undefined;
  AdicionarPonto: undefined;
  EditarPonto: { id: string };
  DetalhesPonto: {
    id: string;
    nome?:string;
    endereco?: string;
    dataCadastro?: Date | FirebaseFirestoreTypes.Timestamp;
  };
};
