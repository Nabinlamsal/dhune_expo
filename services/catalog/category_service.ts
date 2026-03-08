import { api } from "@/libs/api";
import { ListCategoriesResponse } from "@/types/catalog/category";

export const getActiveCategories = async (): Promise<ListCategoriesResponse> => {
    return api<ListCategoriesResponse>("/categories/active", {
        method: "GET",
    });
};
