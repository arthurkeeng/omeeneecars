import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[100vh] px-4 text-center'>

      <h1 className="font-bold text-6xl mb-4 gradient-title">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-8 text-gray-600">
        Oops The Page You Are Looking For Does Not Exist Or Has Been Moved

      </p>
      <Link href='/'>
      Return Home
      </Link>
    </div>
  )
}

export default NotFound
