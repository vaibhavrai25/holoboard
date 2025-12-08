const API_BASE = process.env.REACT_APP_API_BASE || "https://holoboard-backend.onrender.com";

export async function askAI(prompt) {
  try {
    const res = await fetch(`${API_BASE}/api/ai/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    return await res.json();
  } catch (err) {
    console.error("AI Request Error:", err);
    return { ok: false, error: err.message };
  }
}
// bbchv