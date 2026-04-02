export function validarCep(cep) {
  if (!cep) return false;
  
  const limpo = cep.replace(/\D/g, '');
  
  return limpo.length === 8;
}