import React, { useState } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';

const PHASES = Array.from({ length: 12 }).map((_, index) => ({
  id: index + 1,
  title: `Fase ${index + 1}`,
  description: 'Resumo breve da experiência desta fase. Personalize com o conteúdo real.',
  top: 10 + (index % 3) * 30,
  left: 10 + Math.floor(index / 3) * 22,
}));

const MandalaScreen: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<typeof PHASES[number] | null>(null);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80' }}
        style={styles.mandala}
        imageStyle={{ borderRadius: 20 }}
      >
        {PHASES.map((phase) => (
          <TouchableOpacity
            key={phase.id}
            style={[styles.hotspot, { top: `${phase.top}%`, left: `${phase.left}%` }]}
            accessibilityLabel={`Abrir fase ${phase.id}`}
            onPress={() => setSelectedPhase(phase)}
          />
        ))}
      </ImageBackground>
      <Text style={styles.helper}>
        Substitua a imagem por um SVG interativo para estados dinâmicos e animações. É possível utilizar react-native-svg e
        eventos de toque para cada setor da mandala futuramente.
      </Text>
      <Portal>
        <Modal visible={!!selectedPhase} onDismiss={() => setSelectedPhase(null)} contentContainerStyle={styles.modal}>
          <Text variant="titleMedium">{selectedPhase?.title}</Text>
          <Text style={styles.description}>{selectedPhase?.description}</Text>
          <Text style={styles.modalButton} onPress={() => setSelectedPhase(null)}>
            Abrir módulo (placeholder)
          </Text>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  mandala: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  hotspot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.7)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  helper: {
    marginTop: 16,
    textAlign: 'center',
    color: '#475569',
  },
  modal: {
    backgroundColor: '#fff',
    margin: 24,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  description: {
    color: '#64748B',
  },
  modalButton: {
    marginTop: 12,
    color: '#4EAC6D',
  },
});

export default MandalaScreen;
