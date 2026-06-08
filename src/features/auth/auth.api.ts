import { apiClient } from "@/lib/api-client";
import { LoginInput, LoginResponse } from "./auth.types";

export async function loginApi(input: LoginInput) {
  const response = await apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data.user;
}

export async function logoutApi() {
  await apiClient("/auth/logout", {
    method: "POST",
  });
}