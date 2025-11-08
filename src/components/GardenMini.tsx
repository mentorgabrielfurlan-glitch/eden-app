import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Text } from 'react-native-paper';

// Caso `react-native-svg` não esteja instalado, utilize `expo install react-native-svg` ou `npm install react-native-svg`.

interface GardenMiniProps {
  auraScore: number;
  flowers: number;
  water: number;
  light: number;
  shadows: number;
}

const GardenMini: React.FC<GardenMiniProps> = ({ auraScore, flowers, water, light, shadows }) => {
  const normalized = Math.min(100, Math.max(0, auraScore));
  const strokeDashoffset = ((100 - normalized) / 100) * (Math.PI * 2 * 45);

  return (
    <View style={styles.container}>
      <Svg width={150} height={150} viewBox="0 0 150 150">
        <Circle cx={75} cy={75} r={60} stroke="#E0F2F1" strokeWidth={6} fill="none" />
        <Circle
          cx={75}
          cy={75}
          r={45}
          stroke="#4EAC6D"
          strokeWidth={10}
          fill="none"
          strokeDasharray={Math.PI * 2 * 45}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
        <Path
          d="M75 105 C 60 95, 55 70, 75 50 C 95 70, 90 95, 75 105 Z"
          fill="#6CD59F"
        />
        <Circle cx={75} cy={60} r={10} fill="#34D399" />
      </Svg>
      <View style={styles.statsRow}>
        <Text variant="bodySmall">Aura: {normalized.toFixed(0)}</Text>
        <Text variant="bodySmall">Flores: {flowers}</Text>
        <Text variant="bodySmall">Água: {water}</Text>
        <Text variant="bodySmall">Luz: {light}</Text>
        <Text variant="bodySmall">Sombras: {shadows}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
});

export default GardenMini;
