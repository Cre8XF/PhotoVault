// src/utils/picsartClient.js
const BASE = "https://api.picsart.io";
const API_KEY = process.env.REACT_APP_PICSART_KEY;

export async function runPicsartTool(tool, imageUrl, extra = {}) {
  const form = new FormData();
  form.append("image_url", imageUrl);
  Object.entries(extra).forEach(([k, v]) => form.append(k, v));

  const res = await fetch(`${BASE}/tools/${tool}`, {
    method: "POST",
    headers: { "x-picsart-api-key": API_KEY },
    body: form,
  });
  if (!res.ok) throw new Error(`Picsart ${tool} failed`);
  return await res.json();
}
