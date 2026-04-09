import { atom } from "recoil";

export interface User{
    name: string;
    role: 'ADMIN' | 'USER' | undefined;
    token: string | undefined;
    initialized: boolean;
}

export const authState = atom<User>({
    key: 'authState',
    default: { initialized: false, name: '', role: undefined, token: undefined },
});