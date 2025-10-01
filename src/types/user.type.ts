export interface IUser {
    full_name: string;
    email: string;
    occupation?: string;
    years_of_experience?: number;
    password: string;
    token?: string;
}