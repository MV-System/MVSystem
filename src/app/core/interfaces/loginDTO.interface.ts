export interface LoginDTO {
    token: string,
    expires: Date,
    name: string,
    role: string,
    nameid: string,
    IdSucursal:string,
    Sucursal:string,
    Empresa:string
}
export interface User{
    codigo?: number,
    password: string,
    login?: string,
} 
