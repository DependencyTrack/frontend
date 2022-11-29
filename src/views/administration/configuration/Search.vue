<template>
  <b-card no-body :header="header">
    <b-card-body>
      <p>{{ $t('admin.reindex_description') }}</p>
      <br/>
      <c-switch id="project" color="primary" v-model="type.project" label v-bind="labelIcon" />{{$t('admin.reindex_projects')}}
      <br/>
      <c-switch id="component" color="primary" v-model="type.component" label v-bind="labelIcon" />{{$t('admin.reindex_components')}}
      <br/>
      <c-switch id="vulnerability" color="primary" v-model="type.vulnerability" label v-bind="labelIcon" />{{$t('admin.reindex_vulnerabilities')}}
      <br/>
      <c-switch id="vulnerablesoftware" color="primary" v-model="type.vulnerablesoftware" label v-bind="labelIcon" />{{$t('admin.reindex_vulnerable_software')}}
      <br/>
      <c-switch id="servicecomponent" color="primary" v-model="type.servicecomponent" label v-bind="labelIcon" />{{$t('admin.reindex_service_components')}}
      <br/>
      <c-switch id="license" color="primary" v-model="type.license" label v-bind="labelIcon" />{{$t('admin.reindex_licenses')}}
      <br/>
      <c-switch id="cpe" color="primary" v-model="type.cpe" label v-bind="labelIcon" />{{$t('admin.reindex_cpes')}}
      <br/>
    </b-card-body>
    <b-card-footer>
      <b-button size="md" class="px-4" variant="outline-primary" @click="reindex">{{ $t('message.reindex') }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
  import { Switch as cSwitch } from '@coreui/vue';

  export default {
    props: {
      header: String
    },
    components: {
      cSwitch,
    },
    data() {
      return {
        type: {
          project: false,
          component: false,
          vulnerability: false,
          vulnerablesofware: false,
          license: false,
          cpe: false,
          servicecomponent:false
        },
        labelIcon: {
          dataOn: '\u2713',
          dataOff: '\u2715'
        }
      }
    },
    methods: {
      reindex: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_SEARCH}/reindex`;
        let params = new URLSearchParams();
        Object.entries(this.type).forEach(([key, value]) => {
          if(value) {
            params.append('type', key.toUpperCase());
          }
        });
        this.axios.post(url, null, { params: params }).then((response) => {
          this.$toastr.s(this.$t('admin.reindex_submitted'));
        }).catch((error) => {
          this.$toastr.s(this.$t('admin.reindex_error'));
        });
      }
    }
  }
</script>
