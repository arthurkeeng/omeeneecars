import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"


const useFetch = (cb) =>{
    const {user} = useUser()
    const [userId , setUserId] = useState("")
    const [data , setData] = useState(undefined)
    const [loading , setLoading] = useState(false)
    const [error , setError] = useState("")
    // const 
    useEffect(()=>{
        if(user) {
            setUserId(user.id)
        } 
    },[user])
    const fn = async(...args) => {
        setLoading(true)
        setError(null)

   
        try {
            const response = await cb({...args} , userId)
    
            setData(response)
            setError(null)
        } catch (error) {
            setError(error)
        }
        finally{
            setLoading(false)
        }

    }

    return {data , loading , error , fn , setData}

}

export default useFetch;