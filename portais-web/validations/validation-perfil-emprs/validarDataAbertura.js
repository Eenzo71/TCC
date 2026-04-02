export function validarDataAbertura(dataAbertura) {
  if (!dataAbertura) return false;

  const dataAber = new Date(dataAbertura);
  if (isNaN(dataAber.getTime())) return false;

  const hoje = new Date();
  
  return dataAber <= hoje;
}