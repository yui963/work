import { useState } from "react";
import "./App.css";
import axios from "axios";
import SelectBoxRace from "./SelectBoxRace";
import SelectBoxYear from "./SelectBoxYear";
import YoutubePlayer from "./YoutubePlayer";
import { Alert, Stack } from "@mui/material";
import WatchButton from "./WatchButton";

function App() {
  const [error, setError] = useState<string | "">("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string>("");
  const [raceFromSelectBox, setRaceFromSelectBox] = useState<string>("");
  const recvRace = (name: string) => {
    setRaceFromSelectBox(name);
  };
  const [yearFromSelectBox, setYearFromSelectBox] = useState<number | "">("");
  const recvYear = (value: number) => {
    setYearFromSelectBox(value);
  };

  const handleClick = async () => {
    try {
      const postData = {
        year: yearFromSelectBox,
        name: raceFromSelectBox,
      };
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:5000/api/search",
        postData
      );
      setLoading(false);
      if (response.data.status === "error") {
        setError("Movie is not found");
      } else {
        setError("");
        setIsVisible(true);
        setLink(response.data.URL);
      }
    } catch (error) {
      setLoading(false);
      setError("Movie is not found");
      console.error(error);
    }
  };
  return (
    <>
      <div className="App" style={{ width: "600px" }}>
        <Stack direction={"row"} spacing={2}>
          <SelectBoxRace sendRaceToApp={recvRace} />
          <SelectBoxYear sendYearToApp={recvYear} />
          <WatchButton handleClick={handleClick} loading={loading} />
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        {isVisible && <YoutubePlayer youtubeLink={link} />}
      </div>
    </>
  );
}

export default App;
