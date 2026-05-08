export function validarMaiorIdade(dataNascimento) {
  if (!dataNascimento) return false;

  const [ano, mes, dia] = dataNascimento.split('-');
  const dataNasc = new Date(ano, mes - 1, dia);

  if (isNaN(dataNasc.getTime())) return false;

  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const diferencaMes = hoje.getMonth() - dataNasc.getMonth();
  
  if (diferencaMes < 0 || (diferencaMes === 0 && hoje.getDate() < dataNasc.getDate())) {
    idade--;
  }
  
  return idade >= 18 && idade <= 120;
}