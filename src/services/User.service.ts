import { api } from "./api"


interface CreateUserData {
     name: string,
    email: string,
    password: string,
    role: string,
    applicationId: string

}
 // this is for the login
export const login = async(email:string, password:string)=>{
    return await api.post("/v1/user/login", {email, password});
}


// this is for the create user
export const createUser = async (data:CreateUserData)=>{
    return await api.post("/v1/users/create", data);
}

// this is for the fetch the devices

export const fetchdevices = async (limit: number, offset: number,search:string) => {
    return await api.get("/devices", {
        params: {
            limit,
            offset,
            search
        }
    });
}

// this is for the fetch the multicast group

export const fetchMulticastGroups = async (limit?: number, offset?: number) => {
    return await api.get("/multicast-groups",{
        params:{
            limit,
            offset
        }
    })
}

// this is for the fetch the battery 
export const fetchBatteryStatus  = async (groupId:string) =>{
    return await api.get(`/v1/batteries/${groupId}`);
}

// this is to fetch the group details for the group of devices

export const fetchGroup = async () =>{
    return  await api.get("/multicast-groups");
}

// this is send the downlink for the group of devices
export const multicastDownlink = async (groupIds:string[], data:string) =>{
    return await api.post("/multicast-groups/queue", {
        groupId: groupIds,
        data
    });
}

// this is for the sending downlink to the ind devices


export const unicastDownlink =async(devEui:string,data:string) =>{

    return await api.post(`/devices/${devEui}/queue`,{
        data
    })
}



export const fetchBattery = async (groupId:string) =>{
    return await api.get(`/v1/batteries/${groupId}`);
}


// this to fetch the devies for the home page dashboard
export const fetchDevicesV1=async () =>{
    console.log("Fetching devices from API...");
    return await api.get("/v1/devices");
}

// this is for the home page pannels data
export const getHomePannelsCleandata =async() =>{
    return await api.get("/home/pannels-data");
}

// this is also for the homepae for the active and inactive devices

export const getActiveInactiveCount = async() =>{
    return await api.get("/home/active-inactive-count");

}

export const getApplicationLogs = async () => {
    return await api.get("/events");
}

export const deleteUser = async (userId: number) => {
    return await api.delete(`/v1/users/${userId}`);
}
