<template>
  <div style="text-align: center; font-size: xxx-large" v-if="this.loading">
    Loading, please wait...
  </div>
  <div
    v-else
    style="overflow-x: hidden; overflow-y: hidden; cursor: grab"
    @mousedown="mouseDownHandler"
  >
    <span
      v-if="
        this.$route.params.componentUuids &&
        this.$route.params.componentUuids.length > 0 &&
        this.project.directDependencies &&
        this.project.directDependencies.length > 0 &&
        !this.notFound
      "
    >
      <c-switch
        style="margin-left: 1.5rem; margin-right: 0.5rem"
        id="showCompleteGraph"
        color="primary"
        v-model="showCompleteGraph"
        label
        v-bind="labelIcon"
      />
      <span class="text-muted">{{ $t('message.show_complete_graph') }}</span>
    </span>
    <c-switch
      style="margin-left: 1.5rem; margin-right: 0.5rem"
      id="highlightOutdatedComponents"
      color="primary"
      v-model="highlightOutdatedComponents"
      label
      v-bind="labelIcon"
    />
    <span class="text-muted">{{ $t('message.show_update_information') }}</span
    ><br />
    <span v-if="this.notFound">
      <span class="text-muted">{{
        $t('message.not_found_in_dependency_graph')
      }}</span
      ><br />
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
import Vue2OrgTree from 'vue2-org-tree';
import permissionsMixin from '../../../mixins/permissionsMixin';
import xssFilters from 'xss-filters';
import { Switch as cSwitch } from '@coreui/vue';
let pos = { top: 0, left: 0, x: 0, y: 0 };

