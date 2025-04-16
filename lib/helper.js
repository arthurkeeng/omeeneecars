

export const serializedCarData = (car , wishlisted = false) =>{
    return {
        ...car , 
        price : car.price ?parseFloat(car.price.toString()) : 0, 
        createdAt : car.createdAt?.toISOString(),
        updatedAt : car.updatedAt?.toISOString(),
        wishlisted
    }
}

export const formatCurrency = amount => {
    return new Intl.NumberFormat("en-NG", {
        style : "currency", 
        currency : "NGN"
    }).format(amount)
}