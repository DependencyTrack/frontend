<template>
  <div>
    <span><i class="fa fa-link text-muted" v-b-tooltip.hover="{title: $t('message.external_references')}"></i></span>
    <ol style="display: inline-block; margin: 0; list-style-type: none; padding-inline-start: 0">
      <li class="dropdown">
        <a href="#" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="fa fa-caret-down" aria-hidden="true" style="padding-left:10px; padding-right:10px; padding-top:3px; padding-bottom:3px;"></i></a>
        <ul class="dropdown-menu">
          <span v-for="r in externalReferences" :key="r.url">
            <b-dropdown-item target="_blank" :href="r.url" v-b-tooltip.hover="{placement: 'left', title: r.url}">
              <i class="fa fa-external-link text-muted"></i>&nbsp;
              <span v-if="typeAcronyms.includes(r.type)" class="text-uppercase">{{ r.type }}</span>
              <span v-else class="text-capitalize">{{ r.type }}</span>
            </b-dropdown-item>
          </span>
        </ul>
      </li>
    </ol>
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
