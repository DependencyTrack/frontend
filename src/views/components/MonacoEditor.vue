<template>
  <div ref="monaco-editor" style="border: 1px solid #52525e; border-radius: 0.25rem; height: 100px;"></div>
</template>

<script>
import loader from "@monaco-editor/loader";

export default {
  name: "MonacoEditor",
  props: {
    value: String,
    markers: [],
  },
  data() {
    return {
      monaco: null,
      editor: null,
      editorModel: null,
    }
  },
  mounted() {
    loader.init().then(monaco => {
      this.monaco = monaco;
      this.editor = monaco.editor.create(this.$refs["monaco-editor"], {
        automaticLayout: true,
        bracketPairColorization: true,
        cursorBlinking: 'phase',
        language: "python",
        lineDecorationsWidth: 0,
        matchBrackets: true,
        minimap: {
          enabled: false,
        },
        lineNumbersMinChars: 3,
        overviewRulerLanes: 0,
        scrollBeyondLastLine: false,
        theme: "vs-dark",
        wordWrap: "on",
        wrappingStrategy: "advanced",
      });

      this.editorModel = this.editor.getModel();
      this.editorModel.onDidChangeContent(this.handleContentChange);
      this.editorModel.setValue(this.value);
    });
  },
  beforeDestroy() {
    if (this.editor) {
      this.editorModel.dispose();
      this.editor.dispose();
      this.editor = null;
      this.editorModel = null;
    }
  },
  methods: {
    handleContentChange: function (event) {
      this.monaco.editor.removeAllMarkers("foo");
      this.$emit("change", this.editor.getValue(), event);
      this.$emit("input", this.editor.getValue());
    },
  },
  watch: {
    value() {
      if (this.editor && this.value !== this.editor.getValue()) {
        this.editorModel.setValue(this.value);
      }
    },
    markers() {
      if (!this.markers) {
        this.monaco.editor.removeAllMarkers("foo");
      }

      this.monaco.editor.setModelMarkers(this.editorModel, "foo", this.markers);
    }
  }
}
</script>
