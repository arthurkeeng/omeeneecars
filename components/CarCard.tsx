'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import Image from 'next/image'
import {CarIcon, Heart, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useRouter } from 'next/navigation'
import useFetch from '@/hook/use_fetch'
import { toggleSavedCar } from '@/actions/car-fetch'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

// interface CarCardProps {
//         id: number,
//         make: string,
//         model: string,
//         year: number,
//         price: number,
//         images: string[],
//         transmission: string,
//         fuelType: string,
//         bodyType: string,
//         mileage: number,
//         color: string,
//         wishlisted: boolean,
    
// }
const CarCard = ({car} 
//     : {
//     car : CarCardProps
// }
) => {

   
    const [saved , setSaved] = useState(car.wishlisted)
    const {user} = useUser()
    const {
        loading : isToggling , 
        fn : toggleSavedFn, 
        data : toggleResult , 
        error : toggleError
    } = useFetch(toggleSavedCar)


    const handleToggle = async ( e)=>{
        e.preventDefault()
        if(!user){
            toast.error("please sign in to save cars")
            router.push('/sign-in')
            return
        }

        if(isToggling)return
        await toggleSavedFn({carId : car.id})
    }
    const router = useRouter()


    useEffect(()=> {
        if(toggleResult?.success && toggleResult.saved !=saved){
            setSaved(toggleResult.saved)
            toast.success(toggleResult.message)
        }
    } , [toggleResult , saved])
    useEffect(()=> {
        if(toggleError){
            toast.error("Failed to update favorites")
        }
    } , [toggleError])
  return (
    <Card className='overflow-hidden hover:shadow-lg transition group'>
        <div className='relative h-50 '>
            {car.images && car.images.length > 0 ?(
                <div className='relative w-full h-full'>
                    <Image
                    src={car.images[0]                  
                    }
                    fill
                    alt={`${car.make} ${car.model}`}
                    className='object-cover group-hover:scale-105 transition duration-100'
                    />
                </div>
            ) : (
                <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                    <CarIcon
                    className='h-12 w-12 text-gray-400'
                    />
                </div>
            )}
            <Button variant='ghost' size='icon'
            className={`absoulte bg-white/90 rounded-full ${
                saved ? "text-red-500 hover:text-gray-500"
                : "text-gray-600 hover:to-gray-900"
            }`}
            onClick={handleToggle}
            >
                {isToggling ? (
                    <Loader2 className='h-4 w-4 animate-spin'/>
                )
            :
                <Heart className={saved ? "fill-current" : ""} size={70}/>
            }

            </Button>
        </div>
        <CardContent className='p-4'>
                <div >
                    <h3>{car.make} { car.model}</h3>
                    <span className='text-xl font-bold text-blue-600'>
                        N{car.price.toLocaleString()}
                    </span>
                    <div className='text-gray-600 mb-2 flex items-center'>
                        <span>{car.year}</span>
                    <span className='mx-2'>*</span>
                    <span>{car.fuelType}</span>
                    <span className='mx-2'>*</span>
                    <span>{car.transmission}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant =  'outline' className='bg-gray-50' >{car.bodyType}</Badge>
                    <Badge variant =  'outline' className='bg-gray-50'>{car.mileage.toLocaleString()}</Badge>
                    <Badge variant =  'outline' className='bg-gray-50'>{car.color}</Badge>
                </div>
                <div>
                    <Button 
                    className='w-full text-xl p-2'
                    onClick={() => router.push(`/cars/${car.id}`)}
                    >View Car</Button>
                </div>
        </CardContent>
    </Card>
  )
}

export default CarCard
