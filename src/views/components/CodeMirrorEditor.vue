<template>
  <div
    ref="editor"
    :style="{
      border: '1px solid var(--code-editor-border-color)',
      backgroundColor: 'var(--code-editor-bg)',
      borderRadius: '0.25rem',
      maxWidth: maxWidth,
      height: initialHeight,
      resize: 'vertical',
      overflow: 'auto',
    }"
  ></div>
</template>

<script>
import { EditorState, Compartment, Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { setDiagnostics } from '@codemirror/lint';
import { autocompletion } from '@codemirror/autocomplete';
import { getTheme } from '@/shared/utils';

export default {
  name: 'CodeMirrorEditor',
  props: {
    value: String,
    readOnly: Boolean,
    markers: {
      type: Array,
      default: () => [],
    },
    maxWidth: {
      type: String,
      default: '100%',
    },
    language: {
      type: Object,
      default: null,
    },
    lineWrapping: {
      type: Boolean,
      default: true,
    },
    initialHeight: {
      type: String,
      default: null,
    },
    completionSource: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      view: null,
      readOnlyCompartment: new Compartment(),
    };
  },
  mounted() {
    const self = this;
    const state = EditorState.create({
      doc: this.value || '',
      extensions: [
        basicSetup,
        this.language || javascript(),
        autocompletion({
          override: this.completionSource ? [this.completionSource] : [],
        }),
        ...(getTheme() === 'dark' ? [oneDark] : []),
        ...(this.lineWrapping ? [EditorView.lineWrapping] : []),
        this.readOnlyCompartment.of(EditorState.readOnly.of(this.readOnly)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const val = update.state.doc.toString();
            self.$emit('input', val);
            self.updateMinHeight(update.state.doc);
            if (self.$refs.editor) {
              self.$refs.editor.dispatchEvent(new Event('keyup'));
            }
          }
        }),
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-s',
              run: () => {
                self.$emit('save');
                return true;
              },
            },
          ]),
        ),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
    });

    this.view = new EditorView({
      state,
      parent: this.$refs.editor,
    });

    this.updateMinHeight(this.view.state.doc);
    this.view.dom.addEventListener('keyup', (e) => e.stopPropagation());

    if (this.markers && this.markers.length > 0) {
      this.applyMarkers(this.markers);
    }
  },
  beforeDestroy() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
  },
  methods: {
    updateMinHeight(doc) {
      if (!this.view) {
        return;
      }
      const lines = Math.min(Math.max(3, doc.lines + 2), 8);
      this.view.dom.style.minHeight = lines * 1.4 + 'em';
    },
    applyMarkers(markers) {
      if (!this.view) {
        return;
      }
      if (!markers || markers.length === 0) {
        this.view.dispatch(setDiagnostics(this.view.state, []));
        return;
      }
      const doc = this.view.state.doc;
      const diagnostics = markers
        .map((marker) => {
          try {
            const startLine = doc.line(marker.startLineNumber);
            const endLine = doc.line(marker.endLineNumber);
            const from = Math.min(
              startLine.from + marker.startColumn - 1,
              startLine.to,
            );
            const to = Math.max(
              from,
              Math.min(endLine.from + marker.endColumn - 1, endLine.to),
            );
            return {
              from,
              to,
              severity: 'error',
              message: marker.message,
            };
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
      this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
    },
  },
  watch: {
    value(newVal) {
      if (this.view && newVal !== this.view.state.doc.toString()) {
        this.view.dispatch({
          changes: {
            from: 0,
            to: this.view.state.doc.length,
            insert: newVal || '',
          },
        });
      }
    },
    readOnly(newVal) {
      if (this.view) {
        this.view.dispatch({
          effects: this.readOnlyCompartment.reconfigure(
            EditorState.readOnly.of(newVal),
          ),
        });
      }
    },
    markers(newMarkers) {
      this.applyMarkers(newMarkers);
    },
  },
};
</script>
