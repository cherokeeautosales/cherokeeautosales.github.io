import React, { createContext, useContext, FC, ReactNode } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface FirebaseContextProps {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: any;
}

interface FirebaseProviderProps {
  config: FirebaseConfig;
  children: ReactNode;
}

const FirebaseContext = createContext<FirebaseContextProps | undefined>(undefined);

const FirebaseProvider: FC<FirebaseProviderProps> = ({ config, children }) => {
  const effectiveConfig = config;
  const app = initializeApp(effectiveConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  return (
    <FirebaseContext.Provider value={{ app, auth, db, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export default FirebaseProvider;
