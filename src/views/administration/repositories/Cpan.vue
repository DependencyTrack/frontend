<template>
  <repositories type="CPAN" :header="header" />
</template>

<script>
import Repositories from './Repositories.vue';
export default {
  props: {
    header: String,
  },
  components: {
    Repositories,
  },
};
</script>
