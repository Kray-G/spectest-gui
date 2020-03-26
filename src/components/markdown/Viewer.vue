<template>
  <div id="viewer" class="mdviewer" :style="{ width: width, height: height, overflow: 'auto' }" ref="viewer">
    <div v-html="markdown" class="mdviewer-body markdown-body" />
  </div>
</template>

<script>
import marked from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-gist.css'
import 'github-markdown-css/github-markdown.css'

export default {
  name: 'MarkdownViewer',

  created: function () {
    marked.setOptions({
      langPrefix: '',
      highlight: function(code, lang) {
        var l = lang.split(':');
        return hljs.highlightAuto(code, [l[0]]).value
      }
    });
  },

  data: () => ({
    clientWidth: 1,
    clientHeight: 1,
  }),

  methods: {
    resize: function(el) {
      this.clientWidth = el.clientWidth - 1;
      this.clientHeight = el.clientHeight - 3;
    },
    handleScroll: function(e) {
      var el = e.target
      var topEnd = el.scrollHeight - el.clientHeight
      this.$nextTick(() => {
        this.$emit('onScrollUpdatedEditor', el.scrollTop / topEnd)
      })
    },
  },

  mounted: function () {
    document.getElementById("viewer").addEventListener('scroll', this.handleScroll);
  },

  beforeDestroy: function () {
    document.getElementById("viewer").removeEventListener('scroll', this.handleScroll);
  },

  computed: {
    markdown: function () {
      return marked(this.$store.state.code) + '<br />'
    },
    width() {
      return this.clientWidth + 'px'
    },
    height() {
      return this.clientHeight + 'px'
    },
  }
}
</script>

<style>
.mdviewer {
  margin-top: 6px;
  margin-bottom: 8px;
}
.mdviewer-body {
  padding: 8px;
}

code {
  font-size: 85% !important;
  padding: 0px !important;
}
pre>code {
  width: 100%;
  padding: 0.5em;
  color: inherit !important;
  -webkit-box-shadow: inset 0 0px 0 #ffffff !important;
  box-shadow: inset 0 0px 0 #ffffff !important;
}
pre>code:after, pre>code:before {
  content: "" !important;
  letter-spacing: 0px !important;
}
</style>
