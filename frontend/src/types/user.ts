export type User = {
    user_id: number;
    username: string;
    email?: string;
    groups?: string[];
    passwordChangeDate: string;
    is_active: boolean;
    is_totp_enabled: boolean;
    is_totp_confirmed: boolean;
};

export type UserCreate = {
    username: string;
    email?: string;
    password: string;
    confirm_password: string;
    groups?: string[];
};