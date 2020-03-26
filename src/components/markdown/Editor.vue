<template>
  <MonacoEditor ref="editor" v-model="code" language="markdown" class="mdeditor" :style="{ width: width, height: height }"
    :options="{ scrollBeyondLastLine: false, wordWrap: 'on', fontSize: fontSize }"
    @editorWillMount="onEditorWillMount"
  />
</template>

<script>
import MonacoEditor from 'vue-monaco'

var actionCommand = {}

function generateWrapperCommand(monaco, editor, startText, endText) {
  var len = startText.length + endText.length
  return (editor) => {
    var selection = editor.getSelection();
    var range = new monaco.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn+len);
    editor.getModel().pushEditOperations([], [
        {
            range: {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.startLineNumber,
                endColumn: selection.startColumn
            },
            text: startText
        },
        {
            range: {
                startLineNumber: selection.endLineNumber,
                startColumn: selection.endColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn
            },
            text: endText
        }
    ])
    editor.setSelection(range)
    return null;
  }
}

function addWrapperCommand(monaco, editor, label, keybindings, startText, endText) {
  actionCommand[label] = generateWrapperCommand(monaco, editor, startText, endText)
  editor.addAction({
    id: 'markdwn-'+label,
    label: label,
    keybindings: keybindings,
    precondition: null,
    keybindingContext: null,
    contextMenuGroupId: 'navigation',
    contextMenuOrder: 1.5,
    run: actionCommand[label]
  })
}

function setupShortcutKeys(monaco, editor) {
  addWrapperCommand(monaco, editor, "Bold",   [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B ], "**", "**")
  addWrapperCommand(monaco, editor, "Itaric", [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_I ], "*",  "*")
}

export default {
  name: 'MarkdownEditor',
  components: { MonacoEditor },

  data: () => ({
    timeoutId: null,
    isScrollReceived: false,
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
    setScrollTop: function(v) {
      this.isScrollReceived = true
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }
      this.timeoutId = setTimeout(() => {
        this.isScrollReceived = false
        this.timeoutId = null
      }, 1000)
      var el = this.$refs.editor;
      if (el) {
        var editor = el.getEditor()
        if (editor) {
          console.log("Editor value")
          console.log(v)
          var topEnd = editor.getScrollHeight() - this.clientHeight
          this.$nextTick(() => {
            editor.setScrollTop(topEnd * v);
          })
        }
      }
    },
    handleScroll: function() {
      if (this.isScrollReceived) {
        return
      }
      var editor = this.$refs.editor.getEditor()
      if (editor) {
        var scrollTop = editor.getScrollTop();
        var topEnd = editor.getScrollHeight() - this.clientHeight
        if (topEnd > 0) {
          this.$nextTick(() => {
            console.log("Editor fire")
            console.log(scrollTop / topEnd)
            this.$emit('onScrollUpdatedViewer', scrollTop / topEnd)
          })
        }
      }
    },
  },

  mounted: function () {
    var editor = this.$refs.editor.getEditor()
    editor.onDidScrollChange(this.handleScroll)
    if (this.monaco) {
      setupShortcutKeys(this.monaco, editor)
    }
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
