import { useEffect, useState } from "react";
import "./react.scss";
import "./SellForm.scss";


interface FormData {
  year: string;
  make: string;
  model: string;
  mileage: string;
  color: string;
  phone: string;
  optin: boolean;
  image: string;
}

const SellForm = () => {
  const [formData, setFormData] = useState<FormData>({
    year: "",
    make: "",
    model: "",
    mileage: "",
    color: "",
    phone: "",
    optin: false,
    image: "",
  });

  const [msg, setMsg] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      ${formData.optin ? "I would like to receive updates from Cherokee Auto Sales via text." : "I do not want to receive updates from Cherokee Auto Sales via text."}
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
      phone: "",
      image: "",
      optin: false,
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
      <p>
        Please fill out the form below to email us about selling your car. If you have any
        photos of your car, please attach them to your email.
      </p>
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
        <div className="checkbox-container"
            onClick={() => setFormData({ ...formData, optin: !formData.optin })}
        >
          <input
            type="checkbox"
            name="optin"
            checked={formData.optin}
            onChange={handleChange}
          />
          <span>
            By clicking this box, you agree to receive SMS messages about financing options or
            information regarding financing, marketing, or sales from Cherokee Auto Sales.
            Reply STOP to opt out at anytime. For help text 865-687-7100. Message data rates may
            apply. Messaging frequency may vary. See our privacy policy here:{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>.
          </span>
        </div>
        <button type="submit">Send Email</button>
      </form>
    </div>
  );
};

export default SellForm;
