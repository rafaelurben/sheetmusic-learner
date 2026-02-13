import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import About from "./pages/About.tsx";
import Unauthenticated from "@/pages/Unauthenticated.tsx";
import { useAuth } from "react-oidc-context";

export default function App() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Unauthenticated />;
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <nav>
          <Link to="/">Home</Link> | <Link to="/about">About</Link> |{" "}
          <button onClick={() => void auth.removeUser()}>Log out</button>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
}
