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
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
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
      await supabaseService.updateProfile({ avatar_url: publicUrl });

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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  // Get user activity
  getUserActivity: async (limit = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  },

  // Get notification settings
  getNotificationSettings: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // First, ensure the user profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (!profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (profileError) throw profileError;
      }

      // Try to get existing notification settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If settings exist, return them
      if (!fetchError && existingSettings) {
        return existingSettings;
      }

      // If no settings exist, create default settings
      const defaultSettings = {
        user_id: user.id,
        new_recipes: true,
        recipe_comments: true,
        recipe_ratings: true,
        weekly_newsletter: true,
        special_offers: false,
        updated_at: new Date().toISOString()
      };

      const { data: newSettings, error: insertError } = await supabase
        .from('notification_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (insertError) throw insertError;
      return newSettings;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      throw error;
    }
  }
}; 