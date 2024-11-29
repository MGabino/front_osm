import React, { useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Solución para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const App = () => {
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [position, setPosition] = useState([
    -38.716666666667, -62.266666666667,
  ]); // Posición inicial
  const [points, setPoints] = useState([]); // Almacena los puntos del polígono
  const [error, setError] = useState(null); // Para manejar errores

  const handleSearch = async () => {
    try {
      setError(null); // Limpia errores previos

      // Construye la consulta para Nominatim
      const query = `${number} ${street}, ${city}`;
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: query, // Dirección completa
            format: "json", // Formato de respuesta
            addressdetails: 1, // Incluir detalles de la dirección
            limit: 1, // Límite de resultados
          },
        }
      );

      const results = response.data;

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const newPoint = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPoint);
        setPoints((prevPoints) => [...prevPoints, newPoint]); // Agrega el nuevo punto
      } else {
        setError("No se encontraron resultados para la dirección ingresada.");
      }
    } catch (err) {
      console.error(err);
      setError("Hubo un error al consultar la API de Nominatim.");
    }
  };

  // Agregar un punto al hacer clic en el mapa
  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    const newPoint = [lat, lng];
    setPoints((prevPoints) => [...prevPoints, newPoint]);
  };

  // Resetear los puntos
  const resetPoints = () => {
    setPoints([]);
  };

  return (
    <div>
      <h1>Buscar Dirección</h1>
      <div>
        <input
          type="text"
          placeholder="Calle"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
        <input
          type="text"
          placeholder="Numero"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
        <button onClick={resetPoints} style={{ marginLeft: "10px" }}>
          Resetear Ruta
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ height: "80vh", marginTop: "20px" }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          onClick={handleMapClick}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point, index) => (
            <Marker position={point} key={index}>
              <Popup>Punto {index + 1}</Popup>
            </Marker>
          ))}

          {/* Dibujar la ruta */}
          {points.length > 1 && <Polyline positions={points} color="blue" />}
        </MapContainer>
      </div>
    </div>
  );
};

export default App;
