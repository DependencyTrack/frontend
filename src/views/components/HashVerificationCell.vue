<template>
  <div>
    <b-link
      role="button"
      @click="showHashVerificationModal = true"
      class="hash-verification-trigger"
      data-toggle="tooltip"
      data-placement="bottom"
      :title="tooltipTitle"
      :aria-label="tooltipTitle"
    >
      <i :class="['fa', iconClass, colorClass]" aria-hidden="true"></i>
    </b-link>
    <hash-verification-modal
      v-model="showHashVerificationModal"
      :status="status"
      :component-hashes="componentHashes"
      :repository-hashes="repositoryHashes"
      :repository-identifier="repositoryIdentifier"
    />
  </div>
</template>

<script>
import HashVerificationModal from './HashVerificationModal.vue';

export default {
  components: { HashVerificationModal },
  props: {
    status: String,
    tooltipTitle: String,
    iconClass: String,
    colorClass: String,
    componentHashes: Object,
    repositoryHashes: Object,
    repositoryIdentifier: String,
  },
  data() {
    return {
      showHashVerificationModal: false,
    };
  },
};
</script>

<style scoped>
.hash-verification-trigger {
  display: inline-block;
  padding-bottom: 2px;
  border-bottom: 1px dashed currentColor;
  line-height: 1;
}
.hash-verification-trigger:hover {
  text-decoration: none;
  border-bottom-style: solid;
}
</style>
