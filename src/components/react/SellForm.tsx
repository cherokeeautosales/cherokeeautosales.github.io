import { useEffect, useState } from "react";
import "./react.scss";

interface FormData {
  year: string;
  make: string;
  model: string;
  mileage: string;
  color: string;
  phone: string; // Added phone field
  image: string;
}

const SellForm = () => {
  const [formData, setFormData] = useState<FormData>({
    year: "",
    make: "",
    model: "",
    mileage: "",
    color: "",
    phone: "", // Initialize phone state
    image: "",
  });

  const [msg, setMsg] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the phone number is filled
    if (!formData.phone) {
      setMsg("Please enter your phone number.");
      return;
    }

    const subject = "Sell Car Info Form - Cherokee Auto Sales";
    const body = `
      Hi, I'd like to sell my car to you, below are the details of my car:\n
      Year: ${formData.year}\n
      Make: ${formData.make}\n
      Model: ${formData.model}\n
      Mileage: ${formData.mileage}\n
      Color: ${formData.color}\n
      Phone: ${formData.phone}\n
    `.trim();

    const mailtoLink = `mailto:alexisdelmonico@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    setFormData({
      year: "",
      make: "",
      model: "",
      mileage: "",
      color: "",
      phone: "", // Reset phone number field
      image: "",
    });
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
      <p>Please fill out the form below to email us about selling your car. If you have any photos of your car, please attach them to your email.</p>
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
          <label>Phone Number:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your phone number"
          />
        </div>
        {/* <div>
          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div> */}
        <button type="submit">Send Email</button>
      </form>
    </div>
  );
};

export default SellForm;
