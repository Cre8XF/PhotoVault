import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const checkCameraPermissions = async () => {
  try {
    const result = await Camera.checkPermissions();
    return result;
  } catch (error) {
    console.error('Error checking camera permissions:', error);
    return { camera: 'denied', photos: 'denied' };
  }
};

export const requestCameraPermissions = async () => {
  try {
    const result = await Camera.requestPermissions();
    return result;
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return { camera: 'denied', photos: 'denied' };
  }
};

export const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      saveToGallery: false
    });

    return {
      uri: image.webPath,
      path: image.path,
      format: image.format
    };
  } catch (error) {
    console.error('Error taking picture:', error);
    throw error;
  }
};

export const pickImage = async (multiple = false) => {
  try {
    if (multiple) {
      const images = await Camera.pickImages({
        quality: 90,
        limit: 10
      });
      
      return images.photos.map(photo => ({
        uri: photo.webPath,
        path: photo.path,
        format: photo.format
      }));
    } else {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      return [{
        uri: image.webPath,
        path: image.path,
        format: image.format
      }];
    }
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

export const convertWebPathToBlob = async (webPath) => {
  try {
    const response = await fetch(webPath);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error converting image to blob:', error);
    throw error;
  }
};
