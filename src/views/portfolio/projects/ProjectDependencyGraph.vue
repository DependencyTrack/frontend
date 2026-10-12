<template>
  <div style="text-align: center; font-size: xxx-large" v-if="this.loading">
    Loading, please wait...
  </div>
  <div v-else class="dependency-graph">
    <div class="dependency-graph-controls">
      <span
        v-if="
          this.$route.params.componentUuids &&
          this.$route.params.componentUuids.length > 0 &&
          this.project.directDependencies &&
          this.project.directDependencies.length > 0 &&
          !this.notFound
        "
      >
        <b-form-checkbox
          style="margin-left: 1.5rem; margin-right: 0.5rem"
          id="showCompleteGraph"
          v-model="showCompleteGraph"
          inline
          switch
          ><span class="text-muted">{{
            $t('message.show_complete_graph')
          }}</span></b-form-checkbox
        >
      </span>
      <b-form-checkbox
        style="margin-left: 1.5rem; margin-right: 0.5rem"
        id="highlightOutdatedComponents"
        v-model="highlightOutdatedComponents"
        inline
        switch
        ><span class="text-muted">{{
          $t('message.show_update_information')
        }}</span></b-form-checkbox
      >
    </div>
    <span v-if="this.notFound">
      <span class="text-muted">{{
        $t('message.not_found_in_dependency_graph')
      }}</span
      ><br />
    </span>
    <ul>
      <dependency-graph-node :node="data" @toggle="onToggle">
        <template #default="{ node }">
          <component
            :is="nodePath(node) ? 'router-link' : 'span'"
            :to="nodePath(node)"
            :title="node.purl"
            class="dependency-graph-node"
            :class="{ searched: isSearched(node) }"
          >
            <i
              class="fa fa-fw text-muted me-1"
              :class="nodeIcon(node)"
              aria-hidden="true"
            /><span v-if="node.group" class="text-muted">{{ node.group }}/</span
            >{{ node.name }}
            <span class="text-muted">{{ node.version }}</span>
            <span
              v-if="isOutdated(node)"
              v-b-tooltip.hover.noninteractive
              class="badge text-bg-warning ms-2"
              :title="
                'Risk: Outdated component. Current version is: ' +
                node.latestVersion
              "
              ><i class="fa fa-arrow-up" aria-hidden="true" />
              {{ node.latestVersion }}</span
            >
          </component>
        </template>
      </dependency-graph-node>
    </ul>
  </div>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import DependencyGraphNode from './DependencyGraphNode.vue';

