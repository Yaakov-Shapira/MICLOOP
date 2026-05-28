import { I18n } from 'i18n-js';
import * as ExpoLocalization from 'expo-localization';
import { I18nManager } from 'react-native';

import he from './he';
import en from './en';

const i18n = new I18n({ he, en });

// Detect device locale — default to Hebrew
const locale = ExpoLocalization.getLocales()[0]?.languageCode ?? 'he';
i18n.locale = locale === 'he' ? 'he' : 'en';
i18n.defaultLocale = 'he';
i18n.enableFallback = true;

// Apply RTL based on locale
export const isRTL = i18n.locale === 'he';

export function applyRTL() {
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
  }
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

export default i18n;
