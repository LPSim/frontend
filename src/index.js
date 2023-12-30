import Vue from 'vue';
import App from './components/App.vue';
import store from './store';
import VueI18n from 'vue-i18n'
import i18n_data from './i18n';

Vue.config.productionTip = false;
Vue.use(VueI18n);

let i18n = new VueI18n(i18n_data);

new Vue({
  el: '#app',
  store,
  i18n,
  render: h => h(App),
});
