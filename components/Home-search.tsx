
'use client'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import {useDropzone} from 'react-dropzone'
import { Camera, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import useFetch from '@/hook/use_fetch'
import { processImageSearch } from '@/actions/home'
import {fileToBase64} from '@/lib/helper'

const HomeSearch = () => {
  const router= useRouter()
    const [searchInput , setSearchInput] = useState("")
    const [imagePreview , setImagePreview]= useState("")
    const [searchImage , setSearchImage] = useState(null)
    const [isUploading , setIsUploading] = useState(false)
    const [isImageSearchOpen , setIsImageSearchOpen] = useState(false)
    const dropzone = useDropzone()
    const handleSearchSubmit = (e) =>{


      e.preventDefault()
      if(!searchInput.trim){
        toast.error("Please enter a Search Term")
        return
      }
      router.push(`/cars?search=${encodeURIComponent(searchInput)}`)
    }

    const {loading : isProcessing , 
      fn : processImageFn , 
      data : processResult, 
      error : processError
    } = useFetch(processImageSearch)


    const handleImageSearch =async (e)=>{
        e.preventDefault()
        if(!searchImage){

          toast.error("Kindly Upload an Image first")
        return
        } 
        const base64Image = await fileToBase64(searchImage);
        
            const mimeType= searchImage.type
            const data = {
              base64Image , mimeType
            }

        await processImageFn(data)
    }

    useEffect(()=> {
      if(processError){
        console.log('there was an error' , processError)
        toast.error(
          "failed to analyse image"
        )
      }
    } , [processError])
    
    useEffect(()=>{
      if(processResult?.success){
        
        const params = new URLSearchParams()

        if(processResult.data.make) params.set("make" , processResult.data.make);
        if(processResult.data.bodyType) params.set("bodyType" , processResult.data.bodyType);
        if(processResult.data.color) params.set("color" , processResult.data.color);

        router.push(`/cars?${params.toString()}`);
      }
    } , [processResult])

    const onDrop = acceptedFiles => {
      const file = acceptedFiles[0]
      if (file) {
        if (file.size > 5 * 1024 *1024){
          toast.error("Image size must be less than 5mb")
          return
        }

        setIsUploading(true)
        setSearchImage(file)

        const reader = new FileReader()
        reader.onloadend = () =>{
          setImagePreview(reader.result!)
          setIsUploading(false)
          toast.success("Image uploaded successfully")
        }
        reader.onerror  = () => {
          setIsUploading(false)
          toast.error("Failed to read the Image")
        }
        reader.readAsDataURL(file)
      }
    }

    const {getRootProps, getInputProps, isDragActive , isDragReject} = useDropzone({onDrop , 
      accept : {
        "image/*" : [".jpeg" , '.jpg' , '.png']
      } , 
      maxFiles : 1

    })

  return (
    <div>
      <form onSubmit={handleSearchSubmit}>
        <div className='relative flex items-center'>
            <Input
            type='text'
            placeholder='Enter make , model or use the AI image search option'
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className='pl-10 pr12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm'
            />

            <div className='absolute right-[100px]'>
                <Camera 
                size={35}
                onClick={() => setIsImageSearchOpen(!isImageSearchOpen)}
                className='cursor-pointer rounded-xl p-1.5'
                style={{
                    background : isImageSearchOpen ? "black" : "",
                    color: isImageSearchOpen ? 'white' : ""
                }}
                />
            </div>
            <Button type = "submit" className="absolute right-2 rounded-full">
              Search
            </Button>
        </div>
      </form>
      {
        isImageSearchOpen && <div className='mt-4'>
          <form onSubmit={handleImageSearch}>
            <div className='border-2 border-dashed bg-gray-300 rounded-3xl p-6'>
        {
          imagePreview ? <div className='flex flex-col items-center justify-center align-middle'>
            <img
            src={imagePreview}
            alt='Car Preview'
            className='h-40 object-contain mb-4'
            />
            <Button 
            variant='outline'
            onClick={()=>{
              setSearchImage(null)
              setImagePreview("")
              toast.info("Image removed successfully")
            }}
            >
              Remove Image
            </Button>
          </div>:
          <div {...getRootProps()}>
            <input {...getInputProps()}/>
            <div className='flex flex-col items-center'>


            <Upload className='h-12 w-12 align-middle text-gray-400 mb-2'/>
            <p>
            { isDragActive && !isDragReject ? "Leave File to upload": "Drag and drop a car image or click to select"}

            </p>
            {
              isDragReject && <p className='text-red-500 mb-2'>
                Invalid Image Type
              </p>
            }  
            <p>Supports : JPG , PNG of Max size  5MB</p>
            </div>
          </div>
        }
            </div>

            {imagePreview && <Button
            type='submit'
            className='w-full mt-3 cursor-pointer'
            disabled = {isUploading || isProcessing}
            >
              {isUploading ? "Uploading" : isProcessing ? "Processing Image..." : "Search with image"}
              </Button>}
          </form>
        </div>
      }
    </div>
  )
}

export default HomeSearch