// Builds small CycloneDX documents for tests that upload a BOM.

export function cycloneDxBom(componentCount) {
  const components = Array.from({ length: componentCount }, (_, index) => ({
    type: 'library',
    'bom-ref': `pkg:npm/e2e-library-${index}@1.0.${index}`,
    name: `e2e-library-${index}`,
    version: `1.0.${index}`,
    purl: `pkg:npm/e2e-library-${index}@1.0.${index}`,
  }));
  return JSON.stringify({
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    version: 1,
    components,
  });
}

// Cut off inside the components array, so it is not valid JSON.
// A server with BOM validation disabled accepts it and fails while parsing.
export function truncatedBom(componentCount) {
  const bom = cycloneDxBom(componentCount);
  return bom.slice(0, Math.floor(bom.length / 2));
}

export function bomFile(content, name = 'bom.json') {
  return { name, mimeType: 'application/json', buffer: Buffer.from(content) };
}
