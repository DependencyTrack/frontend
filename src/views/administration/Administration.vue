<template>
  <div class="animated fadeIn">

    <b-row>
      <b-col xs="6" sm="4" md="2">
        <admin-menu />
      </b-col>
      <b-col xs="6" sm="8" md="10">
        Content here
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import AdminMenu from './AdminMenu'
  export default {
    components: {
      AdminMenu
    }
  }
</script>

