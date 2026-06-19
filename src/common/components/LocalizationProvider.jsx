import { createContext, use, useEffect, useMemo, Suspense } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import usePersistedState from '../util/usePersistedState';
import Loader from './Loader';

import en from '../../resources/l10n/en.json';
import 'dayjs/locale/en';

const localeLoaders = import.meta.glob([
  '../../resources/l10n/*.json',
  '!../../resources/l10n/en.json',
]);

const dayjsLoaders = {
  af: () => import('dayjs/locale/af.js'),
  ar: () => import('dayjs/locale/ar.js'),
  az: () => import('dayjs/locale/az.js'),
  bg: () => import('dayjs/locale/bg.js'),
  bn: () => import('dayjs/locale/bn.js'),
  ca: () => import('dayjs/locale/ca.js'),
  cs: () => import('dayjs/locale/cs.js'),
  da: () => import('dayjs/locale/da.js'),
  de: () => import('dayjs/locale/de.js'),
  el: () => import('dayjs/locale/el.js'),
  es: () => import('dayjs/locale/es.js'),
  fa: () => import('dayjs/locale/fa.js'),
  fi: () => import('dayjs/locale/fi.js'),
  fr: () => import('dayjs/locale/fr.js'),
  gl: () => import('dayjs/locale/gl.js'),
  he: () => import('dayjs/locale/he.js'),
  hi: () => import('dayjs/locale/hi.js'),
  hr: () => import('dayjs/locale/hr.js'),
  hu: () => import('dayjs/locale/hu.js'),
  id: () => import('dayjs/locale/id.js'),
  it: () => import('dayjs/locale/it.js'),
  ja: () => import('dayjs/locale/ja.js'),
  ka: () => import('dayjs/locale/ka.js'),
  kk: () => import('dayjs/locale/kk.js'),
  km: () => import('dayjs/locale/km.js'),
  ko: () => import('dayjs/locale/ko.js'),
  lo: () => import('dayjs/locale/lo.js'),
  lt: () => import('dayjs/locale/lt.js'),
  lv: () => import('dayjs/locale/lv.js'),
  mk: () => import('dayjs/locale/mk.js'),
  ml: () => import('dayjs/locale/ml.js'),
  mn: () => import('dayjs/locale/mn.js'),
  ms: () => import('dayjs/locale/ms.js'),
  nb: () => import('dayjs/locale/nb.js'),
  ne: () => import('dayjs/locale/ne.js'),
  nl: () => import('dayjs/locale/nl.js'),
  nn: () => import('dayjs/locale/nn.js'),
  pl: () => import('dayjs/locale/pl.js'),
  pt: () => import('dayjs/locale/pt.js'),
  pt_BR: () => import('dayjs/locale/pt-br.js'),
  ro: () => import('dayjs/locale/ro.js'),
  ru: () => import('dayjs/locale/ru.js'),
  si: () => import('dayjs/locale/si.js'),
  sk: () => import('dayjs/locale/sk.js'),
  sl: () => import('dayjs/locale/sl.js'),
  sq: () => import('dayjs/locale/sq.js'),
  sr: () => import('dayjs/locale/sr.js'),
  sv: () => import('dayjs/locale/sv.js'),
  ta: () => import('dayjs/locale/ta.js'),
  th: () => import('dayjs/locale/th.js'),
  tr: () => import('dayjs/locale/tr.js'),
  uk: () => import('dayjs/locale/uk.js'),
  uz: () => import('dayjs/locale/uz.js'),
  vi: () => import('dayjs/locale/vi.js'),
  zh: () => import('dayjs/locale/zh.js'),
  zh_TW: () => import('dayjs/locale/zh-tw.js'),
};

