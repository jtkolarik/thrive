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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ChildInput } from '../../hooks/useChildren';

interface ChildFormData extends ChildInput {
  tempId?: string;
}

export default function AddChildScreen() {
  const router = useRouter();
  const { children, addChild, removeChild } = useOnboarding();

  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    date_of_birth: '',
    avatar_url: undefined,
    gender: undefined,
  });

  const [errors, setErrors] = useState<{ name?: string; date_of_birth?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; date_of_birth?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      if (dob > today) {
        newErrors.date_of_birth = 'Date of birth must be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddChild = () => {
    if (!validateForm()) {
      return;
    }

    const childToAdd: ChildInput = {
      name: formData.name.trim(),
      date_of_birth: formData.date_of_birth,
      avatar_url: formData.avatar_url,
      gender: formData.gender,
    };

    addChild(childToAdd);

    // Reset form
    setFormData({
      name: '',
      date_of_birth: '',
      avatar_url: undefined,
      gender: undefined,
    });
    setErrors({});

    Alert.alert('Success', 'Child added! You can add another or continue.', [
      { text: 'OK' },
    ]);
  };

  const handleRemoveChild = (index: number) => {
    Alert.alert('Remove Child', 'Are you sure you want to remove this child?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeChild(index),
      },
    ]);
  };

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
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData((prev) => ({ ...prev, avatar_url: result.assets[0].uri }));
    }
  };

  const handleContinue = () => {
    if (children.length === 0) {
      Alert.alert('Add a Child', 'Please add at least one child to continue');
      return;
    }
    router.push('/onboarding/preferences');
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
                  index <= 1 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Your Child</Text>
            <Text style={styles.subtitle}>
              Tell us about your little one. You can add multiple children.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, name: text }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Enter child's name"
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Date of Birth Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.date_of_birth && styles.inputError]}
                value={formData.date_of_birth}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, date_of_birth: text }));
                  if (errors.date_of_birth)
                    setErrors((prev) => ({ ...prev, date_of_birth: undefined }));
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.text.tertiary}
              />
              {errors.date_of_birth && (
                <Text style={styles.errorText}>{errors.date_of_birth}</Text>
              )}
              <Text style={styles.helperText}>Format: YYYY-MM-DD (e.g., 2020-05-15)</Text>
            </View>

            {/* Gender Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender (Optional)</Text>
              <View style={styles.genderContainer}>
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderButton,
                      formData.gender === option.value && styles.genderButtonActive,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: option.value as any,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === option.value &&
                          styles.genderButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Photo Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photo (Optional)</Text>
              <TouchableOpacity style={styles.photoPicker} onPress={handlePickImage}>
                {formData.avatar_url ? (
                  <View style={styles.photoPreviewContainer}>
                    <View style={styles.photoPreview}>
                      <Text style={styles.photoPreviewText}>Photo Selected</Text>
                    </View>
                    <Text style={styles.photoChangeText}>Tap to change</Text>
                  </View>
                ) : (
                  <Text style={styles.photoPickerText}>+ Add Photo</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Add Child Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddChild}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>+ Add Child</Text>
            </TouchableOpacity>
          </View>

          {/* Added Children List */}
          {children.length > 0 && (
            <View style={styles.childrenList}>
              <Text style={styles.childrenListTitle}>Added Children</Text>
              {children.map((child, index) => (
                <View key={index} style={styles.childItem}>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childDob}>
                      {formatDate(child.date_of_birth)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveChild(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              children.length === 0 && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={children.length === 0}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.continueButtonText,
                children.length === 0 && styles.continueButtonTextDisabled,
              ]}
            >
              Continue
            </Text>
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
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  required: {
    color: colors.error[500],
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error[500],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genderButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface,
  },
  genderButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  genderButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  genderButtonTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  photoPicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPickerText: {
    fontSize: typography.fontSize.base,
    color: colors.text.tertiary,
  },
  photoPreviewContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  photoPreviewText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
  },
  photoChangeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  addButton: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.primary[600],
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  childrenList: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  childrenListTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  childDob: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  removeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  removeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[600],
    fontWeight: typography.fontWeight.medium,
  },
  bottomContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background,
  },
  continueButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  continueButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  continueButtonTextDisabled: {
    color: colors.text.disabled,
  },
});
