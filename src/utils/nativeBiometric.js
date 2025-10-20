import { NativeBiometric } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';

export const isBiometricAvailable = async () => {
  if (!Capacitor.isNativePlatform()) {
    return { available: false, biometryType: 'none' };
  }

  try {
    const result = await NativeBiometric.isAvailable();
    return {
      available: result.isAvailable,
      biometryType: result.biometryType
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return { available: false, biometryType: 'none' };
  }
};

export const verifyBiometric = async (reason = 'Authenticate to access your photos') => {
  try {
    const result = await NativeBiometric.verifyIdentity({
      reason,
      title: 'PhotoVault Authentication',
      subtitle: 'Secure access required',
      description: 'Use your biometrics to unlock PhotoVault'
    });

    return result;
  } catch (error) {
    console.error('Biometric verification failed:', error);
    throw error;
  }
};

export const setCredentials = async (username, password) => {
  try {
    await NativeBiometric.setCredentials({
      username,
      password,
      server: 'com.cre8web.photovault'
    });
    return true;
  } catch (error) {
    console.error('Error setting credentials:', error);
    return false;
  }
};

export const getCredentials = async () => {
  try {
    const credentials = await NativeBiometric.getCredentials({
      server: 'com.cre8web.photovault'
    });
    return credentials;
  } catch (error) {
    console.error('Error getting credentials:', error);
    return null;
  }
};

export const deleteCredentials = async () => {
  try {
    await NativeBiometric.deleteCredentials({
      server: 'com.cre8web.photovault'
    });
    return true;
  } catch (error) {
    console.error('Error deleting credentials:', error);
    return false;
  }
};

export const getBiometricTypeText = (biometryType) => {
  switch (biometryType) {
    case 'FACE_ID':
      return 'Face ID';
    case 'TOUCH_ID':
      return 'Touch ID';
    case 'FINGERPRINT':
      return 'Fingerprint';
    case 'FACE_AUTHENTICATION':
      return 'Face Authentication';
    case 'IRIS_AUTHENTICATION':
      return 'Iris Authentication';
    default:
      return 'Biometric';
  }
};
