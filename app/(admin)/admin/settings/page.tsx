import SettingsForm from "./_components/settings_form"

export const metadata = {
  title : "Settings | Omeenee cars admin" , 
  description  :"Manage Dealership Working Hours and Admin Users"
}

const SettingsPage = () => {

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Settings
      </h1>
      <SettingsForm/>
    </div>
  )
}

export default SettingsPage
