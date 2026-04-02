export function validarSenha(senha) {
  if (!senha) return false;
  if (senha.length < 6) return false;
  
  return true;
}