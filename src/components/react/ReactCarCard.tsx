import React, { useState, useEffect, useRef } from "react";
import "./react.scss";
import { IoCloseCircle } from "react-icons/io5";
import QuickLead from "./QuickLead";

interface CarProps {
  year: string;
  make: string;
  model: string;
  mileage: string;
  color: string;
  image: string;
  link: string;
  vin: string;
  stockNumber: string;
  cost: string;
  date: string;
}

const CarCard: React.FC<CarProps> = ({
  year,
  make,
  model,
  mileage,
  color,
  image,
  link,
}) => {
  const mileageInt = parseInt(mileage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  // Use IntersectionObserver to set the background image only when visible.
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  // Lock scroll when modal is open.
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  // Modal Component – defined inside for clarity.
  const Modal: React.FC<{ image: string; onClose: () => void }> = ({ image, onClose }) => {
    return (
      <div className="modal-container" onClick={onClose}>
        <IoCloseCircle
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            fontSize: "30px",
            cursor: "pointer",
            color: "rgba(255, 255, 255, 1.0)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
          onClick={onClose}
        />
        <div
          style={{
            position: "relative",
            margin: "15px",
            width: "calc(100% - 30px)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="modal-image"
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={onClose}
          >
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "#fff",
                padding: "10px",
                width: "100%",
                borderRadius: "0 0 8px 8px",
              }}
            >
              {year} {make} {model}
            </div>
          </div>
        </div>
        <div
          style={{
            height: "70vh",
            margin: "15px",
            width: "calc(100% - 30px)",
          }}
        >
          <p
            style={{
              color: "#000",
              textAlign: "center",
              margin: "0",
              height: "32px",
              backgroundColor: "#fff",
              borderRadius: "8px 8px 0 0",
              paddingTop: "10px",
            }}
          >
            Get pre-approved here!
          </p>
          <iframe
            style={{
              width: "100%",
              height: "calc(100% - 32px)",
              borderRadius: "0 0 8px 8px",
            }}
            src="https://cherokeeautosalestn.neoverify.com/quick_lead?referral_source=Website&"
          ></iframe>
          {/* <QuickLead /> */}
        </div>
      </div>
    );
  };

  return (
    <div className="car-card car-wrapper" ref={containerRef}>
      <div
        className="car"
        style={{
          // Only set the background image when the card is in view.
          backgroundImage: isVisible ? `url(${image})` : undefined,
          backgroundSize: "contain",
          backgroundPosition: "center",
          cursor: "pointer",
        }}
        onClick={toggleModal}
      >
        <div className="info">
          <h2>
            {year.toLowerCase()} {make.toLowerCase()} {model.toLowerCase()}
          </h2>
        </div>
      </div>
      {isModalOpen && <Modal image={image} onClose={toggleModal} />}
    </div>
  );
};

export default CarCard;
