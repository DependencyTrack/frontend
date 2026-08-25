/**
 * Builds the label for a node in the project dependency graph. `identity` is
 * either a project or a directDependency/component object; projects are the
 * ones without an objectType property.
 */
export function createNodeLabel(identity) {
  const isProject = !identity.objectType;
  const purl = !isProject && (identity.purlCoordinates || identity.purl);
  if (purl) {
    // purls are percent-encoded per spec (npm scopes become %40); the graph
    // is display-only, so decode for readability.
    try {
      return decodeURIComponent(purl);
    } catch {
      return purl;
    }
  }
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
