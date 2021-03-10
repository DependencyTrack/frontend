<template>
  <div>
    <vue2-org-tree
      :data="data"
      :horizontal="true"
      :collapsable="collapsable"
      :label-class-name="labelClassName"
      :render-content="renderContent"
      selected-class-name="bg-tomato"
      selected-key="selectedKey"
      @on-expand="onExpand"
      @on-node-click="onNodeClick"
    />
  </div>
</template>

<script>
import Vue2OrgTree from 'vue2-org-tree'
import permissionsMixin from "../../../mixins/permissionsMixin";

export default {
  mixins: [permissionsMixin],
  components: {
    Vue2OrgTree
  },
  props: {
    project: Object,
    uuid: String
  },
  data() {
    return {
      data: {},
      nodeId: 0,
      expandAll: true,
      horizontal: false,
      collapsable: true
    }
  },
  watch: {
    project: function(newVal, oldVal) {
      if (this.project && this.project.directDependencies) {
        this.$emit('total', 1);
        this.data = {
          id: this.nodeId,
          label: this.createNodeLabel(this.project),
          objectType: "PROJECT",
          children: this.transformDependenciesToOrgTree(JSON.parse(this.project.directDependencies), true)
        }
      } else {
        this.$emit('total', 0);
        this.data = {
          id: this.nodeId,
          label: this.createNodeLabel(this.project),
          objectType: "PROJECT",
        }
      }
    }
  },
  methods: {
    transformDependenciesToOrgTree: function(dependencies, getChildren) {
      let children = null;
      if (dependencies && dependencies.length > 0) {
        children = [];
        for(let i = 0; i < dependencies.length; i++) {
          let dependency = dependencies[i]
          let childNode = this.transformDependencyToOrgTree(dependency);
          if (getChildren === true) {
            this.getChildrenFromDependency(childNode, dependency);
          }
          children.push(childNode);
        }
      }
      return children;
    },
    transformDependencyToOrgTree: function(dependency) {
      this.nodeId++;
      return {
        id: this.nodeId,
        label: this.createNodeLabel(dependency),
        objectType: dependency.objectType
      }
    },
    getChildrenFromDependency: function(treeNode, dependency) {
      let dependencyFunc = async() => {
        let url = this.getDependencyUrl(dependency);
        let response = await this.axios.get(url);
        let data = response.data;
        if (data && data.directDependencies) {
          treeNode.children = this.transformDependenciesToOrgTree(JSON.parse(data.directDependencies), false);
        }
      }
      return dependencyFunc();
    },
    getDependencyUrl(dependency) {
      if (dependency.objectType === "COMPONENT") {
        return `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${dependency.uuid}`;
      } else {
        return `${this.$api.BASE_URL}/${this.$api.URL_SERVICE}/${dependency.uuid}`;
      }
    },
    createNodeLabel: function(identity) { // could be a project or a component
      if (identity.purlCoordinates) {
        return identity.purlCoordinates;
      } else if (identity.purl) {
        return identity.purl;
      } else {
        let label = "";
        if (identity.groupId) {
          label += identity.groupId + " ";
        }
        if (identity.name) {
          label += identity.name;
        }
        if (identity.version) {
          label += " " + identity.version;
        }
        return label;
      }
    },
    labelClassName: function(data) {
      return 'clickable-node'
    },
    renderContent: function(h, data) {
      return data.label
    },
    onExpand: function(e, data) {
      if ('expand' in data) {
        data.expand = !data.expand
        if (!data.expand && data.children) {
          this.collapse(data.children)
        }
      } else {
        this.$set(data, 'expand', true)
      }
    },
    onNodeClick: function(e, data) {
      //console.log('onNodeClick: %o', data)
      this.$set(data, 'selectedKey', !data.selectedKey)
      if (data.type === 'component') {
        this.$router.replace({ path: "/components/" + data.uuid });
      } else if (data.type === 'service') {
        this.$router.replace({ path: "/services/" + data.uuid });
      }
    },
    collapse: function(list) {
      var _this = this
      list.forEach(function(child) {
        if (child.expand) {
          child.expand = false
        }
        child.children && _this.collapse(child.children)
      })
    },
    expandChange: function() {
      this.toggleExpand(this.data, this.expandAll)
    },
    toggleExpand: function(data, val) {
      var _this = this
      if (Array.isArray(data)) {
        data.forEach(function(item){
          _this.$set(item, 'expand', val)
          if (item.children) {
            _this.toggleExpand(item.children, val)
          }
        })
      } else {
        this.$set(data, 'expand', val)
        if (data.children) {
          _this.toggleExpand(data.children, val)
        }
      }
    }
  }
};
</script>

<style lang="scss">
  @import "~vue2-org-tree/dist/style.css";
  .org-tree-container {
    background-color: inherit;
  }
  .org-tree-node-label .org-tree-node-label-inner {
    border: 1px solid #20a8d8;
  }
  .org-tree-node-label:hover {
    cursor: pointer;
  }
  .org-tree-node-btn {
    background-color: #105770;
    color: #ffffff;
    border: none;
  }
  .org-tree-node-btn:hover {
    background-color: #20a8d8;
  }
  .horizontal .org-tree-node:not(:only-child):after {
    border-top: 1px solid #20a8d8;
  }
  .horizontal .org-tree-node:not(:first-child):before, .horizontal .org-tree-node:not(:last-child):after {
    border-left: 1px solid #20a8d8;
  }
  .horizontal .org-tree-node-children:before {
    border-top: 1px solid #20a8d8;
  }
  .horizontal.collapsable .org-tree-node.collapsed .org-tree-node-label:after {
    border-bottom: 1px solid #20a8d8;
  }
</style>
