export default {
  methods: {
    setSearchTextQuery (searchText) {
      let queries = JSON.parse(JSON.stringify(this.$route.query));
      if (searchText === '') {
        delete queries.searchText;
      } else {
        queries.searchText = searchText;
      }
      this.$router.replace({query: queries});
    }
  }
}
