import { useEffect, useRef, useState } from "react";
import { db, storage } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";

import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";

import { useUploadFile } from "react-firebase-hooks/storage";

import "./../login.css";

interface FormData {
  year: string;
  make: string;
  model: string;
  mileage: string;
  color: string;
  image: string;
  filePath: string;
}

const SellForm = () => {
  const [formData, setFormData] = useState<FormData>({
    year: "",
    make: "",
    model: "",
    mileage: "",
    color: "",
    image: "",
    filePath: "",
  });

  const [msg, setMsg] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, "sell"), formData);
      // console.log("Document written with ID: ", docRef.id);
      setMsg("Thank you for filling out the form!");
      setFormData({
        year: "",
        make: "",
        model: "",
        mileage: "",
        color: "",
        image: "",
        filePath: "",
      });
    } catch (e) {
      // console.error("Error adding document: ", e);
      setMsg("Something went wrong, please try again!");
    }
  };

  const [uploadFile] = useUploadFile();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    const filePath = file ? `vehicleImages/${Date.now()}_${file.name}` : "";
    const imageRef = ref(storage, filePath);
    if (file) {
      const result = await uploadFile(imageRef, file, {
        contentType: "image/jpeg",
      });
    }
    const imageUrl = await getDownloadURL(imageRef);
    setFormData({
      ...formData,
      image: imageUrl,
      filePath: filePath,
    });
  };

  return (
    <div style={{ width: "90%", margin: "20px auto" }}>
      <h2>Sell your car with us!</h2>
      <p>Please fill out the form below to sell your car.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Make:</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Model:</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Year:</label>
          <input
            type="text"
            name="year"
            value={formData.year}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Mileage:</label>
          <input
            type="text"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Color:</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              handleImageUpload(e);
            }}
          />
        </div>
        <p style={{color: '#ff7505'}}>{msg}</p>
        <button type="submit">Submit</button>
      </form>
      
    </div>
  );
};

export default SellForm;
