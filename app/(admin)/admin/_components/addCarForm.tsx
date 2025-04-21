"use client";

import { z } from "zod";
import useFetch from "@/hook/use_fetch";
import { addCar, processCarImageWithAI } from "@/actions/cars";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Camera, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {fileToBase64} from "@/lib/helper"

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];

const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

const AddCarForm = () => {
  const router = useRouter();

  const { data: result, loading, fn } = useFetch(addCar);

  const {data : aiResult , loading : aiLoading , 
    fn : processAi , error : aiError
  } = useFetch(processCarImageWithAI)

  const [uploadedImages, setUploadedImages] = useState<(string | ArrayBuffer)[]>([]);

  const [imageError, setImageError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [uploadedAIImage , setUploadedAIImage] = useState(null)
  const [imagePreview, setImagePreview] = useState<string |ArrayBuffer>("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");
// start
 
// end

  useEffect(() => {
    if (result?.success) {
      toast.success("Car added successfully");
      router.push("/admin/cars");
    }
  }, [result]);

  const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
    featured: z.boolean().default(false),
    // Images are handled separately
  });

  const dropzone = useDropzone();
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(carFormSchema),
  });

  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) {
      setImageError("Please Upload Atleast One Image");
      return;
    }

    const carData = {
      ...data,
      year: parseInt(data.year),
      price: parseFloat(data.price),
      mileage: parseInt(data.mileage),
      seats: data.seats ? parseInt(data.seats) : null,
    };

    await fn({ carData, images: uploadedImages });
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };
  const onMultipleDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit and will be skipped`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    const newImages = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e?.target?.result);
        if (newImages.length === validFiles.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
          setImageError("");
          toast.success("Image Uploaded Successfully");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // FOR NORMAL UPLOADS - NOT AI
  const {
    getRootProps: getMultiImageRootProps,
    getInputProps: getMultiImageInputProps,
  } = useDropzone({
    onDrop: onMultipleDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });
  // FOR AI UPLOADS 

  const onAIDrop = (acceptedFiles) => {

    const file  = acceptedFiles[0]

    if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit and will be skipped`);
        return
      }
    setUploadedAIImage(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
      toast.success("Image uploaded successfully");
    }
   reader.readAsDataURL(file);
   
  };

  const processWithAi = async () =>{
    if(!uploadedAIImage) {
      toast.error("Please upload an image")
      return
    }

    const base64Image = await fileToBase64(uploadedAIImage);

    const mimeType= uploadedAIImage.type
    const data = {
      base64Image , mimeType
    }
    await processAi(data); // send base64 and mimeType
    
  }
  const {
    getRootProps: getAIImageRootProps,
    getInputProps: getAIImageInputProps,
  } = useDropzone({
    onDrop: onAIDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
    maxFiles : 1 
  });
  useEffect(() => {
    if (aiError) {
      toast.error(aiError?.message || "Failed to upload car")
    }
  }, [aiError]);
  useEffect(() => {
    if(aiResult?.success){
      const carDetails = aiResult?.data;

      // Update form with AI results
      setValue("make", carDetails.make);
      setValue("model", carDetails.model);
      setValue("year", carDetails.year.toString());
      setValue("color", carDetails.color);
      setValue("bodyType", carDetails.bodyType);
      setValue("fuelType", carDetails.fuelType);
      setValue("price", carDetails.price);
      setValue("mileage", carDetails.mileage);
      setValue("transmission", carDetails.transmission);
      setValue("description", carDetails.description);

      const reader = new FileReader()

      reader.onload = e => {
        setUploadedImages(prev => [...prev , e.target?.result])
      }
      reader.readAsDataURL(uploadedAIImage!)

      toast.success("Successfully Extracted Car Details")
      setActiveTab("manual")
    }
  }, [aiResult , uploadedAIImage]);
  return (
    <div>
      <Tabs
        defaultValue="ai"
        className="mt-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">MANUAL ENTRY</TabsTrigger>
          <TabsTrigger value="ai">AI UPLOAD</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6 w-100%">
          <Card className="w-100vw">
            <CardHeader>
              <CardTitle>About Car</CardTitle>
              <CardDescription>
                Fill In The Form For Car Description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      type="text"
                      id="make"
                      {...register("make")}
                      placeholder="eg. Toyota"
                      className={errors.make ? "border-red-500" : ""}
                    />
                    {errors.make && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      type="text"
                      id="model"
                      {...register("model")}
                      placeholder="eg. Camry"
                      className={errors.model ? "border-red-500" : ""}
                    />
                    {errors.model && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      type="text"
                      id="year"
                      {...register("year")}
                      placeholder="eg. 2020"
                      className={errors.year ? "border-red-500" : ""}
                    />
                    {errors.year && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input
                      type="number"
                      id="mileage"
                      {...register("mileage")}
                      placeholder="eg. 2000km"
                      className={errors.mileage ? "border-red-500" : ""}
                    />
                    {errors.mileage && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      type="number"
                      id="price"
                      {...register("price")}
                      placeholder="eg. NGN 2000"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      type="text"
                      id="color"
                      {...register("color")}
                      placeholder="eg. Blue"
                      className={errors.color ? "border-red-500" : ""}
                    />
                    {errors.color && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>
                  {/* Fuel Type */}
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select
                      onValueChange={(value) => setValue("fuelType", value)}
                      defaultValue={getValues("fuelType")}
                    >
                      <SelectTrigger
                        className={errors.fuelType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fuelType && (
                      <p className="text-xs text-red-500">
                        {errors.fuelType.message}
                      </p>
                    )}
                  </div>

                  {/* Transmission */}
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select
                      onValueChange={(value) => setValue("transmission", value)}
                      defaultValue={getValues("transmission")}
                    >
                      <SelectTrigger
                        className={errors.transmission ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.transmission && (
                      <p className="text-xs text-red-500">
                        {errors.transmission.message}
                      </p>
                    )}
                  </div>

                  {/* Body Type */}
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Body Type</Label>
                    <Select
                      onValueChange={(value) => setValue("bodyType", value)}
                      defaultValue={getValues("bodyType")}
                    >
                      <SelectTrigger
                        className={errors.bodyType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bodyType && (
                      <p className="text-xs text-red-500">
                        {errors.bodyType.message}
                      </p>
                    )}
                  </div>

                  {/* Seats */}
                  <div className="space-y-2">
                    <Label htmlFor="seats">
                      Number of Seats{" "}
                      <span className="text-sm text-gray-500">(Optional)</span>
                    </Label>
                    <Input
                      id="seats"
                      {...register("seats")}
                      placeholder="e.g. 5"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) => setValue("status", value as "AVAILABLE" | "UNAVAILABLE" | "SOLD" )}
                      defaultValue={getValues("status")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter detailed description of the car..."
                    className={`min-h-32 ${
                      errors.description ? "border-red-500" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Featured */}
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox
                    id="featured"
                    checked={watch("featured")}
                    onCheckedChange={(checked) => {
                      setValue("featured", checked as boolean);
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="featured">Feature this car</Label>
                    <p className="text-sm text-gray-500">
                      Featured cars appear on the homepage
                    </p>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="images"
                    className={imageError ? "text-red-500" : ""}
                  >
                    Images
                    {imageError && <span className="text-red-500">*</span>}
                  </Label>
                  <div
                    {...getMultiImageRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 mt-2 transition ${
                      imageError ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <input {...getMultiImageInputProps()} />
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-12 w-12 align-middle text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Drag and drop or click to upload images
                      </p>

                      <p className="mt-1 text-gray-600 text-xs">
                        Supports : JPG , PNG of Max size 5MB
                      </p>
                    </div>
                  </div>
                  {imageError && (
                    <p className="text-xs text-red-500 mt-1">{imageError}</p>
                  )}
                </div>
                {uploadedImages.length > 0 && (
                  <div>
                    <h3>Uploaded Images {uploadedImages.length}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {uploadedImages.map((image, index) => {
                        return (
                          <div className="relative" key={index}>
                            <Image
                              src={image}
                              alt={`car image ${index + 1}`}
                              height={50}
                              width={50}
                              className="h-28 w-full object-cover rounded-md"
                              priority
                            />

                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity z-1"
                              onClick={() => removeImage(index)}
                            >
                              <X />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Car..
                    </>
                  ) : (
                    <>Add Car</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai">
          <Card >
            <CardHeader>
              <CardTitle>Car Detail Extraction by AI</CardTitle>
              <CardDescription>Upload an image of car to get a near to perfect car info</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {
                  imagePreview ?(<div className="flex flex-col items-center">
                    <img
                    src={imagePreview}
                    alt="Car Preview"
                    className="max-h-56 max-w-full object-contain mb-4"
                    />
                    <div 
                      className="flex gap-2"
                    >
                      <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>{
                        setImagePreview(null)
                        setUploadedAIImage(null)
                      }}
                      
                      >

                        Remove
                      </Button>
                      <Button
                      size="sm"
                      onClick={processWithAi}
                      disabled={aiLoading}
                      
                      >
                        {aiLoading ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Processing...
                        </>
                      :<>
                      <Camera className="mr-2 h-4 w-4"/>
                      Extract Details
                      </>  
                      }
                        
                      </Button>
                    </div>
                  </div>) :
                  <div {...getAIImageRootProps()} className="cursor-pointer hover:bg-gray-50 transition">

                    <input {...getAIImageInputProps()}/>
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-2"/>
                      <p className="text-gray-500 mb-2">
                        Drag and Drop or Click to Upload a Car Image
                      </p>
                      <p className="text-gray-400 text-sm">
                        Supports : JPG , PNG ( MAX : 5MB )
                      </p>
                    </div>
                  </div>
                }
              </div> 

              <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">How it works</h3>
                  <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                    <li>Upload a clear image of the car</li>
                    <li>Click "Extract Details" to analyze with Gemini AI</li>
                    <li>Review the extracted information</li>
                    <li>Fill in any missing details manually</li>
                    <li>Add the car to your inventory</li>
                  </ol>
                </div>

                <div className="bg-amber-50 p-4 rounded-md">
                  <h3 className="font-medium text-amber-800 mb-1">
                    Tips for best results
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-700">
                    <li>• Use clear, well-lit images</li>
                    <li>• Try to capture the entire vehicle</li>
                    <li>• For difficult models, use multiple views</li>
                    <li>• Always verify AI-extracted information</li> 
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddCarForm;
