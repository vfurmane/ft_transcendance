export default interface User {
    id: string,
    name: string,
    avatar_num: number,
    status: string,
    victory: number,
    defeat: number
}

export const initUser = {id:'', name:'', avatar_num: 1, status:'', victory: 0, defeat:0};

export interface UserBack {
    id?: string,
    created_at?: Date,
    updated_at?: Date,
    states?: any[],
    email?: string,
    name?: string,
    password?: string | null,
    tfa_secret?: string | null,
    tfa_setup?: boolean,
}