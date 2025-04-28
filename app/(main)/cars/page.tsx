

import {getCarFilters} from "@/actions/car-fetch"
import CarFilters from "./_components/car-filters"
import CarListing from "./_components/car-listing"
import {Suspense} from 'react'
import { auth } from "@clerk/nextjs/server"
  import { redirect } from "next/navigation"

export const metadata ={
    title : "Cars | OmeeneeCars" , 
    description : "Browse and search for your favorite car"
}

export const dynamic = "force-dynamic";

const CarsPage = async () => {

    const {userId} = await auth()
    if(!userId)redirect("/sign-in?redirect=/cars")
    const filteredCar = await getCarFilters()
  return (
    <div className="container mx-auto px-1 py-1">
      <h1 className="text-6xl mb-4 gradient-title">Browse Cars</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
            {/* {filters } */}
            <Suspense fallback={<div>Loading filters...</div>}>
            
            <CarFilters filters={filteredCar.data}/>
            </Suspense>
            </div>
        <div className="flex-1 ">{/* {listing} */}
            <CarListing/>
        </div>
      </div>
    </div>
  )
}

export default CarsPage
