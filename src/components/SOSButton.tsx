import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import SOSModal from './SOSModal';

const SOSButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <FAB
        icon="phone"
        label="SOS"
        onPress={() => setVisible(true)}
        accessibilityLabel="Abrir opções de suporte emocional"
        style={styles.fab}
      />
      <SOSModal visible={visible} onDismiss={() => setVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    borderRadius: 28,
  },
});

export default SOSButton;
