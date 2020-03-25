<template>
  <MonacoEditor ref="editor" v-model="code" language="markdown" class="mdeditor" :style="{ width: width, height: height }"
    :options="{ scrollBeyondLastLine: false, wordWrap: 'on', fontSize: fontSize }"
    @editorWillMount="onEditorWillMount"
  />
</template>

<script>
import MonacoEditor from 'vue-monaco'

export default {
  name: 'MarkdownEditor',
  components: { MonacoEditor },

  data: () => ({
    code: '',
    monaco: null,
    fontSize: 12,
    clientWidth: 1,
    clientHeight: 1,
  }),

  methods: {
    onEditorWillMount: function(monaco) {
      this.monaco = monaco
    },
    resize: function(el) {
      this.clientWidth = el.clientWidth - 1;
      this.clientHeight = el.clientHeight - 3;
      this.$nextTick(() => {
        this.$refs.editor.getEditor().layout()
      })
    },
  },

  computed: {
    width() {
      return this.clientWidth + 'px'
    },
    height() {
      return this.clientHeight + 'px'
    },
  },

  watch: {
    code() {
      this.$store.commit('updateCode', this.code)
    },
  },
};
</script>

<style scoped>
.mdeditor {
  margin-top: 6px;
  margin-bottom: 8px;
}
</style>
