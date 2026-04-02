export function validarRG(rg) {
  if (!rg) return false;
  
  const limpo = rg.replace(/[\s.-]/g, '');
  
  return limpo.length >= 5 && limpo.length <= 14;
}