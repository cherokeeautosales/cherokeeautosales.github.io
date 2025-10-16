import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import QuickLead from "./QuickLead";
import "./react.scss";

type Vehicle = {
  year: string;
  make: string;
  model: string;
  mileage: string;
  color: string;
  image: string;
  link: string;
  vin: string;
  stockNumber?: string;
  cost: string;
  date: string;
  filePath?: string;
  images?: string[];
  filePaths?: string[];
  primaryImageIndex?: number;
  slug?: string;
  order?: number;
};

function formatMiles(m: string) {
  const n = parseInt((m || "").toString().replace(/[^\d]/g, ""), 10);
  if (isNaN(n)) return m;
  return `${n.toLocaleString()} miles`;
}

function formatMoney(val: string): string | undefined {
  const digits = (val || "").toString().replace(/[^\d]/g, "");
  const n = parseInt(digits, 10);
  if (isNaN(n)) return undefined;
  if (n > 50000) return undefined;
  if (!n || n === 0) return undefined;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function computeHash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  // 1) Try by stockNumber
  const byStockQ = query(
    collection(db, "vehicles"),
    where("stockNumber", "==", id),
    limit(1)
  );
  const byStock = await getDocs(byStockQ);
  if (!byStock.empty) return byStock.docs[0].data() as Vehicle;

  // 2) Try by slug
  const bySlugQ = query(
    collection(db, "vehicles"),
    where("slug", "==", id),
    limit(1)
  );
  const bySlug = await getDocs(bySlugQ);
  if (!bySlug.empty) return bySlug.docs[0].data() as Vehicle;

  // 3) Try by VIN (doc id)
  const byVin = await getDoc(doc(db, "vehicles", id));
  if (byVin.exists()) return byVin.data() as Vehicle;

  // 4) Fallback: compute hash against all docs
  const all = await getDocs(collection(db, "vehicles"));
  for (const d of all.docs) {
    const v = d.data() as Vehicle;
    const hash = computeHash(
      [v.year, v.make, v.model, v.vin, v.mileage, v.color, v.cost, v.date].join("|")
    );
    if (hash === id) return v;
  }

  return null;
}

function LoadingPage() {
  return (
    <div className="loading-page">
      <div className="loading-spinner" />
      <p>Loading vehicle details...</p>
    </div>
  );
}

type Props = { id?: string };

export default function VehicleDetail({ id }: Props) {
  const [routeId, setRouteId] = useState<string>("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Resolve id either from prop or from location.hash; subscribe to hash changes
  useEffect(() => {
    if (id && id.length > 0) {
      setRouteId(id);
      return;
    }
    const read = () => {
      const raw = typeof window !== "undefined" ? window.location.hash : "";
      const hash = raw ? raw.replace(/^#/, "") : "";
      setRouteId(decodeURIComponent(hash));
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [id]);

  // Fetch vehicle whenever routeId changes
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!routeId) {
        setVehicle(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const v = await fetchVehicleById(routeId);
      if (!alive) return;
      setVehicle(v);
      if (v?.primaryImageIndex != null) setActiveIndex(v.primaryImageIndex);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [routeId]);

  const images: string[] = useMemo(() => {
    if (!vehicle) return [];
    if (vehicle.images && vehicle.images.length > 0) return vehicle.images;
    if (vehicle.image) return [vehicle.image];
    return [];
  }, [vehicle]);

  const title = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toUpperCase()
    : "";

  const goPrev = () =>
    setActiveIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  const goNext = () =>
    setActiveIndex((i) => (images.length ? (i + 1) % images.length : 0));

  if (!routeId) {
    return <div style={{ textAlign: "center" }}>Select a vehicle...</div>;
  }

  if (loading) {
    return <div style={{ textAlign: "center" }}>Loading vehicle...</div>;
  }

  if (!vehicle) {
    return <div style={{ textAlign: "center" }}>Vehicle not found.</div>;
  }

  return (
    <div className="vehicle-detail">
      <div className="vehicle-detail__container">
        <div className="vehicle-detail__main">
          <h1 className="vehicle-detail__title">{title}</h1>

          <div className="vehicle-detail__gallery">
            <div className="vehicle-detail__image">
              {images[activeIndex] ? (
                <div
                  className="vehicle-detail__image-bg"
                  style={{ backgroundImage: `url(${images[activeIndex]})` }}
                />
              ) : (
                <div className="vehicle-detail__image-placeholder">No Image</div>
              )}
              {images.length > 1 && (
                <>
                  <button className="vehicle-detail__nav vehicle-detail__nav--left" onClick={goPrev} aria-label="Previous image">
                    &#10094;
                  </button>
                  <button className="vehicle-detail__nav vehicle-detail__nav--right" onClick={goNext} aria-label="Next image">
                    &#10095;
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="vehicle-detail__thumbs">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    className={`vehicle-detail__thumb ${idx === activeIndex ? "is-active" : ""}`}
                    style={{ backgroundImage: `url(${src})` }}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Thumbnail ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="vehicle-detail__specs">
            <div>
                {
                    [["Make", vehicle.make],
                    ["Model", vehicle.model],
                    ["Year", vehicle.year],
                    ["Mileage", formatMiles(vehicle.mileage)],
                    ["Color", vehicle.color],
                    ["Stock#", vehicle.stockNumber],
                    ["VIN", vehicle.vin]].map(([label, value]) => value ? (
                        <div className="spec" key={label}>
                            <span>{label}:</span> {value}
                        </div>
                    ) : null)
                }
            </div>
            <div className="vehicle-detail__price">
              {formatMoney(vehicle.cost) ? (
                <div className="price">{formatMoney(vehicle.cost)}</div>
              ) : (
                <div className="price price--call">Call for Price</div>
              )}
              <button
                className="vehicle-detail__cta"
                onClick={(() => {
                    window.location.href = "tel:8656877100";
                })}
            >Schedule a Test Drive</button>
            </div>
          </div>
        </div>

        <aside className="vehicle-detail__sidebar">
          <div className="vehicle-detail__lead">
            <p className="vehicle-detail__lead-title">Get Pre-Approved Now!</p>
            <QuickLead />
          </div>
        </aside>
      </div>
    </div>
  );
}
