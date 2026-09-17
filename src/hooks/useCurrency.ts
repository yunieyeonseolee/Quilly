import { useSettings } from '../context/SettingsContext';

const currencySymbolMap = {
  CAD: '$',
  KRW: '₩',
} as const;

export const useCurrency = () => {
  const { settings } = useSettings();
  const currencyCode = settings.currency;
  const currencySymbol = currencySymbolMap[currencyCode] ?? '$';

  return { currencyCode, currencySymbol };
};
