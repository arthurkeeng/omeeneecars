


const CarPage = async ({params}) => {
    const {id} = await params
  return (
    <div>
      The id is {id}
    </div>
  )
}

export default CarPage
