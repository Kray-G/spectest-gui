<template>
  <MonacoEditor ref="editor" v-model="code" language="markdown" class="mdeditor" :style="{ width: width, height: height }"
    :theme="editorOptions.theme"
    :options="{ scrollBeyondLastLine: false, wordWrap: 'on', fontSize: editorOptions.fontSize }"
    @editorWillMount="onEditorWillMount"
  />
</template>

<script>
import MonacoEditor from 'vue-monaco'

var actionCommand = {}, cmdid = 0

function generateWrapperCommand(monaco, editor, startText, endText) {
  var len = startText.length + endText.length
  return () => {
    var sels = editor.getSelections()
    if (sels == null) {
      return
    }
    var ranges = []
    sels.forEach(selection => {
      ranges.push(new monaco.Selection(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn+len))
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
    })
    editor.setSelections(ranges)
    return null
  }
}

function addWrapperCommand(monaco, editor, context, label, keybindings, startText, endText) {
  actionCommand[label] = generateWrapperCommand(monaco, editor, startText, endText)
  editor.addAction({
    id: 'markdwon-'+(cmdid++),
    label: label,
    keybindings: keybindings,
    contextMenuGroupId: context && 'navigation',
    contextMenuOrder: context && 1.5,
    run: actionCommand[label]
  })
}

function generateHeaderCommand(monaco, editor, startText) {
  return () => {
    var sels = editor.getSelections()
    if (sels == null) {
      sels = [editor.getSelections()]
    }
    sels.forEach(selection => {      
      var m = editor.getModel().findNextMatch("^(#+ )", { lineNumber: selection.startLineNumber, column: 1 }, true, false, null, true)
      if (m != null) {
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
    })
    return null
  }
}

function addHeaderCommand(monaco, editor, context, label, keybindings, startText) {
  actionCommand[label] = generateHeaderCommand(monaco, editor, startText)
  editor.addAction({
    id: 'markdwon-'+(cmdid++),
    label: label,
    keybindings: keybindings,
    contextMenuGroupId: context && 'navigation',
    contextMenuOrder: context && 1.5,
    run: actionCommand[label]
  })
}

function setupShortcutKeys(monaco, editor) {
  addWrapperCommand(monaco, editor, true , "Bold",           [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B ],                        "**", "**")
  addWrapperCommand(monaco, editor, true , "Italic",         [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_I ],                        "*",  "*")
  addWrapperCommand(monaco, editor, true , "Underline",      [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_U ],                        "<u>",  "</u>")
  addWrapperCommand(monaco, editor, true , "Strikethrough",  [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_S ],  "~~", "~~")
  addWrapperCommand(monaco, editor, true , "Code",           [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_M ],  "`",  "`")
  addWrapperCommand(monaco, editor, false, "Link-1",         [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_L ],                        "[",  "]()")
  addWrapperCommand(monaco, editor, false, "Link-2",         [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_L ],  "[](",  ")")
  addHeaderCommand (monaco, editor, false, "Header 1",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_1 ],  "# ")
  addHeaderCommand (monaco, editor, false, "Header 2",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_2 ],  "## ")
  addHeaderCommand (monaco, editor, false, "Header 3",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_3 ],  "### ")
  addHeaderCommand (monaco, editor, false, "Header 4",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_4 ],  "#### ")
  addHeaderCommand (monaco, editor, false, "Header 5",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_5 ],  "##### ")
  addHeaderCommand (monaco, editor, false, "Header 6",       [ monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt   | monaco.KeyCode.KEY_6 ],  "###### ")
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
    onEditorWillMount (monaco) {
      this.monaco = monaco
    },
    action (name) {
      if (actionCommand[name] != null) {
        actionCommand[name]()
      }
    },
    resize (el, height) {
      this.clientWidth = el.clientWidth - 1;
      this.clientHeight = height ? height - 3 : el.clientHeight;
      this.$nextTick(() => {
        this.$refs.editor.getEditor().layout()
      })
    },
    setTimeout (clearOnly) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
      if (!clearOnly) {
        this.timeoutId = setTimeout(() => {
          this.isScrollReceived = false
          this.timeoutId = null
        }, 200)
      }
    },
    setScrollTop (v) {
      this.isScrollReceived = true
      this.setTimeout(false)
      var el = this.$refs.editor;
      var editor = el.getEditor()
      var topEnd = editor.getScrollHeight() - this.clientHeight
      this.$nextTick(() => {
        editor.setScrollTop(topEnd * v);
      })
    },
    handleScroll () {
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

  mounted () {
    var editor = this.$refs.editor.getEditor()
    editor.onDidScrollChange(this.handleScroll)
    if (this.monaco) {
      setupShortcutKeys(this.monaco, editor)
    }
  },

  computed: {
    width () {
      return this.clientWidth + 'px'
    },
    height () {
      return this.clientHeight + 'px'
    },
  },

  watch: {
    code () {
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
