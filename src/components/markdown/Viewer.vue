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

  created () {
    var renderer = new marked.Renderer();
    renderer.link = function (href, title, text) {
      return `<a target="_blank" href="${href}">${text}` + '</a>';
    }
    marked.setOptions({
      renderer: renderer,
      langPrefix: '',
      highlight (code, lang) {
        var l = lang.split(':');
        return hljs.highlightAuto(code, [l[0]]).value
      }
    });
  },

  data: () => ({
    timeoutId: null,
    isScrollReceived: false,
    clientWidth: 1,
    clientHeight: 1,
  }),

  methods: {
    resize (el, height) {
      this.clientWidth = el.clientWidth - 1;
      this.clientHeight = height ? height - 3 : el.clientHeight;
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
      if (v == null) {
        this.$refs.viewer.scrollTo({
          top: 0,
          behavior: "smooth"
        })
        return
      }
      this.isScrollReceived = true
      this.setTimeout(false)
      var el = this.$refs.viewer;
      var topEnd = el.scrollHeight - el.clientHeight
      this.$nextTick(() => {
        el.scrollTop = topEnd * v;
      })
    },
    handleScroll (e) {
      if (this.isScrollReceived) {
        return
      }
      var el = e.target
      if (el && el.clientHeight && el.scrollHeight) {
        var topEnd = el.scrollHeight - el.clientHeight
        if (topEnd > 0) {
          this.$nextTick(() => {
            this.$emit('onScrollUpdatedEditor', el.scrollTop / topEnd)
          })
        }
      }
    },
  },

  mounted () {
    document.getElementById("viewer").addEventListener('scroll', this.handleScroll);
  },

  beforeDestroy () {
    document.getElementById("viewer").removeEventListener('scroll', this.handleScroll);
  },

  computed: {
    markdown () {
      return marked(this.$store.state.code + '\n')
    },
    width () {
      return this.clientWidth + 'px'
    },
    height () {
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
