import { getCarById } from '@/actions/car-fetch'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import {TestDriveForm} from './_components/test-drive-form'


export async function generateMetadata(){
  return {
    title : "Book test drive", 
    description : "Schedule a test drive in a few second"
  }
}
const TestDrive = async ({params}) => {
  const {userId} = await auth()
  const {id} = await params

  const result = await getCarById(id , userId)
  if(!result.success){notFound()}
  return (
    <div className='container max-auto px-4 py-12'>
      <h1 className='text-6xl mb-6 gradient-title'>Book a test drive</h1>
      <TestDriveForm car={result.data} testDriveInfo={result.data.testDriveInfo}/>
    </div>
  )
}

export default TestDrive
