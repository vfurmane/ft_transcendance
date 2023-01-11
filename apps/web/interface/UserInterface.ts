export default interface User {
    id: string,
    name: string,
    avatar_num: number,
    status: string,
    victory: number,
    defeat: number
}

export const initUser = {id:'', name:'', avatar_num: 1, status:'', victory: 0, defeat:0};