import { useState, useEffect } from "react";
import axios from "axios";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import RoomIcon from "@mui/icons-material/Room";
import Star from "@mui/icons-material/Star";
import "./app.css";
import { format } from "timeago.js";
import Register from "./components/Register";
import Login from "./components/Login";
function App() {
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("User"));
  const [togglePopup, setTogglePopup] = useState(false);
  const [newPlace, setNewPlace] = useState(null);
  const [star, setStar] = useState(1);
  const [desc, setDesc] = useState("");
  const [title, setTitle] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
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
  const handleAddClick = (e) => {
    const [lon, lat] = e.lngLat;
    setNewPlace({
      lat,
      lon,
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };
  const handleLogout = () => {
    setCurrentUser(null);
    myStorage.removeItem("user");
  };
  return (
    <div className="App">
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_API_KEY}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        onDblClick={handleAddClick}
        transistionDuration="200"
      >
        {pins?.map((p) => {
          return (
            <div key={p._id}>
              <Marker
                latitude={p.lat}
                longitude={p.lon}
                offsetLeft={viewport.zoom * 1.5}
                offsetTop={viewport.zoom * 3}
                onClick={() => setTogglePopup(true)}
              >
                <RoomIcon
                  style={{
                    fontSize: viewport.zoom * 3,
                    color: "red",
                    cursor: "pointer",
                    color: p.username === currentUser ? "tomato" : "slateblue",
                  }}
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
        {newPlace && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.lon}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setNewPlace(null)}
            anchor="top"
          >
            <div>
              <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input
                  placeholder="Enter a title"
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label>Description</label>
                <textarea
                  placeholder="Say us something about this place."
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Rating</label>
                <select onChange={(e) => setStar(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button type="submit" className="submitButton">
                  Add Pin
                </button>
              </form>
            </div>
          </Popup>
        )}
        {currentUser ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
            <button
              className="button register"
              onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && (
          <Login
            setShowLogin={setShowLogin}
            setCurrentUser={setCurrentUser}
            myStorage={myStorage}
          />
        )}
      </ReactMapGL>
    </div>
  );
}

export default App;
