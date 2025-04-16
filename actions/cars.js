"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdmin } from "./admin";
// import {  } from "@/lib/supabase";
import { cookies } from "next/headers";
import {createClient} from '@/lib/superbase'
import { v4 as uuidv4 } from "uuid";
import {db} from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {serializedCarData} from '@/lib/helper'


export async function processCarImageWithAI(data,userId) {

  let base64Image = data["0"].base64Image
  let mimeType = data["0"].mimeType

  // console.log('the base is ' , base64Image)
  try {
    const isAdmin = await getAdmin(userId);
    if (!isAdmin.authorized) throw new Error("Unauthorized");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API Key is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType
      },
    };
   

    const prompt = `
            Analyze this car image and extract the following information
            1. Make (Manufacturer)
            2. Model
            3. Year (Approximately)
            4. Color 
            5. Body type (SUV , Sedan , Hatchback , etc.)
            6. Mileage
            7. Fuel type ( Your best guess)
            8. Transmission type (Your best guess)
            9. Price ( Your best guess)
            10. Short description as to be added to a car listing

              {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
        `;

    const result = await model.generateContent([imagePart, prompt]);

    const response = await result.response.text();
    const cleanedText = response.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const carDetails = JSON.parse(cleanedText);

      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "price",
        "mileage",
        "bodyType",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails)
      );

      if (missingFields.length > 0) {
        throw new Error("Missing fields ", missingFields.join(", "));
      }
      return {
        success: true,
        data: carDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to parse AI response",
      };
    }
  } catch (error) {
    
    return {
      success: false,
      message: "Server Error",
    };
    // throw new Error(`Gemini Api Error :${ error.message}`);
  }
}

export async function addCar(args, userId) {


  const carData = args["0"].carData ;
  const images = args["0"].images

  try {
    const isAdmin = await getAdmin(userId);

    if (!isAdmin.authorized) throw new Error("Unauthorized");
    
    
    const carId = uuidv4();
    const folderPath = `cars/${carId}`;
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    let imageUrls = [];
    
    for (let i = 0; i < images.length; i++) {
      const base64data = images[i];
      
      if (!base64data || !base64data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }
      
      const base64 = base64data.split(",")[1];
      // determine file extension from the data url
      const imageBuffer = Buffer.from(base64, "base64");
      const mimeMatch = base64data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";
      
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;
      
      const blob = new Blob([imageBuffer], { type: `image/${fileExtension}` });
   
      const { data: { user } } = await supabase.auth.getUser();
    

      const { data, error } = await supabase.storage
      .from("ca-images")
      .upload(filePath, imageBuffer, {
        contentType: `image/${fileExtension}`,
      });
     
      
      if(error){       
        throw new Error("Failed to upload image")
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ca-images/${filePath}`;

      imageUrls.push(publicUrl)
    }
      if ( imageUrls.length == 0) {
        throw new Error("No images exist in the list")
      }

      const car = await db.car.create({
        data: {
          id: carId, // Use the same ID we used for the folder
          make: carData.make,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          mileage: carData.mileage,
          color: carData.color,
          fuelType: carData.fuelType,
          transmission: carData.transmission,
          bodyType: carData.bodyType,
          seats: carData.seats,
          description: carData.description,
          status: carData.status,
          featured: carData.featured,
          images: imageUrls, // Store the array of image URLs
        },
      });
      revalidatePath("/admin/cars")
      return {
        success : true
      }
    
  } catch (error) {}
}

export async function getCars(args, userId){
  let {search} = args["0"]
 

  try {
    const isAdmin = await getAdmin(userId);

    if (!isAdmin.authorized) throw new Error("Unauthorized");
    if (isAdmin.authorized) console.log("authorized")
    
    let where = {}

    if(search){
      where.OR = [
        {make : {contains : search , mode : "insensitive"}},
        {model : {contains : search , mode : "insensitive"}},
        {color : {contains : search , mode : "insensitive"}},
      ]
    }
    const car = await db.car.findMany()
    
    const cars = await db.car.findMany({
      where , orderBy : {createdAt : "desc"}
    })

    const serializedCars = cars.map(serializedCarData)
   
    return { success : true , data : serializedCars}
  } catch (error) {
    return {
      success : false , 
      error : error.message
    }
  } 
}

export async function deleteCar(args , userId) {
  try {
    let {id} = args[0]  
  const isAdmin = await getAdmin(userId);

  if (!isAdmin.authorized) throw new Error("Unauthorized");
  
  const car = await db.car.findUnique({
    where : {id} , 
    select : {images : true}
  })

  if(!car){
    return {success :false , error : "car not found"}
  }

  await db.car.delete({
    where : {id}
  })
try {
  
  const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const filePaths = car.images
    .map((imageUrl) => {
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/ca-images\/(.*)/);
      return pathMatch ? pathMatch[1] : null;
    })
    .filter(Boolean);

  // Delete files from storage if paths were extracted
  if (filePaths.length > 0) {
    const { error } = await supabase.storage
      .from("car-images")
      .remove(filePaths);

    if (error) {
      console.error("Error deleting images:", error);
      // We continue even if image deletion fails
    }
  }
  revalidatePath("/admin/cars")
  return {
    success : true
  }
} catch (databaseError) {
  console.error("Database storage error ")
}
} catch (error) {
    return {
      success : false , 
      error : error.message
    }
}
}

export async function updateCarStatus( args , userId){
   let {id , status , featured} = args[0]

  try {
    const isAdmin = await getAdmin(userId);

    if (!isAdmin.authorized) throw new Error("Unauthorized");
    
  
    const updateData = {}
    if( status !== undefined ){
      updateData.status = status
    }
    if( featured !== undefined ){
      updateData.featured = featured
    }

    await db.car.update({
      where : {id},
      data : updateData
    })
    revalidatePath("/admin/cars")
    return {success : true}
  } catch (error) {
    
    return {success : false}
  }
}