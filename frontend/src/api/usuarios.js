import api from "./axios";

export async function getUsuarios() {
  const response = await api.get("/usuarios");

  return response.data;
}

export async function createUsuario(payload) {
  const response = await api.post("/usuarios", payload);

  return response.data.data;
}

export async function updateUsuario(id, payload) {
  const response = await api.put(`/usuarios/${id}`, payload);

  return response.data.data;
}