const languages = {
  af: { data: af, country: 'ZA', name: 'Afrikaans' },
  ar: { data: ar, country: 'AE', name: 'العربية' },
  az: { data: az, country: 'AZ', name: 'Azərbaycanca' },
  bg: { data: bg, country: 'BG', name: 'Български' },
  bn: { data: bn, country: 'IN', name: 'বাংলা' },
  ca: { data: ca, country: 'ES', name: 'Català' },
  cs: { data: cs, country: 'CZ', name: 'Čeština' },
  de: { data: de, country: 'DE', name: 'Deutsch' },
  da: { data: da, country: 'DK', name: 'Dansk' },
  el: { data: el, country: 'GR', name: 'Ελληνικά' },
  en: { data: en, country: 'GB', name: 'English' },
  es: { data: es, country: 'ES', name: 'Español' },
  fa: { data: fa, country: 'IR', name: 'فارسی' },
  fi: { data: fi, country: 'FI', name: 'Suomi' },
  fr: { data: fr, country: 'FR', name: 'Français' },
  gl: { data: gl, country: 'ES', name: 'Galego' },
  he: { data: he, country: 'IL', name: 'עברית' },
  hi: { data: hi, country: 'IN', name: 'हिन्दी' },
  hr: { data: hr, country: 'HR', name: 'Hrvatski' },
  hu: { data: hu, country: 'HU', name: 'Magyar' },
  id: { data: id, country: 'ID', name: 'Bahasa Indonesia' },
  it: { data: it, country: 'IT', name: 'Italiano' },
  ja: { data: ja, country: 'JP', name: '日本語' },
  ka: { data: ka, country: 'GE', name: 'ქართული' },
  kk: { data: kk, country: 'KZ', name: 'Қазақша' },
  ko: { data: ko, country: 'KR', name: '한국어' },
  km: { data: km, country: 'KH', name: 'ភាសាខ្មែរ' },
  lo: { data: lo, country: 'LA', name: 'ລາວ' },
  lt: { data: lt, country: 'LT', name: 'Lietuvių' },
  lv: { data: lv, country: 'LV', name: 'Latviešu' },
  mk: { data: mk, country: 'MK', name: 'Mакедонски' },
  ml: { data: ml, country: 'IN', name: 'മലയാളം' },
  mn: { data: mn, country: 'MN', name: 'Монгол хэл' },
  ms: { data: ms, country: 'MY', name: 'بهاس ملايو' },
  nb: { data: nb, country: 'NO', name: 'Norsk bokmål' },
  ne: { data: ne, country: 'NP', name: 'नेपाली' },
  nl: { data: nl, country: 'NL', name: 'Nederlands' },
  nn: { data: nn, country: 'NO', name: 'Norsk nynorsk' },
  pl: { data: pl, country: 'PL', name: 'Polski' },
  pt: { data: pt, country: 'PT', name: 'Português' },
  pt_BR: { data: pt_BR, country: 'BR', name: 'Português (Brasil)' },
  ro: { data: ro, country: 'RO', name: 'Română' },
  ru: { data: ru, country: 'RU', name: 'Русский' },
  si: { data: si, country: 'LK', name: 'සිංහල' },
  sk: { data: sk, country: 'SK', name: 'Slovenčina' },
  sl: { data: sl, country: 'SI', name: 'Slovenščina' },
  sq: { data: sq, country: 'AL', name: 'Shqipëria' },
  sr: { data: sr, country: 'RS', name: 'Srpski' },
  sv: { data: sv, country: 'SE', name: 'Svenska' },
  ta: { data: ta, country: 'IN', name: 'தமிழ்' },
  th: { data: th, country: 'TH', name: 'ไทย' },
  tr: { data: tr, country: 'TR', name: 'Türkçe' },
  uk: { data: uk, country: 'UA', name: 'Українська' },
  uz: { data: uz, country: 'UZ', name: 'Oʻzbekcha' },
  vi: { data: vi, country: 'VN', name: 'Tiếng Việt' },
  zh: { data: zh, country: 'CN', name: '中文' },
  zh_TW: { data: zh_TW, country: 'TW', name: '中文 (Taiwan)' },
};

const getDefaultLanguage = () => {
  const browserLanguages = window.navigator.languages ? window.navigator.languages.slice() : [];
  const browserLanguage = window.navigator.userLanguage || window.navigator.language;
  browserLanguages.push(browserLanguage);
  browserLanguages.push(browserLanguage.substring(0, 2));

  for (let i = 0; i < browserLanguages.length; i += 1) {
    let language = browserLanguages[i].replace('-', '_');
    if (language in languages) {
      return language;
    }
    if (language.length > 2) {
      language = language.substring(0, 2);
      if (language in languages) {
        return language;
      }
    }
  }
  return 'en';
};

const LocalizationContext = createContext({
  languages,
  language: 'en',
  setLocalLanguage: () => {},
  direction: 'ltr',
});

const ResolvedLocalizationProvider = ({ language, setLocalLanguage, children }) => {
  const { data, dayjsName } = use(loadLocale(language));

  const direction = /^(ar|he|fa)$/.test(language) ? 'rtl' : 'ltr';

  const value = useMemo(
    () => ({
      languages: { ...languages, [language]: { ...languages[language], data } },
      language,
      setLocalLanguage,
      direction,
    }),
    [language, data, setLocalLanguage, direction],
  );

  useEffect(() => {
    dayjs.locale(dayjsName);
    document.dir = direction;
  }, [dayjsName, direction]);

  return <LocalizationContext value={value}>{children}</LocalizationContext>;
};

export const LocalizationProvider = ({ children }) => {
  const remoteLanguage = useSelector((state) => {
    const serverLanguage = state.session.server?.attributes?.language;
    const userLanguage = state.session.user?.attributes?.language;
    const targetLanguage = userLanguage || serverLanguage;
    return targetLanguage && targetLanguage in languages ? targetLanguage : null;
  });

  const [localLanguage, setLocalLanguage] = usePersistedState('language', getDefaultLanguage());

  const language = remoteLanguage || localLanguage;

  return (
    <Suspense fallback={<Loader />}>
      <ResolvedLocalizationProvider language={language} setLocalLanguage={setLocalLanguage}>
        {children}
      </ResolvedLocalizationProvider>
    </Suspense>
  );
};

export const useLocalization = () => use(LocalizationContext);

export const useTranslation = () => {
  const context = use(LocalizationContext);
  const { data } = context.languages[context.language];
  return useMemo(() => (key) => data[key], [data]);
};

export const useTranslationKeys = (predicate) => {
  const context = use(LocalizationContext);
  const { data } = context.languages[context.language];
  return Object.keys(data).filter(predicate);
};
