const BASE_URL = "https://api.github.com";

async function fetchRequest<T>(path: string, options?: RequestInit): Promise<T> {
  // Request interceptor — add headers, log outgoing requests, etc.
  console.log(`[http] --> ${options?.method ?? "GET"} ${BASE_URL}${path}`);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  // Response interceptor — normalise errors, log responses, etc.
  console.log(`[http] <-- ${res.status} ${res.url}`);

  if (!res.ok) {
    if (res.status === 404) throw new Error(`Not found: ${path}`);
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data: T = await res.json();
  console.log("[http] response body:", data);

  return data;
}

export const http = {
  get: <T>(path: string, options?: RequestInit) =>
    fetchRequest<T>(path, { ...options, method: "GET" }),
};
