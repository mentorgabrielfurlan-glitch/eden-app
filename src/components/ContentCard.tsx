import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Badge, Button, Card, Text } from 'react-native-paper';

interface ContentCardProps {
  id: string;
  type: 'meditation' | 'breathing' | 'course' | 'lesson';
  title: string;
  duration?: number;
  coverUrl?: string;
  tags?: string[];
  completed?: boolean;
  onPressPlay?: () => void;
  onPressDetails?: () => void;
}

const formatDuration = (duration?: number) => {
  if (!duration) return '---';
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}m ${seconds}s`;
};

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  duration,
  coverUrl,
  tags,
  completed,
  onPressDetails,
  onPressPlay,
  type,
}) => {
  return (
    <Card accessibilityRole="summary" accessibilityLabel={`${title}, duração ${formatDuration(duration)}`} style={styles.card}>
      <TouchableOpacity onPress={onPressDetails} accessibilityRole="button">
        <View style={styles.contentRow}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]}>
              <Text style={styles.placeholderText}>{type === 'breathing' ? 'Respiração' : 'Áudio'}</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={2}>
              {title}
            </Text>
            <Text variant="bodySmall" style={styles.duration}>
              {formatDuration(duration)}
            </Text>
            <View style={styles.tagsRow}>
              {tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} style={styles.badge}>
                  {tag}
                </Badge>
              ))}
            </View>
            <View style={styles.actions}>
              <Button mode="contained-tonal" onPress={onPressPlay} accessibilityLabel={`Reproduzir ${title}`}>
                Reproduzir
              </Button>
              <Button onPress={onPressDetails}>Detalhes</Button>
            </View>
          </View>
          <Badge style={[styles.statusBadge, completed ? styles.completed : styles.newBadge]}>
            {completed ? 'Concluído' : 'Novo'}
          </Badge>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cover: {
    width: 84,
    height: 84,
    borderRadius: 12,
    marginRight: 16,
  },
  coverPlaceholder: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  duration: {
    color: '#64748B',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    marginRight: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  completed: {
    backgroundColor: '#34D399',
  },
  newBadge: {
    backgroundColor: '#F97316',
  },
});

export default ContentCard;
