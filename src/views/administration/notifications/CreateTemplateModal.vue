<template>
  <b-modal
    id="createTemplateModal"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('admin.create_template')"
  >
    <b-form-group
      id="fieldset-1"
      :label="this.$t('message.name')"
      label-for="input-1"
      label-class="required"
    >
      <b-form-input
        id="input-1"
        v-model="name"
        class="required"
        required
        trim
      />
    </b-form-group>
    <b-form-group
      id="fieldset-2"
      :label="this.$t('admin.extension_name')"
      label-for="input-2"
      label-class="required"
    >
      <b-form-select
        id="input-2"
        v-model="extensionName"
        :options="availableExtensions"
        class="required"
        required
      >
        <template #first>
          <b-form-select-option :value="null" disabled>
            {{ $t('admin.select_extension') }}
          </b-form-select-option>
        </template>
      </b-form-select>
    </b-form-group>
    <b-form-group
      id="fieldset-3"
      :label="this.$t('message.description')"
      label-for="input-3"
      label-class="required"
    >
      <b-form-textarea
        id="input-3"
        v-model="description"
        class="required"
        rows="4"
        required
        trim
      />
    </b-form-group>
    <b-form-group
      id="fieldset-4"
      :label="this.$t('admin.mime_type')"
      label-for="input-4"
      label-class="required"
    >
      <b-form-input
        id="input-4"
        v-model="mimeType"
        class="required"
        required
        trim
      />
    </b-form-group>
    <b-form-group
      id="fieldset-5"
      :label="this.$t('admin.template')"
      label-for="input-5"
      label-class="required"
    >
      <code-mirror-editor
        id="input-5"
        v-model="template"
        :language="jinjaLanguage"
        :line-wrapping="false"
      />
    </b-form-group>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button size="md" variant="primary" @click="createTemplate()">{{
        $t('message.create')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import EventBus from '../../../shared/eventbus';
import CodeMirrorEditor from '../../components/CodeMirrorEditor.vue';
import { jinja } from '@codemirror/lang-jinja';

export default {
  mixins: [permissionsMixin],
  components: {
    CodeMirrorEditor,
  },
  mounted() {
    this.fetchAvailableExtensions();
    EventBus.$on('admin:templates:cloneTemplate', (template) => {
      this.name = `${template.name} - clone`;
      this.extensionName = template.extensionName;
      this.description = template.description;
      this.mimeType = template.templateMimeType;
      this.template = template.template;
    });
    this.$root.$on('bv::modal::hide', (_, modalId) => {
      if (modalId === 'createTemplateModal') {
        this.resetValues();
      }
    });
  },
  data() {
    return {
      name: null,
      extensionName: null,
      description: null,
      mimeType: null,
      template: null,
      jinjaLanguage: jinja(),
      availableExtensions: [],
    };
  },
  methods: {
    fetchAvailableExtensions: async function () {
      try {
        const url = `${this.$api.BASE_URL}/api/v2/extension-points/notification-publisher/extensions`;
        const response = await this.axios.get(url);
        const extensions = Array.isArray(response?.data?.items)
          ? response.data.items
          : [];
        this.availableExtensions = extensions.map((extension) => ({
          value: extension.name,
          text: extension.name,
        }));
      } catch (error) {
        console.error('Failed to fetch available extensions:', error);
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      }
    },
    createTemplate: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}`;
      this.axios
        .put(url, {
          name: this.name,
          description: this.description,
          extensionName: this.extensionName,
          template: this.template,
          templateMimeType: this.mimeType,
          defaultPublisher: false,
        })
        .then(() => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('admin.template_created'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      this.$root.$emit('bv::hide::modal', 'createTemplateModal');
    },
    resetValues: function () {
      this.name = null;
      this.extensionName = null;
      this.description = null;
      this.mimeType = null;
      this.template = null;
    },
  },
};
</script>
