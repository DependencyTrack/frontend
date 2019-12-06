<template>
  <b-modal id="projectDetailsModal" size="md" hide-header-close
           :title="$t('message.project_details')"
           :ok-title="$t('message.update')"
           :cancel-title="$t('message.cancel')"
  >
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
      <vue-tags-input id="input-4" v-model="tag" :tags="tags" :add-on-key="addOnKeys" :placeholder="$t('message.add_tag')" style="max-width:none; background-color:transparent;"/>
    </b-form-group>
  </b-modal>
</template>

<script>
  import VueTagsInput from '@johmun/vue-tags-input';

  export default {
    name: "ProjectDetailsModal",
    components: {
      VueTagsInput
    },
    props: {
      project: Object
    },
    data() {
      return {
        tag: '', // The contents of a tag as its being typed into the vue-tag-input
        tags: [], // An array of tags bound to the vue-tag-input
        addOnKeys: [9, 13, 32, ':', ';', ','], // Separators used when typing tags into the vue-tag-input
      }
    },
    beforeUpdate() {
      if (this.tags.length === 0 && this.project && this.project.tags)  { // Prevents line from being executed when entering new tags
        this.project.tags.forEach((tag) => this.tags.push({text: tag.name}));
      }
    }
  }
</script>

<style lang="scss">
  @import "../../../assets/scss/vendors/vue-tags-input/vue-tags-input";
</style>