export default {
  mixins: [permissionsMixin],
  components: {
    Vue2OrgTree,
    cSwitch,
  },
  props: {
    project: Object,
    uuid: String,
  },
  beforeCreate() {
    this.highlightOutdatedComponents =
      localStorage &&
      localStorage.getItem(
        'ProjectDependencyGraphHighlightOutdatedComponents',
      ) !== null
        ? localStorage.getItem(
            'ProjectDependencyGraphHighlightOutdatedComponents',
          ) === 'true'
        : false;
    this.showCompleteGraph =
      localStorage &&
      localStorage.getItem('ProjectDependencyGraphShowCompleteGraph') !== null
        ? localStorage.getItem('ProjectDependencyGraphShowCompleteGraph') ===
          'true'
        : false;
  },
  data() {
    return {
      data: {},
      response: Object,
      nodeId: 0,
      expandAll: true,
      horizontal: false,
      collapsable: true,
      pos: { top: 0, left: 0, x: 0, y: 0 },
      loading: false,
      showCompleteGraph: this.showCompleteGraph,
      notFound: false,
      highlightOutdatedComponents: this.highlightOutdatedComponents,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      searchedComponentUuids: {},
    };
  },
  watch: {
    project: async function (newVal, oldVal) {
      // prepare base object
      const data = {
        id: this.nodeId,
        label: this.createNodeLabel(this.project),
        objectType: 'PROJECT',
      };
      // do not assign data to this.data yet, otherwise tree breaks :(

      // project has no tree data
      if (!this.project || !this.project.directDependencies) {
        this.$emit('total', 0);
        this.data = data;
        return;
      }

      // tree available, populate common info
      this.$emit('total', 1);
      data.fetchedChildren = true;

      // full tree, not searching components
      if (!this.$route.params.componentUuids) {
        data.children = this.transformDependenciesToOrgTree(
          JSON.parse(this.project.directDependencies),
          true,
          { gatheredKeys: [] },
          this.project.uuid,
          'PROJECT',
        );
        this.data = data;
        return;
      }

      // tree with component search active
      this.createSearchedComponentLookupTable(
        this.$route.params.componentUuids,
      );
      this.loading = true;
      let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/project/${this.project.uuid}/dependencyGraph/${encodeURIComponent(this.$route.params.componentUuids)}`;
      this.axios.get(url).then((response) => {
        if (response.data && Object.keys(response.data).length > 0) {
          this.notFound = false;
          this.response = response;

          data.children =
            this.transformDependenciesToOrgTreeWithSearchedDependency(
              this.response.data,
              { gatheredKeys: [] },
              !this.showCompleteGraph,
            );
          data.expand = true;
          this.data = data;

          this.loading = false;
          new Promise((resolve) => setTimeout(resolve, 50)).then(() => {
            const firstSearched = document
              .getElementsByClassName('searched')
              .item(0);
            firstSearched &&
              firstSearched.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'center',
              });
            !firstSearched &&
              console.warn('Failed to locate first searched component in tree');
          });
        } else {
          this.$route.query.dependencyGraph = null;
          this.notFound = true;
          data.children = this.transformDependenciesToOrgTree(
            JSON.parse(this.project.directDependencies),
            true,
            { gatheredKeys: [] },
            this.project.uuid,
            'PROJECT',
          );
          this.loading = false;

          this.data = data;
        }
      });
    },
    showCompleteGraph: function () {
      if (this.$route.params.componentUuids && localStorage) {
        localStorage.setItem(
          'ProjectDependencyGraphShowCompleteGraph',
          this.showCompleteGraph.toString(),
        );
      }
      if (this.showCompleteGraph) {
        this.data = {
          id: this.nodeId,
          label: this.createNodeLabel(this.project),
          objectType: 'PROJECT',
          children: this.transformDependenciesToOrgTreeWithSearchedDependency(
            this.response.data,
            { gatheredKeys: [] },
            false,
          ),
          fetchedChildren: true,
          expand: !!this.$route.params.componentUuids,
        };
        if (this.$route.params.componentUuids) {
          new Promise((resolve) => setTimeout(resolve, 50)).then(() => {
            document.getElementsByClassName('searched').item(0).scrollIntoView({
              behavior: 'smooth',
              inline: 'center',
              block: 'center',
            });
          });
        }
      } else {
        this.data = {
          id: this.nodeId,
          label: this.createNodeLabel(this.project),
          objectType: 'PROJECT',
          children: this.transformDependenciesToOrgTreeWithSearchedDependency(
            this.response.data,
            { gatheredKeys: [] },
            true,
          ),
          fetchedChildren: true,
          expand: true,
        };
      }
    },
    highlightOutdatedComponents: function () {
      if (localStorage) {
        localStorage.setItem(
          'ProjectDependencyGraphHighlightOutdatedComponents',
          this.highlightOutdatedComponents.toString(),
        );
      }
    },
    $route: function (to, from) {
      if (!to.params.componentUuids && from.params.componentUuids) {
        this.showCompleteGraph = true;
        this.collapse(this.data.children);
        this.data.expand = false;
      } else if (to.params.componentUuids && !from.params.componentUuids) {
        this.showCompleteGraph =
          localStorage &&
          localStorage.getItem('ProjectDependencyGraphShowCompleteGraph') !==
            null
            ? localStorage.getItem(
                'ProjectDependencyGraphShowCompleteGraph',
              ) === 'true'
            : false;
      }
      // build map of searched components for later fast lookup
      this.createSearchedComponentLookupTable(to.params.componentUuids);
    },
  },
  methods: {
    mouseDownHandler: function (event) {
      if (
        event.button === 0 &&
        !event.target.classList.contains('clickable-node') &&
        !event.target.classList.contains('org-tree-node-btn')
      ) {
        this.$el.style.cursor = 'grabbing';
        this.$el.style.userSelect = 'none';
        this.pos = {
          left: this.$el.scrollLeft,
          top: document.documentElement.scrollTop,
          x: event.clientX,
          y: event.clientY,
        };
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
      } else if (event.button === 1) {
        this.$el.style.cursor = 'default';
        this.$el.style.userSelect = 'none';
        this.pos = {
          left: this.$el.scrollLeft,
          top: document.documentElement.scrollTop,
          x: event.clientX,
          y: event.clientY,
        };
        document.addEventListener(
          'mousemove',
          this.mouseMoveHandlerMiddleMouseButton,
        );
        document.addEventListener('mouseup', this.mouseUpHandler);
      }
    },
    mouseMoveHandler: function (event) {
      const dx = event.clientX - this.pos.x;
      const dy = event.clientY - this.pos.y;

      document.documentElement.scrollTop = this.pos.top - dy;
      this.$el.scrollLeft = this.pos.left - dx;
    },
    mouseMoveHandlerMiddleMouseButton: function (event) {
      const dx = event.clientX - this.pos.x;

      this.$el.scrollLeft = this.pos.left + dx;
    },
    mouseUpHandler: function () {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
      document.removeEventListener(
        'mousemove',
        this.mouseMoveHandlerMiddleMouseButton,
      );
      document.removeEventListener('mouseup', this.mouseUpHandler);

      this.$el.style.cursor = 'grab';
      this.$el.style.removeProperty('user-select');
    },
    transformDependenciesToOrgTree: function (
      dependencies,
      getChildren,
      treeNode,
      parentUuid,
      objectType,
    ) {
      let children = null;
      if (dependencies && dependencies.length > 0) {
        children = [];
        for (let i = 0; i < dependencies.length; i++) {
          let dependency = dependencies[i];
          let childNode = this.transformDependencyToOrgTree(dependency);
          for (const gatheredKey of treeNode.gatheredKeys) {
            childNode.gatheredKeys.push(gatheredKey);
          }
          if (
            !childNode.gatheredKeys.some(
              (gatheredKey) => gatheredKey === childNode.label,
            )
          ) {
            childNode.gatheredKeys.push(childNode.label);
            children.push(childNode);
          }
        }

        if (getChildren === true) {
          this.getChildrens(children, parentUuid, objectType);
        }
      }
      return children;
    },
    transformDependenciesToOrgTreeWithSearchedDependency: function (
      dependencies,
      treeNode,
      onlySearched,
    ) {
      let children = [];
      if (dependencies) {
        let directDependencies = JSON.parse(this.project.directDependencies);
        directDependencies.forEach((directDependency) => {
          if (
            dependencies[directDependency.uuid] &&
            (!onlySearched ||
              dependencies[directDependency.uuid].expandDependencyGraph ||
              this.searchedComponentUuids[directDependency.uuid])
          ) {
            let childNode = this.transformDependencyToOrgTree(
              dependencies[directDependency.uuid],
            );
            childNode.gatheredKeys.push(childNode.label);
            children.push(childNode);
            if (
              onlySearched &&
              this.searchedComponentUuids[directDependency.uuid]
            ) {
              this.$set(
                childNode,
                'children',
                this.getChildrenFromDependencyWithSearchedDependency(
                  dependencies,
                  dependencies[directDependency.uuid],
                  childNode,
                  false,
                ),
              );
            } else {
              this.$set(
                childNode,
                'children',
                this.getChildrenFromDependencyWithSearchedDependency(
                  dependencies,
                  dependencies[directDependency.uuid],
                  childNode,
                  onlySearched,
                ),
              );
            }
          }
        });
      }
      return children;
    },
    getChildrenFromDependencyWithSearchedDependency: function (
      dependencies,
      component,
      treeNode,
      onlySearched,
    ) {
      let children = [];
      if (component.dependencyGraph) {
        component.dependencyGraph.forEach((dependency) => {
          if (
            dependencies[dependency] &&
            (!onlySearched ||
              dependencies[dependency].expandDependencyGraph ||
              this.searchedComponentUuids[dependency] !== -1)
          ) {
            let childNode = this.transformDependencyToOrgTree(
              dependencies[dependency],
            );
            for (const gatheredKey of treeNode.gatheredKeys) {
              childNode.gatheredKeys.push(gatheredKey);
            }
            if (
              !childNode.gatheredKeys.some(
                (gatheredKey) => gatheredKey === childNode.label,
              )
            ) {
              childNode.gatheredKeys.push(childNode.label);
              children.push(childNode);
              if (onlySearched && this.searchedComponentUuids[dependency]) {
                this.$set(
                  childNode,
                  'children',
                  this.getChildrenFromDependencyWithSearchedDependency(
                    dependencies,
                    dependencies[dependency],
                    childNode,
                    false,
                  ),
                );
                this.collapse(childNode.children);
              } else {
                this.$set(
                  childNode,
                  'children',
                  this.getChildrenFromDependencyWithSearchedDependency(
                    dependencies,
                    dependencies[dependency],
                    childNode,
                    onlySearched,
                  ),
                );
              }
            }
          }
        });
      }
      return children;
    },
    transformDependencyToOrgTree: function (dependency) {
      this.nodeId++;
      return {
        id: this.nodeId,
        label: this.createNodeLabel(dependency),
        version: dependency.version,
        objectType: dependency.objectType || 'COMPONENT',
        uuid: dependency.uuid,
        fetchedChildren: !!dependency.expandDependencyGraph,
        gatheredKeys: [],
        expand: !!dependency.expandDependencyGraph,
        latestVersion:
          dependency.latestVersion || dependency.repositoryMeta?.latestVersion,
      };
    },
    getChildrens: function (treeNodes, parentUuid, objectType) {
      let dependenciesFunc = async () => {
        let url = this.getDependenciesUrl(parentUuid, objectType);

        let treeNodeMap = new Map();

        for (let treeNode of treeNodes) {
          treeNodeMap.set(treeNode.uuid, treeNode);
        }

        let response = await this.axios.get(url);
        let data = response.data;
        let dependencies = [...data];
        if (dependencies.length > 0) {
          for (let dependency of dependencies) {
            if (dependency) {
              let treeNode = treeNodeMap.get(dependency.uuid);
              treeNode.latestVersion = dependency.latestVersion;
              if (dependency.directDependencies) {
                let jsonObject = JSON.parse(dependency.directDependencies);
                this.$set(
                  treeNode,
                  'children',
                  this.transformDependenciesToOrgTree(
                    jsonObject,
                    false,
                    treeNode,
                    dependency.uuid,
                    'COMPONENT',
                  ),
                );
              }
            }
          }
        }
      };
      return dependenciesFunc();
    },
    getDependenciesUrl(parentUuid, objectType) {
      if (objectType === 'PROJECT') {
        return `${this.$api.BASE_URL}/${this.$api.URL_DEPENDENCY_GRAPH}/project/${parentUuid}/directDependencies`;
      } else if (objectType === 'COMPONENT') {
        return `${this.$api.BASE_URL}/${this.$api.URL_DEPENDENCY_GRAPH}/component/${parentUuid}/directDependencies`;
      } else {
        return null;
      }
    },
    createNodeLabel: function (identity) {
      // could be a project or a component
      if (identity.purlCoordinates) {
        return identity.purlCoordinates;
      } else if (identity.purl) {
        return identity.purl;
      } else {
        let label = '';
        if (identity.groupId) {
          label += identity.groupId + ' ';
        }
        if (identity.name) {
          label += identity.name;
        }
        if (identity.version) {
          label += ' ' + identity.version;
        }
        return label;
      }
    },
    labelClassName: function (data) {
      if (
        this.$route.params.componentUuids &&
        this.searchedComponentUuids[data.uuid]
      ) {
        return 'clickable-node searched';
      }
      return 'clickable-node';
    },
    renderContent: function (h, data) {
      if (
        this.highlightOutdatedComponents &&
        data.version &&
        data.latestVersion &&
        data.latestVersion !== data.version
      ) {
        return (
          <div style="white-space: nowrap;">
            {data.label + ' '}
            <i
              id={'icon' + data.id}
              class="fa fa-exclamation-triangle status-warning"
              aria-hidden="true"
            ></i>
            <b-tooltip
              target={'icon' + data.id}
              triggers="hover"
              noninteractive="noninteractive"
            >
              {'Risk: Outdated component. Current version is: ' +
                xssFilters.inHTMLData(data.latestVersion)}
            </b-tooltip>
          </div>
        );
      } else {
        return <div style="white-space: nowrap;">{data.label}</div>;
      }
    },
    onExpand: async function (e, data) {
      if (!data.fetchedChildren) {
        e.target.style.cursor = 'wait';
        if (data.objectType === 'COMPONENT') {
          await this.getChildrens(data.children, data.uuid, data.objectType);
        }
        data.fetchedChildren = true;
        e.target.style.cursor = 'pointer';
        this.$set(data, 'expand', true);
      } else {
        if ('expand' in data) {
          data.expand = !data.expand;
          if (!data.expand && data.children) {
            this.collapse(data.children);
          }
        } else {
          this.$set(data, 'expand', true);
        }
      }
    },
    onNodeClick: function (e, data) {
      this.$set(data, 'selectedKey', !data.selectedKey);
      if (data.objectType === 'COMPONENT') {
        this.$router.push({ path: '/components/' + data.uuid });
      } else if (data.objectType === 'SERVICE') {
        this.$router.push({ path: '/services/' + data.uuid });
      }
    },
    collapse: function (list) {
      var _this = this;
      list.forEach(function (child) {
        if (child.expand) {
          child.expand = false;
        }
        child.fetchedChildren = false;
        child.children && _this.collapse(child.children);
      });
    },
    expandChange: function () {
      this.toggleExpand(this.data, this.expandAll);
    },
    toggleExpand: function (data, val) {
      var _this = this;
      if (Array.isArray(data)) {
        data.forEach(function (item) {
          _this.$set(item, 'expand', val);
          if (item.children) {
            _this.toggleExpand(item.children, val);
          }
        });
      } else {
        this.$set(data, 'expand', val);
        if (data.children) {
          _this.toggleExpand(data.children, val);
        }
      }
    },
    createSearchedComponentLookupTable: function (componentUuids) {
      this.searchedComponentUuids = {};
      if (componentUuids) {
        componentUuids.split('|').forEach((uuid) => {
          this.searchedComponentUuids[uuid] = true;
        });
      }
      return this.searchedComponentUuids;
    },
  },
};
</script>

<style lang="scss">
@import '~vue2-org-tree/dist/style.css';
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
.horizontal .org-tree-node:not(:first-child):before,
.horizontal .org-tree-node:not(:last-child):after {
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
.horizontal .org-tree-node:after,
.horizontal .org-tree-node:before,
.horizontal .org-tree-node.is-leaf:before,
.org-tree-node.is-leaf:after {
  width: 10px;
  height: 50%;
}
// Horizontal line from a node
.horizontal .org-tree-node-children {
  padding-left: 10px;
}
.horizontal.collapsable .org-tree-node.collapsed .org-tree-node-label:after,
.horizontal .org-tree-node-children:before {
  width: 10px;
}
// Margin between nodes
.horizontal .org-tree-node,
.horizontal .org-tree-node.collapsed,
.horizontal .org-tree-node.is-leaf {
  padding: 0;
}
.horizontal .org-tree-node-label {
  padding: 5px 0px 5px 10px;
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
