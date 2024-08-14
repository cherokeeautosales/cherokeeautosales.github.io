import { useEffect, useRef, useState } from "react";
import { db, storage } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

import "./react.scss";

interface FormData {
  year: string;
  make: string;
  model: string;
  mileage: string;
  color: string;
  image: string;
}

const SellForm = () => {
  const [formData, setFormData] = useState<FormData>({
    year: "",
    make: "",
    model: "",
    mileage: "",
    color: "",
    image: "",
  });

  const [msg, setMsg] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = "";

    if (file) {
      try {
        const storageRef = ref(
          storage,
          `sellImages/${Date.now()}_${file.name}`
        );
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Error uploading file: ", error);
        alert("Failed to upload image");
        return;
      }
    }

    try {
      const docRef = await addDoc(collection(db, "sell"), {
        ...formData,
        image: imageUrl,
      });
      // console.log("Document written with ID: ", docRef.id);
      setMsg("Submitted! Thank you for filling out the form!");
      setFormData({
        year: "",
        make: "",
        model: "",
        mileage: "",
        color: "",
        image: "",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      // console.error("Error adding document: ", e);
      setMsg("Something went wrong, please try again!");
    }
  };

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg("");
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [msg]);

  return (
    <div style={{ width: "90%", margin: "20px auto" }}>
      <h2>Sell your car with us!</h2>
      <p>Please fill out the form below to sell your car.</p>
      <form onSubmit={handleSubmit}>
        {msg && <div className="message">{msg}</div>}
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
            // onChange={(e) => {
            //   handleImageUpload(e);
            // }}
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
        {/* <p style={{color: '#ff7505'}}>{msg}</p> */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SellForm;
