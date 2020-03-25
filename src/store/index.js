import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    windowSize: { width: 0, height: 0 },
    code: "",
  },
  mutations: {
    setWindowSize (state, appbar) {
      state.windowSize.width = window.innerWidth
      state.windowSize.height = window.innerHeight - appbar.clientHeight - 3
    },
    updateCode (state, code) {
      state.code = code;
    }
  },
  actions: {
  },
  modules: {
  }
})
