import React, { useState, useEffect, useRef } from "react";
import "./react.scss";

interface CarProps {
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
  showFinanceRibbon?: boolean;
}

const CarCard: React.FC<CarProps> = ({
  year,
  make,
  model,
  mileage,
  color,
  image,
  link,
  vin,
  stockNumber,
  cost,
  images,
  primaryImageIndex,
  slug,
  showFinanceRibbon = true,
  date,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cb: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(e.target);
        }
      });
    };
    const obs = new IntersectionObserver(cb, { threshold: 0.1 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);


  const formatMiles = (m: string) => {
    const n = parseInt((m || "").toString().replace(/[^\d]/g, ""), 10);
    if (isNaN(n)) return m;
    return `${n.toLocaleString()} miles`;
  };

  const formatMoney = (val: string): string | undefined => {
    const digits = (val || "").toString().replace(/[^\d]/g, "");
    const n = parseInt(digits, 10);

    // stopgap -- replace values over 50000 with "Call for Price"
    if (isNaN(n)) return undefined;
    if (n > 50000) return undefined;
    if (!n || n === 0) return undefined;
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  const title = `${year} ${make} ${model}`.toUpperCase();

  // Create a stable slug: prefer stockNumber, else provided slug, else hash of core fields.
  const computeHash = (s: string) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) ^ s.charCodeAt(i);
    }
    return (h >>> 0).toString(36);
  };
  const derivedSlug =
    (stockNumber && stockNumber.trim()) ||
    (slug && slug.trim()) ||
    computeHash([year, make, model, vin, mileage, color, cost, date].join("|"));

  const handleNavigate = () => {
    // Static-friendly hash routing: single static page at /vehicle reads the hash.
    const url = `/vehicle#${encodeURIComponent(derivedSlug)}`;
    window.location.href = url;
  };

  const primaryIdx =
    typeof primaryImageIndex === "number" ? primaryImageIndex : 0;
  const displayImage =
    images && images.length
      ? images[Math.max(0, Math.min(primaryIdx, images.length - 1))]
      : image;

  return (
    <div className="car-card" ref={containerRef}>
      <div className="car-card__container" role="group" aria-label={`${title} card`}>
        {/* <div
          className="car-card__image"
          style={{ backgroundImage: isVisible ? `url(${displayImage})` : undefined }}
          onClick={handleNavigate}
          aria-label="View vehicle details"
        >
          {showFinanceRibbon && <div className="car-card__ribbon">FINANCE</div>}
        </div> */}
        <div
            onClick={handleNavigate}
            className="car-card__image-container"
            style={{ cursor: "pointer" }}
        >
            <div
                className="car-card__image-background"
                style={{ backgroundImage: isVisible ? `url(${displayImage})` : undefined }}
            />
            <div
                className="car-card__image"
                style={{
                    backgroundImage: isVisible ? `url(${displayImage})` : undefined,
                    zIndex: 1,
                }}
                aria-label={title}
            />
        </div>
        {showFinanceRibbon && <div className="car-card__ribbon">FINANCE</div>}
        <div className="car-card__banner">Buy Here Pay Here!</div>

        <div className="car-card__body">
          <h3
            className="car-card__title"
            style={{ cursor: "pointer" }}
            onClick={handleNavigate}
          >
            {title}
          </h3>
          <div className="car-card__price">{formatMoney(cost) || "Call for price"}</div>

          <div className="car-card__pills">
            {year ? <span className="pill pill--primary">{year}</span> : null}
            {mileage ? <span className="pill">{formatMiles(mileage)}</span> : null}
            {/* <span className="pill">{stockNumber || vin}</span> */}
          </div>

          <div style={{ flexGrow: 1 }} />

          <button type="button" className="car-card__cta" onClick={handleNavigate}>
            START PURCHASE
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
