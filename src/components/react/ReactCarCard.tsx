import React from 'react';
import './CarCard.scss';

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

    return (
        <div className="car-card car-wrapper">
            <a href={link} target="_blank" rel="noopener noreferrer">
                <div
                    className="car"
                    style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="info">
                        <h2>{year.toLowerCase()} {make.toLowerCase()} {model.toLowerCase()}</h2>
                        <p>{color.toLowerCase()}</p>
                        {mileageInt < 200000 ? (
                            <p>{mileage} miles</p>
                        ) : (
                            <p>One year Service Contract!</p>
                        )}
                    </div>
                </div>
            </a>
        </div>
    );
};

export default CarCard;
