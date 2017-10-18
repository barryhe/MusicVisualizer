import Vue from 'vue';
import App from './App.vue';

import 'element-ui/lib/theme-default/index.css';
import Element from 'element-ui';

Vue.use(Element);

new Vue({
  el: '#app',
  render: h => h(App),
});
