'use server'
import { db } from "@/lib/prisma"
import { serializedCarData } from "@/lib/helper"
import { revalidatePath } from 'next/cache'

export async function getCarFilters() {
    try {
        const makes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { make: true },
            distinct: ["make"],
            orderBy: { make: "asc" }

        })
        const fuelTypes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { fuelType: true },
            distinct: ["fuelType"],
            orderBy: { fuelType: "asc" }

        })
        const bodyTypes = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { bodyType: true },
            distinct: ["bodyType"],
            orderBy: { bodyType: "asc" }

        })
        const transmissions = await db.car.findMany({
            where: { status: "AVAILABLE" },
            select: { transmission: true },
            distinct: ["transmission"],
            orderBy: { transmission: "asc" }

        })

        const priceAggregation = await db.car.aggregate({
            where: { status: 'AVAILABLE' },
            _min: { price: true },
            _max: { price: true }
        })
        return {
            success: true,
            data: {
                makes: makes.map(item => item.make),
                bodyTypes: bodyTypes.map(item => item.bodyType),
                fuelTypes: fuelTypes.map(item => item.fuelType),
                transmissions: transmissions.map(item => item.transmission),
                priceRange: {
                    min: priceAggregation._min.price ?
                        parseFloat(priceAggregation._min.price.toString()) : 0,
                    max: priceAggregation._max.price ?
                        parseFloat(priceAggregation._max.price.toString()) : 100000000000,

                }
            }
        }
    }
    catch (error) {
        throw new Error("Error Fetching Car Filters")
    }
}

export async function getCars(args, userId) {
    let {
        search = "",
        make = "",
        bodyType = "",
        fuelType = "",
        transmission = "",
        minPrice = 0,
        maxPrice = Number.MAX_SAFE_INTEGER,
        page = 1,
        limit = 6,
        sortBy = "newest",
    } = args[0]

    try {
        let dbUser = null
        if (userId) {
            dbUser = await db.user.findUnique({
                where: { clerkUserId: userId }
            })
        }
        let where = {
            status: "AVAILABLE"
        }
        if (search) {
            where.OR = [
                { make: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ]
        }
        if (make) where.make = { equals: make, mode: "insensitive" };
        if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
        if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
        if (transmission)
            where.transmission = { equals: transmission, mode: "insensitive" };
        // Add price range
        where.price = {
            gte: parseFloat(minPrice) || 0,
        };

        if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
            where.price.lte = parseFloat(maxPrice);
        }

        const skip = (page - 1) * limit;
        let orderBy = {};
        switch (sortBy) {
            case "priceAsc":
                orderBy = { price: "asc" };
                break;
            case "priceDesc":
                orderBy = { price: "desc" };
                break;
            case "newest":
            default:
                orderBy = { createdAt: "desc" };
                break;
        }
        const totalCars = await db.car.count({ where });
        const cars = await db.car.findMany({
            where,
            take: limit,
            skip,
            orderBy,
        });
        //   might not bother with this part

        let wishlisted = new Set();
        if (dbUser) {
            const savedCars = await db.userSavedCars.findMany({
                where: { userId: dbUser.id },
                select: { carId: true },
            });

            wishlisted = new Set(savedCars.map((saved) => saved.carId));
        }

        //   the part above might be discarded
        const serializedCars = cars.map((car) =>
            serializedCarData(car, wishlisted.has(car.id))
            // serializedCarData(car)
        );



        return {
            success: true,
            data: serializedCars,
            pagination: {
                total: totalCars,
                page,
                limit,
                pages: Math.ceil(totalCars / limit),
            },
        };

    } catch (error) {
        console.log('the error is ', error)
    }
}

export async function toggleSavedCar(args, userId) {
    let { carId } = args[0]
    try {
        if (!userId) throw new Error("Unauthorized")

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        })

        if (!user) throw new Error("User not found")

        const car = await db.car.findUnique({
            where: { id: carId }
        })
        if (!car) {
            return {
                success: false,
                error: "Car not found"
            }
        }

        const existingSave = await db.userSavedCars.findUnique({
            where: {
                userId_carId: {
                    userId: user.id,
                    carId
                }
            }
        })

        if (existingSave) {
            await db.userSavedCars.delete({

                where: {
                    userId_carId: {
                        userId: user.id, carId
                    }
                }
            })

            revalidatePath("/saved-cars")
            return {
                success: true,
                saved: false,
                message: "Car removed from favorites"
            }
        }
        await db.userSavedCars.create({
            data: {
                userId: user.id,
                carId,
            },
        });

        revalidatePath(`/saved-cars`);
        return {
            success: true,
            saved: true,
            message: "Car added to favorites",
        };
    } catch (error) {
        console.log('eror', error)
        throw new Error("Something Happend")
    }
}


export async function getSavedCars(userId) {
    try {
        if (!userId) throw new Error("Unauthenticated")

        const user = await db.user.findUnique({
            where : {
                clerkUserId : userId
            }
        })

        if(!user){
            return {
                success : false , 
                error : "User not found"
            }
        }
        const savedCars = await db.userSavedCars.findMany({
            where: {
                userId: user.id
            } , 
            include : {
                car : true
            } , 
            orderBy : {
                savedAt : "desc"
            }
        })

        const serializedCars = savedCars.map(saved=> serializedCarData(saved.car))
        
        return {
            success : true  , 
            data : serializedCars
        }
    }

    catch (error) {
        console.error("Error fetching cars " , error)
        return {
            success : false , 
            error : "Error fetching cars"
        }
    }
}

export async function getCarById(carId , userId){
    try {
        let dbUser = null
        if(!userId) throw new Error("Unauthorized")
        if(userId) {
            dbUser  = await db.user.findUnique({
                where : {clerkUserId : userId}
            })
        }

        const car = await db.car.findUnique({
            where : {id : carId}
        })
        if(!car){
            return {
                success : false , 
                error : "Car Not Found"
            }
        }

        let isWishlisted = false
        if(dbUser) {
            const savedCar = await db.userSavedCars.findUnique({
                where : {
                    userId_carId: {
                        userId : dbUser.id, 
                        carId
                    }
                }
            })
            isWishlisted = !!savedCar
        }

        const existingTestDrive = await db.testDriveBooking.findFirst({
            where : {
                carId , userId : dbUser.id , 
                status : {in : ["PENDING" , "CONFIRMED" , "COMPLETED"]}
            }, 
            orderBy : {
                createdAt : "desc"
            }
        })
        let userTestDrive = null;
        if(existingTestDrive){
            userTestDrive = {
                id : existingTestDrive.id , 
                status : existingTestDrive.status, 
                bookingDate : existingTestDrive.bookingDate.toISOString()
            }
        }
        const dealership = await db.dealershipInfo.findFirst({
            include : {
                workingHours : true
            }
        })
        

        return {
            success: true,
            data: {
              ...serializedCarData(car, isWishlisted),
              testDriveInfo: {
                userTestDrive,
                dealership: dealership
                  ? {
                      ...dealership,
                      createdAt: dealership.createdAt.toISOString(),
                      updatedAt: dealership.updatedAt.toISOString(),
                      workingHours: dealership.workingHours.map((hour) => ({
                        ...hour,
                        createdAt: hour.createdAt.toISOString(),
                        updatedAt: hour.updatedAt.toISOString(),
                      })),
                    }
                  : null,
              },
            },
          };
    } catch (error) {
        console.log('error is ' , error)
        throw new Error("Failed to get Car")
    }
}