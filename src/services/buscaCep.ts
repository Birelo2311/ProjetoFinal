export async function buscarEndereco(cep: string) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error('Erro ao buscar CEP');
    return await response.json();
  } catch (error) {
    console.error('Erro na busca de CEP:', error);
    return null;
  }
}
