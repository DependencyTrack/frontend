<template>
  <div class="animated fadeIn">
    <portfolio-widget-row/>
    <BootstrapTable ref="table" :columns="columns" :data="data" :options="options"></BootstrapTable>
  </div>
</template>

<script>
  import PortfolioWidgetRow from "../../dashboard/PortfolioWidgetRow";

  export default {
    components: {
      PortfolioWidgetRow
    },
    data () {
      return {
        columns: [
          {
            title: 'Project Name',
            field: 'name'
          },
          {
            title: 'Version',
            field: 'version',
          },
          {
            title: 'Last BOM Import',
            field: 'lastImported',
          },
          {
            title: 'BOM Format',
            field: 'bomFormat',
          },
          {
            title: 'Risk Score',
            field: 'riskScore',
          },
          {
            title: 'Active',
            field: 'active',
          },
          {
            title: 'Vulnerabilities',
            field: 'vulnerabilities',
          }
        ],
        data: [
          {
            id: 1,
            name: 'Item 1',
            price: '$1'
          },
          {
            id: 2,
            name: 'Item 2',
            price: '$2'
          },
          {
            id: 3,
            name: 'Item 3',
            price: '$3'
          },
          {
            id: 4,
            name: 'Item 4',
            price: '$4'
          },
          {
            id: 5,
            name: 'Item 5',
            price: '$5'
          }
        ],
        options: {
          search: true,
          showColumns: true
        }
      }
    }
  }
</script>
