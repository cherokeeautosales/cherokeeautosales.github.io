import { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
} from "firebase/firestore";

import {
    ref,
    getDownloadURL,
    uploadBytes,
    deleteObject,
} from "firebase/storage";

import type { CarProps } from "./pieces/CarCard.astro";
import CarCard from "./react/ReactCarCard.js";

import { useUploadFile, useDownloadURL } from "react-firebase-hooks/storage";

import "./login.css";

export function InventoryCards() {
    const collectionRef = "vehicles";

    const [vehicles, setVehicles] = useState<CarProps[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAll, setShowAll] = useState(false);

    const toggleShowAll = () => {
        setShowAll(!showAll);
    };

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, collectionRef));
            const data = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
            })) as CarProps[];
            setVehicles(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div>
            {loading ? (
                <div style={{ color: "white" }}>Loading inventory...</div>
            ) : (
                <>
                    <h2 style={{ color: "white", textAlign: "center" }}>
                        Current Inventory:
                    </h2>
                    <div className="web-ver-only">
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(200px, 1fr))",
                                gap: "1rem",
                            }}
                        >
                            {vehicles.map((car, index) => (
                                <CarCard key={index} {...car} />
                            ))}
                        </div>
                    </div>
                    <div className="mobile-ver-only">
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gap: "1rem",
                            }}
                        >
                            {vehicles
                                .slice(0, showAll ? vehicles.length : 3)
                                .map((car, index) => (
                                    <CarCard key={index} {...car} />
                                ))}
                            {!showAll && (
                                <div
                                    style={{
                                        textAlign: "center",
                                    }}
                                >
                                    <button onClick={toggleShowAll}>
                                        Click to see more
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const [editingVin, setEditingVin] = useState("");
    const [editedFields, setEditedFields] = useState<Partial<CarProps>>({});

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(
                auth,
                email || usernameRef.current?.value || "",
                password || passwordRef.current?.value || ""
            );
            fetchData();
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Login error:", error);
            setError("Invalid email or password. Please try again.");
        }
    };

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
                prevVehicles.filter(
                    (prevVehicle) => prevVehicle.vin !== vehicle.vin
                )
            );
        } catch (error) {
            console.error("Delete vehicle error:", error);
        }
    };

    const handleChange = async (field: string, value: string) => {
        setEditedFields((prevState) => ({
            ...prevState,
            [field]: value,
        }));

        // await updateDoc(doc(db, "vehicles", editedFields.vin), {
        //     [field]: value,
        // });
    };

    const [uploadFile] = useUploadFile();

    const handleImageUpload = async (
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
        if (newVehicle.image) {
            addVehicle(newVehicle);
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
            alert("Vehicle added successfully!");
        }
    };

    return (
        <div>
            {isLoggedIn ? (
                <div style={{ margin: "10px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "10px",
                        }}
                    >
                        <h2>Welcome!</h2>
                        <button onClick={() => setIsLoggedIn(false)}
                            style={{margin: '0'}}>
                            Logout
                        </button>
                    </div>
                    <h3 style={{ marginTop: "50px" }}>Add Vehicle</h3>
                    <form id="add-vehicle-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddVehicle();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Stock Number"
                            value={newVehicle.stockNumber}
                            onChange={(e) =>
                                setNewVehicle({
                                    ...newVehicle,
                                    stockNumber: e.target.value,
                                })
                            }
                            required
                            id="addStockNumber"
                            name="addStockNumber"
                        />
                        <input
                            type="text"
                            placeholder="Year"
                            value={newVehicle.year}
                            onChange={(e) =>
                                setNewVehicle({
                                    ...newVehicle,
                                    year: e.target.value,
                                })
                            }
                            required
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
                            required
                            id="addMake"
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
                            required
                            id="addModel"
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
                            required
                            id="addMileage"
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
                            required
                            id="addColor"
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
                            required
                            id="addCost"
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
                            required
                            id="addDate"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                handleImageUpload(e);
                            }}
                            required
                            id="addImage"
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
                            required
                            id="addLink"
                        />
                        <button type="submit">Add</button>
                    </form>

                    <h3 style={{ marginTop: "50px" }}>Vehicles</h3>
                    <ul>
                        {vehicles.map((vehicle) => (
                            <div className="vehicleCard" key={vehicle.vin}>
                                <div className="vehicle-info">
                                    <div className="info-row">
                                        <span className="label">
                                            Stock Number:
                                        </span>
                                        <span className="value">
                                            {editingVin === vehicle.vin ? (
                                                <input
                                                    type="text"
                                                    id="editStockNumber"
                                                    value={
                                                        editedFields.stockNumber ||
                                                        vehicle.stockNumber
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "stockNumber",
                                                            e.target.value
                                                        )
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
                                                    value={
                                                        editedFields.year ||
                                                        vehicle.year
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "year",
                                                            e.target.value
                                                        )
                                                    }
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
                                                    value={
                                                        editedFields.make ||
                                                        vehicle.make
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "make",
                                                            e.target.value
                                                        )
                                                    }
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
                                                    value={
                                                        editedFields.model ||
                                                        vehicle.model
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "model",
                                                            e.target.value
                                                        )
                                                    }
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
                                                    value={
                                                        editedFields.vin ||
                                                        vehicle.vin
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "vin",
                                                            e.target.value
                                                        )
                                                    }
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
                                                    value={
                                                        editedFields.mileage ||
                                                        vehicle.mileage
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "mileage",
                                                            e.target.value
                                                        )
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
                                                    value={
                                                        editedFields.color ||
                                                        vehicle.color
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "color",
                                                            e.target.value
                                                        )
                                                    }
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
                                                    value={
                                                        editedFields.cost ||
                                                        vehicle.cost
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "cost",
                                                            e.target.value
                                                        )
                                                    }
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
                                                    value={
                                                        editedFields.date ||
                                                        vehicle.date
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "date",
                                                            e.target.value
                                                        )
                                                    }
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
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                        <button
                                                            className="delete-image-button"
                                                            onClick={() =>
                                                                handleDeleteImage(
                                                                    vehicle
                                                                )
                                                            }
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
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        handleEditImageUpload(
                                                            e
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <p style={{ color: "orange" }}>
                                                    No image, please click edit
                                                    to upload.
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
                                                    value={
                                                        editedFields.link ||
                                                        vehicle.link
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "link",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <a href={vehicle.link}>
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
                                    <button
                                        onClick={() => handleEdit(vehicle.vin)}
                                    >
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteVehicle(vehicle)}
                                    style={{
                                        marginLeft: "10px",
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
            ) : (
                <div style={{ margin: "10px" }}>
                    <h2>Login</h2>
                    {error && (
                        <div style={{ color: "red", fontSize: "20px" }}>
                            {error}
                        </div>
                    )}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                        id="login-form"
                    >
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            ref={usernameRef}
                            required
                            id="loginEmail"
                            name="loginEmail"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            ref={passwordRef}
                            required
                            id="loginPassword"
                            name="loginPassword"
                        />
                        <button
                            type="submit"
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "100px",
                                borderRadius: "5px",
                                padding: "5px",
                                border: "none",
                                backgroundColor: "#007bff",
                                color: "white",
                            }}
                        >
                            Login
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
