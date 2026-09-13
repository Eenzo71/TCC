export function validarCNH(cnh) {
  if (!cnh) return false;
  
  const strCNH = cnh.replace(/[^\d]/g, '');

  if (strCNH.length !== 11 || /^(\d)\1{10}$/.test(strCNH)) return false;

  let v = 0;
  let dsc = 0;

  for (let i = 0, j = 9; i < 9; i++, j--) {
    v += parseInt(strCNH.charAt(i)) * j;
  }

  let vl1 = v % 11;
  if (vl1 >= 10) {
    vl1 = 0;
    dsc = 2;
  }

  v = 0;
  for (let i = 0, j = 1; i < 9; i++, j++) {
    v += parseInt(strCNH.charAt(i)) * j;
  }

  let x = v % 11;
  let vl2 = x >= 10 ? 0 : x - dsc;
  if (vl2 < 0) vl2 += 11;

  return String(vl1) === strCNH.charAt(9) && String(vl2) === strCNH.charAt(10);
}