export default {
  data() {
    return {
      availableCollectionLogics: [
        {
          value: 'AGGREGATE_DIRECT_CHILDREN',
          text: this.$t(
            'message.project_collection_logic_aggregate_direct_children',
          ),
        },
        {
          value: 'AGGREGATE_DIRECT_CHILDREN_WITH_TAG',
          text: this.$t(
            'message.project_collection_logic_aggregate_direct_children_with_tag',
          ),
        },
        {
          value: 'AGGREGATE_LATEST_VERSION_CHILDREN',
          text: this.$t(
            'message.project_collection_logic_latest_version_children',
          ),
        },
      ],
    };
  },
};
