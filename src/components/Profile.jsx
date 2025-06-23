import { useState, useEffect, useRef } from 'react';
import { FaUser, FaCog, FaHeart, FaHistory, FaBell, FaLock, FaCamera } from 'react-icons/fa';
import { supabaseService } from '../services/supabaseService';
import './Profile.css';

const COOKING_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CUISINE_PREFERENCES = [
  'American', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian',
  'French', 'Thai', 'Mediterranean', 'Korean', 'Vietnamese'
];
const DIETARY_PREFERENCES = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
  'Nut-Free', 'Halal', 'Kosher', 'None'
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState(null);
  const [activity, setActivity] = useState([]);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);  const [formData, setFormData] = useState({
    id: '', // Add this to match the profile structure
    full_name: '',
    email: '',
    bio: '',
    cooking_level: 'Beginner',
    avatar_url: '',
    preferences: {
      favorite_cuisines: [],
      dietary_preferences: []
    }
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => {
    fetchUserData();
  }, []);

  // This runs only AFTER the user is successfully fetched
  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  // Set editing mode when mounted
  useEffect(() => {
    if (user && !isEditing) {
      console.log('User data loaded, enabling edit mode:', user);
      setIsEditing(true);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      setLoading(true);
      setError(null);

      const [
        userProfile,
        userPreferences,
        userActivity,
        userConnectedAccounts
      ] = await Promise.all([
        supabaseService.getCurrentUser(),
        supabaseService.getUserPreferences(),
        supabaseService.getUserActivity(),
        supabaseService.getConnectedAccounts()
      ]);

      console.log('Fetched user profile:', userProfile);
      console.log('Fetched preferences:', userPreferences);

      setUser(userProfile);
      setPreferences(userPreferences);
      setActivity(userActivity);
      setConnectedAccounts(userConnectedAccounts);

      // Initialize form data with default values if data is not available
      const newFormData = {
        id: userProfile?.id || '',
        full_name: userProfile?.full_name || '',
        email: userProfile?.email || '',
        bio: userProfile?.bio || '',
        cooking_level: userProfile?.cooking_level || 'Beginner',
        avatar_url: userProfile?.avatar_url || '',
        preferences: {
          favorite_cuisines: Array.isArray(userPreferences?.favorite_cuisines) ? userPreferences.favorite_cuisines : [],
          dietary_preferences: Array.isArray(userPreferences?.dietary_preferences) ? userPreferences.dietary_preferences : []
        }
      };
      
      console.log('Initializing form with data:', newFormData);
      setFormData(newFormData);
      
      setAvatarUrl(userProfile?.avatar_url);
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setError(null);
      setAvatarUploading(true);

      const url = await supabaseService.uploadAvatar(file);
      setAvatarUrl(url);
      setFormData(prev => ({ ...prev, avatar_url: url }));
    } catch (err) {
      setError('Failed to upload avatar. Please try again.');
      console.error(err);
    } finally {
      setAvatarUploading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value?.trim() ?? '') // Trim values as they are entered
    }));
    // Clear error when user starts typing
    setError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('User context:', { id: user?.id, email: user?.email });
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        console.error('No user ID found');
        throw new Error('Please sign in to update your profile');
      }

      // Clean form data before update
      const profileUpdate = {
        id: user.id,
        email: user.email,
        full_name: formData.full_name.trim(),
        cooking_level: formData.cooking_level,
        bio: formData.bio?.trim() || '',
        avatar_url: formData.avatar_url || ''
      };

      console.log('Sending profile update:', profileUpdate);

      // Update profile
      const updatedProfile = await supabaseService.updateProfile(profileUpdate);
      console.log('Profile updated successfully:', updatedProfile);

      // Update preferences if they've changed and are valid
      if (formData.preferences?.dietary_preferences || formData.preferences?.favorite_cuisines) {
        const preferencesUpdate = {
          user_id: user.id,
          dietary_preferences: formData.preferences.dietary_preferences || [],
          favorite_cuisines: formData.preferences.favorite_cuisines || [],
        };

        console.log('Updating preferences:', preferencesUpdate);
        await supabaseService.updateUserPreferences(preferencesUpdate);
        console.log('Preferences updated successfully');
      }

      // Update local state
      setUser(updatedProfile);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh the data to ensure we have the latest state
      console.log('Refreshing user data...');
      await fetchUserData();
      console.log('User data refreshed');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      // Keep form in edit mode on error
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  // Validate a single form field
  const validateField = (name, value) => {
    console.log(`Validating field ${name}:`, value);
    
    switch (name) {
      case 'full_name':
        if (!value?.trim()) {
          setError('Name is required');
          console.log('Name validation failed: empty name');
          return false;
        }
        if (value.trim().length < 2) {
          setError('Name must be at least 2 characters');
          console.log('Name validation failed: too short');
          return false;
        }
        return true;

      case 'cooking_level':
        const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
        if (!validLevels.includes(value)) {
          setError('Invalid cooking level');
          console.log('Cooking level validation failed:', value);
          return false;
        }
        return true;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setError('Invalid email address');
          console.log('Email validation failed:', value);
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const validateForm = () => {
    console.log('Validating form data:', formData);
    let isValid = true;
    setError(null);

    // Validate required fields
    if (!formData.full_name?.trim()) {
      console.log('Form validation failed: name is required');
      setError('Name is required');
      return false;
    }

    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (!validLevels.includes(formData.cooking_level)) {
      console.log('Form validation failed: invalid cooking level');
      setError('Invalid cooking level');
      return false;
    }

    // Additional validation for preferences
    if (formData.preferences) {
      if (formData.preferences.cuisines && !Array.isArray(formData.preferences.cuisines)) {
        console.log('Form validation failed: cuisines must be an array');
        setError('Invalid cuisine preferences format');
        return false;
      }
      
      if (formData.preferences.dietary && !Array.isArray(formData.preferences.dietary)) {
        console.log('Form validation failed: dietary preferences must be an array');
        setError('Invalid dietary preferences format');
        return false;
      }
    }

    console.log('Form validation passed');
    return isValid;
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    return Object.entries(requirements).every(([key, valid]) => valid);
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      if (!validatePassword(newPassword)) {
        setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special characters');
        return;
      }

      // Update password using Supabase Auth
      const { data: { user }, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccessMessage('Password updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      // Clear the form
      const form = document.querySelector('.password-form');
      if (form) form.reset();
    } catch (err) {
      setError('Failed to update password. Please ensure your current password is correct.');
      console.error(err);
    } finally {
      setLoading(false);
    } 
  };

  const fetchPreferences = async () => {
    try {
      const prefs = await supabaseService.getUserPreferences();
      const preferencesData = {
        favorite_cuisines: prefs.favorite_cuisines || [],
        dietary_preferences: prefs.dietary_preferences || [],
      };
      setFormData(prev => ({
        ...prev,
        preferences: preferencesData,
      }));
      setOriginalPreferences(preferencesData);
    } catch (err) {
      console.error('Failed to load preferences', err);
      setError('Failed to load preferences.');
    }
  };

  const handlePreferenceChange = (type, value) => {
    setFormData(prev => {
      const current = prev.preferences?.[type] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];

      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [type]: updated,
        },
      };
    });
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    console.log("🚀 Saving preferences:", formData.preferences);

    try {
      const saved = await supabaseService.updateUserPreferences({
        dietary_preferences: formData.preferences.dietary_preferences || [],
        favorite_cuisines: formData.preferences.favorite_cuisines || [],
      });

      setOriginalPreferences(formData.preferences);
      setIsEditingPreferences(false);
      setSuccessMessage('Preferences saved successfully!');
    } catch (err) {
      setError('Failed to save preferences.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className="loading">Loading profile...</div>;
  }
  return (
    <div className="profile-page">
      {error && isEditing && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message" role="status">
          {successMessage}
        </div>
      )}

      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <FaUser /> Personal Info
          </button>
          <button
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <FaHeart /> Preferences
          </button>
          <button
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <FaHistory /> Activity
          </button>
          <button
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaLock /> Security
          </button>
        </div>
      </div>

      <div className="profile-content">
        {activeTab === 'personal' && (          <form onSubmit={handleSubmit} className="profile-form">
            <div className="avatar-section">
              <div 
                className={`avatar-wrapper ${avatarUploading ? 'uploading' : ''}`}
                onClick={handleAvatarClick}
              >
                {avatarUrl || formData?.avatar_url ? (
                  <img 
                    src={avatarUrl || formData.avatar_url} 
                    alt="Profile" 
                    className="profile-avatar"
                  />
                ) : (
                  <FaUser className="avatar-placeholder" />
                )}
                <div className="avatar-overlay">
                  <FaCamera />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            {/* Personal info form fields */}
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cooking_level">Cooking Experience</label>
                <select
                  id="cooking_level"
                  name="cooking_level"
                  value={formData?.cooking_level || 'Beginner'}
                  onChange={handleInputChange}
                >
                  {COOKING_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bio">About Me</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData?.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us about your cooking journey..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="edit-btn">
                  Edit Profile
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                    Cancel
                  </button>                  <button type="submit" className="save-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <div className="preference-header">
              <h2>Preferences</h2>
              {!isEditingPreferences ? (
                <button className="edit-btn" onClick={() => {
                  setOriginalPreferences(formData.preferences);
                  setIsEditingPreferences(true);
                }}>
                  Edit Preferences
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        preferences: originalPreferences,
                      }));
                      setIsEditingPreferences(false);
                      setError(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-btn"
                    onClick={handleSavePreferences}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              )}
            </div>

            <div className="preference-group">
              <h3>Cuisine Preferences</h3>
              <div className="preferences-grid">
                {CUISINE_PREFERENCES.map(cuisine => (
                  <label key={cuisine} className="preference-item">
                    <input
                      type="checkbox"
                      checked={formData?.preferences?.favorite_cuisines?.includes(cuisine)}
                      onChange={() => handlePreferenceChange('favorite_cuisines', cuisine)}
                      disabled={!isEditingPreferences}
                    />
                    <span>{cuisine}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="preference-group">
              <h3>Dietary Preferences</h3>
              <div className="preferences-grid">
                {DIETARY_PREFERENCES.map(diet => (
                  <label key={diet} className="preference-item">
                    <input
                      type="checkbox"
                      checked={formData?.preferences?.dietary_preferences?.includes(diet)}
                      onChange={() => handlePreferenceChange('dietary_preferences', diet)}
                      disabled={!isEditingPreferences}
                    />
                    <span>{diet}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {activity.map(item => (
                <div key={item.id} className="activity-item">
                  <div className={`activity-icon ${item.type}`} />
                  <div className="activity-details">
                    <p>{item.description}</p>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security">
            <h2>Security Settings</h2>
            
            <div className="security-section">
              <h3>Change Password</h3>
              <form 
                className="password-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const currentPassword = e.target.currentPassword.value;
                  const newPassword = e.target.newPassword.value;
                  const confirmPassword = e.target.confirmPassword.value;

                  if (newPassword !== confirmPassword) {
                    setError('New passwords do not match');
                    return;
                  }

                  handlePasswordChange(currentPassword, newPassword);
                }}
              >
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" name="currentPassword" required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" name="newPassword" required />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" name="confirmPassword" required />
                </div>
                <button 
                  type="submit" 
                  className="change-password-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            <div className="security-section">
              <h3>Connected Accounts</h3>
              <div className="connected-accounts">
                {connectedAccounts.map(account => (
                  <div key={account.provider} className="account-item">
                    <div className="account-info">
                      <h4>{account.provider}</h4>
                      <p>{account.connected ? 'Connected' : 'Not connected'}</p>
                    </div>
                    <button
                      className={account.connected ? 'disconnect-btn' : 'connect-btn'}
                      onClick={() => {
                        // Handle connect/disconnect
                      }}
                      disabled={loading}
                    >
                      {account.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}