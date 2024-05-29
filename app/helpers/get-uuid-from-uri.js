export default function getUUIDFromUri(uri) {
  const segmentedUri = uri.split('/');
  return segmentedUri[segmentedUri.length - 1];
}
