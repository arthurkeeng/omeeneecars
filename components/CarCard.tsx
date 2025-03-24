'use client'

import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import Image from 'next/image'
import {CarIcon, Heart } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useRouter } from 'next/navigation'

interface CarCardProps {
        id: number,
        make: string,
        model: string,
        year: number,
        price: number,
        images: string[],
        transmission: string,
        fuelType: string,
        bodyType: string,
        mileage: number,
        color: string,
        wishlisted: boolean,
    
}
const CarCard = ({car} : {
    car : CarCardProps
}) => {
    const [saved , setSaved] = useState(car.wishlisted)
    const handleToggle = ()=>{}
    const router = useRouter()
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
            {/* <Button variant='ghost' size='icon'
            className={`absoulte bg-white/90 rounded-full ${
                saved ? "text-red-500 hover:text-gray-500"
                : "text-gray-600 hover:to-gray-900"
            }`}
            onClick={handleToggle}
            >
                <Heart className={saved ? "fill-current" : ""} size={30}/>

            </Button> */}
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
