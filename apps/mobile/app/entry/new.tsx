import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';

import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useChildren } from '../../hooks/useChildren';
import { useEntries } from '../../hooks/useEntries';
import { Button, Typography, DatePicker } from '../../components/ui';
import { ChildSelector } from '../../components/ChildSelector';

type EntryType = 'note' | 'photo' | 'milestone' | 'health';

const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  note: 'Note',
  photo: 'Photo',
  milestone: 'Milestone',
  health: 'Health',
};

export default function NewEntryScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const entryType = (params.type as EntryType) || 'note';

  const { user } = useAuth();
  const { children, selectedChild, selectChild } = useChildren(user?.id);
  const { createEntry, uploadMedia, loading } = useEntries(user?.id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [photos, setPhotos] = useState<string[]>([]);
  const [healthCategory, setHealthCategory] = useState<string>('symptoms');
  const [saving, setSaving] = useState(false);

  const canSave = () => {
    if (!selectedChild) return false;
    if (entryType === 'photo') {
      return photos.length > 0;
    }
    return content.trim().length > 0;
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedChild || !canSave()) return;

    try {
      setSaving(true);

      // Upload photos first if any
      const mediaUrls: string[] = [];
      for (const photo of photos) {
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        // We'll create the entry first and then upload
        mediaUrls.push(photo); // Temporary - will be replaced after upload
      }

      const entry = await createEntry({
        child_id: selectedChild.id,
        type: entryType,
        title: title.trim() || undefined,
        content: content.trim(),
        media_urls: [],
        occurred_at: occurredAt.toISOString(),
      });

      // Upload photos and update entry
      if (photos.length > 0 && entry) {
        const uploadedUrls: string[] = [];
        for (const photo of photos) {
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
          const url = await uploadMedia(entry.id, photo, fileName);
          uploadedUrls.push(url);
        }
        // Update entry with uploaded URLs would go here
      }

      router.back();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() || photos.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleChildSelect = (childId: string | null) => {
    const child = childId ? children.find((c) => c.id === childId) || null : null;
    selectChild(child);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: `New ${ENTRY_TYPE_LABELS[entryType]}`,
          headerLeft: () => (
            <Pressable onPress={handleCancel} style={styles.headerButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <Button
              title="Save"
              onPress={handleSave}
              disabled={!canSave() || saving}
              loading={saving}
              size="sm"
            />
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Child Selector */}
          {children.length > 1 && (
            <View style={styles.section}>
              <Typography variant="label" style={styles.label}>
                Child
              </Typography>
              <ChildSelector
                selectedChildId={selectedChild?.id || null}
                onSelect={handleChildSelect}
                children={children}
              />
            </View>
          )}

          {/* Date/Time */}
          <View style={styles.section}>
            <Typography variant="label" style={styles.label}>
              When did this happen?
            </Typography>
            <DatePicker
              value={occurredAt}
              onChange={setOccurredAt}
              mode="datetime"
            />
          </View>

          {/* Photo-specific UI */}
          {entryType === 'photo' && (
            <View style={styles.section}>
              <Typography variant="label" style={styles.label}>
                Photos ({photos.length}/5)
              </Typography>
              <View style={styles.photoGrid}>
                {photos.map((uri, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri }} style={styles.photo} />
                    <Pressable
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.error[500]} />
                    </Pressable>
                  </View>
                ))}
                {photos.length < 5 && (
                  <View style={styles.photoActions}>
                    <Pressable style={styles.photoButton} onPress={handleTakePhoto}>
                      <Ionicons name="camera" size={32} color={colors.primary[500]} />
                      <Typography variant="caption">Camera</Typography>
                    </Pressable>
                    <Pressable style={styles.photoButton} onPress={handlePickImage}>
                      <Ionicons name="images" size={32} color={colors.primary[500]} />
                      <Typography variant="caption">Gallery</Typography>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Title (optional) */}
          <View style={styles.section}>
            <Typography variant="label" style={styles.label}>
              Title (optional)
            </Typography>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Give this entry a title..."
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          {/* Content */}
          <View style={styles.section}>
            <Typography variant="label" style={styles.label}>
              {entryType === 'photo' ? 'Caption' : 'What happened?'}
            </Typography>
            <TextInput
              style={[styles.contentInput, entryType === 'photo' && styles.captionInput]}
              value={content}
              onChangeText={setContent}
              placeholder={
                entryType === 'photo'
                  ? 'Add a caption...'
                  : 'Describe what happened...'
              }
              placeholderTextColor={colors.text.tertiary}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Health-specific UI */}
          {entryType === 'health' && (
            <View style={styles.section}>
              <Typography variant="label" style={styles.label}>
                Category
              </Typography>
              <View style={styles.categoryGrid}>
                {['symptoms', 'medications', 'appointment', 'measurement'].map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryButton,
                      healthCategory === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setHealthCategory(cat)}
                  >
                    <Typography
                      variant="body"
                      color={healthCategory === cat ? 'inverse' : 'primary'}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  headerButton: {
    padding: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  titleInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  contentInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 150,
  },
  captionInput: {
    minHeight: 80,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.medium,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
});
