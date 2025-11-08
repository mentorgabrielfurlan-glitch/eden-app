import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import GardenMini from '../components/GardenMini';

const JourneyScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Jornada do Jardim Interior
      </Text>
      <Card style={styles.card}>
        <Card.Title title="Sua evolução" subtitle="Acompanhe seu progresso nos módulos" />
        <Card.Content>
          <Text>
            Em breve este espaço exibirá a mandala interativa, missões concluídas e sugestões de próximos passos.
          </Text>
        </Card.Content>
      </Card>
      <View style={styles.gardenWrapper}>
        <GardenMini auraScore={72} flowers={6} water={3} light={4} shadows={1} />
        <Text style={styles.helperText}>
          O GardenMini será atualizado conforme o usuário completa sessões e meditações.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  title: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
  },
  gardenWrapper: {
    alignItems: 'center',
  },
  helperText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#64748B',
  },
});

export default JourneyScreen;
