import { api } from "@/src/libs/api";
import {
    ListCategoriesResponse,
    CategoryResponse,
    DeactivateCategoryResponse,
    CreateCategoryPayload,
    UpdateCategoryPayload,
    DeleteCategoryResponce,
    ReactivateCategoryResponse,
} from "@/src/types/catalog/category";

export const getCategories = async (): Promise<ListCategoriesResponse> => {
    return api<ListCategoriesResponse>("/admin/categories", {
        method: "GET",
    });
};
export const getActiveCategories = async (): Promise<ListCategoriesResponse> => {
    return api<ListCategoriesResponse>("/categories/active", {
        method: "GET",
    });
};


export const createCategory = async (
    payload: CreateCategoryPayload
): Promise<CategoryResponse> => {
    return api<CategoryResponse>("/admin/categories", {
        method: "POST",
        data: payload,
    });
};

export const updateCategory = async (
    id: string,
    payload: UpdateCategoryPayload
): Promise<CategoryResponse> => {
    return api<CategoryResponse>(`/admin/categories/${id}`, {
        method: "PUT",
        data: payload,
    });
};

export const deactivateCategory = async (
    id: string
): Promise<DeactivateCategoryResponse> => {
    return api<DeactivateCategoryResponse>(
        `/admin/categories/${id}/deactivate`,
        {
            method: "PATCH",
        }
    );
};

export const reactivateCategory = async (
    id: string
): Promise<ReactivateCategoryResponse> => {
    return api<ReactivateCategoryResponse>(
        `/admin/categories/${id}/reactivate`,
        {
            method: "PATCH",
        }
    );
};

export const deleteCategory = async (
    id: string
): Promise<DeleteCategoryResponce> => {
    return api<DeleteCategoryResponce>(
        `/admin/categories/${id}`,
        {
            method: "DELETE",
        }
    );
};