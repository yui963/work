import "./App.css";
import Header from "./Header.tsx";
import Context from "./Context.tsx";
import HRM from "./HRM.tsx";
import About from "./About.tsx";
import Weather from "./weather.tsx";
import { Route, BrowserRouter, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <div>
        <Header />
        <BrowserRouter basename={"/work/"}>
          <Routes>
            <Route path="/" element={<Context />} />
            <Route path="/HRM" element={<HRM />} />
            <Route path="/About" element={<About />} />
            <Route path="/Weather" element={<Weather />} />
            <Route path="*" element={<p>404 not found</p>} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
