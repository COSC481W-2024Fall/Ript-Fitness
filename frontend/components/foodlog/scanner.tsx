import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ScannerProps = {
  onClose: () => void; // Callback to close the scanner
  onScan: (data: string) => void; // Callback for handling scanned barcode data
};

const Scanner: React.FC<ScannerProps> = ({ onClose, onScan }) => {
  const facing: 'front' | 'back' = 'back';
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function handleBarCodeScanned({ data, type }: { data: string; type: string }) {
    if (!scannedData) {
      setScannedData(data);
      console.log(`Scanned Barcode - Type: ${type}, Data: ${data}`);
      onScan(data); // Send the scanned data to the parent component
      onClose(); // Automatically close scanner after scanning
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13', // European food products
            'ean8', // Shorter EAN codes
            'upc_a', // US food barcodes
            'upc_e', // Compact UPC
            'code128', // Some grocery stores use this
          ],
        }}
      >
      </CameraView>

      <Button title="Close Scanner" onPress={onClose} />

      {scannedData && <Text style={styles.scannedText}>Scanned: {scannedData}</Text>}
    </View>
  );
};

export default Scanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  scannedText: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    fontSize: 18,
    color: 'black',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
});
