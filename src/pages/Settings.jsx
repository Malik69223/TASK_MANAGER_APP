import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { usePWA } from '../hooks/usePWA';
import { useTasks } from '../hooks/useTasks';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Bell,
  BellOff,
  BellRing,
  Download,
  CheckCircle,
  Wifi,
  WifiOff,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Palette,
  Clock,
  Shield,
} from 'lucide-react';

// Toggle Switch Component
const Toggle = ({ checked, onChange, id }) => (
  <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only peer"
    />
    <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600" />
  </label>
);

export const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const { theme, toggleTheme, colorTheme, switchColorTheme, COLOR_THEMES } = useTheme();
  const {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
    notificationPermission,
    requestNotificationPermission,
    sendPushNotification,
    sendTestReminder,
    reminderTime,
    reminderEnabled,
    updateReminderTime,
    updateReminderEnabled,
  } = usePWA();

  const { showToast } = useTasks();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

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
    showToast('Profile photo removed.', 'info');
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    updateUserProfile({ name, avatar });
    setSavingProfile(false);
    showToast('Profile updated successfully!', 'success');
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      showToast('🔔 Notifications enabled! You\'ll get daily habit reminders.', 'success');
    } else {
      showToast('Notifications blocked. Please allow in browser settings.', 'error');
    }
  };

  const handleTestNotification = () => {
    if (notificationPermission !== 'granted') {
      showToast('Please enable notifications first!', 'error');
      return;
    }
    sendTestReminder();
    showToast('Test notification sent! Check your browser 🔔', 'success');
  };

  const permStatusColors = {
    granted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    denied: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    default: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
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
          App Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Manage profile, theme, habit reminders, and PWA installation
        </p>
      </div>

      {/* 1. Profile */}
      <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <User className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
            Profile Information
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex items-center gap-4 py-2">
            <div className="relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-brand-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-pink-500 text-white flex items-center justify-center text-2xl font-bold font-outfit border-4 border-brand-500/30">
                  {name ? name.charAt(0).toUpperCase() : 'H'}
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
              <div className="flex items-center gap-2 flex-wrap">
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
                  Upload
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400">PNG, JPG or GIF · Max 5MB</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Display Name
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
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* 2. Appearance — Dark/Light + Color Theme */}
      <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <Palette className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
            Appearance & Theme
          </h2>
        </div>

        {/* Dark / Light toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Switch between light and sleek dark theme
            </p>
          </div>
          <Toggle checked={theme === 'dark'} onChange={() => toggleTheme()} id="dark-mode-toggle" />
        </div>

        {/* Color Theme Selector */}
        <div>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
            Accent Color Theme
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COLOR_THEMES.map((ct) => {
              const isActive = colorTheme === ct.id;
              return (
                <button
                  key={ct.id}
                  onClick={() => {
                    switchColorTheme(ct.id);
                    showToast(`✨ ${ct.label} theme applied!`, 'success');
                  }}
                  className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    isActive
                      ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-white/50 dark:bg-gray-800/30'
                  }`}
                >
                  {/* Color preview swatches */}
                  <div className="flex -space-x-2 flex-shrink-0">
                    {ct.preview.map((color, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      {ct.label}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {ct.description}
                    </p>
                  </div>

                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Notifications — Full Section */}
      <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-brand-500" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Habit Reminders & Notifications
            </h2>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${
              permStatusColors[notificationPermission] || permStatusColors.default
            }`}
          >
            {notificationPermission}
          </span>
        </div>

        {/* Permission block */}
        {notificationPermission !== 'granted' ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
            <div className="flex items-start gap-3">
              <BellRing className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">
                  Notifications not enabled yet
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mb-3">
                  Enable push notifications to get daily habit reminders even when the app is closed.
                </p>
                <button
                  onClick={handleEnableNotifications}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs transition-all shadow-sm"
                >
                  <Bell className="w-4 h-4" />
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Notifications are active — you'll receive habit reminders!
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Real-time Reminders
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified 2-3 times a day while the app is open
                </p>
              </div>
            </div>
            <Toggle
              checked={reminderEnabled}
              onChange={updateReminderEnabled}
              id="reminder-toggle"
            />
          </div>
        </div>

      </div>
      {/* 5. About Developer Section */}
      <div className="p-6 rounded-3xl glass-card border border-gray-200/80 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <User className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
            About Developer
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Meet the Creator
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Learn more about the developer behind Habit Tracker Pro.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/about-developer')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold text-sm transition-colors border border-gray-200 dark:border-gray-700"
          >
            <User className="w-4 h-4" />
            View Profile
          </button>
        </div>
      </div>

    </div>
  );
};
