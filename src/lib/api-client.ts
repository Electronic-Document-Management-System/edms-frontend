import useAuthStore from "@/store/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiClientOptions = RequestInit;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {

    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/token-refresh`, {
        method: "POST",
        credentials: "include",
      });
      return refreshRes.ok;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const text = await response.text();
    console.error('Non-JSON API response:', {
      endpoint, status: response.status, contentType, response: text.slice(0, 500),
    });
    if (response.status === 413) throw new Error('File is too large. Please upload a smaller file.');
    if (response.status >= 500) throw new Error('Server error occurred. Please try again.');
    throw new Error('Unexpected server response. Please try again.');
  }

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes("/auth/")) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return apiClient<T>(endpoint, options);
      }

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});

      useAuthStore.setState({ user: null, isAuthenticated: false });
      useAuthStore.persist.clearStorage();
      window.location.href = "/login";
    }

    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}