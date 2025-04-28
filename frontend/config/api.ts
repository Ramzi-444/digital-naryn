import { Platform } from 'react-native';
import { API_URL_ANDROID, API_URL_IOS } from '@env';

export const API_URL =
  Platform.OS === 'android'
    ? API_URL_ANDROID
    : API_URL_IOS;
