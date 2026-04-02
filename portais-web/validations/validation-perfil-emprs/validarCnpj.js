export function validarCNPJ(cnpj) {
  if (!cnpj) return false;

  const strCNPJ = String(cnpj).replace(/[^\d]+/g, '');

  if (strCNPJ.length !== 14) return false;

  if (/^(\d)\1+$/.test(strCNPJ)) return false;

  let tamanho = strCNPJ.length - 2;
  let numeros = strCNPJ.substring(0, tamanho);
  let digitos = strCNPJ.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = strCNPJ.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}