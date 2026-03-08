import { ApiResponse } from "../api";
import { PricingUnit } from "./category-enums";

export interface Category {
    id: string;
    name: string;
    description: string;
    allowed_units: PricingUnit[];
    is_active: boolean;
}
export interface CreateCategoryPayload {
    name: string;
    description?: string;
    allowed_units: PricingUnit[];
}

export interface UpdateCategoryPayload {
    name: string;
    description?: string;
    allowed_units: PricingUnit[];
}

//get categories
export type ListCategoriesResponse = ApiResponse<Category[]>;

export type CategoryResponse = ApiResponse<Category>;

//update category
export interface MessageResponse {
    message: string;
}

export type DeactivateCategoryResponse = ApiResponse<MessageResponse>;
export type ReactivateCategoryResponse = ApiResponse<MessageResponse>;
export type DeleteCategoryResponce = ApiResponse<MessageResponse>;