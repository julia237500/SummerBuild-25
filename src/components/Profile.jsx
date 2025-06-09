import { useState, useEffect } from 'react';
import { FaUser, FaCog, FaHeart, FaHistory, FaBell, FaLock } from 'react-icons/fa';
import { supabaseService } from '../services/supabaseService';
import './Profile.css';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all user data in parallel
      const [
        userProfile,
        userPreferences,
        userActivity,
        notificationSettings,
        userConnectedAccounts
      ] = await Promise.all([
        supabaseService.getCurrentUser(),
        supabaseService.getUserPreferences(),
        supabaseService.getUserActivity(),
        supabaseService.getNotificationSettings(),
        supabaseService.getConnectedAccounts()
      ]);

      setUser(userProfile);
      setPreferences(userPreferences);
      setActivity(userActivity);
      setNotifications(notificationSettings);
      setConnectedAccounts(userConnectedAccounts);
      setFormData(userProfile);
    } catch (err) {
      setError('Failed to load user data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationToggle = async (key) => {
    try {
      const updatedSettings = {
        ...notifications,
        [key]: !notifications[key]
      };

      await supabaseService.updateNotificationSettings(updatedSettings);
      setNotifications(updatedSettings);
    } catch (err) {
      setError('Failed to update notification settings');
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await supabaseService.updateProfile(formData);
      setUser(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      setError(null);
      const avatarUrl = await supabaseService.uploadAvatar(file);
      setFormData(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceToggle = async (preference) => {
    try {
      const updatedPreferences = {
        ...preferences,
        dietary_preferences: preferences.dietary_preferences.includes(preference)
          ? preferences.dietary_preferences.filter(p => p !== preference)
          : [...preferences.dietary_preferences, preference]
      };

      await supabaseService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (err) {
      setError('Failed to update preferences');
      console.error(err);
    }
  };

  const handleAddAllergy = async (allergy) => {
    try {
      const updatedPreferences = {
        ...preferences,
        allergies: [...preferences.allergies, allergy]
      };

      await supabaseService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (err) {
      setError('Failed to add allergy');
      console.error(err);
    }
  };

  const handleRemoveAllergy = async (allergy) => {
    try {
      const updatedPreferences = {
        ...preferences,
        allergies: preferences.allergies.filter(a => a !== allergy)
      };

      await supabaseService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (err) {
      setError('Failed to remove allergy');
      console.error(err);
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      await supabaseService.updatePassword(newPassword);
      // Show success message or redirect
    } catch (err) {
      setError('Failed to update password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div className="error-message">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-page">
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
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notifications
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
        {activeTab === 'personal' && (
          <div className="personal-info">
            <div className="avatar-section">
              <img src={formData?.avatar_url || '/default-avatar.png'} alt="Profile" className="avatar" />
              {isEditing && (
                <div className="avatar-upload">
                  <label htmlFor="avatar-input" className="upload-btn">
                    Change Photo
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />
                </div>
              )}
            </div>

            <div className="info-form">
              <div className="form-group">
                <label>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData?.full_name || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{user.full_name}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <p>{user.email}</p>
              </div>

              <div className="form-group">
                <label>Cooking Level</label>
                {isEditing ? (
                  <select
                    name="cooking_level"
                    value={formData?.cooking_level || ''}
                    onChange={handleInputChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                ) : (
                  <p>{user.cooking_level}</p>
                )}
              </div>

              {isEditing ? (
                <div className="form-actions">
                  <button 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(user);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn" 
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button 
                  className="edit-btn" 
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && preferences && (
          <div className="preferences">
            <h2>Dietary Preferences</h2>
            <div className="preferences-grid">
              {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map(pref => (
                <label key={pref} className="preference-item">
                  <input
                    type="checkbox"
                    checked={preferences.dietary_preferences.includes(pref)}
                    onChange={() => handlePreferenceToggle(pref)}
                    disabled={loading}
                  />
                  {pref}
                </label>
              ))}
            </div>

            <h2>Allergies & Restrictions</h2>
            <div className="allergies-section">
              <div className="allergy-tags">
                {preferences.allergies.map(allergy => (
                  <span key={allergy} className="allergy-tag">
                    {allergy}
                    <button 
                      className="remove-tag"
                      onClick={() => handleRemoveAllergy(allergy)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button 
                className="add-allergy-btn"
                onClick={() => {
                  const allergy = prompt('Enter allergy or restriction:');
                  if (allergy) handleAddAllergy(allergy);
                }}
                disabled={loading}
              >
                + Add Allergy
              </button>
            </div>

            <h2>Favorite Cuisines</h2>
            <div className="cuisine-grid">
              {preferences.favorite_cuisines.map(cuisine => (
                <div key={cuisine} className="cuisine-item">
                  {cuisine}
                </div>
              ))}
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

        {activeTab === 'notifications' && notifications && (
          <div className="notifications">
            <h2>Notification Preferences</h2>
            <div className="notification-settings">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="notification-item">
                  <div className="notification-info">
                    <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                    <p>Receive notifications about {key.toLowerCase()}</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleNotificationToggle(key)}
                      disabled={loading}
                    />
                    <span className="slider round"></span>
                  </label>
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