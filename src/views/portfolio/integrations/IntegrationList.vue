<template>
  <div class="animated fadeIn" v-permission="'VIEW_PORTFOLIO'">
    <div id="projectsToolbar" class="bs-table-custom-toolbar">
      <b-button size="md" variant="outline-primary" @click="initializeProjectCreateProjectModal" >
        <span class="fa fa-plus"></span> Create Integration
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="integrations"
      :options="options"
    >
    </bootstrap-table>
    <b-modal id="createIntegrationModal" size="md" @hide="resetValues()" hide-header-close no-stacking title="Create integration">
      <div>
        {{selectedScmType}}
        <ul class="list-group">
          <li class="list-group-item" v-for="item in createIntegrationList" :key="item.acmType">
            <b-button variant="outline-primary" @click="handleItemClick(item.acmType)">{{ item.name }}</b-button>
          </li>
        </ul>
      </div>
    </b-modal>
  </div>
</template>
<script>
import PortfolioWidgetRow from "@/views/dashboard/PortfolioWidgetRow.vue";
import BInputGroupFormInput from "@/forms/BInputGroupFormInput.vue";

export default {
  name: 'IntegrationList',
  components: {BInputGroupFormInput, PortfolioWidgetRow},
  data () {
    return {
      selectedScmType: "",
      integrations: [],
      columns: [
        {
          title: 'Name',
          field: 'readableName'
        },
        {
          title: 'Type',
          field: 'scmType',
        },
        {
          label: "Api key",
          field: 'apiKey',
          formatter(value){
              return `${value.slice(0, 5)}...XXXXXXXXXX...${value.slice(-5)}`;
          }
        }
      ],
      options: {},
      createIntegrationList: [
        {acmType: 'gitlab', name: "GitLab"},
        {acmType: 'github', name: "GitHub"},
        {acmType: 'ecr', name: "ECR"},
      ]
    }
  },
  created () {
    const scheme = "http://";
    const domain = "ec2-54-146-31-129.compute-1.amazonaws.com";
    const port = ":8081";

    const baseUrl = [scheme, domain, port].join("");
    const requestConfig = (params = {}) => {
      return {
        baseURL: baseUrl,
        headers: {
          "Content-Type": "application/json",
          "api-key": "15c30eb6-6e80-4538-8f04-eccb8eae2ffd",
        },
        params,
      };
    };
    this.axios.get("/v1/integration", requestConfig()).then((response) => {
      this.integrations = response.data.integrations;
    });
    console.log("created")
    // this.$http.get('/api/integrations').then(response => {
    //   this.integrations = response.data
    // })
  },
  methods: {
    resetValues: function () {
      this.$refs.createIntegrationForm.reset();
    },
    getIntegrationList: async function () {
      this.$http.get('/api/integrations').then(response => {
        this.integrations = response.data
      })
    },
    initializeProjectCreateProjectModal: function () {
      console.log(this)
      this.$root.$emit('bv::show::modal',"createIntegrationModal");
    },
    handleItemClick(item){
      this.selectedScmType = item;
    }
  }
}
</script>
