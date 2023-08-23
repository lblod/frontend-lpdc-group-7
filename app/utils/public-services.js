export function loadPublicServiceDetails(store, publicServiceId) {
  return store.findRecord('public-service', publicServiceId, {
    reload: true,
    include: 'concept,type,status,review-status',
  });
}

export async function bestuursEenheidHasPublicServices(store) {
  const query = { 'page[size]': 1, 'page[number]': 0 };
  const publicServices = await store.query('public-service', query);
  return publicServices.length !== 0;
}
