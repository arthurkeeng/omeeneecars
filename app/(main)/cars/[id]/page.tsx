import { getCarById } from "@/actions/car-fetch"
import CarCard from "@/components/CarCard"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import {CarDetails} from "./components/car-details"


export async function generateMetadata({params}){
  const {userId} = await auth()
  const {id} = await params
  const result = await getCarById(id, userId)

  if(!result.success){
    return {
      title : "Car not found", 
      description : "The requested car could not be found"
    }
  }
  const car = result.data
  return {
    title : `${car.year} ${car.make} ${car.model} | omeeneecars`,
    description : car.description.substring(0,160), 
    openGraph : {
      images : car.images?.[0] ? [car.images[0]] : []
    }
  }
}
const CarPage = async ({params}) => {
  const {userId} = await auth()
    const {id} = await params
    console.log('the user id is ' , userId)
    const result = await getCarById(id , userId)

    if(!result.success){
      notFound()
    }
  return (
    <div className="container mx-auto px-4 py-12">
      <CarDetails car={result.data} testDriveInfo = {result.data.testDriveInfo}/>
    </div>
  )
}

export default CarPage
