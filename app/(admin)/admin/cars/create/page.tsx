import AddCarForm from "../../_components/addCarForm"


export const metadata = {
  title : "Add New Car ",
  description : "Add a New Car to the Marketplace"
}
const AddPage = () => {
  return (
    <div className="p-6">
      <h1 className="mb-6 font-bold text-2xl">Add New Car</h1>
      <AddCarForm/>
    </div>
  )
}

export default AddPage
