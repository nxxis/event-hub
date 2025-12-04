import http from './http.js';

export const listOrgs = () => http.get('/orgs').then((r) => r.data);
export const createOrg = (payload) =>
  http.post('/orgs', payload).then((r) => r.data);
export const myOrgs = () => http.get('/orgs/mine').then((r) => r.data);
export const adminOrgs = () => http.get('/orgs/admin').then((r) => r.data);
export const approveOrg = (id) =>
  http.post(`/orgs/${id}/approve`).then((r) => r.data);
export const deleteOrg = (id) => http.delete(`/orgs/${id}`).then((r) => r.data);

export default {};
