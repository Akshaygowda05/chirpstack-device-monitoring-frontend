import { api } from "./api"


interface CreateUserData {
     name: string,
    email: string,
    password: string,
    role: string,
    applicationId: string

}

export const createUser = async (data:CreateUserData)=>{
    return await api.post("/v1/users/create", data);
}

export const fetchdevices = async (limit: number, offset: number) => {
    return await api.get("/devices", {
        params: {
            limit,
            offset
        }
    });
}