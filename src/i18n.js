import zhCN from './locales/zh-CN.json';
import enUS from './locales/zh-CN.json';
const languages = ['zh-CN', 'en-US'];
const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export default {
  locale: languages[0],
  fallbackLocale: languages,
  messages,
};
