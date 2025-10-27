import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-scroll";
import { motion, AnimatePresence } from "framer-motion";
export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false); // modal avatar

  const navLinks = [
    { name: "Trang chủ", to: "hero" },
    { name: "Giới thiệu", to: "about" },
    { name: "Kỹ năng", to: "skill" },
    { name: "Kinh nghiệm", to: "experience" },
    { name: "Tiếng Nhật", to: "japanese" },
    { name: "Dự án", to: "projects" },
    { name: "Liên hệ", to: "contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md shadow-md z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo + Avatar */}
        <div className="flex items-center space-x-3">
          <img
            src="/favicon.ico"
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-primary object-cover cursor-pointer"
            onClick={() => setShowAvatar(true)} // mở modal
          />
          <h1 className="text-xl font-bold text-primary tracking-wide">
            LE HONG LINH
          </h1>
        </div>

        {/* Menu desktop */}
        <ul className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                smooth={true}
                duration={600}
                offset={-70}
                spy={true}
                activeClass="active-nav"
                className="cursor-pointer text-foreground hover:text-primary transition-all duration-300 relative"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Nút mở menu mobile */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden bg-background border-t border-border">
          <ul className="flex flex-col items-center py-4 space-y-3">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  smooth={true}
                  duration={600}
                  offset={-70}
                  spy={true}
                  activeClass="active-nav"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer text-foreground hover:text-primary transition-all duration-300 relative"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal avatar */}
     {showAvatar && (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-start justify-left z-50 pt-0" 
      // 👆 đẩy ảnh xuống bằng pt-20 (có thể chỉnh lại tuỳ giao diện)
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowAvatar(false)} // click ở bất kỳ đâu sẽ tắt
    >
      <motion.img
        src="/favicon.ico"
        alt="Avatar Large"
        className="w-48 h-48 object-cover rounded-xl shadow-2xl cursor-pointer"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => setShowAvatar(false)} // click ảnh cũng tắt luôn
      />
    </motion.div>
  </AnimatePresence>
)}

    </nav>
  );
};
