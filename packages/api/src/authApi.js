import http from './http.js';

export const adminCreateUser = (payload) =>
  http.post('/auth/create', payload).then((r) => r.data);

export default {};
