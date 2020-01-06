<template>
  <b-modal id="componentDetailsModal" size="md" hide-header-close no-stacking :title="$t('message.component_details')">
    blah
  </b-modal>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';
  import permissionsMixin from "../../../mixins/permissionsMixin";

  export default {
    name: "ComponentDetailsModal",
    mixins: [permissionsMixin],
    components: {
      cSwitch
    },
    props: {
      component: Object
    },
    data() {
      return {
      }
    },
    methods: {
      updateComponent: function() {
        this.$root.$emit('bv::hide::modal', 'componentDetailsModal');
        let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}`;
        let tagsNode = [];
        this.tags.forEach((tag) => tagsNode.push({name: tag.text}));
        this.axios.post(url, {
          // TODO
        }).then((response) => {
          this.$toastr.s(this.$t('message.component_updated'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      },
      deleteComponent: function() {
        this.$root.$emit('bv::hide::modal', 'componentDetailsModal');
        let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/` + this.component.uuid;
        this.axios.delete(url).then((response) => {
          this.$toastr.s(this.$t('message.component_deleted'));
          this.$router.replace({ name: "Components" });
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      }
    }
  }
</script>
