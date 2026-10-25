import React, { useEffect, useState, useCallback } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import RoomCard from "./RoomDetails/RoomCard";
import "./BookingComponent.css";

const BookingComponent = ({ currentUser }) => {
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(currentUser);

  const [roomData, setRoomData] = useState([]);

  // Wrapped in useCallback so we can reuse it after a booking
  const fetchRoomData = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/rooms/", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch room data. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetching successful:", data);
      setRoomData(data);
    } catch (error) {
      console.error("Error during fetch:", error);
      setError("Unable to load rooms. Please make sure the Django server is running.");
    }
  }, []);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  const handleDateClick = (day, monthOffset = 0) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day
    );
    
    // Normalize the time to midnight to prevent timezone comparison issues
    selectedDate.setHours(0, 0, 0, 0);

    if (!selectedDates.startDate || selectedDates.endDate) {
      setSelectedDates({ startDate: selectedDate, endDate: null });
    } else if (selectedDate.getTime() === selectedDates.startDate.getTime()) {
      setSelectedDates({ startDate: selectedDate, endDate: selectedDate });
    } else {
      if (selectedDate > selectedDates.startDate) {
        setSelectedDates({ ...selectedDates, endDate: selectedDate });
      } else {
        setSelectedDates({
          startDate: selectedDate,
          endDate: selectedDates.startDate,
        });
      }
    }

    setError("");
    setSuccess(""); // Clear success message when picking new dates
  };

  const handleMonthChange = (increment) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + increment));
    setCurrentDate(new Date(newDate));
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const startOfMonth = new Date(year, month, 1).getDay();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Add previous month days
    for (let i = startOfMonth - 1; i >= 0; i--) {
      days.push({ day: daysInPreviousMonth - i, monthOffset: -1 });
    }

    // Add current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({ day: i, monthOffset: 0 });
    }

    // Add next month days
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ day: i, monthOffset: 1 });
    }

    return days;
  };

  const isDateSelected = (day, monthOffset) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day
    );
    date.setHours(0, 0, 0, 0);

    return (
      (selectedDates.startDate && selectedDates.startDate.getTime() === date.getTime()) ||
      (selectedDates.endDate && selectedDates.endDate.getTime() === date.getTime()) ||
      (selectedDates.startDate &&
        selectedDates.endDate &&
        date >= selectedDates.startDate &&
        date <= selectedDates.endDate)
    );
  };

  const days = generateCalendarDays();

  const handleFilterRooms = () => {
    if (!selectedDates.startDate) {
      setError("Please select a valid date.");
      setIsFiltered(false);
      return;
    }

    const startDate = selectedDates.startDate;
    const endDate = selectedDates.endDate || selectedDates.startDate;

    // FIXED DATE COMPARISON LOGIC
    const isDateInRange = (occupiedDate) => {
      // Normalize all dates to YYYY-MM-DD strings for accurate comparison
      const occStr = new Date(occupiedDate).toDateString();
      const startStr = startDate.toDateString();
      const endStr = endDate.toDateString();

      if (startStr === endStr) {
        return occStr === startStr;
      }
      
      return new Date(occStr) >= new Date(startStr) && new Date(occStr) <= new Date(endStr);
    };

    const availableRooms = roomData.filter((room) => {
      const occupiedDates = room.occupiedDates || [];
      return occupiedDates.every((occ) => !isDateInRange(occ.date));
    });

    setFilteredRooms(availableRooms);
    setIsFiltered(true);
    setError("");
    setSuccess("");
  };

  return (
    <div className="booking-container">
      <div className="calendar-header">
        <button className="date-switcher" onClick={() => handleMonthChange(-1)}>
          <FaArrowLeft />
        </button>
        <h2>
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button className="date-switcher" onClick={() => handleMonthChange(1)}>
          <FaArrowRight />
        </button>
      </div>

      <div className="calendar-days">
        {days.map(({ day, monthOffset }, index) => (
          <div
            key={index}
            className={`calendar-day ${
              isDateSelected(day, monthOffset) ? "selected" : ""
            } ${monthOffset !== 0 ? "overflow" : ""}`}
            onClick={() => handleDateClick(day, monthOffset)}
          >
            {day}
          </div>
        ))}
      </div>

      <button className="book-rooms-button" onClick={handleFilterRooms}>
        Book Rooms
      </button>

      {error && !isFiltered && <div className="error-message">{error}</div>}

      <div className="filtered-rooms">
        {/* FIXED UI PRIORITY LOGIC */}
        {success ? (
          <p className="success-message">{success}</p>
        ) : isFiltered ? (
          filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard
                onBookingSuccess={() => {
                  // 1. Refetch data from Django so dates update immediately
                  fetchRoomData(); 
                  
                  // 2. Reset UI
                  setSelectedDates({ startDate: null, endDate: null });
                  setFilteredRooms([]);
                  setIsFiltered(false);
                  setSuccess("Booking Successful!");
                  
                  // 3. Clear success message after 5 seconds
                  setTimeout(() => {
                    setSuccess("");
                  }, 5000);
                }}
                key={room.id}
                room={room}
                selectedDateRange={selectedDates}
              />
            ))
          ) : (
            <p>No available rooms for the selected dates.</p>
          )
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <p>Please select a date for booking.</p>
        )}
      </div>
    </div>
  );
};

export default BookingComponent;