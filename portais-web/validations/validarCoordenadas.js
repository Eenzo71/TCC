export function validarCoordenadas(lat, lng) {
  if (!lat || !lng) return false;
  
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  
  if (isNaN(numLat) || isNaN(numLng)) return false;
  if (numLat < -90 || numLat > 90) return false;
  if (numLng < -180 || numLng > 180) return false;
  
  return true;
}