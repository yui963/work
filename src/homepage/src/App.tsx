import "./App.css";
import Header from "./Header.tsx";
import Context from "./Context.tsx";
import HRM from "./HRM.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <div>
        <Header />
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <Routes>
            <Route path="/" element={<Context />} />
            <Route path="/HRM" element={<HRM />} />
            <Route path="*" element={<div>404 ページが見つかりません。</div>} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
