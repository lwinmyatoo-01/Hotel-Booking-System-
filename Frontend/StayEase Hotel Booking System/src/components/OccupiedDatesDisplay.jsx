import React, { useState, useEffect, useContext } from "react";
import "./OccupiedDatesDisplay.css";
import { UserContext } from "./UserContext";

const OccupiedDatesDisplay = () => {
  const [groupedDates, setGroupedDates] = useState({});
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user || !user.token) {
      return;
    }

    const baseURL = "http://127.0.0.1:8000"; // FIXED http://

    async function fetchDates() {
      try {
        const response = await fetch(`${baseURL}/occupied-dates/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`, // This will now work
          },
        });

        if (!response.ok) {
          throw new Error("Fetch failed");
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error during fetching dates:", error);
        setError("Could not load your bookings. Please try again.");
        return []; 
      }
    }

    async function processAndSetDates() {
      const fetchedDates = await fetchDates(); 

      const processDates = (dates) => {
        if (!dates || dates.length === 0) return {};
        
        const dateStrings = dates.map((entry) => entry.date);
        const sortedDates = dateStrings.sort();

        const ranges = {};
        let currentMonth = "";
        let currentRange = null;

        sortedDates.forEach((dateStr) => {
          const date = new Date(`${dateStr}T00:00:00`); 

          if (isNaN(date.getTime())) {
            console.error("Invalid date:", dateStr);
            return; 
          }

          const month = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });

          if (month !== currentMonth) {
            if (currentRange) {
              if (!ranges[currentMonth]) ranges[currentMonth] = [];
              ranges[currentMonth].push(currentRange);
            }
            currentMonth = month;
            currentRange = { startDate: dateStr, endDate: dateStr };
          } else {
            const prevDate = new Date(`${currentRange.endDate}T00:00:00`);
            prevDate.setDate(prevDate.getDate() + 1); 

            if (
              date.toISOString().split("T")[0] ===
              prevDate.toISOString().split("T")[0]
            ) {
              currentRange.endDate = dateStr;
            } else {
              if (!ranges[currentMonth]) ranges[currentMonth] = [];
              ranges[currentMonth].push(currentRange);
              currentRange = { startDate: dateStr, endDate: dateStr };
            }
          }
        });

        if (currentRange) {
          if (!ranges[currentMonth]) ranges[currentMonth] = [];
          ranges[currentMonth].push(currentRange);
        }

        return ranges;
      };

      setGroupedDates(processDates(fetchedDates));
    }

    processAndSetDates(); 
  }, [user]); 

  if (!user) {
    return <p>Please log in to see your bookings.</p>;
  }

  return (
    <div className="occupied-dates-container">
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {Object.keys(groupedDates).length === 0 && !error ? (
        <p>You have no upcoming bookings.</p>
      ) : (
        Object.keys(groupedDates).map((month) => (
          <div key={month} className="month-section">
            <h2 className="month-title">{month}</h2>
            <div className="date-cards">
              {groupedDates[month].map((range, index) => (
                <div key={index} className="date-card">
                  <p className="date-range">
                    {new Date(range.startDate).toLocaleDateString()} -{" "}
                    {new Date(range.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OccupiedDatesDisplay;