<template>
  <v-app>
    <v-app-bar app ref="appbar" height="56">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>SpecTest GUI</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <MarkdownPane ref="pane" />
    </v-content>
    <v-btn color="red" dark fixed right bottom fab @click="gotoTop"><font-awesome-icon icon="chevron-up" /></v-btn>
  </v-app>
</template>

<script>
import MarkdownPane from './components/MarkdownPane';

export default {
  name: 'App',

  components: {
    MarkdownPane,
  },

  data: () => ({
    //
  }),

  methods: {
    gotoTop () {
      this.$refs.pane.gotoTop()
    },
    handleResize () {
      this.$store.commit('setWindowSize', this.$refs.appbar.$el)
      this.$refs.pane.resizedPane()
    },
  },

  mounted () {
    window.addEventListener('resize', this.handleResize)
    this.$store.commit('setWindowSize', this.$refs.appbar.$el)
    this.$nextTick(() => {
      this.$refs.pane.resizedPane()
    })
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
  },
};
</script>
