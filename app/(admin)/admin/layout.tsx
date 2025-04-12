"use client";
import { useGlobalState } from "@/components/contextProvider";
import Header from "@/components/Header";
import Sidebar from "@/app/(admin)/admin/_components/Sidebar";
import { checkUser } from "@/lib/checkUser";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
const AdminLayout = ({ children }) => {
  // const [isAdmin , setIsAdmin] = useState(false)
  // const {
  //   signedInUser: { user },
  // } = useGlobalState();


//   useEffect(()=>{
//     let person;
//         if(user){
//           person = checkUser(true , 
//             user.id,
//             user.firstName! + user.lastName,
//             user.imageUrl,
//             user.emailAddresses?.[0]?.emailAddress,
          
//         );

//         }

//         person?.then(p => {
//           if (p.role !== "Admin"){

//             return notFound()
//           }
//           console.log('the p is ' , p)
//           setIsAdmin(() => p.role === "ADMIN" ?true : false)}).catch(error => console.log('something happened'))

//           // console.log('is admin' , isAdmin)
          
// },[user])


  return <div className="h-full">
    <Header isAdminPage= {true}/>
    <div
    className="flex h-full w-56 flex-col top-20 fixed inset-y-0 z-50"
    ><Sidebar/></div>
    <main className="h-full md:pl-56 pt-[80px]">
      {children}
    </main>
  </div>;
};

export default AdminLayout;
