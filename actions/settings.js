'use server'
import { revalidatePath } from "next/cache";
import {db} from "@/lib/prisma";
import { getAdmin } from "./admin";

export async function getDealershipInfo(args , userId) {
    
    
  try {
    const isAdmin = await getAdmin();

    if (!isAdmin.authorized) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where : { clerkUserId : userId}
    })

    if(!user) throw new Error("User not found")

    let dealership = await db.dealershipInfo.findFirst({
        include : {
            workingHours : {
                orderBy : {
                    dayOfWeek : "asc"
                }
            }
        }
    })

    if (!dealership ){
        dealership = await db.dealershipInfo.create({
            data : {
                workingHours: {
                    create: [
                      {
                        dayOfWeek: "MONDAY",
                        openTime: "09:00",
                        closeTime: "18:00",
                        isOpen: true,
                      },
                      {
                        dayOfWeek: "TUESDAY",
                        openTime: "09:00",
                        closeTime: "18:00",
                        isOpen: true,
                      },
                      {
                        dayOfWeek: "WEDNESDAY",
                        openTime: "09:00",
                        closeTime: "18:00",
                        isOpen: true,
                      },
                      {
                        dayOfWeek: "THURSDAY",
                        openTime: "09:00",
                        closeTime: "18:00",
                        isOpen: true,
                      },
                      {
                        dayOfWeek: "FRIDAY",
                        openTime: "09:00",
                        closeTime: "18:00",
                        isOpen: true,
                      },
                      {
                        dayOfWeek: "SATURDAY",
                        openTime: "10:00",
                        closeTime: "16:00",
                        isOpen: true,
                      },
                      {
                        dayOfWeek: "SUNDAY",
                        openTime: "10:00",
                        closeTime: "16:00",
                        isOpen: false,
                      },
                    ],
                  },
            } , 
            include : {
                workingHours : {
                    orderBy : {
                        dayOfWeek : "asc"
                    }
                }
            }
        })
    }
    return {
        success : true , 
        data : {
            ...dealership , 
            createdAt : dealership.createdAt.toISOString(),
            updatedAt : dealership.updatedAt.toISOString(),
        }
    }
  } catch (error) {
    throw new Error("Error Fetching Dealership Info " + error.message)
  }
}

export async function saveWorkingHours (args, userId) {

    try {
        let {workingHours} = args[0]
        const isAdmin = await getAdmin();

    if (!isAdmin.authorized) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
        where : { clerkUserId : userId}
    })
    if( !user || user.role !== "ADMIN"){
        throw new Error("Unauthorized : Admin Access Required")
    }

    let dealership = await db.dealershipInfo.findFirst()

    if(!dealership) {
        throw new Error("Dealership Info Not Found")
    }
    await db.workingHour.deleteMany ({
        where  : {
            dealershipId : dealership.id
        }
    })

    for (const hour of workingHours){
        await db.workingHour.create({
            data : {
                dayOfWeek : hour.dayOfWeek, 
                openTime : hour.openTime, 
                closeTime : hour.closeTime , 
                isOpen : hour.isOpen, 
                dealershipId : dealership.id 
            }
        })
    }

    revalidatePath("/admin/settings")
    revalidatePath("/")
    return {
        success: true,
      };
    } catch (error) {
        console.log(error)
        throw new Error("Error Saving Working Hours")
    }
    
}

export async function getUsers(args , userId) {
    try {
        const isAdmin = await getAdmin();

        if (!isAdmin.authorized) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where : { clerkUserId : userId}
        })
        if( !user || user.role !== "ADMIN"){
            throw new Error("Unauthorized : Admin Access Required")
        }  

        const users = await db.user.findMany({
            orderBy : {createdAt : "desc"}
        })

        return {
            success : true , 
            data : users.map(user=>({
                ...user , 
                createdAt : user.createdAt.toISOString(), 
                updatedAt : user.updatedAt.toISOString(), 
            }))
        }
    } catch (error) {
        throw new Error ("Error fetching users")
    }
}


export async function updateUserRole(args, userId){
    let {role , userToChangeId} = args[0]
    
    try {
        const isAdmin = await getAdmin();

        if (!isAdmin.authorized) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where : { clerkUserId : userId}
        })
        if( !user || user.role !== "ADMIN"){
            throw new Error("Unauthorized : Admin Access Required")
        } 


        await db.user.update({
            where : {id : userToChangeId}, 
            data : {role}
        })

        revalidatePath("/admin/settings")
        revalidatePath("/")
        return {
            success: true
        }
    } catch (error) {
        
        throw new Error("Error")
    }
}