// services/ai.js

// IMPORTANT — update this to your backend URL:
const AI_API_URL =
  "https://glorious-succotash-wrg7466vjpx629599-1234.app.github.dev/generate";

/**
 * askAI(prompt)
 * Sends user prompt to AI backend and returns JSON instructions.
 *
 * Returns:
 * {
 *   ok: true/false,
 *   response: "raw string from AI",
 *   error: "error message if any"
 * }
 */
export async function askAI(prompt) {
  try {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `Server returned ${res.status}`,
      };
    }

    const data = await res.json();

    if (!data) {
      return {
        ok: false,
        error: "Empty server response",
      };
    }

    // Expecting: { response: "JSON string" }
    if (data.error) {
      return {
        ok: false,
        error: data.error,
      };
    }

    if (!data.response) {
      return {
        ok: false,
        error: "AI did not return 'response' field",
      };
    }

    return {
      ok: true,
      response: data.response,
    };
  } catch (err) {
    console.error("AI Fetch Error:", err);
    return {
      ok: false,
      error: err.message || "Network error",
    };
  }
}
