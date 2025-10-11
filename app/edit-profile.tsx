import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Save,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useAuth } from '@/providers/auth-provider';
import { trpc } from '@/lib/trpc';
import { profileService } from '@/services/profile';

interface EditProfileForm {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const sessionQuery = trpc.profile.fetchSession.useQuery(undefined, {
    retry: 1,
    staleTime: 30_000,
  });

  const initialForm: EditProfileForm = useMemo(() => ({
    fullName: (sessionQuery.data?.data?.user?.fullName as string) ?? (user?.name ?? ''),
    email: (sessionQuery.data?.data?.user?.email as string) ?? (user?.email ?? ''),
    phone: (sessionQuery.data?.data?.user?.phone as string) ?? ((user as any)?.phone ?? ''),
    location: (sessionQuery.data?.data?.user?.location as string) ?? ((user as any)?.location ?? ''),
    bio: (sessionQuery.data?.data?.user as any)?.bio ?? '',
  }), [sessionQuery.data?.data?.user, user?.email, user?.name]);

  const [formData, setFormData] = useState<EditProfileForm>(initialForm);

  useEffect(() => {
    setFormData(initialForm);
  }, [initialForm]);

  const updateProfileMutation = trpc.profile.update.useMutation();

  const handleSave = async () => {
    console.log('[EditProfile] handleSave called with', formData);

    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    try {
      setIsSaving(true);

      const res = await updateProfileMutation.mutateAsync({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
      });

      try {
        if (res?.profile) {
          await updateProfile({
            name: res.profile.fullName ?? user?.name ?? '',
            email: res.profile.email ?? user?.email ?? '',
            phone: res.profile.phone ?? (user as any)?.phone ?? '',
            location: res.profile.location ?? (user as any)?.location,
            avatar: res.profile.profilePictureUrl ?? user?.avatar,
          } as any);
        }
      } catch (e) {
        console.log('[EditProfile] Failed to sync auth user after update', e);
      }

      await sessionQuery.refetch();

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: unknown) {
      console.error('[EditProfile] Update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = () => {
    console.log('[EditProfile] handlePhotoUpload');
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Gallery', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const imageAsset = await profileService.takePicture();
      if (!imageAsset) return;

      setIsSaving(true);
      const result = await profileService.uploadAvatar(user?.id || '', imageAsset);
      
      if (result.success && result.url) {
        await sessionQuery.refetch();
        Alert.alert('Success', 'Profile photo updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('[EditProfile] Take photo error:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const imageAsset = await profileService.pickImage();
      if (!imageAsset) return;

      setIsSaving(true);
      const result = await profileService.uploadAvatar(user?.id || '', imageAsset);
      
      if (result.success && result.url) {
        await sessionQuery.refetch();
        Alert.alert('Success', 'Profile photo updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('[EditProfile] Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container} testID="editProfile-screen">
      <LinearGradient colors={[WHITE, '#F9FAFB']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} testID="editProfile-back">
            <ArrowLeft size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: ((sessionQuery.data?.data?.user?.profilePictureUrl as string) ?? (user?.avatar ?? DEFAULT_AVATAR)) }}
                style={styles.photo}
                contentFit="cover"
                transition={300}
              />
              <TouchableOpacity style={styles.photoButton} onPress={handlePhotoUpload} testID="editProfile-photo">
                <Camera size={20} color={WHITE} />
              </TouchableOpacity>
            </View>
            <Text style={styles.photoLabel}>Tap to change photo</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <UserIcon size={20} color={ICON_MUTED} />
                <TextInput
                  testID="input-fullName"
                  style={styles.input}
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                  placeholder="Enter your full name"
                  placeholderTextColor={PLACEHOLDER}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={ICON_MUTED} />
                <TextInput
                  testID="input-email"
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter your email"
                  placeholderTextColor={PLACEHOLDER}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color={ICON_MUTED} />
                <TextInput
                  testID="input-phone"
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Enter your phone number"
                  placeholderTextColor={PLACEHOLDER}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color={ICON_MUTED} />
                <TextInput
                  testID="input-location"
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder="Enter your location"
                  placeholderTextColor={PLACEHOLDER}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  testID="input-bio"
                  style={[styles.input, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(text) => setFormData({ ...formData, bio: text })}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={PLACEHOLDER}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            testID="save-profile"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={WHITE} />
            ) : (
              <>
                <Save size={20} color={WHITE} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const WHITE = '#FFFFFF' as const;
const TEXT_PRIMARY = '#1F2937' as const;
const BORDER = '#F3F4F6' as const;
const ICON_MUTED = '#6B7280' as const;
const PLACEHOLDER = '#9CA3AF' as const;
const GREEN = '#2D5016' as const;
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=800&auto=format&fit=crop' as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: TEXT_PRIMARY },
  headerRight: { width: 40 },
  content: { flex: 1, paddingHorizontal: 16 },
  photoSection: { alignItems: 'center', paddingVertical: 32 },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photo: { width: '100%', height: '100%' },
  photoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: GREEN,
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoLabel: { fontSize: 13, color: '#6B7280' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' as const, color: '#374151' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  textAreaContainer: { alignItems: 'flex-start', paddingVertical: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  textArea: { minHeight: 80 },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: '700' as const, color: WHITE },
});
