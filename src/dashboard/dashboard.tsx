import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";

import { ref, getDownloadURL, deleteObject } from "firebase/storage";

import type { CarProps } from "./CarCard";

import { useUploadFile } from "react-firebase-hooks/storage";
import { useFirebase } from "./firebase";

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [vehicles, setVehicles] = useState<CarProps[]>([]);
  const [newVehicle, setNewVehicle] = useState<CarProps>({
    stockNumber: "",
    year: "",
    make: "",
    model: "",
    vin: "",
    mileage: "",
    color: "",
    cost: "",
    date: "",
    image: "",
    link: "",
    filePath: "",
  });

  const [imgBool, setImgBool] = useState(false);

  const [editingVin, setEditingVin] = useState("");
  const [editedFields, setEditedFields] = useState<Partial<CarProps>>({});

  const { auth, db, storage } = useFirebase();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearLoggedInCookie();
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const clearLoggedInCookie = () => {
    // Set the cookie to expire in the past to delete it
    const pastDate = new Date(0);
    document.cookie = `isLoggedIn=; expires=${pastDate.toUTCString()}; path=/`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "vehicles"));
      const data: CarProps[] = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data() as CarProps);
      });
      setVehicles(data);
    } catch (error) {
      console.error("Fetch data error:", error);
    }
  };

  const addVehicle = async (vehicle: CarProps) => {
    try {
      const carDoc = doc(db, "vehicles", String(vehicle.vin));
      await setDoc(carDoc, vehicle);
      // const docRef = await addDoc(collection(db, "vehicles"), vehicle);
      const newVehicle = { ...vehicle, id: carDoc.id };
      setVehicles([...vehicles, newVehicle]);
    } catch (error) {
      console.error("Add vehicle error:", error);
    }
  };

  const editVehicle = async (vin: string, updatedVehicle: CarProps) => {
    try {
      const { vin: updatedVin, ...rest } = updatedVehicle;
      const updatedVehicleData = { ...rest };
      await updateDoc(doc(db, "vehicles", vin), updatedVehicleData);
      setVehicles((prevVehicles) => {
        const updatedVehicles = prevVehicles.map((vehicle) => {
          if (vehicle.vin === vin) {
            return { ...vehicle, ...rest };
          }
          return vehicle;
        });
        return updatedVehicles;
      });
    } catch (error) {
      console.error("Edit vehicle error:", error);
    }
  };

  const deleteVehicle = async (vehicle: CarProps) => {
    try {
      await deleteDoc(doc(db, "vehicles", vehicle.vin));
      try {
        const imageRef = ref(storage, vehicle.filePath);
        await deleteObject(imageRef);
      } catch (error) {
        // console.error("Delete image error:", error);
      }
      setVehicles((prevVehicles) =>
        prevVehicles.filter((prevVehicle) => prevVehicle.vin !== vehicle.vin)
      );
    } catch (error) {
      console.error("Delete vehicle error:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setEditedFields((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    // await updateDoc(doc(db, "vehicles", editedFields.vin), {
    //     [field]: value,
    // });
  };

  const [uploadFile] = useUploadFile();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    const filePath = file ? `vehicleImages/${Date.now()}_${file.name}` : "";
    const imageRef = ref(storage, filePath);
    setImgBool(true);

    if (file) {
      const result = await uploadFile(imageRef, file, {
        contentType: "image/jpeg",
      });
    }

    const imageUrl = await getDownloadURL(imageRef);
    setNewVehicle({
      ...newVehicle,
      image: imageUrl,
      filePath: filePath,
    });
  };

  const handleEditImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    const filePath = file ? `vehicleImages/${Date.now()}_${file.name}` : "";
    const imageRef = ref(storage, filePath);

    if (file) {
      const result = await uploadFile(imageRef, file, {
        contentType: "image/jpeg",
      });
    }

    const imageUrl = await getDownloadURL(imageRef);
    setEditedFields((prevState) => ({
      ...prevState,
      image: imageUrl,
      filePath: filePath,
    }));
  };

  const handleDeleteImage = async (vehicle: CarProps) => {
    const imageRef = ref(storage, vehicle.filePath);
    await deleteObject(imageRef);
    setEditedFields((prevState) => ({
      ...prevState,
      image: "",
      filePath: "",
    }));

    await updateDoc(doc(db, "vehicles", vehicle.vin), {
      image: "",
      filePath: "",
    });

    setVehicles((prevVehicles) => {
      const updatedVehicles = prevVehicles.map((prevVehicle) => {
        if (prevVehicle.vin === vehicle.vin) {
          return { ...prevVehicle, image: "", filePath: "" };
        }
        return prevVehicle;
      });
      return updatedVehicles;
    });
  };

  const handleEdit = (vin: string) => {
    setEditingVin(vin);
  };

  const handleSave = (vin: string) => {
    editVehicle(vin, editedFields as CarProps);
    setEditingVin("");
  };

  const handleAddVehicle = () => {
    if (!imgBool) {
      addVehicle(newVehicle);
    } else {
      if (newVehicle.image) {
        addVehicle(newVehicle);
        setImgBool(false);
        setNewVehicle({
          stockNumber: "",
          year: "",
          make: "",
          model: "",
          vin: "",
          mileage: "",
          color: "",
          cost: "",
          date: "",
          image: "",
          link: "",
          filePath: "",
        });
      }
    }
    alert("Vehicle added successfully!");
  };

  return (
    <div>
      <div style={{ margin: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <h2>Welcome!</h2>
          <button onClick={handleLogout} style={{ margin: "0" }}>
            Logout
          </button>
        </div>
        <h3 style={{ marginTop: "50px" }}>Add Vehicle</h3>
        <form
          id="add-vehicle-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddVehicle();
          }}
          autoComplete="off"
        >
          <input
            autoComplete="off"
            type="text"
            placeholder="Stock Number"
            value={newVehicle.stockNumber}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                stockNumber: e.target.value,
              })
            }
            // required
            id="addStockNumber"
            name="addStockNumber"
          />
          <input
            autoComplete="off"
            type="text"
            placeholder="Year"
            value={newVehicle.year}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                year: e.target.value,
              })
            }
            // required
            id="addYear"
            name="addYear"
          />
          <input
            type="text"
            placeholder="Make"
            value={newVehicle.make}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                make: e.target.value,
              })
            }
            // required
            id="addMake"
            name="addMake"
          />
          <input
            type="text"
            placeholder="Model"
            value={newVehicle.model}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                model: e.target.value,
              })
            }
            // required
            id="addModel"
            name="addModel"
          />
          <input
            type="text"
            placeholder="VIN"
            value={newVehicle.vin}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                vin: e.target.value,
              })
            }
            required
            id="addVin"
            name="addVin"
          />
          <input
            type="text"
            placeholder="Mileage"
            value={newVehicle.mileage}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                mileage: e.target.value,
              })
            }
            // required
            id="addMileage"
            name="addMileage"
          />
          <input
            type="text"
            placeholder="Color"
            value={newVehicle.color}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                color: e.target.value,
              })
            }
            // required
            id="addColor"
            name="addColor"
          />
          <input
            type="text"
            placeholder="Cost"
            value={newVehicle.cost}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                cost: e.target.value,
              })
            }
            // required
            id="addCost"
            name="addCost"
          />
          <input
            type="text"
            placeholder="Date"
            value={newVehicle.date}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                date: e.target.value,
              })
            }
            // required
            id="addDate"
            name="addDate"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              handleImageUpload(e);
            }}
            // required
            id="addImage"
            name="addImage"
          />
          <input
            type="text"
            placeholder="Link"
            value={newVehicle.link}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                link: e.target.value,
              })
            }
            // required
            id="addLink"
            name="addLink"
          />
          <button type="submit">Add</button>
        </form>

        <h3 style={{ marginTop: "50px" }}>Vehicles</h3>
        <ul>
          {vehicles.map((vehicle) => (
            <div className="vehicleCard" key={vehicle.vin}>
              <div className="vehicle-info">
                <div className="info-row">
                  <span className="label">Stock Number:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editStockNumber"
                        name="editStockNumber"
                        value={editedFields.stockNumber !== undefined ? editedFields.stockNumber : vehicle.stockNumber}
                        onChange={(e) =>
                          handleChange("stockNumber", e.target.value)
                        }
                      />
                    ) : (
                      vehicle.stockNumber
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Year:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editYear"
                        name="editYear"
                        value={editedFields.year || vehicle.year}
                        onChange={(e) => handleChange("year", e.target.value)}
                      />
                    ) : (
                      vehicle.year
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Make:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editMake"
                        name="editMake"
                        value={editedFields.make || vehicle.make}
                        onChange={(e) => handleChange("make", e.target.value)}
                      />
                    ) : (
                      vehicle.make
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Model:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editModel"
                        name="editModel"
                        value={editedFields.model || vehicle.model}
                        onChange={(e) => handleChange("model", e.target.value)}
                      />
                    ) : (
                      vehicle.model
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">VIN:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editVin"
                        name="editVin"
                        value={editedFields.vin || vehicle.vin}
                        onChange={(e) => handleChange("vin", e.target.value)}
                      />
                    ) : (
                      vehicle.vin
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Mileage:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editMileage"
                        name="editMileage"
                        value={editedFields.mileage || vehicle.mileage}
                        onChange={(e) =>
                          handleChange("mileage", e.target.value)
                        }
                      />
                    ) : (
                      vehicle.mileage
                    )}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Color:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editColor"
                        name="editColor"
                        value={editedFields.color || vehicle.color}
                        onChange={(e) => handleChange("color", e.target.value)}
                      />
                    ) : (
                      vehicle.color
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Cost:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editCost"
                        name="editCost"
                        value={editedFields.cost || vehicle.cost}
                        onChange={(e) => handleChange("cost", e.target.value)}
                      />
                    ) : (
                      vehicle.cost
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editDate"
                        name="editDate"
                        value={editedFields.date || vehicle.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                      />
                    ) : (
                      vehicle.date
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Image:</span>
                  <span className="value">
                    {vehicle.image ? (
                      editingVin === vehicle.vin ? (
                        <>
                          <img
                            src={vehicle.image}
                            alt="vehicle"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            className="delete-image-button"
                            onClick={() => handleDeleteImage(vehicle)}
                          >
                            Delete Image
                          </button>
                        </>
                      ) : (
                        <img
                          src={vehicle.image}
                          alt="vehicle"
                          style={{
                            width: "200px",
                            height: "200px",
                            objectFit: "cover",
                          }}
                        />
                      )
                    ) : editingVin === vehicle.vin ? (
                      <input
                        type="file"
                        id="editImage"
                        name="editImage"
                        accept="image/*"
                        onChange={(e) => {
                          handleEditImageUpload(e);
                        }}
                      />
                    ) : (
                      <p style={{ color: "orange" }}>
                        No image, please click edit to upload.
                      </p>
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Link:</span>
                  <span className="value">
                    {editingVin === vehicle.vin ? (
                      <input
                        type="text"
                        id="editLink"
                        name="editLink"
                        value={editedFields.link || vehicle.link}
                        onChange={(e) => handleChange("link", e.target.value)}
                      />
                    ) : (
                      <a href={vehicle.link} target="_blank">
                        {vehicle.link}
                      </a>
                    )}
                  </span>
                </div>
              </div>

              {editingVin === vehicle.vin ? (
                <button
                  onClick={() => handleSave(vehicle.vin)}
                  style={{
                    border: "1px solid #2ba664",
                    backgroundColor: "#96ebb2",
                  }}
                >
                  Save
                </button>
              ) : (
                <button onClick={() => handleEdit(vehicle.vin)}>Edit</button>
              )}
              <button
                onClick={() => deleteVehicle(vehicle)}
                style={{
                  marginLeft: "50px",
                  width: "150px",
                  border: "1px solid #a62b38",
                  backgroundColor: "#eb969e",
                }}
              >
                Delete Vehicle
              </button>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
