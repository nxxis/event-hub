import http from './http.js';

export const listEvents = (params = {}) =>
  http.get('/events', { params }).then((r) => r.data);
export const getEvent = (id) => http.get(`/events/${id}`).then((r) => r.data);

export const signup = (payload) =>
  http.post('/auth/signup', payload).then((r) => r.data);
export const login = (payload) =>
  http.post('/auth/login', payload).then((r) => r.data);
export const me = () => http.get('/auth/me').then((r) => r.data);

export const rsvp = (eventId) =>
  http.post(`/tickets/${eventId}/rsvp`).then((r) => r.data);
export const myTickets = () => http.get('/tickets/me').then((r) => r.data);

export const ticketQR = (ticketId) =>
  http
    .get(`/tickets/${ticketId}/qr`, { responseType: 'blob' })
    .then((r) => r.data);
