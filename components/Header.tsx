'use client'

import {checkUser} from "@/lib/checkUser"
import {useUser} from '@clerk/clerk-react'
import { SignedIn, SignedOut, SignInButton, UserButton} from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { ArrowLeft, CarFront } from 'lucide-react'
import { useEffect, useState } from 'react'
const Header = ({isAdminPage = false}) => {

  const {user} = useUser()
  const [person , setPerson] = useState(null)
  const isAdmin = person?.role === "ADMIN" ? true : false

  
  
  useEffect(()=>{
      let person;
          if(user){
            person = checkUser(true , 
              user.id,
              user.firstName! + user.lastName,
              user.imageUrl,
              user.emailAddresses?.[0]?.emailAddress,
            
          );

          }

          person?.then(p => setPerson(p)).catch(error => console.log('something happened'))

  },[user])


  return (
    <header
    className='fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b'
    >
      <nav className='mx-auto px-4 py-4 flex items-center justify-between'>
        <Link 
        className='flex items-center'
        href={isAdminPage ?"/admin" : "/"}>
        <Image src={"/car.png"} alt = "car store"
        width={500}
        height={100}
        className='h-12 w-auto'
        />
        {isAdmin && (
          <span className='text-xs font-extralight'> Admin</span>
        )}
          </Link>
         <div
         className='flex 
          items-center space-x-4'
         >
          {
            isAdminPage ?<>
            <Link href="/">
            <Button variant='outline' className='flex items-center gap-1' >
              <ArrowLeft  size={18}/>
              <span className='hidden md:inline'>
                </span>Back to App
            </Button>
            </Link></>:
            
            <SignedIn>
            <Link href="/saved-cars">
            <Button>
              <CarFront size={18}/>
              <span className='hidden md:inline'>
                </span>Saved Cars
            </Button>
            </Link>
         {!isAdmin ? (<Link href="/reservations">
            <Button variant="outline">
              <CarFront size={18}/>
              <span className='hidden md:inline'>
              My Reservations  </span>
            </Button>
            </Link>) : (

            <Link href="/admin">
            <Button variant="outline">
              <CarFront size={18}/>
              <span className='hidden md:inline'>
              Admin   </span>
            </Button>
            </Link>
            )}
            
          </SignedIn>}

          <SignedOut>
            <SignInButton forceRedirectUrl='/'>
              <Button variant="outline">
                Login
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn>
          </div>
          
      </nav>
    </header>
  )
}

export default Header
