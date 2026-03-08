"use client";

import { getCategories, createCategory, updateCategory, deactivateCategory, reactivateCategory, deleteCategory } from "@/src/services/catalog/category_service";
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/src/types/catalog/category";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCategories() {
    return useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await getCategories();
            return res.data; // unwrap ApiResponse
        },
    });
}
export function useActiveCategories() {
    return useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await getCategories();
            return res.data;
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCategoryPayload) =>
            createCategory(payload),

        onSuccess: () => {
            // Refetch categories after create
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("category created successfully")
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { id: string } & UpdateCategoryPayload) =>
            updateCategory(data.id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("category updated successfully!")
        },
    });
}

export function useDeactivateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deactivateCategory(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("category deactivated!")

        },
    });
}
export function useReactivateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reactivateCategory(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("category activated successfully")
        },
    });
}
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("category deleted successfully")
        },
        onError: () => {
            toast.error("failed to delete the category")
        }
    });
}