import { useState, type SetStateAction } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";

import { firebaseConfig } from "../../key.js";

import type { CarProps } from "../components/pieces/CarCard.astro";
import CarCard from "./react/ReactCarCard";

export function Firebase() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const collectionRef = "vehicles";

    const [vehicles, setVehicles] = useState<CarProps[]>([]);
    const [loading, setLoading] = useState(true);

    // intial data load
    // const data = parse(inventory, {
    //   skip_empty_lines: true,
    //     delimiter: ',',
    //     columns: ["stockNumber", "year", "make", "model", "vin", "mileage", "color", "cost", "date", "image", "link"]
    // }).splice(1);

    // data.forEach(async (row: any) => {
    //   const { vin } = row;
    //   const vehicleRef = doc(db, collectionRef, vin);
    //   await setDoc(vehicleRef, row);
    // });

    const fetchData = async () => {
        const querySnapshot = await getDocs(collection(db, collectionRef));
        const data = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
        })) as CarProps[];
        setVehicles(data);
        setLoading(false);
    };
    fetchData();
    console.log(vehicles);

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    {
                        vehicles.map((vehicle, index) => {
                            console.log(vehicle);
                            // return <p key={index}>{vehicle.year}</p> //lol fix this with car cards :(
                            return <CarCard {...vehicle}/>
                        }
                    )}
                </div>
            )}
        </div>
    );
}

export function Login() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

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
    });

    const [editingVin, setEditingVin] = useState("");
    const [editedFields, setEditedFields] = useState<Partial<CarProps>>({});

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
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
            const docRef = await addDoc(collection(db, "vehicles"), vehicle);
            const newVehicle = { ...vehicle, id: docRef.id };
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

    const deleteVehicle = async (vin: string) => {
        try {
            await deleteDoc(doc(db, "vehicles", vin));
            setVehicles((prevVehicles) =>
                prevVehicles.filter((vehicle) => vehicle.vin !== vin)
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
    };

    const handleEdit = (vin: string) => {
        setEditingVin(vin);
    };

    const handleSave = (vin: string) => {
        editVehicle(vin, editedFields as CarProps);
        setEditingVin("");
    };

    const handleAddVehicle = () => {
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
        });
    };

    return (
        <div>
            {isLoggedIn ? (
                <div style={{ margin: "10px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                        }}
                    >
                        <h2>Welcome!</h2>
                        <button
                            onClick={() => setIsLoggedIn(false)}
                            style={{
                                marginLeft: "10px",
                                width: "100px",
                                borderRadius: "5px",
                                padding: "5px",
                                border: "none",
                                backgroundColor: "#007bff",
                                color: "white",
                            }}
                        >
                            Logout
                        </button>
                    </div>
                    <h3 style={{ marginTop: "50px" }}>Add Vehicle</h3>
                    <form
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Image"
                            value={newVehicle.image}
                            onChange={(e) =>
                                setNewVehicle({
                                    ...newVehicle,
                                    image: e.target.value,
                                })
                            }
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
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
                            style={{
                                marginRight: "10px",
                                marginBottom: "10px",
                                width: "300px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                            required
                        />
                        <button
                            type="submit"
                            style={{
                                width: "100px",
                                borderRadius: "5px",
                                padding: "5px",
                                border: "none",
                                backgroundColor: "#007bff",
                                color: "white",
                            }}
                        >
                            Add
                        </button>
                    </form>

                    <h3 style={{ marginTop: "50px" }}>Vehicles</h3>
                    <ul>
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.vin}
                                style={{
                                    marginBottom: "20px",
                                    border: "1px lightgray solid",
                                    borderRadius: "5px",
                                    padding: "15px",
                                }}
                            >
                                {/* Display vehicle information */}
                                <div>
                                    <span>
                                        Stock Number:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.stockNumber
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Year:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.year
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Make:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.make
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Model:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.model
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        VIN:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.vin
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Mileage:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.mileage
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Color:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.color
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Cost:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.cost
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Date:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.date
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Image:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
                                                value={
                                                    editedFields.image ||
                                                    vehicle.image
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "image",
                                                        e.target.value
                                                    )
                                                }
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.image
                                        )}
                                    </span>
                                    <br />
                                    <span>
                                        Link:{" "}
                                        {editingVin === vehicle.vin ? (
                                            <input
                                                type="text"
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
                                                style={{
                                                    marginRight: "5px",
                                                    marginBottom: "5px",
                                                    width: "80%",
                                                    padding: "2px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : (
                                            vehicle.link
                                        )}
                                    </span>
                                    <br />
                                </div>
                                {/* Show "Edit" or "Save" button based on editingVin state */}
                                {editingVin === vehicle.vin ? (
                                    <button
                                        onClick={() => handleSave(vehicle.vin)}
                                        style={{
                                            width: "60px",
                                            borderRadius: "5px",
                                            padding: "5px",
                                            border: "none",
                                            backgroundColor: "lightgray",
                                            marginTop: "10px",
                                        }}
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEdit(vehicle.vin)}
                                        style={{
                                            width: "60px",
                                            borderRadius: "5px",
                                            padding: "5px",
                                            border: "none",
                                            backgroundColor: "lightgray",
                                            marginTop: "10px",
                                        }}
                                    >
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteVehicle(vehicle.vin)}
                                    style={{
                                        marginLeft: "10px",
                                        width: "60px",
                                        borderRadius: "5px",
                                        padding: "5px",
                                        border: "none",
                                        backgroundColor: "lightgray",
                                        marginTop: "10px",
                                    }}
                                >
                                    Delete
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
                            required
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
                            required
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
