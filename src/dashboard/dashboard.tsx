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

function computeHash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

function computeSlug(v: Partial<CarProps>): string {
  return (
    (v.stockNumber && String(v.stockNumber).trim()) ||
    (v.slug && String(v.slug).trim()) ||
    computeHash(
      [
        v.year ?? "",
        v.make ?? "",
        v.model ?? "",
        v.vin ?? "",
        v.mileage ?? "",
        v.color ?? "",
        v.cost ?? "",
        v.date ?? "",
      ].join("|")
    )
  );
}

function normalizeVehicle(v: any, idx: number): CarProps {
  const images: string[] = Array.isArray(v.images)
    ? v.images
    : v.image
    ? [v.image]
    : [];
  const filePaths: string[] = Array.isArray(v.filePaths)
    ? v.filePaths
    : v.filePath
    ? [v.filePath]
    : [];
  const primaryImageIndex: number =
    typeof v.primaryImageIndex === "number" ? v.primaryImageIndex : 0;
  const slug = computeSlug(v);
  const order: number = typeof v.order === "number" ? v.order : idx;

  const image = images[primaryImageIndex] ?? images[0] ?? v.image ?? "";
  const filePath =
    filePaths[primaryImageIndex] ?? filePaths[0] ?? v.filePath ?? "";

  return {
    year: String(v.year ?? ""),
    make: String(v.make ?? ""),
    model: String(v.model ?? ""),
    mileage: String(v.mileage ?? ""),
    color: String(v.color ?? ""),
    image,
    link: String(v.link ?? ""),
    vin: String(v.vin ?? ""),
    stockNumber: v.stockNumber ? String(v.stockNumber) : undefined,
    cost: String(v.cost ?? ""),
    date: String(v.date ?? ""),
    filePath: filePath || undefined,
    images,
    filePaths,
    primaryImageIndex,
    slug,
    order,
  };
}

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
    images: [],
    filePaths: [],
    primaryImageIndex: 0,
    slug: "",
    order: 0,
  });

  const [editingVin, setEditingVin] = useState("");
  const [editedFields, setEditedFields] = useState<Partial<CarProps>>({});
  const { auth, db, storage } = useFirebase();
  const [uploadFile] = useUploadFile();

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
    const pastDate = new Date(0);
    document.cookie = `isLoggedIn=; expires=${pastDate.toUTCString()}; path=/`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortAndSet = (arr: CarProps[]) => {
    const sorted = [...arr].sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) -
        (b.order ?? Number.MAX_SAFE_INTEGER)
    );
    setVehicles(sorted);
  };

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "vehicles"));
      const data: CarProps[] = [];
      querySnapshot.docs.forEach((d, idx) => {
        data.push(normalizeVehicle(d.data(), idx));
      });
      sortAndSet(data);
    } catch (error) {
      console.error("Fetch data error:", error);
    }
  };

  const addVehicle = async (vehicle: CarProps) => {
    try {
      const slug = computeSlug(vehicle);
      const order =
        vehicles.length > 0
          ? Math.max(
              ...vehicles.map((v) =>
                typeof v.order === "number" ? v.order : 0
              )
            ) + 1
          : 0;

      const images = vehicle.images ?? (vehicle.image ? [vehicle.image] : []);
      const filePaths = vehicle.filePaths ?? (vehicle.filePath ? [vehicle.filePath] : []);
      const primaryImageIndex =
        typeof vehicle.primaryImageIndex === "number"
          ? vehicle.primaryImageIndex
          : 0;

      const primaryImage =
        images[primaryImageIndex] ?? images[0] ?? vehicle.image ?? "";
      const primaryPath =
        filePaths[primaryImageIndex] ??
        filePaths[0] ??
        vehicle.filePath ??
        "";

      const carDoc = doc(db, "vehicles", String(vehicle.vin));
      await setDoc(carDoc, {
        ...vehicle,
        slug,
        order,
        images,
        filePaths,
        primaryImageIndex,
        image: primaryImage,
        filePath: primaryPath,
      });

      const newV = normalizeVehicle(
        {
          ...vehicle,
          slug,
          order,
          images,
          filePaths,
          primaryImageIndex,
        },
        order
      );
      sortAndSet([...vehicles, newV]);
      alert("Vehicle added successfully!");
    } catch (error) {
      console.error("Add vehicle error:", error);
    }
  };

  const editVehicle = async (vin: string, updatedVehicle: Partial<CarProps>) => {
    try {
      const rest = { ...updatedVehicle } as any;

      // Ensure slug and legacy fields stay consistent if images changed
      const current = vehicles.find((v) => v.vin === vin);
      const merged = { ...current, ...rest } as CarProps;

      const slug = computeSlug(merged);
      const images = merged.images ?? (merged.image ? [merged.image] : []);
      const filePaths = merged.filePaths ?? (merged.filePath ? [merged.filePath] : []);
      const primaryImageIndex =
        typeof merged.primaryImageIndex === "number"
          ? merged.primaryImageIndex
          : 0;

      const primaryImage =
        images[primaryImageIndex] ?? images[0] ?? merged.image ?? "";
      const primaryPath =
        filePaths[primaryImageIndex] ??
        filePaths[0] ??
        merged.filePath ??
        "";

      const updatedVehicleData = {
        ...rest,
        slug,
        images,
        filePaths,
        primaryImageIndex,
        image: primaryImage,
        filePath: primaryPath,
      };

      await updateDoc(doc(db, "vehicles", vin), updatedVehicleData);

      setVehicles((prev) => {
        const updatedVehicles = prev.map((vehicle) => {
          if (vehicle.vin === vin) {
            return normalizeVehicle({ ...vehicle, ...updatedVehicleData }, vehicle.order ?? 0);
          }
          return vehicle;
        });
        return updatedVehicles.sort(
          (a, b) =>
            (a.order ?? Number.MAX_SAFE_INTEGER) -
            (b.order ?? Number.MAX_SAFE_INTEGER)
        );
      });
    } catch (error) {
      console.error("Edit vehicle error:", error);
    }
  };

  const deleteVehicle = async (vehicle: CarProps) => {
    try {
      await deleteDoc(doc(db, "vehicles", vehicle.vin));
      // delete all images in storage (best-effort)
      const paths = vehicle.filePaths ?? (vehicle.filePath ? [vehicle.filePath] : []);
      for (const p of paths) {
        if (!p) continue;
        try {
          const imageRef = ref(storage, p);
          await deleteObject(imageRef);
        } catch {}
      }
      setVehicles((prevVehicles) =>
        prevVehicles.filter((prevVehicle) => prevVehicle.vin !== vehicle.vin)
      );
    } catch (error) {
      console.error("Delete vehicle error:", error);
    }
  };

  const handleChange = (field: keyof CarProps, value: any) => {
    setEditedFields((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // New: multiple upload for new vehicle
  const handleNewImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    const paths: string[] = [];

    for (const file of Array.from(files)) {
      const filePath = `vehicleImages/${newVehicle.vin || "no-vin"}/${Date.now()}_${file.name}`;
      const imageRef = ref(storage, filePath);
      await uploadFile(imageRef, file, {
        contentType: file.type || "image/jpeg",
      });
      const imageUrl = await getDownloadURL(imageRef);
      urls.push(imageUrl);
      paths.push(filePath);
    }

    const image = urls[0] ?? "";
    const filePathPrimary = paths[0] ?? "";

    setNewVehicle((prev) => ({
      ...prev,
      images: urls,
      filePaths: paths,
      primaryImageIndex: 0,
      image,
      filePath: filePathPrimary,
    }));
  };

  // Edit: add more images (append)
  const handleEditAddImages = async (
    vehicle: CarProps,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const baseImages = editedFields.images ?? vehicle.images ?? (vehicle.image ? [vehicle.image] : []);
    const basePaths = editedFields.filePaths ?? vehicle.filePaths ?? (vehicle.filePath ? [vehicle.filePath] : []);
    const images = [...baseImages];
    const filePaths = [...basePaths];

    for (const file of Array.from(files)) {
      const filePath = `vehicleImages/${vehicle.vin}/${Date.now()}_${file.name}`;
      const imageRef = ref(storage, filePath);
      await uploadFile(imageRef, file, {
        contentType: file.type || "image/jpeg",
      });
      const imageUrl = await getDownloadURL(imageRef);
      images.push(imageUrl);
      filePaths.push(filePath);
    }

    setEditedFields((prev) => ({
      ...prev,
      images,
      filePaths,
    }));
  };

  const handleDeleteImageAt = async (vehicle: CarProps, index: number) => {
    const baseImages = editedFields.images ?? vehicle.images ?? (vehicle.image ? [vehicle.image] : []);
    const basePaths = editedFields.filePaths ?? vehicle.filePaths ?? (vehicle.filePath ? [vehicle.filePath] : []);
    const images = [...baseImages];
    const filePaths = [...basePaths];

    const pathToDelete = filePaths[index];
    if (pathToDelete) {
      try {
        const imageRef = ref(storage, pathToDelete);
        await deleteObject(imageRef);
      } catch {}
    }

    images.splice(index, 1);
    filePaths.splice(index, 1);

    let primary = editedFields.primaryImageIndex ?? vehicle.primaryImageIndex ?? 0;
    if (primary === index) {
      primary = 0;
    } else if (primary > index) {
      primary = primary - 1;
    }

    await editVehicle(vehicle.vin, {
      images,
      filePaths,
      primaryImageIndex: primary,
    });
  };

  const handleSetPrimary = async (vehicle: CarProps, index: number) => {
    await editVehicle(vehicle.vin, {
      primaryImageIndex: index,
    });
  };

  const handleReorderImage = async (
    vehicle: CarProps,
    index: number,
    direction: "up" | "down"
  ) => {
    const baseImages = vehicle.images ?? (vehicle.image ? [vehicle.image] : []);
    const basePaths = vehicle.filePaths ?? (vehicle.filePath ? [vehicle.filePath] : []);
    const images = [...baseImages];
    const filePaths = [...basePaths];

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;

    [images[index], images[target]] = [images[target], images[index]];
    [filePaths[index], filePaths[target]] = [filePaths[target], filePaths[index]];

    let primary = vehicle.primaryImageIndex ?? 0;
    if (primary === index) primary = target;
    else if (primary === target) primary = index;

    await editVehicle(vehicle.vin, {
      images,
      filePaths,
      primaryImageIndex: primary,
    });
  };

  const handleEdit = (vin: string) => {
    setEditingVin(vin);
    setEditedFields({});
  };

  const handleSave = async (vin: string) => {
    await editVehicle(vin, editedFields as CarProps);
    setEditingVin("");
    setEditedFields({});
  };

  // Vehicle-level reordering
  const moveVehicle = async (idx: number, dir: "up" | "down") => {
    const arr = [...vehicles];
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= arr.length) return;

    const a = arr[idx];
    const b = arr[targetIdx];
    const aOrder = typeof a.order === "number" ? a.order : idx;
    const bOrder = typeof b.order === "number" ? b.order : targetIdx;

    // swap in DB
    await updateDoc(doc(db, "vehicles", a.vin), { order: bOrder });
    await updateDoc(doc(db, "vehicles", b.vin), { order: aOrder });

    // swap locally
    const newArr = [...arr];
    newArr[idx] = { ...b, order: aOrder };
    newArr[targetIdx] = { ...a, order: bOrder };
    sortAndSet(newArr);
  };

  const handleAddVehicle = async () => {
    await addVehicle(newVehicle);
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
      images: [],
      filePaths: [],
      primaryImageIndex: 0,
      slug: "",
      order: 0,
    });
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
            value={newVehicle.stockNumber || ""}
            onChange={(e) =>
              setNewVehicle({
                ...newVehicle,
                stockNumber: e.target.value,
              })
            }
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
            id="addDate"
            name="addDate"
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewImagesUpload}
            id="addImages"
            name="addImages"
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
            id="addLink"
            name="addLink"
          />
          <button type="submit">Add</button>
        </form>

        <h3 style={{ marginTop: "50px" }}>Vehicles</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {vehicles.map((vehicle, index) => {
            const isEditing = editingVin === vehicle.vin;
            const images = vehicle.images ?? (vehicle.image ? [vehicle.image] : []);
            const primary = vehicle.primaryImageIndex ?? 0;
            return (
              <div className="vehicleCard" key={vehicle.vin}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <button
                      onClick={() => moveVehicle(index, "up")}
                      disabled={index === 0}
                      style={{ marginRight: "6px" }}
                    >
                      ↑ Move Up
                    </button>
                    <button
                      onClick={() => moveVehicle(index, "down")}
                      disabled={index === vehicles.length - 1}
                    >
                      ↓ Move Down
                    </button>
                  </div>
                  <div style={{ opacity: 0.7 }}>Order: {vehicle.order ?? index}</div>
                </div>

                <div className="vehicle-info">
                  <div className="info-row">
                    <span className="label">Stock Number:</span>
                    <span className="value">
                      {isEditing ? (
                        <input
                          type="text"
                          id="editStockNumber"
                          name="editStockNumber"
                          value={
                            editedFields.stockNumber !== undefined
                              ? (editedFields.stockNumber as string)
                              : vehicle.stockNumber || ""
                          }
                          onChange={(e) => handleChange("stockNumber", e.target.value)}
                        />
                      ) : (
                        vehicle.stockNumber || "-"
                      )}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Year:</span>
                    <span className="value">
                      {isEditing ? (
                        <input
                          type="text"
                          id="editYear"
                          name="editYear"
                          value={(editedFields.year as string) || vehicle.year}
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
                      {isEditing ? (
                        <input
                          type="text"
                          id="editMake"
                          name="editMake"
                          value={(editedFields.make as string) || vehicle.make}
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
                      {isEditing ? (
                        <input
                          type="text"
                          id="editModel"
                          name="editModel"
                          value={(editedFields.model as string) || vehicle.model}
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
                      {isEditing ? (
                        <input
                          type="text"
                          id="editVin"
                          name="editVin"
                          value={(editedFields.vin as string) || vehicle.vin}
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
                      {isEditing ? (
                        <input
                          type="text"
                          id="editMileage"
                          name="editMileage"
                          value={(editedFields.mileage as string) || vehicle.mileage}
                          onChange={(e) => handleChange("mileage", e.target.value)}
                        />
                      ) : (
                        vehicle.mileage
                      )}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">Color:</span>
                    <span className="value">
                      {isEditing ? (
                        <input
                          type="text"
                          id="editColor"
                          name="editColor"
                          value={(editedFields.color as string) || vehicle.color}
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
                      {isEditing ? (
                        <input
                          type="text"
                          id="editCost"
                          name="editCost"
                          value={(editedFields.cost as string) || vehicle.cost}
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
                      {isEditing ? (
                        <input
                          type="text"
                          id="editDate"
                          name="editDate"
                          value={(editedFields.date as string) || vehicle.date}
                          onChange={(e) => handleChange("date", e.target.value)}
                        />
                      ) : (
                        vehicle.date
                      )}
                    </span>
                  </div>

                  {/* Image gallery */}
                  <div className="info-row">
                    <span className="label">Images:</span>
                    <span className="value" style={{ display: "block" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {images.length === 0 && (
                          <p style={{ color: "orange", margin: "6px 0" }}>
                            No image uploaded.
                          </p>
                        )}
                        {images.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              border:
                                i === primary ? "2px solid #2ba664" : "1px solid #ddd",
                              padding: "4px",
                              borderRadius: "6px",
                            }}
                          >
                            <img
                              src={src}
                              alt={`vehicle-${i}`}
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                            {isEditing ? (
                              <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                                <button
                                  onClick={() => handleReorderImage(vehicle, i, "up")}
                                  disabled={i === 0}
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => handleReorderImage(vehicle, i, "down")}
                                  disabled={i === images.length - 1}
                                >
                                  ↓
                                </button>
                                <button onClick={() => handleSetPrimary(vehicle, i)}>
                                  Set Primary
                                </button>
                                <button
                                  className="delete-image-button"
                                  onClick={() => handleDeleteImageAt(vehicle, i)}
                                  style={{
                                    border: "1px solid #a62b38",
                                    backgroundColor: "#eb969e",
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      {isEditing && (
                        <div style={{ marginTop: "8px" }}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleEditAddImages(vehicle, e)}
                          />
                        </div>
                      )}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">Link:</span>
                    <span className="value">
                      {isEditing ? (
                        <input
                          type="text"
                          id="editLink"
                          name="editLink"
                          value={(editedFields.link as string) || vehicle.link}
                          onChange={(e) => handleChange("link", e.target.value)}
                        />
                      ) : vehicle.link ? (
                        <a href={vehicle.link} target="_blank">
                          {vehicle.link}
                        </a>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>

                {isEditing ? (
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
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
