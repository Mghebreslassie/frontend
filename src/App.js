import { useState, useEffect } from "react";
import axios from "axios";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import RoomIcon from "@mui/icons-material/Room";
import Star from "@mui/icons-material/Star";
import "./app.css";
import { format } from "timeago.js";
function App() {
  const [togglePopup, setTogglePopup] = useState(false);
  const [currentPlace, setCurrentPlace] = useState();
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  });
  const [pins, setPins] = useState();

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlace(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };
  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("/pin");
        setPins(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getPins();
  }, []);
  return (
    <div className="App">
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_API_KEY}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
      >
        {pins?.map((p) => {
          return (
            <div key={p._id}>
              <Marker
                latitude={p.lat}
                longitude={p.lon}
                offsetLeft={-20}
                offsetTop={-10}
                onClick={() => setTogglePopup(true)}
              >
                <RoomIcon
                  style={{ fontSize: viewport.zoom * 3, color: "red" }}
                  onClick={() => handleMarkerClick(p._id, p.lat, p.lon)}
                />
              </Marker>
              {p._id === currentPlace && (
                <Popup
                  latitude={p.lat}
                  longitude={p.lon}
                  closeButton={true}
                  closeOnClick={false}
                  onClose={() => setCurrentPlace(null)}
                  anchor="left"
                >
                  <div className="card">
                    <label>Place</label>
                    <h4 className="place">{p.title}</h4>
                    <label>Review</label>
                    <p className="desc">{p.desc}</p>
                    <label>Rating</label>
                    <div className="stars">
                      {Array(p.rating).fill(<Star className="star" />)}
                    </div>
                    <label>Information</label>
                    <span className="username">
                      created by <b>modiggs</b>
                    </span>
                    <span className="date">{format(p.createdAt)}</span>
                  </div>
                </Popup>
              )}
            </div>
          );
        })}
      </ReactMapGL>
    </div>
  );
}

export default App;
