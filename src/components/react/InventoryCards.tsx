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
    //   if (import.meta.env.DEV) {
        // Dummy data for development environment
    //     const dummyVehicles: CarProps[] = [
    //       {
    //         stockNumber: "ABC123",
    //         year: "2020",
    //         make: "Toyota",
    //         model: "Camry",
    //         vin: "VIN1234567890",
    //         mileage: "20000",
    //         color: "Blue",
    //         cost: "$20,000",
    //         date: "2022-01-01",
    //         image: "/images/dummy-car.jpg",
    //         link: "https://example.com/car/1",
    //         filePath: "vehicleImages/dummy1.jpg",
    //       },
    //       {
    //         stockNumber: "DEF456",
    //         year: "2021",
    //         make: "Honda",
    //         model: "Accord",
    //         vin: "VIN0987654321",
    //         mileage: "15000",
    //         color: "Red",
    //         cost: "$22,000",
    //         date: "2022-02-01",
    //         image: "/images/dummy-car2.jpg",
    //         link: "https://example.com/car/2",
    //         filePath: "vehicleImages/dummy2.jpg",
    //       },
    //     ];
    //     setVehicles(dummyVehicles);
    //     setLoading(false);
    //   } else {
        const querySnapshot = await getDocs(collection(db, collectionRef));

        // Enhance records: compute slug (prefer stockNumber, else hash), normalize images, and sort by order
        const dataRaw = querySnapshot.docs.map((doc) => ({ ...doc.data() })) as any[];

        const computeHash = (s: string) => {
          let h = 5381;
          for (let i = 0; i < s.length; i++) {
            h = ((h << 5) + h) ^ s.charCodeAt(i);
          }
          return (h >>> 0).toString(36);
        };

        const enhanced = dataRaw.map((v: any, idx: number) => {
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
          const slug: string =
            (v.slug && String(v.slug)) ||
            (v.stockNumber && String(v.stockNumber).trim()) ||
            computeHash(
              [v.year, v.make, v.model, v.vin, v.mileage, v.color, v.cost, v.date]
                .map((x) => String(x ?? ""))
                .join("|")
            );
          const order: number =
            typeof v.order === "number" ? v.order : idx;

          return {
            ...v,
            images,
            filePaths,
            primaryImageIndex,
            slug,
            order,
          };
        });

        enhanced.sort(
          (a: any, b: any) =>
            (a.order ?? Number.MAX_SAFE_INTEGER) -
            (b.order ?? Number.MAX_SAFE_INTEGER)
        );

        setVehicles(enhanced as CarProps[]);
        setLoading(false);
    //   }
    };
    fetchData();
  }, []);
  
  return (
    <div>
      {loading ? (
        <div style={{ color: "white" }}>Loading inventory...</div>
      ) : (
        <>
          <h2 style={{ color: "white", textAlign: "center", marginBottom: "1rem" }}>
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
