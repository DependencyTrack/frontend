<template>
  <div
    class="tags-input form-control h-auto d-flex flex-wrap align-items-center"
  >
    <span
      v-for="tag in modelValue"
      :key="tag"
      class="badge text-bg-tag me-1 d-inline-flex align-items-center"
    >
      {{ tag }}
      <button
        v-if="!readonly"
        type="button"
        class="btn-close btn-close-white ms-1"
        :aria-label="`${$t('message.remove')} ${tag}`"
        @click="remove(tag)"
      ></button>
    </span>
    <input
      v-if="!maxTags || modelValue.length < maxTags"
      :id="id"
      :value="text"
      :list="`${id}-suggestions`"
      :placeholder="placeholder"
      :readonly="readonly"
      class="border-0 bg-transparent text-reset flex-grow-1"
      autocomplete="off"
      @input="onInput"
      @keydown="onKeydown"
      @blur="add"
    />
    <datalist :id="`${id}-suggestions`">
      <option v-for="s in suggestions" :key="s" :value="s" />
    </datalist>
  </div>
</template>

<script>
const SEPARATORS = ['Enter', ' ', ':', ';', ','];

export default {
  props: {
    id: { type: String, required: true },
    modelValue: { type: Array, default: () => [] },
    suggestions: { type: Array, default: () => [] },
    placeholder: String,
    maxTags: Number,
    readonly: Boolean,
  },
  emits: ['update:modelValue', 'search'],
  data() {
    return { text: '' };
  },
  methods: {
    onInput(event) {
      this.text = event.target.value;
      // Browsers fire insertReplacementText (older Chrome no inputType) when a suggestion is picked.
      const picked =
        !event.inputType || event.inputType === 'insertReplacementText';
      if (picked && this.suggestions.includes(this.text)) {
        this.add();
      } else {
        this.$emit('search', this.text);
      }
    },
    onKeydown(event) {
      if (SEPARATORS.includes(event.key)) {
        event.preventDefault();
        this.add();
      }
    },
    add() {
      const tag = this.text.trim();
      this.text = '';
      if (tag && !this.modelValue.includes(tag)) {
        this.$emit('update:modelValue', [...this.modelValue, tag]);
      }
    },
    remove(tag) {
      this.$emit(
        'update:modelValue',
        this.modelValue.filter((t) => t !== tag),
      );
    },
  },
};
</script>
