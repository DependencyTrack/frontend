<template>
  <div style="text-align: center; font-size: xxx-large" v-if="this.loading">
    Loading, please wait...
  </div>
  <div v-else style="overflow-x: hidden; overflow-y: hidden; cursor: grab" @mousedown="mouseDownHandler">
    <span v-if="this.$route.params.componentUuid && this.$route.params.componentUuid.length > 0 && this.project.directDependencies && this.project.directDependencies.length > 0 && !this.notFound">
      <c-switch style="margin-left:1.5rem; margin-right:.5rem" id="showCompleteGraph" color="primary" v-model="showCompleteGraph" label v-bind="labelIcon" />
      <span class="text-muted">{{ $t('message.show_complete_graph') }}</span><br>
    </span>
    <c-switch style="margin-left:1.5rem; margin-right:.5rem" id="fetchRepositoryMetaData" color="primary" v-model="fetchRepositoryMetaData" label v-bind="labelIcon" />
    <span class="text-muted">{{$t('message.show_update_information')}}</span><br>
    <span v-if="this.notFound">
      <span class="text-muted">{{ $t('message.not_found_in_dependency_graph') }}</span><br>
    </span>
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
import xssFilters from "xss-filters";
import { Switch as cSwitch } from '@coreui/vue';
let pos = { top: 0, left: 0, x: 0, y: 0};

