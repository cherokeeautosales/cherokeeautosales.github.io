// ---
export interface CarProps {
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
    filePath: string;
}

type props = CarProps;

// const { year, make, model, mileage, color, image, link, vin, stockNumber, cost, date}: props =  props as CarProps;

// const mileageInt = parseInt(mileage);
// ---

// <!-- <style lang="scss">
//     .car-wrapper {
//         display: flex;
//         justify-content: center;
//         align-items: center;

//         position: relative;
//         width: 100%;
//     }
    
//     .car {
//         background: #f9f9f9;
//         color: white;
//         padding: 1rem;
//         border-radius: 5px;
//         border: 1px solid #ddd;
    
//         width: 100%;
//         max-width: 300px;
//         height: 300px;
    
//         display: flex;
//         flex-direction: column;

//         text-transform: capitalize;
//         position: relative;
//     }

//     .info {
//         position: absolute;
//         top: 0;
//         left: 0;
//         width: 100%;
//         padding: 1rem;

//         // border-radius-top: 10px;
//         border-radius: 5px 5px 0 0;

//         background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 10%, rgba(0,0,0,0.7) 100%);
//     }

//     a, a:visited {
//         text-decoration: none;
//         color: inherit;
//         width: 100%;
//         transition: transform 0.2s;
        
//         display: flex;
//         justify-content: center;
//     }

//     a:hover {
//         transform: scale(1.05);
//     }
// </style>

// <div class="car-wrapper">
//     DEPRECATED!! use react component instead (doesn't need hydration)
//     <a href={link} target="_blank">
//     <div
//         class="car"
//         style={{
//             backgroundImage: `url(${image})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//         }}
//     >
//         <div class="info">
//             <h2>{year.toLowerCase()} {make.toLowerCase()} {model.toLowerCase()}</h2>
//             <p>{color.toLowerCase()}</p>{
//                 (mileageInt < 200000) ? <p>{mileage} miles</p> : <p>One year Service Contract!</p>
//             }
//         </div>
//     </div>
//     </a>
// </div>
//      -->