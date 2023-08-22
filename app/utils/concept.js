export async function loadConceptLanguageVersion(serviceId) {
  const response = await fetch(
    `/lpdc-management/conceptual-public-services/${serviceId}/language-version`
  );
  return (await response.json()).languageVersion;
}
