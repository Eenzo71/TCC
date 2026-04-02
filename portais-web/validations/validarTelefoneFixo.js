export function validarTelefoneFixo(telefone) {
  if (!telefone) return true;
  
  const limpo = telefone.replace(/\D/g, '');
  
  return limpo.length === 10 || limpo.length === 11;
}