import { useEffect, useState } from "react";
import { db } from "../../firebase";
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
                  <button onClick={toggleShowAll} style={{ width: "200px" }}>
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