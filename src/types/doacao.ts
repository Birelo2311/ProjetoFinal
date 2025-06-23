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
  destinatarioId: string;
  destino: 'Voluntário' | 'ONG';
  itens: ItemDoacao[];
  data: Date;
}
