import React, { createContext, useState, useContext } from "react";

// Create Context
const UserContext = createContext();

// Create Provider Component
export const UserProvider = ({ children }) => {
  const [userData2, setUserData] = useState({
    phase: null, // 'reduction' or 'commitment'
    reductionDays: null, // 7, 15, or 21
    committingDays: null, // Future feature if needed
  });

  // Function to update user data
  const updateUserData = (key, value) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <UserContext.Provider value={{ userData2, updateUserData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to Use Context
export const useUser = () => useContext(UserContext);
