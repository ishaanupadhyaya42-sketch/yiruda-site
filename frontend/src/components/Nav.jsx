import { Link, useLocation } from "react-router-dom";
import { WordmarkStatic } from "./BrushPaintLogo";
import CartTrigger from "./CartTrigger";

export default function Nav() {
  const loc = useLocation();
  return (
    <nav
      data-testid="site-nav"
      className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-12 py-5 flex items-center justify-between"
      style={{ mixBlendMode: "difference", color: "#F9F6F0" }}
    >
      <Link
        to="/"
        data-testid="nav-logo"
        className="transition-transform duration-500 hover:scale-105"
      >
        <WordmarkStatic className="h-6 sm:h-7 w-auto" />
      </Link>
      <div className="flex items-center gap-8">
        <Link
          to="/"
          data-testid="nav-home"
          className={`font-mono-label hover-stroke ${loc.pathname === "/" ? "opacity-100" : "opacity-70"}`}
        >
          Home
        </Link>
        <Link
          to="/drops"
          data-testid="nav-drops"
          className={`font-mono-label hover-stroke ${loc.pathname === "/drops" ? "opacity-100" : "opacity-70"}`}
        >
          Drops
        </Link>
        <CartTrigger />
      </div>
    </nav>
  );
}
