export function validarTextoObrigatorio(texto, tamanhoMinimo = 3) {
  if (!texto || typeof texto !== 'string') return false;
  return texto.trim().length >= tamanhoMinimo;
}