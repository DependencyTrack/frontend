<template>
  <project-list :parentProject="this.project" :uuid="this.uuid"></project-list>
</template>

<script>
import ProjectList from "@/views/portfolio/projects/ProjectList.vue";

export default {
  components: {
    ProjectList
  },
  props: {
    uuid: String,
    project: Object,
  }
};
</script>
