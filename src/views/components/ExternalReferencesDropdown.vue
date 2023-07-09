<template>
  <div>
    <b-dropdown size="sm" right>
      <template #button-content>
        <span><i class="fa fa-link" v-b-tooltip.hover="{title: $t('message.external_references')}"></i></span>
      </template>
      <b-dropdown-item
        v-for="r in externalReferences" :key="r.url"
        target="_blank" :href="r.url" v-b-tooltip.hover="{placement: 'left', title: r.url}"
      >
        <i class="fa fa-external-link text-muted"></i>&nbsp;
        <span v-if="typeAcronyms.includes(r.type)" class="text-uppercase">{{ r.type }}</span>
        <span v-else class="text-capitalize">{{ r.type }}</span>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
  export default {
    props: {
      externalReferences: Object
    },
    data() {
      return {
        // acronyms should be shown as uppercase letters, other types just be capitalized
        typeAcronyms: ['bom', 'poam', 'vcs']
      }
    }
  }
</script>
