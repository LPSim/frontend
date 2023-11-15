let languages = ['zh-CN', 'en-US'];
let messages = {};
for (let i = 0; i < languages.length; i++) {
  let lang = languages[i];
  messages[lang] = require(`./locales/${lang}.json`);
}

export default {
  locale: languages[0],
  fallbackLocale: languages,
  messages,
};
