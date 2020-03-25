<template>
  <splitpanes :style="{ height: height, overflow: 'hidden' }" @resized="resizedPane($event)">
    <pane class="pane-editor" ref="epane" size="55">
      <MarkdownEditor ref="editor" />
    </pane>
    <pane class="pane-view" ref="vpane">
      <MarkdownViewer ref="viewer" />
    </pane>
  </splitpanes>
</template>

<script>
import MarkdownEditor from './markdown/Editor'
import MarkdownViewer from './markdown/Viewer'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'MarkdownPane',

  components: {
    MarkdownEditor, MarkdownViewer, Splitpanes, Pane,
  },

  methods: {
    resizedPane: function() {
      this.$nextTick(() => {
        this.$refs.editor.resize(this.$refs.epane.$el)
        this.$refs.viewer.resize(this.$refs.vpane.$el)
      })
    }
  },

  computed: {
    height () {
      return (this.$store.state.windowSize.height - 1) + "px"
    },
  }
};
</script>
