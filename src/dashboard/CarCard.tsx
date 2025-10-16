export interface CarProps {
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
}

type props = CarProps;
