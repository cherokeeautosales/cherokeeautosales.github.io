import { useEffect, useState } from "react";
// import { db } from "../../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import type { CarProps } from "../pieces/CarCard.astro";
import CarCard from "./ReactCarCard";

import "./react.scss";

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
      if (import.meta.env.DEV) {
        // Dummy data for development environment
        const dummyVehicles: CarProps[] = [
          {
            stockNumber: "ABC123",
            year: "2020",
            make: "Toyota",
            model: "Camry",
            vin: "VIN1234567890",
            mileage: "20000",
            color: "Blue",
            cost: "$20,000",
            date: "2022-01-01",
            image: "/images/dummy-car.jpg",
            link: "https://example.com/car/1",
            filePath: "vehicleImages/dummy1.jpg",
          },
          {
            stockNumber: "DEF456",
            year: "2021",
            make: "Honda",
            model: "Accord",
            vin: "VIN0987654321",
            mileage: "15000",
            color: "Red",
            cost: "$22,000",
            date: "2022-02-01",
            image: "/images/dummy-car2.jpg",
            link: "https://example.com/car/2",
            filePath: "vehicleImages/dummy2.jpg",
          },
        ];
        setVehicles(dummyVehicles);
        setLoading(false);
      } else {
        // Production: fetch from Firebase
        const db = require("../../firebase").db;
        const querySnapshot = await getDocs(collection(db, collectionRef));
        const data = querySnapshot.docs.map((doc) => ({ ...doc.data() })) as CarProps[];
        setVehicles(data);
        setLoading(false);
      }
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
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
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
                justifyItems: "center",
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
                  <button onClick={toggleShowAll} style={{ width: "300px", backgroundColor: "red" }}>
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