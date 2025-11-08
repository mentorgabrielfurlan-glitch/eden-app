import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';
import * as Linking from 'expo-linking';
import AudioPlayer from './AudioPlayer';

interface SOSModalProps {
  visible: boolean;
  onDismiss: () => void;
  emergencyNumber?: string;
}

const SOSModal: React.FC<SOSModalProps> = ({ visible, onDismiss, emergencyNumber = '0800-123-456' }) => {
  const [playQuickBreathing, setPlayQuickBreathing] = useState(false);

  const handleCall = () => {
    Alert.alert('Entrar em contato', `Deseja ligar para ${emergencyNumber}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Ligar',
        style: 'destructive',
        onPress: () => Linking.openURL(`tel:${emergencyNumber}`).catch(() => Alert.alert('Erro', 'Não foi possível iniciar a chamada.')),
      },
    ]);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleMedium">SOS Emocional</Text>
        <Text style={styles.description}>
          Utilize uma das práticas rápidas abaixo. Estas ações devem ser acompanhadas de protocolos clínicos adequados.
        </Text>
        <View style={styles.actions}>
          <Button mode="contained" onPress={() => setPlayQuickBreathing((prev) => !prev)}>
            Respiração curta (3 min)
          </Button>
          <Button mode="contained-tonal" onPress={() => setPlayQuickBreathing(false)}>
            Calmaria curta
          </Button>
          <Button mode="outlined" onPress={handleCall}>
            Contato humano
          </Button>
        </View>
        {playQuickBreathing && (
          <AudioPlayer
            audioUrl="https://storage.googleapis.com/placeholder-bucket/quick-breathing.mp3"
            title="Respiração curta"
            duration={180}
            resumeKey="sos-breathing"
            onComplete={() => setPlayQuickBreathing(false)}
          />
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  description: {
    color: '#475569',
  },
  actions: {
    gap: 12,
  },
});

export default SOSModal;
