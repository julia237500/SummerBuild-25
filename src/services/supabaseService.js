import supabase from './supabaseClient';

export const supabaseService = {
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },  // Update user profile
  updateProfile: async (profileData) => {
    try {
      console.log('Updating profile with data:', profileData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      console.log('Current user:', user);

      // Validate required fields
      if (!profileData.full_name?.trim()) {
        throw new Error('Name is required');
      }

      // Validate cooking level
      const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      if (!validLevels.includes(profileData.cooking_level)) {
        console.log('Invalid cooking level, defaulting to Beginner');
        profileData.cooking_level = 'Beginner';
      }

      // Ensure clean data structure with only allowed fields
      // Do not include bio field for now as it's not in the schema yet
      const updatePayload = {
        full_name: profileData.full_name.trim(),
        cooking_level: profileData.cooking_level,
        avatar_url: profileData.avatar_url || '',
        updated_at: new Date().toISOString()
      };

      console.log('Update payload:', updatePayload);

      // Check if profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Existing profile check result:', { existingProfile, checkError });

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile:', checkError);
        throw checkError;
      }

      let result;
      // If profile doesn't exist, create it
      if (!existingProfile) {
        console.log('Creating new profile');
        result = await supabase
          .from('profiles')
          .insert([{ ...updatePayload, id: user.id }])
          .select()
          .single();
      } else {
        // If profile exists, update it
        console.log('Updating existing profile');
        result = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', user.id)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Profile operation failed:', result.error);
        throw new Error(`Profile operation failed: ${result.error.message || result.error.details || 'Unknown error'}`);
      }

      console.log('Profile updated successfully:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  },

  // Upload profile picture
  uploadAvatar: async (file) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl }, error: urlError } = await supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      // Update profile with new avatar URL
      const profile = await supabaseService.getCurrentUser();

      await supabaseService.updateProfile({
        full_name: profile.full_name,
        cooking_level: profile.cooking_level || 'Beginner',
        avatar_url: publicUrl,
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },
  // Get user preferences
  getUserPreferences: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') { // No data found
        // If no preferences exist, create default preferences
        const defaultPreferences = {
          user_id: user.id,
          dietary_preferences: [],
          allergies: [],
          favorite_cuisines: []
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPreferences)
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newData;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  },
  // Update user preferences
  updateUserPreferences: async (preferences) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_cuisines: preferences.favorite_cuisines,
          dietary_preferences: preferences.dietary_preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },

  fetchFavoriteRecipes: async (userId) => {
    const { data, error } = await supabase
      .from('favorite_recipes')
      .select('recipes!inner(*)') // assumes you've set up a foreign key to recipes
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
    return data; // this will be an array of recipe objects
  },
 
  // Get user activity
  getUserActivity: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },
  // Get notification settings
  getNotificationSettings: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') { // No data found
        // Create default notification settings
        const defaultSettings = {
          user_id: user.id,
          enabled: true,
          email_notifications: true,
          push_notifications: true
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('notification_settings')
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newData;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },
  // Get connected accounts
  getConnectedAccounts: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      return data || [];
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      throw error;
    }
  }
};