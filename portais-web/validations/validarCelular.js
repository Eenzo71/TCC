export function validarCelular(celular) {
  if (!celular) return false;
  
  const limpo = celular.replace(/\D/g, '');
  
  return limpo.length === 11;
}