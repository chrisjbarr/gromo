import Vue from 'vue';
import Vuex from 'vuex';

import { v4 as uuidv4 } from 'uuid';

import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    count: 0,
    gromoers: []
  },
  mutations: {
    increment: state => state.count++,
    decrement: state => state.count--,
    'add-gromoer': (state, name) => {
      state.gromoers.push({
        id: uuidv4(),
        name: name
      });
    }
  },
  actions: {},
  modules: {},
  plugins: [
    createPersistedState({
      key: 'gromo'
    })
  ]
});
