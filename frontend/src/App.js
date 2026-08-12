import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import CursorTrail from "./components/CursorTrail";
import Nav from "./components/Nav";
import CartDrawer from "./components/CartDrawer";
import Landing from "./pages/Landing";
import Drops from "./pages/Drops";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <CartProvider>
          <CursorTrail />
          <Nav />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/drops" element={<Drops />} />
          </Routes>
          <CartDrawer />
        </CartProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#0F0E0E",
              color: "#F9F6F0",
              border: "1px solid #D4AF37",
              borderRadius: 0,
              fontFamily: "Outfit, sans-serif",
              fontSize: "0.78rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            },
          }}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
