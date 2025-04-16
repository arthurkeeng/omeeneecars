"use client";
import {
  getDealershipInfo,
  saveWorkingHours,
  getUsers,
  updateUserRole,
} from "@/actions/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useFetch from "@/hook/use_fetch";
import {
  Clock,
  Loader2,
  Save,
  Search,
  Shield,
  User,
  Users,
  UserX,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];
const SettingsForm = () => {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );

  const [userSearch, setUserSearch] = useState("");
  const [accessDialogOpen , setAccessDialogOpen] = useState(false)
  const [userAction , setUserAction] = useState("revoke")
  const [userToUpdate , setUserToUpdate] = useState("")
  const {
    loading: fetchSettings,
    fn: fetchDealershipInfo,
    data: settingsData,
    error: settingsError,
  } = useFetch(getDealershipInfo);

  useEffect(() => {
    if (settingsData?.success && settingsData.data) {
      const dealership = settingsData.data;
      if (dealership.workingHours.length > 0) {
        const mappedHours = DAYS.map((day) => {
          const hourData = dealership.workingHours.find(
            (h) => h.dayOfWeek === day.value
          );

          if (hourData) {
            return {
              dayOfWeek: hourData.dayOfWeek,
              openTime: hourData.openTime,
              closeTime: hourData.closeTime,
              isOpen: hourData.isOpen,
            };
          }
          return {
            dayOfWeek: day.value,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: day.value !== "SUNDAY",
          };
        });
        setWorkingHours(mappedHours);
      }
    }
  }, [settingsData]);

  const {
    loading: savingHours,
    fn: saveHours,
    data: saveResult,
    error: saveError,
  } = useFetch(saveWorkingHours);
  const {
    loading: fetchingUsers,
    fn: fetchUsers,
    data: usersData,
    error: usersError,
  } = useFetch(getUsers);
  const {
    loading: updatingRole,
    fn: updateRole,
    data: updateRoleResult,
    error: updateRoleError,
  } = useFetch(updateUserRole);

  useEffect(() => {

    if(updateRoleResult?.success) {
      setAccessDialogOpen(false)
      fetchUsers({});
    }
  }, [updateRoleResult]);

  useEffect(()=>{
    fetchDealershipInfo({})
  },[])
  const openWorkingHours = async () => {
    fetchDealershipInfo({});
  };
  const openUsers = async () => {
    fetchUsers({});
  };

  const handleWorkingHourChange = (index, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };

    setWorkingHours(updatedHours);
  };
  const handleSavedHours = async () => {
    await saveHours({ workingHours });
  };

  useEffect(() => {
    if (saveResult?.success) {
      toast.success("Working hours saved successfully");
      fetchDealershipInfo({});
    }
  }, [saveResult]);



  const filteredUser = usersData?.success
    ? usersData.data.filter(
        (user) =>
          user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
      )
    : [];

    const handleRemoveAdmin = async (user) =>{
       
                await updateRole({userToChangeId : user.id , role:"USER"})
               
                
              }
              // to make admin
              const handleMakeAdmin = async (user) =>{
                
                await updateRole({userToChangeId : user.id , role:"ADMIN"})
                if(updateRoleResult?.success) {
              setAccessDialogOpen(false)
            }
          
        
    }
  return (
    <div className="spacy-y-6">
      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours" onClick={openWorkingHours}>
            <Clock className="h-4 w-4 mr-2" />
            Working Hours
          </TabsTrigger>
          <TabsTrigger value="admin"
          onClick={openUsers}
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Users
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hours" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set Your Dealership's Working Hours for Each Day of The Week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS.map((day, index) => {
                  return (
                    <div
                      key={day.value}
                      className="grid grid-cols-12 gap-4 items-center py-3 px-4 rounded-lg hover:bg-slate-50"
                    >
                      <div className="col-span-3 md:col-span-2">
                        <div className="font-medium">{day.label}</div>
                      </div>
                      <div className="flex items-center col-span-9 md:col-span-2">
                        <Checkbox
                          id={`is-open-${day.value}`}
                          checked={workingHours[index]?.isOpen}
                          onCheckedChange={(checked) => {
                            handleWorkingHourChange(index, "isOpen", checked);
                          }}
                        />
                        <Label
                          htmlFor={`is-open-${day.value}`}
                          className="ml-2 cursor-pointer"
                        >
                          {workingHours[index]?.isOpen ? "Open" : "Closed"}
                        </Label>
                      </div>

                      {workingHours[index]?.isOpen && (
                        <>
                          <div className="col-span-3 md:col-span-2">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <Input
                                type="time"
                                value={workingHours[index]?.openTime}
                                onChange={(e) =>
                                  handleWorkingHourChange(
                                    index,
                                    "openTime",
                                    e.target.value
                                  )
                                }
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="text-center col-span-1">to</div>
                          <div className="col-span-5 md:col-span-3">
                            <Input
                              type="time"
                              value={workingHours[index]?.closeTime}
                              onChange={(e) =>
                                handleWorkingHourChange(
                                  index,
                                  "closeTime",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          </div>
                        </>
                      )}
                      {!workingHours[index]?.isOpen && (
                        <div className="col-span-11 md:col-span-6 text-gray-500 italic text-sm">
                          Closed All Day
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex mt-6 justify-end">
                <Button onClick={handleSavedHours} disabled={savingHours}>
                  {savingHours ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save />
                      Save Working Hours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Manage Users with Admin Privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-9 w-full"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              {fetchingUsers ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {usersData?.success && filteredUser.length > 0 ? (
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead >User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                filteredUser.map(user => {
                                  
                                   return  <TableRow  key={user.id}>
                                    <TableCell 
                                  
                                    className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 items-center justify-center relative">
                                    {user.imageUrl ? 
                                    <img 
                                    src={user.imageUrl}
                                    alt={user.name || "User"}
                                    className="w-full h-full object-cover"
                                    />
                                    : <Users
                                    className="h-4 w-4 text-gray-500"
                                    />}
                                </div>
                                <span>{user.name || "Unnamed User"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                                {user.email}
                            </TableCell>
                            <TableCell>
                               <Badge
                               className={
                                user.role === "ADMIN"?"bg-green-800" : "bg-gray-800"
                               }
                               >
                                {user.role}
                               </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               {
                                user.role === "ADMIN" ? 
                                <Button
                                variant="outline"
                                size='sm'
                                className="text-red-600"
                                onClick={() => {
                                  setUserAction("revoke")
                                  setAccessDialogOpen(true)  
                                  setUserToUpdate(user)
                                  // handleRemoveAdmin(user)
                                }}
                                disabled={updatingRole}
                                >
                                    <UserX className="h-4 w-4 mr-2"/>
                                    Remove Admin</Button> : <Button
                                variant="outline"
                                size='sm'
                                className="text-red-600"
                                onClick={() => {
                                  setUserAction("make")
                                  // handleMakeAdmin(user)
                                setAccessDialogOpen(true)  
                                  setUserToUpdate(user)
                                }

                                }
                                disabled={updatingRole}>
                                    <Shield className="h-4 w-4 mr-2"/>
                                    Make Admin
                                </Button>
                               }
                            </TableCell>
                          </TableRow>
                                })
                            }
                            
                           
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="mb-1 text-lg font-medium text-gray-900">
                        No Users Found
                      </h3>
                      <p className="text-greay-500">
                        {userSearch
                          ? "No Users Match Your Search Criteria"
                          : "There Are No Users Registered Yet"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Action?</DialogTitle>
                  <DialogDescription>
                    Are You Sure You Want to {userAction === "revoke" ? "Revoke User Admin Privileges" :"Make User Admin"} . This action cannot be undone
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAccessDialogOpen(false)}
                    disabled={updatingRole}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={()=>userAction === "revoke" ? handleRemoveAdmin(userToUpdate) : handleMakeAdmin(userToUpdate)}
                    disabled={updatingRole}
                  >
                    {updatingRole ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                         {userAction == "revoke" ? "Revoking..." :"Making Admin.."}
                      </>
                    ) : (
                      <>
                      Update
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
    </div>
  );
};

export default SettingsForm;
