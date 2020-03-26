<template>
  <MonacoEditor ref="editor" v-model="code" language="markdown" class="mdeditor" :style="{ width: width, height: height }"
    :theme="editorOptions.theme"
    :options="{ scrollBeyondLastLine: false, wordWrap: 'on', fontSize: editorOptions.fontSize }"
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
    return null
  }
}

function addWrapperCommand(monaco, editor, label, keybindings, startText, endText) {
  actionCommand[label] = generateWrapperCommand(monaco, editor, startText, endText)
  editor.addAction({
    id: 'markdwon-'+label,
    label: label,
    keybindings: keybindings,
    contextMenuGroupId: 'navigation',
    contextMenuOrder: 1.5,
    run: actionCommand[label]
  })
}

function generateHeaderCommand(monaco, editor, startText) {
  return (editor) => {
    var selection = editor.getSelection();
    var m = editor.getModel().findNextMatch("^(#+ )", { lineNumber: selection.startLineNumber, column: 1 }, true, false, null, true)
    console.log(m)
    if (m.range.startLineNumber == selection.startLineNumber && m.range.startColumn == 1) {
      if (m.matches[1] == startText) {
        return
      }
      editor.getModel().pushEditOperations([], [
          {
              range: {
                  startLineNumber: selection.startLineNumber,
                  startColumn: 1,
                  endLineNumber: selection.startLineNumber,
                  endColumn: m.matches[1].length + 1
              },
              text: ''
          }
      ])
    }
    editor.getModel().pushEditOperations([], [
        {
            range: {
                startLineNumber: selection.startLineNumber,
                startColumn: 1,
                endLineNumber: selection.startLineNumber,
                endColumn: 1
            },
            text: startText
        }
    ])
    editor.setSelection(selection)
    return null
  }
}

function addHeaderCommand(monaco, editor, label, keybindings, startText) {
  actionCommand[label] = generateHeaderCommand(monaco, editor, startText)
  editor.addAction({
    id: 'markdwon-header-'+label,
    label: label,
    keybindings: keybindings,
    run: actionCommand[label]
  })
}

function setupShortcutKeys(monaco, editor) {
  addWrapperCommand(monaco, editor, "Bold",           [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B ],                       "**", "**")
  addWrapperCommand(monaco, editor, "Itaric",         [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_I ],                       "*",  "*")
  addWrapperCommand(monaco, editor, "Underline",      [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_U ],                       "<u>",  "</u>")
  addWrapperCommand(monaco, editor, "Strikethrough",  [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_S ], "~~", "~~")
  addWrapperCommand(monaco, editor, "Code",           [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_M ], "`",  "`")
  addHeaderCommand (monaco, editor, "Header 1",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_1 ], "# ")
  addHeaderCommand (monaco, editor, "Header 2",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_2 ], "## ")
  addHeaderCommand (monaco, editor, "Header 3",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_3 ], "### ")
  addHeaderCommand (monaco, editor, "Header 4",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_4 ], "#### ")
  addHeaderCommand (monaco, editor, "Header 5",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_5 ], "##### ")
  addHeaderCommand (monaco, editor, "Header 6",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_6 ], "###### ")
}

export default {
  name: 'MarkdownEditor',
  components: { MonacoEditor },

  data: () => ({
    timeoutId: null,
    isScrollReceived: false,
    code: '',
    monaco: null,
    clientWidth: 1,
    clientHeight: 1,
    editorOptions: {
      fontSize: 12,
      theme: '',
    }
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
      var scrollTop = editor.getScrollTop();
      var topEnd = editor.getScrollHeight() - this.clientHeight
      if (topEnd > 0) {
        this.$nextTick(() => {
          this.$emit('onScrollUpdatedViewer', scrollTop / topEnd)
        })
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