function purlNamespace(purl) {
  const path = purl?.split(/[?#]/)[0].replace(/^pkg:[^/]+\//, '');
  const slash = path?.lastIndexOf('/');
  return slash > 0 ? decodeURIComponent(path.slice(0, slash)) : undefined;
}

export default {
  mixins: [permissionsMixin],
  components: {
    DependencyGraphNode,
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
  mounted() {
    this.computeData();
  },
  data() {
    return {
      data: {},
      response: Object,
      nodeId: 0,
      loading: false,
      showCompleteGraph: this.showCompleteGraph,
      notFound: false,
      highlightOutdatedComponents: this.highlightOutdatedComponents,
      searchedComponentUuids: {},
    };
  },
  watch: {
    project: function () {
      this.computeData();
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
          name: this.project.name,
          version: this.project.version,
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
          name: this.project.name,
          version: this.project.version,
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
    computeData: function () {
      // prepare base object
      const data = {
        id: this.nodeId,
        name: this.project.name,
        version: this.project.version,
        objectType: 'PROJECT',
        expand: true,
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
      let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/project/${
        this.project.uuid
      }/dependencyGraph/${encodeURIComponent(
        this.$route.params.componentUuids,
      )}`;
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
              (gatheredKey) => gatheredKey === childNode.uuid,
            )
          ) {
            childNode.gatheredKeys.push(childNode.uuid);
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
      _treeNode,
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
            childNode.gatheredKeys.push(childNode.uuid);
            children.push(childNode);
            if (
              onlySearched &&
              this.searchedComponentUuids[directDependency.uuid]
            ) {
              childNode.children =
                this.getChildrenFromDependencyWithSearchedDependency(
                  dependencies,
                  dependencies[directDependency.uuid],
                  childNode,
                  false,
                );
            } else {
              childNode.children =
                this.getChildrenFromDependencyWithSearchedDependency(
                  dependencies,
                  dependencies[directDependency.uuid],
                  childNode,
                  onlySearched,
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
                (gatheredKey) => gatheredKey === childNode.uuid,
              )
            ) {
              childNode.gatheredKeys.push(childNode.uuid);
              children.push(childNode);
              if (onlySearched && this.searchedComponentUuids[dependency]) {
                childNode.children =
                  this.getChildrenFromDependencyWithSearchedDependency(
                    dependencies,
                    dependencies[dependency],
                    childNode,
                    false,
                  );
                this.collapse(childNode.children);
              } else {
                childNode.children =
                  this.getChildrenFromDependencyWithSearchedDependency(
                    dependencies,
                    dependencies[dependency],
                    childNode,
                    onlySearched,
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
        group: dependency.group || purlNamespace(dependency.purl),
        name: dependency.name,
        version: dependency.version,
        objectType: dependency.objectType || 'COMPONENT',
        uuid: dependency.uuid,
        purl: dependency.purl,
        fetchedChildren: !!dependency.expandDependencyGraph,
        gatheredKeys: [],
        children: null,
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
                treeNode.children = this.transformDependenciesToOrgTree(
                  jsonObject,
                  false,
                  treeNode,
                  dependency.uuid,
                  'COMPONENT',
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
    nodePath: function (node) {
      if (node.objectType === 'COMPONENT') {
        return '/components/' + node.uuid;
      } else if (node.objectType === 'SERVICE') {
        return '/services/' + node.uuid;
      }
      return null;
    },
    nodeIcon: function (node) {
      return (
        { PROJECT: 'fa-sitemap', SERVICE: 'fa-exchange' }[node.objectType] ||
        'fa-cube'
      );
    },
    isSearched: function (node) {
      return (
        this.$route.params.componentUuids &&
        this.searchedComponentUuids[node.uuid]
      );
    },
    isOutdated: function (node) {
      return (
        this.highlightOutdatedComponents &&
        node.version &&
        node.latestVersion &&
        node.latestVersion !== node.version
      );
    },
    onToggle: async function (node) {
      if (!node.fetchedChildren) {
        if (node.objectType === 'COMPONENT') {
          await this.getChildrens(node.children, node.uuid, node.objectType);
        }
        node.fetchedChildren = true;
        node.expand = true;
      } else {
        node.expand = !node.expand;
        if (!node.expand && node.children) {
          this.collapse(node.children);
        }
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
$dependency-graph-line: rgba(32, 168, 216, 0.35);

// CoreUI's hidden makes .app-body a scroll container, so pinned rows couldn't stick to the page.
.app-body:has(.tab-pane.active .dependency-graph) {
  overflow-x: clip;
}

.dependency-graph {
  white-space: nowrap;
}
.dependency-graph-controls {
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #2b3a48;
}
.dependency-graph ul {
  list-style: none;
  margin: 0;
  padding-left: 1.25rem;
}
.dependency-graph > ul {
  padding-left: 2.75rem;
}
.dependency-graph li {
  position: relative;
}
.dependency-graph-row {
  display: flex;
  align-items: center;
  height: 2.375rem;
}
.dependency-graph-row.pinned {
  position: sticky;
  // Below the fixed app header.
  top: calc(55px + var(--depth) * 2.375rem);
  z-index: calc(100 - var(--depth));
  background: #131d26;
  // Also covers the indent, so tree lines don't show through left of the row.
  box-shadow: calc(-2.75rem - var(--depth) * 1.25rem) 0 0 #131d26;
}
// Fades out the row scrolling under a pinned one instead of cutting it off.
.dependency-graph-row.pinned::after {
  content: '';
  position: absolute;
  top: 100%;
  left: calc(-2.75rem - var(--depth) * 1.25rem);
  right: 0;
  height: 12px;
  background: linear-gradient(#131d26, rgba(19, 29, 38, 0));
  pointer-events: none;
}
.dependency-graph ul ul > li::before {
  content: '';
  position: absolute;
  left: -1.875rem;
  top: 0;
  width: 0.625rem;
  height: 1.1875rem;
  border-left: 1px solid $dependency-graph-line;
  border-bottom: 1px solid $dependency-graph-line;
  border-bottom-left-radius: 4px;
}
.dependency-graph ul ul > li.leaf::before {
  width: 1.5rem;
}
// Carries the parent's line down past this node to the next sibling.
.dependency-graph ul ul > li:not(:last-child)::after {
  content: '';
  position: absolute;
  left: -1.875rem;
  top: 0;
  bottom: 0;
  border-left: 1px solid $dependency-graph-line;
}
.dependency-graph-toggle {
  width: 1.25rem;
  margin-left: -1.25rem;
  padding: 0;
  border: 0;
  background: none;
  color: #73818f;
}
.dependency-graph-toggle:hover {
  color: #20a8d8;
}
.dependency-graph-toggle:focus-visible {
  outline: 2px solid #20a8d8;
}
.dependency-graph-node {
  display: inline-block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 0.75rem;
  line-height: 1.75rem;
  border: 1px solid #2b3a48;
  border-radius: 1rem;
  background: #151f29;
}
a.dependency-graph-node:hover {
  border-color: #20a8d8;
  text-decoration: none;
}
.dependency-graph-node.searched {
  border-color: #4dbd74;
  color: #4dbd74;
  font-weight: bold;
}
</style>
