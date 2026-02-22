import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [alunoData, setAlunoData] = useState(null);

  // Solicita permissão da câmera ao abrir o app
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  // Função disparada assim que a câmera detecta qualquer QR Code
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true); // Trava a câmera para não ler 2x seguidas
    
    try {
      // Converte o texto lido de volta para um objeto JavaScript
      const parsedData = JSON.parse(data);
      setAlunoData(parsedData);
    } catch (error) {
      Alert.alert("Erro", "QR Code inválido. Não pertence ao sistema.");
    }
  };

  if (hasPermission === null) return <Text>Solicitando permissão da câmera...</Text>;
  if (hasPermission === false) return <Text>Sem acesso à câmera. Libere nas configurações.</Text>;

  return (
    <View style={styles.container}>
      {!scanned ? (
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"], // Filtra para ler apenas QR Codes
          }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.titulo}>Leitura Concluída!</Text>
          
          {alunoData && (
            <View style={styles.card}>
              <Text style={styles.texto}>🆔 ID: {alunoData.id}</Text>
              <Text style={styles.texto}>📍 Destino: {alunoData.destino}</Text>
            </View>
          )}
          
          <Button title={'Escanear Próximo Aluno'} onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#000' },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 20, width: '80%', elevation: 3 },
  texto: { fontSize: 18, marginBottom: 10, color: '#555' }
});