'use server'
import { db } from './prisma';

export const checkUser = async ( user = false , id , name , imageUrl ,email) =>{

    
    if (!user) {
        return null;
    }

    try {

        
        const loggedInUser = await db.user.findUnique({
            where : {
                clerkUserId : id
            }
        })
        if (loggedInUser) {
            return loggedInUser
        }

        const newUser = await db.user.create({
            data : {
                clerkUserId : id, 
                name , 
                imageUrl , 
                email
            }
        })
        return newUser
    } catch (error) {
        console.log(error.message)
    }
}