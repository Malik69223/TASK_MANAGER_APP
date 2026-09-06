import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { usePWA } from '../hooks/usePWA';
import { useTasks } from '../hooks/useTasks';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Moon,
  Sun,
  Bell,
  Download,
  CheckCircle,
  Wifi,
  WifiOff,
  Sparkles,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react';


export const Settings = () => {
  const { user, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
    notificationPermission,
    requestNotificationPermission,
    sendPushNotification,
  } = usePWA();


  const { showToast } = useTasks();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Preferences
  const [dueDateAlerts, setDueDateAlerts] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);


  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setAvatar(newAvatar);
        updateUserProfile({ avatar: newAvatar });
        showToast('Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    updateUserProfile({ avatar: '' });
    showToast('Profile photo deleted!', 'info');
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    updateUserProfile({ name, avatar });
    setSavingProfile(false);
    showToast('Profile updated successfully!', 'success');
  };


  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully!', 'success');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
          <SettingsIcon className="w-4 h-4" />
          Preferences & Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-outfit tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Manage profile details, dark/light theme, notification rules, and PWA installation
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <User className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
            Profile Information
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Profile Picture Upload Section */}
          <div className="flex items-center gap-4 py-2">
            <div className="relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover border-4 border-brand-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold font-outfit border-4 border-brand-500/30">
                  {name ? name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <label
                htmlFor="avatar-file-input"
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
              >
                <Camera className="w-6 h-6" />
              </label>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Profile Photo
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-file-input"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold text-xs border border-brand-500/30 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Photo</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Supports PNG, JPG, or GIF (Max 5MB)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>




      {/* 3. Theme & Notifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Appearance Theme
            </h2>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Switch between light and sleek dark mode themes.
          </p>

          <button
            onClick={toggleTheme}
            className="w-full py-3 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white hover:border-brand-500 transition-all"
          >
            <span className="capitalize">{theme} Mode Active</span>
            <div className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-semibold">
              Toggle
            </div>
          </button>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-brand-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
                Browser Push Notifications
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 capitalize">
              {notificationPermission}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enable browser push notifications to receive daily task reminders and streak alerts even if you don't open the app.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-sm"
              >
                Enable Push Notifications
              </button>
              <button
                type="button"
                onClick={() =>
                  sendPushNotification(
                    '🔥 Streak Alert: Don\'t break your streak!',
                    'You have tasks waiting for today. Open TaskManager to complete them!'
                  )
                }
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs transition-all"
              >
                Test Notification Alert
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* 4. PWA Installation Section */}
      <div className="p-6 rounded-3xl glass-card border border-brand-500/20 bg-gradient-to-br from-brand-950/20 to-indigo-950/20 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200/20">
          <Download className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
            Progressive Web App (PWA) Status
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isOnline ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Wifi className="w-4 h-4" /> Network: Online & Syncing
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <WifiOff className="w-4 h-4" /> Network: Offline Cache Mode Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {isInstalled
                ? 'App is installed on this device with full offline caching support.'
                : 'Install TaskManager on your mobile device or laptop for offline access.'}
            </p>
          </div>

          {isInstallable && (
            <button
              onClick={installPWA}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Install PWA Now</span>
            </button>
          )}

          {isInstalled && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
              <span>Installed Standalone App</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
