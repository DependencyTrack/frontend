<template>
  <b-modal id="projectCreateProjectModal" size="md" hide-header-close no-stacking :title="$t('message.create_project')">
    <b-form-group
      id="fieldset-1"
      :label="this.$t('message.project_name')"
      label-for="input-1"
      label-class="required">
      <b-form-input id="input-1" v-model="name" class="required" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-2"
      :label="this.$t('message.version')"
      label-for="input-2">
      <b-form-input id="input-2" v-model="version" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-3"
      :label="this.$t('message.description')"
      label-for="input-3">
      <b-form-textarea id="input-3" v-model="description" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-4"
      :label="this.$t('message.tags')"
      label-for="input-4">
      <vue-tags-input id="input-4" v-model="tag" :tags="tags" :add-on-key="addOnKeys"
                      :placeholder="$t('message.add_tag')" @tags-changed="newTags => this.tags = newTags"
                      style="max-width:none; background-color:transparent;"/>
    </b-form-group>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.close') }}</b-button>
      <b-button size="md" variant="primary" @click="createProject()">{{ $t('message.create') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import VueTagsInput from '@johmun/vue-tags-input';
  import { Switch as cSwitch } from '@coreui/vue';
  import api from "../../../shared/api";
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    name: "ProjectCreateProjectModal",
    mixins: [permissionsMixin],
    components: {
      VueTagsInput,
      cSwitch
    },
    data() {
      return {
        name: null,
        version: null,
        description: null,
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
      createProject: function() {
        this.$root.$emit('bv::hide::modal', 'projectCreateProjectModal');
        let url = `${api.BASE_URL}/${api.URL_PROJECT}`;
        let tagsNode = [];
        this.tags.forEach((tag) => tagsNode.push({name: tag.text}));
        this.axios.put(url, {
          name: this.name,
          version: this.version,
          description: this.description,
          tags: tagsNode,
          active: true
        }).then((response) => {
          this.$emit('refreshTable');
          this.$toastr.s(this.$t('message.project_created'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
        this.resetValues();
      },
      resetValues: function () {
        this.name = null;
        this.version = null;
        this.description = null;
        this.tag = "";
        this.tags = [];
      }
    }
  }
</script>

<style lang="scss">
  @import "../../../assets/scss/vendors/vue-tags-input/vue-tags-input";
</style>
