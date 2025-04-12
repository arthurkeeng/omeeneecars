import CarsList from "./_components/CarsList"

export const metadata = {
    title : "Cars | Vehicle Admin page",
    description : "Manage cars in your marketplace"
}

const CarPage = () => {
  return (
    <div className="p-6">
      <h1 className="mb-6 font-bold text-2xl">Cars Management</h1>
      <CarsList/>
    </div>
  )
}

export default CarPage
