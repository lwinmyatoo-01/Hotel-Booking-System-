import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize state from localStorage if it exists
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("stayEaseUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Whenever 'user' changes, update localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("stayEaseUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("stayEaseUser");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};