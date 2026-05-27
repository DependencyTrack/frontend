export const DEFAULT_CLASSIFIER = 'APPLICATION';

export const COLLECTION_LOGIC_AGGREGATE_TAG =
  'AGGREGATE_DIRECT_CHILDREN_WITH_TAG';

// Empty project-form shape. Source of truth for the fields the modals bind via
// v-model. Declared up-front because Vue 2 doesn't make keys added after
// initialization reactive, which silently breaks watchers and computed
// properties (e.g. projectNameState, showCollectionTags).
export const FORM_FIELD_DEFAULTS = Object.freeze({
  name: null,
  version: null,
  classifier: null,
  collectionLogic: null,
  group: null,
  purl: null,
  cpe: null,
  swidTagId: null,
  isLatest: false,
  description: null,
});

// Subset of FORM_FIELD_DEFAULTS that surfaces server-side validation feedback.
export const INITIAL_FIELD_FEEDBACK = Object.freeze({
  name: null,
  version: null,
  classifier: null,
  collectionLogic: null,
  group: null,
  purl: null,
  cpe: null,
  swidTagId: null,
});

// Subset of FORM_FIELD_DEFAULTS rendered in the collapsible "Identity"
// section of the creation form.
export const IDENTITY_FIELDS = Object.freeze([
  'group',
  'purl',
  'cpe',
  'swidTagId',
]);

export default {
  data() {
    return {
      submitted: false,
      isCollection: false,
      fieldFeedback: { ...INITIAL_FIELD_FEEDBACK },
      tag: '',
      tags: [],
      tagsAutoCompleteItems: [],
      tagsAutoCompleteDebounce: null,
      collectionTagTyping: '',
      collectionTags: [],
      addOnKeys: [9, 13, 32, ':', ';', ','],
      isLoading: false,
      defaultParents: [],
      availableParents: [],
      selectedParent: null,
    };
  },
  created() {
    Object.keys(INITIAL_FIELD_FEEDBACK).forEach((field) => {
      this.$watch(`project.${field}`, () => {
        this.fieldFeedback[field] = null;
      });
    });
  },
  watch: {
    'project.version'(v) {
      if (!v) this.project.isLatest = false;
    },
    tag(input) {
      this.searchTags(input);
    },
    collectionTagTyping(input) {
      this.searchTags(input);
    },
  },
  computed: {
    showCollectionTags() {
      return this.project.collectionLogic === COLLECTION_LOGIC_AGGREGATE_TAG;
    },
    projectNameState() {
      if (this.fieldFeedback.name) return false;
      if (!this.submitted) return undefined;
      return !!(this.project.name && this.project.name.trim().length > 0);
    },
    versionState() {
      return this.fieldFeedback.version ? false : undefined;
    },
    classifierState() {
      if (this.fieldFeedback.classifier) return false;
      if (!this.submitted || this.isCollection) return undefined;
      return !!this.project.classifier;
    },
    collectionLogicState() {
      if (this.fieldFeedback.collectionLogic) return false;
      if (!this.submitted || !this.isCollection) return undefined;
      return !!this.project.collectionLogic;
    },
    groupState() {
      return this.fieldFeedback.group ? false : undefined;
    },
    purlState() {
      return this.fieldFeedback.purl ? false : undefined;
    },
    cpeState() {
      return this.fieldFeedback.cpe ? false : undefined;
    },
    swidTagIdState() {
      return this.fieldFeedback.swidTagId ? false : undefined;
    },
  },
  methods: {
    validate() {
      this.submitted = true;
      if (!this.project.name || !this.project.name.trim()) return false;
      if (!this.isCollection && !this.project.classifier) return false;
      if (this.isCollection && !this.project.collectionLogic) return false;
      return true;
    },
    scrollToFirstError() {
      this.$nextTick(() => {
        const el = this.$refs.form
          ? this.$refs.form.$el || this.$refs.form
          : null;
        if (!el) return;
        const invalid = el.querySelector('.is-invalid, [aria-invalid="true"]');
        if (invalid) {
          invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    },
    resetValidationFeedback() {
      this.fieldFeedback = { ...INITIAL_FIELD_FEEDBACK };
    },
    resetTagInputs() {
      clearTimeout(this.tagsAutoCompleteDebounce);
      this.tag = '';
      this.collectionTagTyping = '';
      this.tagsAutoCompleteItems = [];
    },
    applyValidationErrors(error) {
      const contentType = error.response?.headers?.['content-type'] || '';
      if (
        error.response?.status !== 400 ||
        !contentType.includes('application/problem+json') ||
        !error.response.data?.errors
      ) {
        return false;
      }
      for (const validationErr of error.response.data.errors) {
        const field = validationErr.path.split('.').pop();
        if (field in this.fieldFeedback) {
          this.fieldFeedback[field] = validationErr.message;
        }
      }
      this.scrollToFirstError();
      return IDENTITY_FIELDS.some((f) => this.fieldFeedback[f]);
    },
    createProjectLabel(project) {
      return project.version
        ? `${project.name} : ${project.version}`
        : project.name;
    },
    fetchDefaultParents() {
      this.axios
        .get(this.parentSearchUrl(''))
        .then((response) => {
          this.defaultParents = response.data || [];
          this.availableParents = this.defaultParents;
        })
        .catch(() => {
          this.defaultParents = [];
          this.availableParents = [];
        });
    },
    asyncFind(query) {
      if (!query) {
        this.availableParents = this.defaultParents;
        return;
      }
      this.isLoading = true;
      this.axios
        .get(this.parentSearchUrl(query))
        .then((response) => {
          this.availableParents = response.data || [];
        })
        .catch(() => {
          this.availableParents = this.defaultParents;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    searchTags(input) {
      clearTimeout(this.tagsAutoCompleteDebounce);
      if (!input) {
        this.tagsAutoCompleteItems = [];
        return;
      }
      this.tagsAutoCompleteDebounce = setTimeout(() => {
        const url = `${this.$api.BASE_URL}/${this.$api.URL_TAG}?searchText=${encodeURIComponent(
          input,
        )}&pageNumber=1&pageSize=6`;
        this.axios.get(url).then((response) => {
          this.tagsAutoCompleteItems = response.data.map((tag) => ({
            text: tag.name,
          }));
        });
      }, 250);
    },
  },
};
