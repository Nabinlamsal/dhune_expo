"use client";

import { getActiveCategories } from "@/services/catalog/category_service";
import { Category } from "@/types/catalog/category";
import { useQuery } from "@tanstack/react-query";

export function useActiveCategories() {
    return useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await getActiveCategories();
            return res.data;
        },
    });
}
