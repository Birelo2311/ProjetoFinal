export interface ItemDoacao {
  id: string;
  item: string;
  quantidade: number;
  tamanho: string;
  sexo: string;
  data: string;
}

export interface Doacao {
  id: string;
  destinatarioId: string; // <--- Adicionado
  destino: 'Voluntário' | 'ONG'; // <--- Corrigido
  itens: ItemDoacao[];
  data: Date;
}
