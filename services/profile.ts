import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface ProfileData {
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
}

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class ProfileService {
  async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error('❌ No active session');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<ProfileData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      return { success: false, error: error?.message || 'Failed to update profile' };
    }
  }

  async pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('❌ Media library permission denied');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('❌ Pick image error:', error);
      return null;
    }
  }

  async takePicture(): Promise<ImagePicker.ImagePickerAsset | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('❌ Camera permission denied');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('❌ Take picture error:', error);
      return null;
    }
  }

  async uploadAvatar(userId: string, imageAsset: ImagePicker.ImagePickerAsset): Promise<AvatarUploadResult> {
    try {
      console.log('📤 Uploading avatar for user:', userId);

      const fileExt = imageAsset.uri.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let fileBlob: Blob;
      
      if (Platform.OS === 'web') {
        const response = await fetch(imageAsset.uri);
        fileBlob = await response.blob();
      } else {
        const response = await fetch(imageAsset.uri);
        fileBlob = await response.blob();
      }

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, fileBlob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      const updateResult = await this.updateProfile(userId, { avatar_url: avatarUrl });

      if (!updateResult.success) {
        return { success: false, error: updateResult.error };
      }

      console.log('✅ Avatar uploaded successfully:', avatarUrl);
      return { success: true, url: avatarUrl };
    } catch (error: any) {
      console.error('❌ Upload avatar error:', error);
      return { success: false, error: error?.message || 'Failed to upload avatar' };
    }
  }

  async syncAuthUserWithProfile(userId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ No authenticated user');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email || '',
            phone: user.phone || '',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          });

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
        } else {
          console.log('✅ Profile created successfully');
        }
      } else {
        console.log('✅ Profile already exists');
      }
    } catch (error) {
      console.error('❌ Sync auth user error:', error);
    }
  }
}

export const profileService = new ProfileService();
