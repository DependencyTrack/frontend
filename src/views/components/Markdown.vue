<template>
  <div class="markdown" v-html="outputHTML"></div>
</template>

<script>
import DOMPurify from 'dompurify';
import { Marked } from 'marked';
import xssFilters from 'xss-filters';

const marked = new Marked({
  breaks: true,
  renderer: {
    html: ({ text, block }) =>
      block
        ? `<p>${xssFilters.inHTMLData(text.trim())}</p>`
        : xssFilters.inHTMLData(text),
  },
});

export default {
  props: {
    markdown: String,
  },
  computed: {
    outputHTML() {
      return DOMPurify.sanitize(marked.parse(this.markdown ?? ''));
    },
  },
};
</script>
