<template>
  <splitpanes horizontal :style="{ height: height, overflow: 'hidden' }" @resized="resizedPane($event)">
    <pane :size="toobarSize">
      <div style="margin-left: 8px">
        <v-btn :style="{ marginTop: btnMargin }" class="btn-item" color="primary" fab x-small @click="click('Bold')"><font-awesome-icon icon="bold" /></v-btn>
        <v-btn :style="{ marginTop: btnMargin }" class="btn-item" color="primary" fab x-small @click="click('Italic')"><font-awesome-icon icon="italic" /></v-btn>
        <v-btn :style="{ marginTop: btnMargin }" class="btn-item" color="primary" fab x-small @click="click('Underline')"><font-awesome-icon icon="underline" /></v-btn>
        <v-btn :style="{ marginTop: btnMargin }" class="btn-item" color="primary" fab x-small @click="click('Strikethrough')"><font-awesome-icon icon="strikethrough" /></v-btn>
        <v-btn :style="{ marginTop: btnMargin }" class="btn-item" color="primary" fab x-small @click="click('Code')"><font-awesome-icon icon="code" /></v-btn>
      </div>
    </pane>
    <pane :size="editorSize">
      <splitpanes :style="{ overflow: 'hidden' }" @resized="resizedPane($event)">   
        <pane class="pane-editor" ref="epane" size="55">
          <MarkdownEditor ref="editor" @onScrollUpdatedViewer="onScrollUpdatedViewer" />
        </pane>
        <pane class="pane-view" ref="vpane">
          <MarkdownViewer ref="viewer" @onScrollUpdatedEditor="onScrollUpdatedEditor" />
        </pane>
      </splitpanes>
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

  data: () => ({
    toolbarPx: 60,
  }),

  methods: {
    click (name) {
      this.$refs.editor.action(name);
    },
    resizedPane () {
      this.$nextTick(() => {
        this.$refs.editor.resize(this.$refs.epane.$el, this.$store.state.windowSize.height - this.toolbarPx)
        this.$refs.viewer.resize(this.$refs.vpane.$el, this.$store.state.windowSize.height - this.toolbarPx)
      })
    },
    gotoTop () {
      this.$refs.viewer.setScrollTop(null);
    },
    onScrollUpdatedEditor (value) {
      this.$refs.editor.setScrollTop(value > 1 ? 1 : value);
    },
    onScrollUpdatedViewer (value) {
      this.$refs.viewer.setScrollTop(value > 1 ? 1 : value);
    },
  },

  computed: {
    height () {
      return (this.$store.state.windowSize.height - 1) + "px"
    },
    btnMargin () {
      var top = ((this.toolbarPx - 4 - 32) / 2 + 4) + "px"
      return top
    },
    toobarSize () {
      return this.toolbarPx * 100 / this.$store.state.windowSize.height
    },
    editorSize () {
      return (this.$store.state.windowSize.height - this.toolbarPx) * 100 / this.$store.state.windowSize.height
    },
  }
};
</script>

<style scoped>
.btn-item {
  margin-left: 2px;
  margin-right: 2px;
}
</style>