export default {
  mixins: [permissionsMixin],
  components: {
    Vue2OrgTree,
    cSwitch
  },
  props: {
    project: Object,
    uuid: String
  },
  data() {
    return {
      data: {},
      response: Object,
      nodeId: 0,
      expandAll: true,
      horizontal: false,
      collapsable: true,
      pos: { top: 0, left: 0, x: 0, y: 0},
      loading: false,
      showCompleteGraph: false,
      notFound: false,
      fetchRepositoryMetaData: false,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715'
      },
    }
  },
  watch: {
    project: async function (newVal, oldVal) {
      if (this.$route.params.componentUuid) {
        if (this.project && this.project.directDependencies) {
          this.$emit('total', 1);
          this.loading = true
          let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/project/${this.project.uuid}/dependencyGraph/${this.$route.params.componentUuid}`
          this.axios.get(url).then(response => {
            if (response.data && Object.keys(response.data).length > 0){
              this.showCompleteGraph = false
              this.notFound = false
              this.response = response
              this.data = {
                id: this.nodeId,
                label: this.createNodeLabel(this.project),
                objectType: "PROJECT",
                children: this.transformDependenciesToOrgTreeWithSearchedDependency(this.response.data, {gatheredKeys: []}, true),
                fetchedChildren: true,
                expand: true
              }
              this.loading = false
            } else {
              this.$route.query.dependencyGraph = null
              this.notFound = true
              this.data = {
                id: this.nodeId,
                label: this.createNodeLabel(this.project),
                objectType: "PROJECT",
                children: this.transformDependenciesToOrgTree(JSON.parse(this.project.directDependencies), true, {gatheredKeys: []}),
                fetchedChildren: true
              }
              this.loading = false
            }
          })
        } else {
          this.$emit('total', 0);
          this.data = {
            id: this.nodeId,
            label: this.createNodeLabel(this.project),
            objectType: "PROJECT",
          }
        }
      } else {
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
    showCompleteGraph: function () {
      if (this.showCompleteGraph) {
        this.data = {
          id: this.nodeId,
          label: this.createNodeLabel(this.project),
          objectType: "PROJECT",
          children: this.transformDependenciesToOrgTreeWithSearchedDependency(this.response.data, {gatheredKeys: []}, false),
          fetchedChildren: true,
          expand: true
        }
        new Promise(resolve => setTimeout(resolve, 50)).then(() => {
          document.getElementsByClassName("searched").item(0).scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "center"
          })
        })
      } else {
        this.data = {
          id: this.nodeId,
          label: this.createNodeLabel(this.project),
          objectType: "PROJECT",
          children: this.transformDependenciesToOrgTreeWithSearchedDependency(this.response.data, {gatheredKeys: []}, true),
          fetchedChildren: true,
          expand: true
        }
      }
    }
  },
  methods: {
    mouseDownHandler: function (event) {
      if (event.button === 0 && !event.target.classList.contains("clickable-node") && !event.target.classList.contains("org-tree-node-btn")){
        this.$el.style.cursor = "grabbing";
        this.$el.style.userSelect = 'none';
        this.pos = {
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
        this.pos = {
          left: this.$el.scrollLeft,
          top: document.documentElement.scrollTop,
          x: event.clientX,
          y: event.clientY,
        }
        document.addEventListener('mousemove', this.mouseMoveHandlerMiddleMouseButton)
        document.addEventListener("mouseup", this.mouseUpHandler)
      }
    },
    mouseMoveHandler: function (event) {
      const dx = event.clientX - this.pos.x
      const dy = event.clientY - this.pos.y

      document.documentElement.scrollTop = this.pos.top - dy
      this.$el.scrollLeft = this.pos.left - dx
    },
    mouseMoveHandlerMiddleMouseButton: function (event) {
      const dx = event.clientX - this.pos.x

      this.$el.scrollLeft = this.pos.left + dx
    },
    mouseUpHandler: function () {
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
          for (const gatheredKey of treeNode.gatheredKeys) {
            childNode.gatheredKeys.push(gatheredKey)
          }
          if (!childNode.gatheredKeys.some(gatheredKey => gatheredKey === childNode.label)) {
            childNode.gatheredKeys.push(childNode.label)
            if (getChildren === true) {
              this.getChildrenFromDependency(childNode, dependency);
            }
            children.push(childNode);
          }
        }
      }
      return children;
    },
    transformDependenciesToOrgTreeWithSearchedDependency: function (dependencies, treeNode, onlySearched) {
      let children = []
      let directDependencies = JSON.parse(this.project.directDependencies)
      directDependencies.forEach((directDependency) => {
        if (dependencies[directDependency.uuid] && (!onlySearched || (onlySearched && (dependencies[directDependency.uuid].expandDependencyGraph || directDependency.uuid === this.$route.params.componentUuid)))) {
          let childNode = this.transformDependencyToOrgTreeWithSearchedDependency(dependencies[directDependency.uuid])
          childNode.gatheredKeys.push(childNode.label)
          children.push(childNode)
          if (onlySearched && directDependency.uuid === this.$route.params.componentUuid) {
            this.$set(childNode, 'children', this.getChildrenFromDependencyWithSearchedDependency(dependencies, dependencies[directDependency.uuid], childNode, false))
          } else {
            this.$set(childNode, 'children', this.getChildrenFromDependencyWithSearchedDependency(dependencies, dependencies[directDependency.uuid], childNode, onlySearched))
          }
        }
      })
      return children
    },
    getChildrenFromDependencyWithSearchedDependency: function (dependencies, component, treeNode, onlySearched) {
      let children = []
      if (component.dependencyGraph) {
        component.dependencyGraph.forEach((dependency) => {
          if (dependencies[dependency] && (!onlySearched || (onlySearched && (dependencies[dependency].expandDependencyGraph || dependency === this.$route.params.componentUuid)))) {
            let childNode = this.transformDependencyToOrgTreeWithSearchedDependency(dependencies[dependency])
            for (const gatheredKey of treeNode.gatheredKeys) {
              childNode.gatheredKeys.push(gatheredKey)
            }
            if (!childNode.gatheredKeys.some(gatheredKey => gatheredKey === childNode.label)) {
              childNode.gatheredKeys.push(childNode.label)
              children.push(childNode)
              if (onlySearched && dependency === this.$route.params.componentUuid) {
                this.$set(childNode, 'children', this.getChildrenFromDependencyWithSearchedDependency(dependencies, dependencies[dependency], childNode, false))
                this.collapse(childNode.children)
              } else {
                this.$set(childNode, 'children', this.getChildrenFromDependencyWithSearchedDependency(dependencies, dependencies[dependency], childNode, onlySearched))
              }
            }
          }
        })
      }
      return children
    },
    transformDependencyToOrgTree: function(dependency) {
      this.nodeId++;
      return {
        id: this.nodeId,
        label: this.createNodeLabel(dependency),
        version: dependency.version,
        objectType: dependency.objectType,
        uuid: dependency.uuid,
        fetchedChildren: false,
        gatheredKeys: []
      }
    },
    transformDependencyToOrgTreeWithSearchedDependency: function(dependency) {
      this.nodeId++;
      return {
        id: this.nodeId,
        label: this.createNodeLabel(dependency),
        objectType: "COMPONENT",
        uuid: dependency.uuid,
        fetchedChildren: dependency.expandDependencyGraph,
        gatheredKeys: [],
        expand: dependency.expandDependencyGraph
      }
    },
    getChildrenFromDependency: function(treeNode, dependency) {
      let dependencyFunc = async() => {
        let url = this.getDependencyUrl(dependency);
        let response = await this.axios.get(url);
        let data = response.data;
        treeNode.repositoryMeta = data.repositoryMeta
        if (data && data.directDependencies) {
          let jsonObject = JSON.parse(data.directDependencies)
          this.$set(treeNode, 'children', this.transformDependenciesToOrgTree(jsonObject, false, treeNode) )
        }
      }
      return dependencyFunc();
    },
    getDependencyUrl(dependency) {
      if (dependency.objectType === "COMPONENT") {
        return `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${dependency.uuid}?includeRepositoryMetaData=true`;
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
      if (this.$route.params.componentUuid && data.uuid === this.$route.params.componentUuid) {
        return 'clickable-node searched'
      } else {
        return 'clickable-node'
      }
    },
    renderContent: function(h, data) {
      if (this.fetchRepositoryMetaData && data.repositoryMeta && data.repositoryMeta.latestVersion && data.repositoryMeta.latestVersion !== data.version) {
        return (<div style="white-space: nowrap;">{data.label + ' '}<i id={"icon"+data.id} class="fa fa-exclamation-triangle status-warning" aria-hidden="true"></i><b-tooltip target={"icon"+data.id} triggers="hover" noninteractive="noninteractive">{"Risk: Outdated component. Current version is: "+ xssFilters.inHTMLData(data.repositoryMeta.latestVersion)}</b-tooltip></div>)
      } else {
        return (<div>{data.label}</div>)
      }
    },
    onExpand: async function (e, data) {
      if (!data.fetchedChildren) {
        e.target.style.cursor = "wait"
        for (const child of data.children) {
          await this.getChildrenFromDependency(child, child)
        }
        data.fetchedChildren = true
        e.target.style.cursor = "pointer"
        this.$set(data, 'expand', true)
    } else {
        if ('expand' in data) {
          data.expand = !data.expand
          if (!data.expand && data.children) {
            this.collapse(data.children)
          }
        } else {
          this.$set(data, 'expand', true)
        }
      }
    },
    onNodeClick: function(e, data) {
      //console.log('onNodeClick: %o', data)
      this.$set(data, 'selectedKey', !data.selectedKey)
      if (data.objectType === 'COMPONENT') {
        this.$router.push({ path: "/components/" + data.uuid });
      } else if (data.objectType === 'SERVICE') {
        this.$router.push({ path: "/services/" + data.uuid });
      }
    },
    collapse: function(list) {
      var _this = this
      list.forEach(function(child) {
        if (child.expand) {
          child.expand = false
        }
        child.fetchedChildren = false
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
    width: 17px;
    height: 17px;
    margin: -9px 0px 0px 1.5px;
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
  .org-tree-node-label-inner.clickable-node.searched {
    border: 2.5px solid #4dbd74;
    font-weight: bold;
  }
</style>
