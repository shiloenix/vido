import { useState } from "react";
import { NavLink } from "react-router-dom";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";

const links = [
  { to: "/", label: "Home" },
  { to: "/download", label: "Download" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="h-0.5 w-full bg-linear-to-r from-transparent via-gray-400 to-transparent opacity-70" />

      <div className="backdrop-blur-md bg-black/60 border-b border-gray-500/20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

          <a href="/" className="flex items-center gap-0 group">
            <img
              src="/.png"
              alt=""
              className="h-10 w-auto"
            />
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative px-4 py-1.5 text-xs tracking-widest uppercase transition-all duration-200
                  ${isActive ? "text-gray-300" : "text-white/40 hover:text-white/80"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute inset-0 border border-gray-500/40 rounded bg-gray-500/5" />
                    )}
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <button
            onClick={() => setOpen((p) => !p)}
            className="md:hidden text-gray-400 hover:text-gray-300 transition-colors"
          >
            {open ? <RiCloseLine className="size-6" /> : <RiMenuLine className="size-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-500/20 px-6 py-4 flex flex-col gap-3">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-xs tracking-widest uppercase py-2 transition-colors
                  ${isActive ? "text-gray-300" : "text-white/40"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
