<template>
  <v-app>
    <v-app-bar app ref="appbar" height="56">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>SpecTest GUI</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <MarkdownPane ref="pane" />
    </v-content>
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
    handleResize: function() {
      this.$store.commit('setWindowSize', this.$refs.appbar.$el)
      this.$refs.pane.resizedPane()
    },
  },

  mounted: function () {
    window.addEventListener('resize', this.handleResize)
    this.$store.commit('setWindowSize', this.$refs.appbar.$el)
    this.$nextTick(() => {
      this.$refs.pane.resizedPane()
    })
  },

  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
  },
};
</script>
