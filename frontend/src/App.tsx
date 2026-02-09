import { Link, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}
