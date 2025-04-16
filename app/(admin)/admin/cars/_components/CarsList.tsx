"use client";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  CarIcon,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarOff,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import useFetch from "@/hook/use_fetch";
import { getCars, updateCarStatus, deleteCar } from "@/actions/cars";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CarsList = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user } = useUser();
  const [userId, setUserId] = useState("");
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    loading: loadingCars,
    fn: fetchCarsFn,
    data: carData,
    error: carsError,
  } = useFetch(getCars);
  const {
    loading: deletingCar,
    fn: deleteCarFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteCar);
  const {
    loading: updatingCar,
    fn: updatingCarFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCarStatus);

  const loadCars = async () => {
    await fetchCarsFn({ search });
  };

  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Car Updated Successfully");
      fetchCarsFn({ search });
    }
    if (deleteResult?.success) {
      toast.success("Car Deleted Successfully");
      fetchCarsFn({ search });
    }
  }, [updateResult, deleteResult]);

  useEffect(() => {
    if (carsError) {
      toast.error("Failed to Perform Action Successfully");
    }
    if (updateError) {
      toast.error("Failed to Perform Action Successfully");
    }
    if (deleteError) {
      toast.error("Failed to Perform Action Successfully");
    }
  }, [carsError, deleteError, updateError]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCarsFn({ search });

    // api call
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            AVAILABLE
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            UNAVAILABLE
          </Badge>
        );
      case "SOLD":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            SOLD
          </Badge>
        );
    }
  };

  const handleFeatureToggle = async (car) => {
    await updatingCarFn({ id: car.id, featured: !car.featured });
  };
  const handleStatusToggle = async (id, status) => {
    await updatingCarFn({ id, status });
  };
  const handleDelete = async () => {
    if (!carToDelete) return;
    await deleteCarFn({ id: carToDelete.id });
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          onClick={() => router.push("/admin/cars/create")}
          className="flex items-center"
        >
          <Plus className="h-4 w-4" /> Add Car
        </Button>
        <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 to-gray-500" />
            <Input
              className="pl-9 w-full sm:w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="Search"
              placeholder="Search Cars..."
            />
          </div>
        </form>
      </div>
      {/* cars table */}
      <Card>
        <CardContent className="p-0">
          {loadingCars && !carData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : carData?.success && carData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Car Image</TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-rigth">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carData.data.map((car) => {
                    return (
                      <TableRow key={car.id}>
                        <TableCell className="w-10 h-10 rounded-md overflow-hidden">
                          {car.images && car.images.length > 0 ? (
                            <Image
                              src={car.images[0]}
                              alt={`${car.make} ${car.model}`}
                              height={40}
                              width={40}
                              priority
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center">
                              <CarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {car.make} {car.model}
                        </TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{formatCurrency(car.price)}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleFeatureToggle(car)}
                            disabled={updatingCar}
                          >
                            {car.featured ? (
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </TableCell>

                        <TableCell>{getStatusBadge(car.status)}</TableCell>
                        <TableCell className="">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel> Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/cars/${car.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusToggle(car.id, "AVAILABLE")
                                }
                                disabled={
                                  car.status === "AVAILABLE" || updatingCar
                                }
                              >
                                Set Available
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  car.status === "UNAVAILABLE" || updatingCar
                                }
                                onClick={() =>
                                  handleStatusToggle(car.id, "UNAVAILABLE")
                                }
                              >
                                Set Unavailable
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={car.status === "SOLD" || updatingCar}
                                onClick={() =>
                                  handleStatusToggle(car.id, "SOLD")
                                }
                              >
                                Mark as Sold
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setCarToDelete(car);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 px-4 justify-between">
              <CarIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No Cars Available
              </h3>
              <p className="text-gray-500 mb-4">
                {" "}
                {search ? (
                  "No Cars Match Your Search Criteria"
                ) :"Your Inventory is Empty . Add Cars to Get Started"}
              </p>
              <Button onClick={loadCars}>Load Cars</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion?</DialogTitle>
            <DialogDescription>
              Are You Sure You Want to Delete {carToDelete?.make}{" "}
              {carToDelete?.model} . This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingCar}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingCar}
            >
              {deletingCar ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Deleting...
                </>
              ) : (
                "Delete Car"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarsList;
