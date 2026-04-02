export function validarCnae(cnae) {
  if (!cnae) return false;
  
  const limpo = cnae.replace(/\D/g, '');
  
  return limpo.length === 7;
}