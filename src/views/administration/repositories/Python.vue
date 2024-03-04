<template>
  <repositories type="PYPI" :header="header" />
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
