<template>
  <repositories type="GO_MODULES" :header="header" />
</template>

<script>
import Repositories from './Repositories';
export default {
  props: {
    header: String,
  },
  components: {
    Repositories,
  },
};
</script>
