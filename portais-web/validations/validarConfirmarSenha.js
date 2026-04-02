export function validarConfirmarSenha(senha, confirmarSenha) {
  if (!senha || !confirmarSenha) return false;
  return senha === confirmarSenha;
}