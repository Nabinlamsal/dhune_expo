export type Role =
    | "user"
    | "business"
    | "vendor"
    | "admin";

export type UserIdentity = {
    id: string;
    display_name: string;
    role: Role
};
