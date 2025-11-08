import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Text } from 'react-native-paper';
import { doc, setDoc } from 'firebase/firestore';
import AudioPlayer from '../components/AudioPlayer';
import { HomeStackParamList } from '../navigation';
import { useAuth } from '../hooks/useAuth';
import { initializeFirebase } from '../services/firebase';

interface PlayerRouteParams {
  contentId: string;
  audioUrl: string;
  title: string;
  duration?: number;
}

type PlayerRouteProp = RouteProp<HomeStackParamList, 'Player'> & {
  params: PlayerRouteParams;
};

const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerRouteProp>();
  const { user } = useAuth();
  const { firestore } = initializeFirebase();

  const { audioUrl, contentId, title, duration } = route.params;

  const handleComplete = async () => {
    if (!user?.uid) return;
    await setDoc(doc(firestore, 'userProgress', `${user.uid}_${contentId}`), {
      userId: user.uid,
      contentId,
      contentType: 'meditation',
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      <AudioPlayer audioUrl={audioUrl} title={title} duration={duration} resumeKey={contentId} onComplete={handleComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
});

export default PlayerScreen;
