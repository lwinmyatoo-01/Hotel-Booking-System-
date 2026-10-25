import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomImageSlider from "./RoomImageSlider";
import RoomInfo from "./Roominfo";
import "./RoomDetails.css";
import { UserContext } from "../UserContext"; 

const RoomCard = ({ room, selectedDateRange, onBookingSuccess }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [isBooking, setIsBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleBooking = async (roomId, selectedDateRange) => {
    if (!user || !user.token) {
      return navigate("/auth");
    }

    setIsBooking(true);
    setErrorMsg("");

    const baseURL = "http://127.0.0.1:8000";
    const start = new Date(selectedDateRange.startDate);
    const end = selectedDateRange.endDate 
      ? new Date(selectedDateRange.endDate) 
      : new Date(selectedDateRange.startDate);

    let isSuccess = true;

    for (let current = start; current <= end; current.setDate(current.getDate() + 1)) {
      try {
        const response = await fetch(`${baseURL}/occupied-dates/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
          body: JSON.stringify({
            room: roomId,     // ONLY send room ID
            date: formatDate(current),
            // DO NOT send user. Django handles it.
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.log("Backend Error:", errorData);
          isSuccess = false;
          break;
        }
      } catch (err) {
        console.error("Network error:", err);
        isSuccess = false;
        break;
      }
    }

    setIsBooking(false);

    if (isSuccess) {
      onBookingSuccess();
    } else {
      setErrorMsg("Failed to book. Dates may be unavailable or already booked.");
    }
  };

  return (
    <div className="room-card">
      <RoomImageSlider images={room.images} />
      <RoomInfo room={room} />
      
      {errorMsg && (
        <p style={{ color: "red", fontSize: "14px", marginTop: "10px", fontWeight: "bold" }}>
          {errorMsg}
        </p>
      )}

      {selectedDateRange ? (
        <button
          className="book-room-button"
          onClick={() => {
            if (!user) {
              navigate("/auth");
            } else {
              // Notice we only pass roomId now, not userId
              handleBooking(room.id, selectedDateRange);
            }
          }}
          disabled={isBooking || !selectedDateRange.startDate}
        >
          {isBooking ? "Booking..." : "Book Room"}
        </button>
      ) : null}
    </div>
  );
};

export default RoomCard;