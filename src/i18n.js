let languages = ['zh-CN', 'en-US'];
let messages = {};
for (let i = 0; i < languages.length; i++) {
  let lang = languages[i];
  messages[lang] = Object.assign(
    require(`./locales/${lang}/names.json`),
    require(`./locales/${lang}/descs.json`),
    require(`./locales/${lang}/others.json`),
  );
}

export default {
  locale: languages[0],
  messages,
};
