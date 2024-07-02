import { useEffect, useState } from "react";
import type { FC } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./loginPage";
import Dashboard from "./dashboard";
import FirebaseProvider from "./firebase";
import "./index.css";

const BASE_URL = import.meta.env.BASE_URL + "dashboard/";
export const genUrl = (path: string) => `${BASE_URL}${path}`;
console.log("BASE_URL", BASE_URL);

interface AppProps {
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  }; // Optional Firebase configuration prop
}

const App: FC<AppProps> = ({ firebaseConfig }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // useEffect(() => {
  //   // Check authentication status here (e.g., check if token exists)
  //   const token = localStorage.getItem('authToken');
  //   if (token) {
  //     setIsLoggedIn(true);
  //   } else {
  //     setIsLoggedIn(false);
  //   }
  // }, []);

  // const handleLogout = () => {
  //   setIsLoggedIn(false);
  // };

  useEffect(() => {
    // Function to check if the cookie is present
    const checkLoggedInCookie = () => {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        const [name, value] = cookie.split("=");
        if (name.trim() === "isLoggedIn" && value.trim() === "true") {
          setIsLoggedIn(true);
          return;
        }
      }
      setIsLoggedIn(false);
    };

    // On component mount, check the cookie
    checkLoggedInCookie();
  }, []);

  const onLogin = () => {
    setIsLoggedIn(true);
  };

  const onLogout = () => {
    setIsLoggedIn(false);
  };

  console.log(import.meta.env.BASE_URL);

  return (
    <FirebaseProvider config={firebaseConfig}>
      {/* <Router basename={`/${import.meta.env.BASE_URL}dashboard`}> */}
      <Router>
        <Routes>
          <Route
            path=""
            element={
              isLoggedIn ? (
                <Dashboard onLogout={onLogout} />
              ) : (
                <Navigate to="login" />
              )
            }
          />
          <Route
            path="login"
            element={
              isLoggedIn ? (
                <Navigate to="/" />
              ) : (
                <LoginPage onLogin={onLogin} />
              )
            }
          />
          {/* <Route
            path={genUrl("dashboard")}
            element={
              isLoggedIn ? (
                <Dashboard onLogout={onLogout} />
              ) : (
                <Navigate to={genUrl("login")} />
              )
            }
          /> */}
          <Route path="*" element={<Navigate to="" />} />
          {/* <Route path={`${BASE_URL}/`} element={<Navigate to="/login" />} /> */}
          {/* <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={onLogin} />}
          />
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard onLogout={onLogout} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={
            <Navigate to="/login" />}
        /> */}
        </Routes>
      </Router>
    </FirebaseProvider>
  );
};

export default App;
