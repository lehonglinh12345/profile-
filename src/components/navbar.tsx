import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-scroll";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { name: "Trang chủ", to: "hero" },
    { name: "Giới thiệu", to: "about" },
    { name: "Kỹ năng", to: "skill" },
    { name: "Kinh nghiệm", to: "experience" },
    { name: "Tiếng Nhật", to: "japanese" },
    { name: "Dự án", to: "projects" },
    { name: "Liên hệ", to: "contact" },
  ];

  // Theo dõi scroll để thu gọn navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full bg-background/80 backdrop-blur-md shadow-md z-50 transition-all duration-300 ${
        scrolled ? "h-14 bg-background/95" : "h-16"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={`max-w-6xl mx-auto px-4 flex justify-between items-center transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
        {/* Logo + Avatar */}
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.img
            src="/favicon.ico"
            alt="Avatar"
            className={`w-10 h-10 rounded-full border-2 border-primary object-cover cursor-pointer transition-all duration-300 ${
              scrolled ? "w-8 h-8" : ""
            }`}
            onClick={() => setShowAvatar(true)}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          />
          <motion.h1
            className={`font-bold text-primary tracking-wide transition-all duration-300 ${
              scrolled ? "text-lg" : "text-xl"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            LE HONG LINH
          </motion.h1>
        </motion.div>

        {/* Menu desktop */}
        <motion.ul
          className="hidden md:flex space-x-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {navLinks.map((link, index) => (
            <motion.li
              key={link.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
              whileHover={{ y: -2, scale: 1.05 }}
            >
              <Link
                to={link.to}
                smooth={true}
                duration={600}
                offset={-70}
                spy={true}
                activeClass="active-nav"
                className="cursor-pointer text-foreground hover:text-primary transition-all duration-300 relative block py-1"
              >
                {link.name}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full"
                  initial={false}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        {/* Nút mở menu mobile */}
        <motion.button
          className="md:hidden text-foreground p-1 rounded transition-all duration-200 hover:bg-accent/20"
          onClick={() => setOpen(!open)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.X
                key="close"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                size={24}
              />
            ) : (
              <motion.Menu
                key="open"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                size={24}
              />
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden bg-background border-t border-border overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ul className="flex flex-col items-center py-4 space-y-3">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 5, scale: 1.02 }}
                >
                  <Link
                    to={link.to}
                    smooth={true}
                    duration={600}
                    offset={-70}
                    spy={true}
                    activeClass="active-nav"
                    onClick={() => setOpen(false)}
                    className="cursor-pointer text-foreground hover:text-primary transition-all duration-300 text-lg py-2"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal avatar */}
      {showAvatar && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-start justify-start z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowAvatar(false)}
          >
            <motion.img
              src="/favicon.ico"
              alt="Avatar Large"
              className="w-48 h-48 object-cover rounded-xl shadow-2xl cursor-pointer border-2 border-primary/50 hover:border-primary transition-all duration-300 ml-4 mt-4 hover:scale-105"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              onClick={(e) => e.stopPropagation()} // Không đóng khi click ảnh
            />
          </motion.div>
        </AnimatePresence>
      )}
    </motion.nav>
  );
};