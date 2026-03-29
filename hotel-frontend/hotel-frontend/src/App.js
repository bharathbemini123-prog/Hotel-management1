import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8082/rooms")
      .then(response => {
        console.log(response.data);
        setRooms(response.data);
      })
      .catch(error => {
        console.error("Error fetching rooms:", error);
      });
  }, []);

  return (
    <div>
      <h1>Hotel Rooms</h1>

      {rooms.length === 0 ? (
        <p>No rooms found</p>
      ) : (
        rooms.map(room => (
          <div key={room.id}>
            <p>Room No: {room.roomNumber}</p>
            <p>Type: {room.roomType}</p>
            <p>Available: {room.available ? "Yes" : "No"}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default App;