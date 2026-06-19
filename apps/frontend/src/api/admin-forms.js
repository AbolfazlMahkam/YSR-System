import HttpClient from "../utiles/axios";

export default {
  getAll: () => HttpClient.get("/admin/forms"),
  getOne: (id) => HttpClient.get(`/admin/forms/${id}`),
  create: (data) => HttpClient.post("/admin/forms", data),
  update: (id, data) => HttpClient.put(`/admin/forms/${id}`, data),
  remove: (id) => HttpClient.delete(`/admin/forms/${id}`),
  getSubmissions: (formId) =>
    HttpClient.get(`/admin/forms/${formId}/submissions`),
};
