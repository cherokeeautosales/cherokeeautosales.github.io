import React, { useEffect, useState } from 'react';

const BgImage = () => {
    const [backgroundImage, setBackgroundImage] = useState<string>('');

    const images = [
        '/images/happyguy.jpg',
        '/images/happyguy2.jpg',
        '/images/happyguy3.jpg',
    ];

    const updateBackgroundImage = () => {
        // const index = Math.floor(Date.now() / (1000 * 60 * 60 * 3)) % images.length;
        const index = Math.floor(Math.random() * images.length);
        setBackgroundImage(images[index]);
    };

    useEffect(() => {
        updateBackgroundImage();
        const intervalId = setInterval(updateBackgroundImage, 1000 * 60 * 60 * 3);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div
            style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(${backgroundImage}) no-repeat center center/cover`,
                height: 'calc(50vh - 90px)',
                minHeight: '300px',
                width: '100%',
            }}
        >
        </div>
    );
};

export default BgImage;
