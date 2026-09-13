export function validarPlaca(placa) {
  if (!placa) return false;
  
  const placaLimpa = placa.trim().toUpperCase().replace('-', '');

  const regexPlaca = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

  return regexPlaca.test(placaLimpa);
}