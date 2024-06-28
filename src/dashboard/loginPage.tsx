import React, { useState } from "react";
// import { auth } from "./firebase.js";
import { useFirebase } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { genUrl } from "./App";

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  window.onpopstate = () => {
    navigate(genUrl("login"));
    // navigate("/");
  };

  // const usernameRef = useRef<HTMLInputElement | null>(null);
  // const passwordRef = useRef<HTMLInputElement | null>(null);

  const { auth } = useFirebase();

  const handleLogin = async () => {
    try {
      // Attempt to sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);
      
      // If successfully logged in, set a cookie (for demonstration purposes)
      setLoggedInCookie(); // This function should set a cookie with an expiration time
      setMsg("Successfully logged in!");
      onLogin();
      
      navigate(genUrl("dashboard"));
      // Redirect or perform necessary action

      // Redirect or perform necessary actions upon successful login
      // For demonstration, you can set state or redirect to another page
    } catch (error) {
      // Handle login errors
      console.error('Error signing in:', error);
      setMsg("Invalid email or password. Please try again.");
    }
    // try {
      // const userCredential = await signInWithEmailAndPassword(
      //   auth,
      //   email || usernameRef.current?.value || "",
      //   password || passwordRef.current?.value || ""
      // );
    //   const userEmail = email || (usernameRef.current?.value ?? "");
    //   const userPassword = password || (passwordRef.current?.value ?? "");

    //   if (!userEmail || !userPassword) {
    //     setError("Email and password are required.");
    //     return;
    //   }
  
    //   const userCredential = await signInWithEmailAndPassword(
    //     auth,
    //     userEmail,
    //     userPassword
    //   );
    //   const token = await userCredential.user?.getIdToken();


    //   if (token) {
    //     const expirationTime = new Date();
    //     expirationTime.setTime(expirationTime.getTime() + 30 * 60 * 1000); // 30 minutes from now
    //     document.cookie = `auth_token=${token};expires=${expirationTime.toUTCString()};path=/`;
    //     window.location.href = "/CherokeeAuto/dashboard";
    //   }
    // } catch (error) {
    //   console.error("Login error:", error);
    //   setError("Invalid email or password. Please try again.");
    // }
  };


  const setLoggedInCookie = () => {
    // Example: Setting a cookie that expires in 30 minutes
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    document.cookie = `isLoggedIn=true; expires=${expirationTime.toUTCString()}; path=/`;
  };


  return (
    <div style={{ margin: "10px" }}>
      <h2>Login</h2>
      {msg && <div style={{ color: "red", fontSize: "20px" }}>{msg}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        id="login-form"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "300px" }}
          // ref={usernameRef}
          required
          id="loginEmail"
          name="loginEmail"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "300px" }}
          // ref={passwordRef}
          required
          id="loginPassword"
          name="loginPassword"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
