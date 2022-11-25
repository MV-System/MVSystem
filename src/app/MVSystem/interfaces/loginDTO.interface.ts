export interface LoginDTO {
    token: string,
    expires: Date,
    name: string,
    role: string,
    nameid: string
}
export interface User{
    codigo?: number,
    password: string,
    login?: string,
} 
