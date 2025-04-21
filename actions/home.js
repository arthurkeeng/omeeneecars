
'use server'
import {db} from "@/lib/prisma";
import {serializedCarData} from "@/lib/helper"
import { request } from "@arcjet/next";
import aj from "../lib/arcjet";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";


export async function getFeaturedCars(limit = 3) {
    try {
        const cars = await db.car.findMany({
            where :{
                featured : true , 
                status : "AVAILABLE"
            } , 
            take : limit , 
            orderBy : {
                createdAt : "desc"
            }
        })

        return cars.map(serializedCarData)
    } catch (error) {
        throw new Error("Error fetching featured cars ")
    }
}


export async function processImageSearch(data ){
    let base64Image = data["0"].base64Image
    let mimeType = data["0"].mimeType
    try {
        // rate limiting with arcjet
        const req = await request();

        // Check rate limit
        const decision = await aj.protect(req, {
          requested: 1, // Specify how many tokens to consume
        });
    
        if (decision.isDenied()) {
          if (decision.reason.isRateLimit()) {
            const { remaining, reset } = decision.reason;
            console.error({
              code: "RATE_LIMIT_EXCEEDED",
              details: {
                remaining,
                resetInSeconds: reset,
              },
            });
    
            throw new Error("Too many requests. Please try again later.");
          }
    
          throw new Error("Request blocked");
        }
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
                  Analyze this car image and extract the following information for a search query
                  1. Make (Manufacturer)
                  2. Body type (SUV , Sedan , Hatchback , etc)
                  3. Color
                Format your response as a clean JSON object with these fields: 
                    {
              "make": "",
              "color": "",
              "bodyType": "",
              "confidence": 0.0
            }
      
            For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
            Only respond with the JSON object, nothing else.
              `;
      
          const result = await model.generateContent([imagePart, prompt]);
      
          const response = await result.response.text();
          const cleanedText = response.replace(/```(?:json)?\n?/g, "").trim();
      
          
          try {
              const carDetails = JSON.parse(cleanedText)
              
            return {
                success : true , 
                data : carDetails
            }
          } catch (error) {
            return {
                success : false , 
                error : "Failed to parse AI response"
            }
          }
    } catch (error) {
        
    }
}