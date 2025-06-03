import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Edit, Trash2, PlusCircle, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";


const AdminTopics = () => {
  const navigate = useNavigate();
  const [topicField, setTopicField] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [vehicleName, setVehicleName] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [isUpdatingTopic, setIsUpdatingTopic] = useState(false);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [topicsRes, vehiclesRes] = await Promise.all([
          axios.get("https://traffic-solve-cors-backend.vercel.app/api/topics"),
          axios.get(
            "https://traffic-solve-cors-backend.vercel.app/api/vehicles"
          ),
        ]);
        setTopics(topicsRes.data);
        setVehicles(vehiclesRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Vehicle CRUD operations
  const handleVehicleCreate = async (e) => {
    e.preventDefault();
    if (!vehicleName) {
      toast.error("Please enter a vehicle name.");
      return;
    }

    setIsCreatingVehicle(true);

    try {
      let imageUrl = "";
      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);
        imageData.append("upload_preset", "traffic-exam");

        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/deyqhzw8p/image/upload",
          imageData
        );
        imageUrl = cloudinaryResponse.data.secure_url;
      }

      await axios.post(
        "https://traffic-solve-cors-backend.vercel.app/api/vehicles",
        { name: vehicleName, photo: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Vehicle created successfully");
      setVehicleName("");
      setImage(null);
      setImagePreview(null);
      const response = await axios.get(
        "https://traffic-solve-cors-backend.vercel.app/api/vehicles"
      );
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to create vehicle", error);
      toast.error(error.response?.data?.message || "Failed to create vehicle");
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedItem) return;

    setIsDeletingVehicle(true);

    try {
      await axios.delete(
        `https://traffic-solve-cors-backend.vercel.app/api/vehicles/${selectedItem._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Vehicle deleted successfully");
      const response = await axios.get(
        "https://traffic-solve-cors-backend.vercel.app/api/vehicles"
      );
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to delete vehicle", error);
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
    } finally {
      setIsDeletingVehicle(false);
      setSelectedItem(null);
      setModalType(null);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!selectedItem) return;

    setIsUpdatingVehicle(true);

    try {
      let imageUrl = selectedItem.photo;
      if (image) {
        const imageData = new FormData();
        imageData.append("file", image);
        imageData.append("upload_preset", "traffic-exam");

        const cloudinaryResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/deyqhzw8p/image/upload",
          imageData
        );
        imageUrl = cloudinaryResponse.data.secure_url;
      }

      await axios.put(
        `https://traffic-solve-cors-backend.vercel.app/api/vehicles/${selectedItem._id}`,
        { name: vehicleName, photo: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Vehicle updated successfully");
      const response = await axios.get(
        "https://traffic-solve-cors-backend.vercel.app/api/vehicles"
      );
      setVehicles(response.data);
    } catch (error) {
      console.error("Failed to update vehicle", error);
      toast.error(error.response?.data?.message || "Failed to update vehicle");
    } finally {
      setIsUpdatingVehicle(false);
      setSelectedItem(null);
      setModalType(null);
      setVehicleName("");
      setImage(null);
      setImagePreview(null);
    }
  };

  // Topic CRUD operations
  const handleTopicCreate = async (e) => {
    e.preventDefault();
    if (!topicField) {
      toast.error("Please enter a topic name.");
      return;
    }
    if (selectedVehicles.length === 0) {
      toast.error("Please select at least one vehicle.");
      return;
    }

    setIsCreatingTopic(true);

    try {
      const response = await axios.post(
        "https://traffic-solve-cors-backend.vercel.app/api/topics",
        {
          name: topicField,
          vehicleIds: selectedVehicles,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        toast.success("Topic created successfully");
        setTopicField("");
        setSelectedVehicles([]);
        const topicsRes = await axios.get(
          "https://traffic-solve-cors-backend.vercel.app/api/topics"
        );
        setTopics(topicsRes.data);
      }
    } catch (error) {
      console.error("Failed to create topic", error);
      toast.error(error.response?.data?.message || "Failed to create topic");
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedItem) return;

    setIsDeletingTopic(true);

    try {
      await axios.delete(
        `https://traffic-solve-cors-backend.vercel.app/api/topics/${selectedItem._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Topic deleted successfully");
      const response = await axios.get(
        "https://traffic-solve-cors-backend.vercel.app/api/topics"
      );
      setTopics(response.data);
    } catch (error) {
      console.error("Failed to delete topic", error);
      toast.error(error.response?.data?.message || "Failed to delete topic");
    } finally {
      setIsDeletingTopic(false);
      setSelectedItem(null);
      setModalType(null);
    }
  };

  const handleUpdateTopic = async () => {
    if (!selectedItem) return;

    setIsUpdatingTopic(true);

    try {
      await axios.put(
        `https://traffic-solve-cors-backend.vercel.app/api/topics/${selectedItem._id}`,
        {
          name: topicField,
          vehicleIds: selectedVehicles,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Topic updated successfully");
      setTopicField("");
      setSelectedVehicles([]);
      const response = await axios.get(
        "https://traffic-solve-cors-backend.vercel.app/api/topics"
      );
      setTopics(response.data);
    } catch (error) {
      console.error("Failed to update topic", error);
      toast.error(error.response?.data?.message || "Failed to update topic");
    } finally {
      setIsUpdatingTopic(false);
      setSelectedItem(null);
      setModalType(null);
    }
  };
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const prepareEditForm = (item, type) => {
    setSelectedItem(item);
    setModalType(type);

    if (type.includes("vehicle")) {
      setVehicleName(item.name);
      setImagePreview(item.photo || null);
    } else if (type.includes("topic")) {
      setTopicField(item.name);
      setSelectedVehicles(item.vehicles.map((v) => v._id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Topic Creation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Create New Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTopicCreate} className="space-y-4">
              <div>
                <Label htmlFor="topic-name">Topic Name</Label>
                <Input
                  id="topic-name"
                  type="text"
                  value={topicField}
                  onChange={(e) => setTopicField(e.target.value)}
                  placeholder="Enter topic name"
                  required
                />
              </div>

              <div>
                <Label>Select Vehicle Type(s)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle._id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={`vehicle-${vehicle._id}`}
                        checked={selectedVehicles.includes(vehicle._id)}
                        onChange={() => handleVehicleChange(vehicle._id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor={`vehicle-${vehicle._id}`}
                        className="font-normal"
                      >
                        {vehicle.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isCreatingTopic}
              >
                {isCreatingTopic ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Topic"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Vehicle Creation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Add New Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVehicleCreate} className="space-y-4">
              <div>
                <Label htmlFor="vehicle-name">Vehicle Name</Label>
                <Input
                  id="vehicle-name"
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="Enter vehicle name"
                  required
                />
              </div>

              <div>
                <Label>Vehicle Image</Label>
                <div
                  {...getRootProps()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-32 object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <X className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        </div>
                        <div className="flex flex-col items-center text-sm text-gray-600">
                          {isDragActive ? (
                            <p className="text-blue-500">
                              Drop the image here...
                            </p>
                          ) : (
                            <>
                              <p className="text-center">
                                <span className="font-medium text-blue-600 hover:text-blue-500">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isCreatingVehicle}
              >
                {isCreatingVehicle ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Vehicle"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Topics Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Topics List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Topic Name</TableHead>
                  <TableHead>Associated Vehicles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic, index) => (
                  <TableRow key={topic._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{topic.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {topic.vehicles?.map((v) => (
                          <span
                            key={v._id}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => prepareEditForm(topic, "update-topic")}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => prepareEditForm(topic, "delete-topic")}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Vehicles List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Vehicle Name</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle, index) => (
                  <TableRow key={vehicle._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{vehicle.name}</TableCell>
                    <TableCell>
                      {vehicle.photo && (
                        <img
                          src={vehicle.photo}
                          alt={vehicle.name}
                          className="h-10 object-contain"
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            prepareEditForm(vehicle, "update-vehicle")
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            prepareEditForm(vehicle, "delete-vehicle")
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation/Edit Modal */}
      <AlertDialog
        open={!!modalType}
        onOpenChange={(open) => {
          if (!open) {
            setModalType(null);
            setSelectedItem(null);
          }
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {modalType === "delete-vehicle"
                ? "Delete Vehicle"
                : modalType === "update-vehicle"
                ? "Update Vehicle"
                : modalType === "delete-topic"
                ? "Delete Topic"
                : "Update Topic"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {modalType?.includes("delete")
                ? "This action cannot be undone. Are you sure you want to proceed?"
                : "Make changes to the item below."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {(modalType === "update-vehicle" || modalType === "update-topic") && (
            <div className="space-y-4 py-4">
              {modalType === "update-vehicle" && (
                <>
                  <div>
                    <Label htmlFor="edit-vehicle-name">Vehicle Name</Label>
                    <Input
                      id="edit-vehicle-name"
                      type="text"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-vehicle-image">Vehicle Image</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="mx-auto max-h-32 object-contain"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                            >
                              <X className="h-5 w-5 text-gray-600" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            </div>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="edit-vehicle-image"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="edit-vehicle-image"
                                  name="edit-vehicle-image"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {modalType === "update-topic" && (
                <>
                  <div>
                    <Label htmlFor="edit-topic-name">Topic Name</Label>
                    <Input
                      id="edit-topic-name"
                      type="text"
                      value={topicField}
                      onChange={(e) => setTopicField(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Associated Vehicles</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {vehicles.map((vehicle) => (
                        <div
                          key={vehicle._id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`modal-vehicle-${vehicle._id}`}
                            checked={selectedVehicles.includes(vehicle._id)}
                            onChange={() => handleVehicleChange(vehicle._id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label
                            htmlFor={`modal-vehicle-${vehicle._id}`}
                            className="font-normal"
                          >
                            {vehicle.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (modalType === "delete-vehicle") handleDeleteVehicle();
                else if (modalType === "update-vehicle") handleUpdateVehicle();
                else if (modalType === "delete-topic") handleDeleteTopic();
                else if (modalType === "update-topic") handleUpdateTopic();
              }}
              disabled={
                isDeletingVehicle ||
                isUpdatingVehicle ||
                isDeletingTopic ||
                isUpdatingTopic
              }
            >
              {isDeletingVehicle ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isUpdatingVehicle ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isDeletingTopic ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isUpdatingTopic ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {modalType === "delete-vehicle"
                ? isDeletingVehicle
                  ? "Deleting..."
                  : "Delete"
                : modalType === "update-vehicle"
                ? isUpdatingVehicle
                  ? "Updating..."
                  : "Update"
                : modalType === "delete-topic"
                ? isDeletingTopic
                  ? "Deleting..."
                  : "Delete"
                : isUpdatingTopic
                ? "Updating..."
                : "Update"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTopics;