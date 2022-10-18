<template>
  <div style="overflow-x: hidden; overflow-y: hidden; cursor: grab" @mousedown="mouseDownHandler">
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

let pos = { top: 0, left: 0, x: 0, y: 0};

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
          children: this.transformDependenciesToOrgTree(JSON.parse(this.project.directDependencies), true, {gatheredKeys: []}),
          fetchedChildren: true
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
    mouseDownHandler: function (event) {
      if (event.button === 0 && !event.target.classList.contains("clickable-node") && !event.target.classList.contains("org-tree-node-btn")){
        this.$el.style.cursor = "grabbing";
        this.$el.style.userSelect = 'none';
        pos = {
          left: this.$el.scrollLeft,
          top: document.documentElement.scrollTop,
          x: event.clientX,
          y: event.clientY,
        }
        document.addEventListener('mousemove', this.mouseMoveHandler)
        document.addEventListener("mouseup", this.mouseUpHandler)
      } else if (event.button === 1) {
        this.$el.style.cursor = "default";
        this.$el.style.userSelect = 'none';
        pos = {
          left: this.$el.scrollLeft,
          top: document.documentElement.scrollTop,
          x: event.clientX,
          y: event.clientY,
        }
        console.log("pos: %o", pos)
        document.addEventListener('mousemove', this.mouseMoveHandlerMiddleMouseButton)
        document.addEventListener("mouseup", this.mouseUpHandler)
      }
    },
    mouseMoveHandler: function (event) {
      const dx = event.clientX - pos.x
      const dy = event.clientY - pos.y

      document.documentElement.scrollTop = pos.top - dy
      this.$el.scrollLeft = pos.left - dx
    },
    mouseMoveHandlerMiddleMouseButton: function (event) {
      const dx = event.clientX - pos.x

      this.$el.scrollLeft = pos.left + dx
    },
    mouseUpHandler: function (event) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
      document.removeEventListener('mousemove', this.mouseMoveHandlerMiddleMouseButton)
      document.removeEventListener('mouseup', this.mouseUpHandler);

      this.$el.style.cursor = 'grab';
      this.$el.style.removeProperty('user-select');
    },
    transformDependenciesToOrgTree: function(dependencies, getChildren, treeNode) {
      let children = null;
      if (dependencies && dependencies.length > 0) {
        children = [];
        for(let i = 0; i < dependencies.length; i++) {
          let dependency = dependencies[i]
          let childNode = this.transformDependencyToOrgTree(dependency);
          for (const gatheredKey of treeNode.gatheredKeys){
            childNode.gatheredKeys.push(gatheredKey)
          }
          childNode.gatheredKeys.push(childNode.label)
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
        objectType: dependency.objectType,
        uuid: dependency.uuid,
        fetchedChildren: false,
        gatheredKeys: []
      }
    },
    getChildrenFromDependency: function(treeNode, dependency) {
      let dependencyFunc = async() => {
        let url = this.getDependencyUrl(dependency);
        let response = await this.axios.get(url);
        let data = response.data;
        if (data && data.directDependencies) {
          let jsonObject = JSON.parse(data.directDependencies)
          for (let i = 0; i < jsonObject.length; i++){
            if (treeNode.gatheredKeys.some(gatheredKey => gatheredKey === jsonObject[i].purl)){
              jsonObject.splice(i, 1)
            }
          }
          this.$set(treeNode, 'children', this.transformDependenciesToOrgTree(jsonObject, false, treeNode) )
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
    onExpand: async function (e, data) {
      if ('expand' in data) {
        data.expand = !data.expand
        if (!data.expand && data.children) {
          this.collapse(data.children)
        }
      } else {
        if (!data.fetchedChildren) {
          e.target.style.cursor = "wait"
          for (const child of data.children) {
            await this.getChildrenFromDependency(child, child)
          }
          data.fetchedChildren = true
        }
        e.target.style.cursor = "pointer"
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
    padding: 1px 2.5px;
    font-size: 0.675rem;
  }
  .org-tree-node-label:hover {
    cursor: pointer;
  }
  .org-tree-node-btn {
    background-color: #105770;
    color: #ffffff;
    border: none;
    pointer-events: initial;
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
  // Fixes white line instead of blue line to only-child nodes
  .horizontal .org-tree-node:only-child:before {
    border-bottom-color: #20a8d8;
  }
  // Horizontal line to a node
  .horizontal .org-tree-node:after, .horizontal .org-tree-node:before, .horizontal .org-tree-node.is-leaf:before, .org-tree-node.is-leaf:after {
    width: 10px;
    height: 50%;
  }
  // Horizontal line from a node
  .horizontal .org-tree-node-children {
    padding-left: 10px;
  }
  .horizontal.collapsable .org-tree-node.collapsed .org-tree-node-label:after, .horizontal .org-tree-node-children:before {
    width: 10px;
  }
  // Margin between nodes
  .horizontal .org-tree-node, .horizontal .org-tree-node.collapsed, .horizontal .org-tree-node.is-leaf {
    padding: 0;
  }
  .horizontal .org-tree-node-label {
    padding: 5px 0px 5px 10px
  }
  // Button size and position
  .horizontal .org-tree-node-btn {
    width: 14px;
    height: 14px;
    margin: -7px 0px 0px 2.85px;
  }
  // Inner button vertical line
  .org-tree-node-btn:before {
    left: 3px;
    right: 3px;
    top: 50%;
  }
  // Inner button horizontal line
  .org-tree-node-btn:after {
    top: 3px;
    bottom: 3px;
    left: 50%;
  }
  // Fix wrong pointer
  .org-tree-node-label:hover {
    cursor: default;
  }
  .org-tree-node-label .org-tree-node-label-inner {
    cursor: pointer;
  }
  // Enable dragging nodes without scrolling by dragging
  .org-tree-node-label-inner {
    pointer-events: initial;
  }
  // Enable scrolling by dragging in empty space between nodes
  .org-tree-node-label {
    pointer-events: none;
  }
</style>
