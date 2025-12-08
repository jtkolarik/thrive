import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useProfile } from '../../hooks/useProfile';
import { supabase } from '../../lib/supabase';

export default function FirstEntryScreen() {
  const router = useRouter();
  const { children, preferences, reset } = useOnboarding();
  const { updateProfile } = useProfile();

  const [content, setContent] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstChild = children[0];

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant permission to access your photo library'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(undefined);
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      await completeOnboarding();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndStart = async () => {
    if (!content.trim() && !photoUri) {
      Alert.alert('No Entry', 'Please add some content or a photo to save an entry.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      // Save the entry to the database
      let mediaUrls: string[] = [];

      // Upload photo if provided
      if (photoUri) {
        const fileName = `entry-${Date.now()}.jpg`;
        const filePath = `entries/${user.id}/${firstChild.name}/${fileName}`;

        const response = await fetch(photoUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, blob, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        mediaUrls.push(publicUrl);
      }

      // Create the entry - we'll need to create the child first
      // First, let's add all children from onboarding
      const childIds: string[] = [];
      for (const child of children) {
        const { data: childData, error: childError } = await supabase
          .from('children')
          .insert({
            parent_id: user.id,
            name: child.name,
            date_of_birth: child.date_of_birth,
            gender: child.gender || null,
            avatar_url: child.avatar_url || null,
          })
          .select()
          .single();

        if (childError) throw childError;
        childIds.push(childData.id);
      }

      // Create the entry if there's content
      if (content.trim() || mediaUrls.length > 0) {
        const { error: entryError } = await supabase.from('entries').insert({
          child_id: childIds[0], // First child
          parent_id: user.id,
          type: photoUri ? 'photo' : 'note',
          content: content.trim() || null,
          media_urls: mediaUrls,
          occurred_at: new Date().toISOString(),
        });

        if (entryError) throw entryError;
      }

      // Complete onboarding
      await completeOnboarding();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Update profile with onboarding completion and preferences
      await updateProfile({
        onboarding_completed: true,
        digest_frequency: preferences.digest_frequency,
      });

      // Reset onboarding state
      reset();

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= 3 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your First Memory</Text>
            <Text style={styles.subtitle}>
              {firstChild
                ? `What's one thing you want to remember about ${firstChild.name} today?`
                : "What's one thing you want to remember today?"}
            </Text>
          </View>

          {/* Entry Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.textArea}
              value={content}
              onChangeText={setContent}
              placeholder="Type your thoughts here... It could be a funny thing they said, a milestone they reached, or just a sweet moment you want to remember."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            {/* Photo Attachment */}
            {photoUri ? (
              <View style={styles.photoAttached}>
                <View style={styles.photoPreview}>
                  <Text style={styles.photoPreviewText}>📷 Photo attached</Text>
                </View>
                <TouchableOpacity onPress={handleRemovePhoto}>
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <Text style={styles.addPhotoText}>📷 Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Encouragement */}
          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementEmoji}>✨</Text>
            <Text style={styles.encouragementText}>
              Don't worry about making it perfect. This is just the beginning of
              your journey with Thrive!
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSubmitting && styles.saveButtonDisabled,
            ]}
            onPress={handleSaveAndStart}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.saveButtonText}>Save & Get Started</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
  },
  progressDotActive: {
    backgroundColor: colors.primary[600],
    width: 24,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.base,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 200,
    lineHeight: typography.lineHeight.base,
  },
  addPhotoButton: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  photoAttached: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.success[50],
    borderWidth: 1,
    borderColor: colors.success[200],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  photoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoPreviewText: {
    fontSize: typography.fontSize.base,
    color: colors.success[700],
    fontWeight: typography.fontWeight.medium,
  },
  removePhotoText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[600],
    fontWeight: typography.fontWeight.medium,
  },
  encouragementBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  encouragementEmoji: {
    fontSize: 20,
  },
  encouragementText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[800],
    lineHeight: typography.lineHeight.sm,
  },
  bottomContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background,
  },
  skipButton: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.primary[400],
  },
  saveButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
