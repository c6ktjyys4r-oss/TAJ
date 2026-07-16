import { useSettings } from '../context/SettingsContext';
import { locales } from '../i18n/locales';

/**
 * Translation hook — returns a `t(key)` function that resolves
 * the current locale string. Falls back to English if the key
 * is missing from the active locale.
 */
export const useT = () => {
  const { isRTL } = useSettings();
  const locale    = isRTL ? 'ar' : 'en';

  return (key: string, fallback?: string): string => {
    return locales[locale][key] ?? locales.en[key] ?? fallback ?? key;
  };
};
