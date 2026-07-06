import { apiClient } from "@/lib/api-client";
import { CreateUserInput, UpdateUserInput, User, UserWithRoles } from "./users.types";

const BASE = "/users";

export const getAllUsers = async (permission?: string): Promise<User[]> => {
    const query = permission ? `?permission=${encodeURIComponent(permission)}` : "";
    const res = await apiClient<{ data: { users: User[] } }>(`${BASE}/${query}`);
    // console.log(res.data);
    return res.data.users;
};

export const getUserById = async (userId: number): Promise<User> => {
    const res = await apiClient<{ data: User }>(`${BASE}/${userId}`);
    return res.data;
};

export const createNewUser = async (input: CreateUserInput): Promise<User> => {
    const res = await apiClient<{ data: User }>(`${BASE}/`, {
        method: "POST",
        body: JSON.stringify(input),
    });
    return res.data;
};

export const updateUserById = async (
    userId: number,
    input: UpdateUserInput
): Promise<User> => {
    const res = await apiClient<{ data: User }>(`${BASE}/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
    return res.data;
};

export const activateUser = async (userId: number): Promise<User> => {
    const res = await apiClient<{ data: User }>(`${BASE}/${userId}/activate`, {
        method: "PATCH",
    });
    return res.data;
};

export const disableUser = async (userId: number): Promise<User> => {
    const res = await apiClient<{ data: { user: User } }>(`${BASE}/${userId}/disable`, {
        method: "PATCH",
    });
    return res.data.user;
};

export const getUserRoles = async (userId: number): Promise<UserWithRoles> => {
    const res = await apiClient<{ data: { userRoles: UserWithRoles } }>(
        `${BASE}/${userId}/roles`
    );
    return res.data.userRoles;
};

export const assignRoleToUser = async (userId: number, roleId: number) => {
    await apiClient(`${BASE}/${userId}/roles`, {
        method: "POST",
        body: JSON.stringify({ roleId }),
    });
};

export const removeRoleFromUser = async (userId: number, roleId: number) => {
    await apiClient(`${BASE}/${userId}/roles/${roleId}`, {
        method: "DELETE",
    });
};