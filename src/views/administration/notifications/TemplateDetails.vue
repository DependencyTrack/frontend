<template>
  <div>
    <b-row class="expanded-row">
      <b-col sm="6">
        <b-form-group
          v-if="template.defaultPublisher"
          id="fieldset-2"
          :label="this.$t('admin.extension_name')"
          label-for="input-2"
        >
          <b-form-input
            v-if="template.defaultPublisher"
            id="input-2"
            v-model.trim="template.extensionName"
            disabled
            class="form-control disabled"
            readonly
          />
        </b-form-group>
        <b-input-group-form-input
          v-if="!template.defaultPublisher"
          id="input-2"
          :label="this.$t('admin.extension_name')"
          input-group-size="mb-3"
          required="true"
          type="text"
          v-model="template.extensionName"
        />
        <b-form-group
          v-if="template.defaultPublisher"
          id="fieldset-3"
          :label="this.$t('message.description')"
          label-for="input-3"
        >
          <b-form-textarea
            v-if="template.defaultPublisher"
            id="input-3"
            v-model.trim="template.description"
            rows="4"
            disabled
            class="form-control disabled"
            readonly
          />
        </b-form-group>
        <b-input-group-form-input
          v-if="!template.defaultPublisher"
          id="input-3"
          :label="this.$t('message.description')"
          input-group-size="mb-3"
          required="true"
          type="text"
          v-model="template.description"
        />
      </b-col>
      <b-col sm="6">
        <b-form-group
          v-if="template.defaultPublisher && template.templateMimeType"
          id="fieldset-4"
          :label="this.$t('admin.mime_type')"
          label-for="input-4"
        >
          <b-form-input
            id="input-4"
            v-model.trim="template.templateMimeType"
            disabled
            class="form-control disabled"
            readonly
          />
        </b-form-group>
        <b-input-group-form-input
          v-if="!template.defaultPublisher && template.templateMimeType"
          id="input-4"
          :label="this.$t('admin.mime_type')"
          input-group-size="mb-3"
          required="true"
          type="text"
          v-model="template.templateMimeType"
        />
      </b-col>
    </b-row>
    <b-row class="expanded-row">
      <b-col sm="12">
        <b-form-group
          v-if="template.template"
          id="fieldset-5"
          :label="this.$t('admin.template')"
          label-for="input-5"
        >
          <code-mirror-editor
            id="input-5"
            v-model="template.template"
            :read-only="template.defaultPublisher"
            :language="jinjaLanguage"
            initial-height="300px"
          />
        </b-form-group>
        <div style="text-align: right">
          <b-button
            variant="outline-primary"
            @click="cloneNotificationPublisher"
            >{{ $t('admin.clone_template') }}</b-button
          >
          <b-button
            v-if="!template.defaultPublisher"
            variant="outline-primary"
            @click="updateNotificationPublisher"
            >{{ $t('message.update') }}</b-button
          >
          <b-button
            v-if="!template.defaultPublisher"
            variant="outline-danger"
            @click="deleteNotificationPublisher"
            >{{ $t('admin.delete_template') }}</b-button
          >
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import EventBus from '../../../shared/eventbus';
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput.vue';
import CodeMirrorEditor from '../../components/CodeMirrorEditor.vue';
import { jinja } from '@codemirror/lang-jinja';

export default {
  props: {
    row: Object,
    index: Number,
  },
  data() {
    return {
      template: this.row,
      jinjaLanguage: jinja(),
    };
  },
  components: {
    BInputGroupFormInput,
    CodeMirrorEditor,
  },
  methods: {
    updateNotificationPublisher: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}`;
      this.axios
        .post(url, {
          uuid: this.template.uuid,
          name: this.template.name,
          description: this.template.description,
          extensionName: this.template.extensionName,
          template: this.template.template,
          templateMimeType: this.template.templateMimeType,
        })
        .then((response) => {
          this.template = response.data;
          EventBus.emit('admin:templates:rowUpdate', this.index, this.template);
          this.$toastr.s(this.$t('message.updated'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    deleteNotificationPublisher: async function () {
      if (
        !(await this.$confirmDelete({
          title: this.$t('admin.delete_template'),
        }))
      )
        return;
      let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_PUBLISHER}/${this.template.uuid}`;
      this.axios
        .delete(url)
        .then((response) => {
          this.template = response.data;
          EventBus.emit('admin:templates:rowDeleted', this.index);
          this.$toastr.s(this.$t('admin.template_deleted'));
        })
        .catch(() => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
    },
    cloneNotificationPublisher: function () {
      EventBus.emit('admin:templates:cloneTemplate', this.template);
    },
  },
};
</script>
