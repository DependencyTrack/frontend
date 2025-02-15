<template>
  <repositories type="GEM" :header="header" />
</template>

<script>
import Repositories from './Repositories';

export default {
  components: {
    Repositories,
  },
  props: {
    header: String,
  },
};
</script>
