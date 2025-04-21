

import { getSavedCars } from "@/actions/car-fetch"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import SavedCarsList from "./_components/saved-cars"


const SavedCarsPage = async () => {
 const {userId} = await auth()

 
 if(!userId) {
  redirect("/sign-in?redirect=/saved-cars")
 }
  const savedCarResult = await getSavedCars(userId)
  
  return (
    <div className="container mx-auto px-1 py-2">
      <h1 className="mb-6 gradient-title text-6xl">Your Saved Cars</h1>
      <SavedCarsList initialData={savedCarResult}/>
      
    </div>
  )
}

export default SavedCarsPage
