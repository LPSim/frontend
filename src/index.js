import { createApp } from 'vue';
import { createI18n } from 'vue-i18n'
import App from './components/App.vue';
import store from './store';
import i18n_data from './i18n';

const i18n = createI18n(i18n_data);

const app = createApp(App)
app.config.productionTip = false;
app.use(store);
app.use(i18n);
app.mount('#app')