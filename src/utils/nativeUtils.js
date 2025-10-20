import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const shareImage = async (imageUrl, title = 'Photo from PhotoVault') => {
  if (!Capacitor.isNativePlatform()) {
    // Web fallback
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: imageUrl
        });
        return true;
      } catch (error) {
        console.error('Web share failed:', error);
        return false;
      }
    }
    return false;
  }

  try {
    await Share.share({
      title,
      url: imageUrl,
      dialogTitle: 'Share photo'
    });
    return true;
  } catch (error) {
    console.error('Native share failed:', error);
    return false;
  }
};

export const showToast = async (message, duration = 'short') => {
  if (!Capacitor.isNativePlatform()) {
    // Web fallback handled by existing Notification component
    return;
  }

  try {
    await Toast.show({
      text: message,
      duration: duration === 'short' ? 'short' : 'long',
      position: 'bottom'
    });
  } catch (error) {
    console.error('Toast failed:', error);
  }
};

export const triggerHaptic = async (style = 'medium') => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    let impactStyle = ImpactStyle.Medium;
    
    switch (style) {
      case 'light':
        impactStyle = ImpactStyle.Light;
        break;
      case 'heavy':
        impactStyle = ImpactStyle.Heavy;
        break;
      default:
        impactStyle = ImpactStyle.Medium;
    }

    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('Haptic feedback failed:', error);
  }
};

export const setStatusBarStyle = async (isDark = true) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light
    });
  } catch (error) {
    console.error('Status bar style update failed:', error);
  }
};

export const setStatusBarColor = async (color) => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() === 'ios') {
    return;
  }

  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('Status bar color update failed:', error);
  }
};

export const addAppListener = (callback) => {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  const listeners = [];

  App.addListener('appStateChange', (state) => {
    callback('appStateChange', state);
  });

  App.addListener('backButton', () => {
    callback('backButton', {});
  });

  return () => {
    listeners.forEach(listener => listener.remove());
  };
};

export const exitApp = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await App.exitApp();
  } catch (error) {
    console.error('Exit app failed:', error);
  }
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

export const isNative = () => {
  return Capacitor.isNativePlatform();
};
