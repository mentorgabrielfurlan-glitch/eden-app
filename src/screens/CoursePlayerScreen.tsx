import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Button, Card, Checkbox, Text } from 'react-native-paper';
import { doc, setDoc } from 'firebase/firestore';
import AudioPlayer from '../components/AudioPlayer';
import { HomeStackParamList } from '../navigation';
import { Course, Lesson } from '../types/models';
import { initializeFirebase } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { getCourseById } from '../services/contentService';

interface CourseRouteParams {
  course?: Course;
  courseId?: string;
}

type CourseRouteProp = RouteProp<HomeStackParamList, 'CoursePlayer'> & {
  params: CourseRouteParams;
};

const CoursePlayerScreen: React.FC = () => {
  const route = useRoute<CourseRouteProp>();
  const { user } = useAuth();
  const { firestore } = initializeFirebase();
  const params = route.params ?? {};
  const [course, setCourse] = useState<Course | null>(params.course ?? null);
  const [loadingCourse, setLoadingCourse] = useState(!params.course);

  useEffect(() => {
    if (!params.course && params.courseId) {
      const fetchCourse = async () => {
        const data = await getCourseById(params.courseId!);
        setCourse(data);
        setLoadingCourse(false);
      };
      fetchCourse();
    } else {
      setLoadingCourse(false);
    }
  }, [params.course, params.courseId]);

  const firstPendingLesson = useMemo(() => {
    if (!course) return null;
    return course.lessons.find((lesson) => !lesson.completed) ?? course.lessons[0];
  }, [course]);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(firstPendingLesson);

  useEffect(() => {
    if (firstPendingLesson) {
      setCurrentLesson(firstPendingLesson);
    }
  }, [firstPendingLesson]);

  const handleCompleteLesson = async () => {
    if (!user?.uid || !currentLesson) return;
    await setDoc(doc(firestore, 'userProgress', `${user.uid}_${currentLesson.id}`), {
      userId: user.uid,
      contentType: 'lesson',
      contentId: currentLesson.id,
      completedAt: new Date().toISOString(),
    });
    // TODO: acionar webhook/backend para atualizar progresso agregado do curso.
  };

  const sortedLessons = useMemo(() => {
    if (!course) return [];
    return [...course.lessons].sort((a, b) => a.order - b.order);
  }, [course]);

  const goToNextLesson = () => {
    if (!currentLesson || !course) return;
    const currentIndex = sortedLessons.findIndex((lesson) => lesson.id === currentLesson.id);
    const next = sortedLessons[currentIndex + 1];
    if (next) {
      setCurrentLesson(next);
    }
  };

  if (loadingCourse || !course || !currentLesson) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {course.title}
      </Text>
      <Text style={styles.description}>{course.description}</Text>
      <AudioPlayer
        audioUrl={currentLesson.audioUrl ?? ''}
        title={currentLesson.title}
        duration={currentLesson.durationSeconds}
        resumeKey={`course-${course.id}-${currentLesson.id}`}
        onComplete={handleCompleteLesson}
      />
      <Button mode="outlined" onPress={goToNextLesson} style={styles.nextButton}>
        Continuar próxima lição
      </Button>
      <FlatList
        data={sortedLessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={[styles.lessonCard, item.id === currentLesson.id && styles.activeLesson]}
            onPress={() => setCurrentLesson(item)}
          >
            <Card.Title
              title={item.title}
              subtitle={`Duração: ${item.durationSeconds ? Math.round(item.durationSeconds / 60) : '--'} min`}
              left={() => <Checkbox status={item.completed ? 'checked' : 'unchecked'} />} // Integração com progresso real
            />
          </Card>
        )}
        ListFooterComponent={
          <Text style={styles.helper}>
            Ao finalizar todas as lições, atualize o progresso no Firestore (`courses/{courseId}/progress`).
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
  },
  description: {
    color: '#475569',
  },
  lessonCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  activeLesson: {
    borderWidth: 2,
    borderColor: '#4EAC6D',
  },
  helper: {
    color: '#64748B',
    marginTop: 12,
  },
  nextButton: {
    alignSelf: 'flex-start',
  },
});

export default CoursePlayerScreen;
