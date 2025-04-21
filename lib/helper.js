

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

export async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Strip the base64 prefix
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }