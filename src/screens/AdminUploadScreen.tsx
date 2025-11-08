import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

// Para usar o seletor de arquivos/galeria instale `expo-document-picker` e `expo-image-picker`.

interface PickedFile {
  uri: string;
  name: string;
}

const AdminUploadScreen: React.FC = () => {
  const { user } = useAuth();
  const { firestore, storage } = initializeFirebase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('iniciante');
  const [tags, setTags] = useState('');
  const [audioFile, setAudioFile] = useState<PickedFile | null>(null);
  const [coverImage, setCoverImage] = useState<PickedFile | null>(null);
  const [collectionType, setCollectionType] = useState<'meditations' | 'breathings'>('meditations');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== 'admin') {
    return (
      <View style={styles.centered}>
        <Text>Você precisa de permissão de administrador para acessar esta tela.</Text>
      </View>
    );
  }

  const handlePickAudio = async () => {
    const DocumentPicker = await import('expo-document-picker');
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.type === 'success') {
      setAudioFile({ uri: result.uri, name: result.name ?? 'audio.mp3' });
    }
  };

  const handlePickImage = async () => {
    const ImagePicker = await import('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      const asset = result.assets[0];
      setCoverImage({ uri: asset.uri, name: asset.fileName ?? 'cover.jpg' });
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) {
      setError('Selecione um arquivo de áudio.');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const audioResponse = await fetch(audioFile.uri);
      const audioBlob = await audioResponse.blob();
      const audioRef = ref(storage, `${collectionType}/${Date.now()}-${audioFile.name}`);
      await uploadBytes(audioRef, audioBlob);
      const audioUrl = await getDownloadURL(audioRef);

      let coverUrl: string | null = null;
      if (coverImage) {
        const coverResponse = await fetch(coverImage.uri);
        const coverBlob = await coverResponse.blob();
        const coverRef = ref(storage, `${collectionType}/covers/${Date.now()}-${coverImage.name}`);
        await uploadBytes(coverRef, coverBlob);
        coverUrl = await getDownloadURL(coverRef);
      }

      await addDoc(collection(firestore, collectionType), {
        title,
        description,
        durationSeconds: Number(duration),
        level,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        audioUrl,
        coverUrl,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });

      Alert.alert('Sucesso', 'Conteúdo enviado para o Firebase Storage.');
      setTitle('');
      setDescription('');
      setDuration('');
      setTags('');
      setAudioFile(null);
      setCoverImage(null);
    } catch (uploadError: any) {
      console.warn(uploadError);
      setError(uploadError?.message ?? 'Falha ao enviar conteúdo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Upload de conteúdo</Text>
      <TextInput label="Título" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
      <TextInput
        label="Descrição"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        style={styles.input}
      />
      <TextInput
        label="Duração (segundos)"
        value={duration}
        onChangeText={setDuration}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />
      <Picker selectedValue={level} onValueChange={(value) => setLevel(value)} style={styles.picker}>
        <Picker.Item label="Iniciante" value="iniciante" />
        <Picker.Item label="Intermediário" value="intermediario" />
        <Picker.Item label="Avançado" value="avancado" />
      </Picker>
      <Picker selectedValue={collectionType} onValueChange={(value) => setCollectionType(value)} style={styles.picker}>
        <Picker.Item label="Meditações" value="meditations" />
        <Picker.Item label="Respirações" value="breathings" />
      </Picker>
      <TextInput
        label="Tags (separadas por vírgula)"
        value={tags}
        onChangeText={setTags}
        mode="outlined"
        style={styles.input}
      />
      <Button onPress={handlePickAudio} mode="contained-tonal" style={styles.input}>
        {audioFile ? `Áudio selecionado: ${audioFile.name}` : 'Selecionar áudio'}
      </Button>
      <Button onPress={handlePickImage} mode="contained-tonal" style={styles.input}>
        {coverImage ? `Capa selecionada: ${coverImage.name}` : 'Selecionar capa'}
      </Button>
      {error && <HelperText type="error">{error}</HelperText>}
      <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
        Enviar
      </Button>
      <Text style={styles.helper}>
        Validações adicionais: garantir tamanho máximo do áudio, converter para .mp3/.aac e usar Cloud Functions para gerar
        waveforms ou pré-visualizações.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#F1F5F9',
  },
  helper: {
    marginTop: 16,
    color: '#64748B',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});

export default AdminUploadScreen;
