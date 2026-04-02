export function validarTelefoneEmergencia(telefone) {
  if (!telefone || telefone.trim() === '') return true;
  
  const limpo = telefone.replace(/\D/g, '');
  
  return limpo.length === 10 || limpo.length === 11;
}