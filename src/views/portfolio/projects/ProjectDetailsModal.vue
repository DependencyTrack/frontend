<template>
  <b-modal id="projectDetailsModal" size="md" hide-header-close no-stacking :title="$t('message.project_details')">
    <b-form-group
      id="fieldset-1"
      :label="this.$t('message.project_name')"
      label-for="input-1"
      label-class="required">
      <b-form-input id="input-1" v-model="project.name" class="required" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-2"
      :label="this.$t('message.version')"
      label-for="input-2">
      <b-form-input id="input-2" v-model="project.version" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-3"
      :label="this.$t('message.description')"
      label-for="input-3">
      <b-form-textarea id="input-3" v-model="project.description" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-4"
      :label="this.$t('message.tags')"
      label-for="input-4">
      <vue-tags-input id="input-4" v-model="tag" :tags="tags" :add-on-key="addOnKeys"
                      :placeholder="$t('message.add_tag')" @tags-changed="newTags => this.tags = newTags"
                      style="max-width:none; background-color:transparent;"/>
    </b-form-group>
    <b-form-group
      id="fieldset-5"
      :label="this.$t('message.active')"
      label-for="input-5">
      <c-switch id="input-5" class="mx-1" color="primary" checked label variant="pill" v-bind="labelIcon" />
    </b-form-group>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="outline-danger" @click="deleteProject()">{{ $t('message.delete') }}</b-button>
      <b-button size="md" variant="outline-primary" v-b-modal.projectPropertiesModal>{{ $t('message.properties') }}</b-button>
      <b-button size="md" variant="outline-primary" v-b-modal.projectAddVersionModal>{{ $t('message.add_version') }}</b-button>
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
      <b-button size="md" variant="primary" @click="updateProject()">{{ $t('message.update') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import VueTagsInput from '@johmun/vue-tags-input';
  import { Switch as cSwitch } from '@coreui/vue';
  import EventBus from "../../../shared/eventbus";
  import api from "../../../shared/api";

  export default {
    name: "ProjectDetailsModal",
    components: {
      VueTagsInput,
      cSwitch
    },
    props: {
      project: Object
    },
    data() {
      return {
        active: true,
        tag: '', // The contents of a tag as its being typed into the vue-tag-input
        tags: [], // An array of tags bound to the vue-tag-input
        addOnKeys: [9, 13, 32, ':', ';', ','], // Separators used when typing tags into the vue-tag-input
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        },
      }
    },
    beforeUpdate() {
      if (this.tags.length === 0 && this.project && this.project.tags)  { // Prevents line from being executed when entering new tags
        this.project.tags.forEach((tag) => this.tags.push({text: tag.name}));
      }
    },
    methods: {
      updateProject: function() {
        this.$root.$emit('bv::hide::modal', 'projectDetailsModal');
        let url = `${api.BASE_URL}/${api.URL_PROJECT}`;
        let tagsNode = [];
        this.tags.forEach((tag) => tagsNode.push({name: tag.text}));
        this.axios.post(url, {
            uuid: this.project.uuid,
            name: this.project.name,
            version: this.project.version,
            description: this.project.description,
            tags: tagsNode,
            active: this.active
          }
        ).then((response) => {
          this.$toastr.s("Project updated");
        });
      },
      deleteProject: function() {
        this.$root.$emit('bv::hide::modal', 'projectDetailsModal');
        let url = `${api.BASE_URL}/${api.URL_PROJECT}/` + this.project.uuid;
        this.axios.delete(url)
        .then((response) => {
          this.$toastr.s("Project deleted");
          this.$router.replace({ name: "Projects" });
        });
      }
    }
  }
</script>

<style lang="scss">
  @import "../../../assets/scss/vendors/vue-tags-input/vue-tags-input";
</style>
