const languages = ['zh-CN', 'en-US'];
const messages = {};
for (let i = 0; i < languages.length; i++) {
  let lang = languages[i];
  import(`./locales/${lang}.json`).then((json) => {
    messages[lang] = json;
  });
}

export default {
  locale: languages[0],
  fallbackLocale: languages,
  messages,
};
