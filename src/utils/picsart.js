export async function removeBackground(imageUrl, apiKey) {
  const res = await fetch("https://api.picsart.io/tools/removebg", {
    method: "POST",
    headers: {
      "x-picsart-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image_url: imageUrl })
  });
  if (!res.ok) throw new Error("Picsart API-feil");
  const data = await res.json();
  return data.data.url; // ny bilde-URL
}
