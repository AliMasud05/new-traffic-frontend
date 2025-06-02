import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, ChevronDown, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import { FaPhoneAlt } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown Menu
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu
  const location = useLocation(); // Get the current location
  const [activeButton, setActiveButton] = useState(
    "https://exam.avtoskola-varketilshi.ge/"
  ); // State for active button

  // Check device size
  useEffect(() => {
    const checkDeviceSize = () => {
      setIsSmallDevice(window.innerWidth < 768);
    };
    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);
    return () => window.removeEventListener("resize", checkDeviceSize);
  }, []);

  // Dropdown handlers
  const handleMouseEnter = () => !isSmallDevice && setIsDropdownOpen(true);
  const handleMouseLeave = () => !isSmallDevice && setIsDropdownOpen(false);
  const handleDropdownClick = () =>
    isSmallDevice && setIsDropdownOpen(!isDropdownOpen);

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close mobile menu when clicking outside
  const closeMenu = () => setIsMenuOpen(false);

  // Check if the current route is /v
  const isVRoute =
    location.pathname === "https://exam.avtoskola-varketilshi.ge/";

  return (
    <div className=" ">
      <header className="">
        {/* Top Contact Info */}
        <div className="bg-[#EEEEEE] text-black py-1 px-0  xl-custom:px-32 hidden lg:block">
          <ul className="hidden xl-custom:grid grid-cols-7 mx-6 text-[12px] xl-custom:text-[13px] font-semibold   ">
            <li className="text-[13px] lg:text-sm font-medium col-span-3">
              ავტოსკოლა ვარკეთილში
            </li>
            <div className="  col-span-4 flex items-center justify-between  ">
              <li className="flex items-center ">
                <div className="bg-[#BE3144] text-white rounded-xl  flex items-center justify-center ">
                  <div className=" p-[5px] rounded-[50%]">
                    <FaPhoneAlt size={10} className="text-white" />
                  </div>
                </div>
                <span className="ml-2 text-nowrap text-[12px] leading-3">+995 574-747-581</span>
              </li>
              <li className="flex items-center">
                <div className=" p-[5px] rounded-[50%] bg-[#BE3144]">
                  <svg
                    aria-hidden="true"
                    className="e-font-icon-svg e-fas-envelope w-[10px] h-[10px] text-white fill-current"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path>
                  </svg>
                </div>

                <span className="ml-2 text-[12px] leading-3 font-[550] text-nowrap"> 
                  Guramdiasamidze123@gmail.com
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className=" p-[5px] rounded-[50%] bg-[#BE3144]">
                  <svg
                    aria-hidden="true"
                    className="e-font-icon-svg e-fas-envelope w-[10px] h-[10px] text-white fill-current"
                    viewBox="0 0 288 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M112 316.94v156.69l22.02 33.02c4.75 7.12 15.22 7.12 19.97 0L176 473.63V316.94c-10.39 1.92-21.06 3.06-32 3.06s-21.61-1.14-32-3.06zM144 0C64.47 0 0 64.47 0 144s64.47 144 144 144 144-64.47 144-144S223.53 0 144 0zm0 76c-37.5 0-68 30.5-68 68 0 6.62-5.38 12-12 12s-12-5.38-12-12c0-50.73 41.28-92 92-92 6.62 0 12 5.38 12 12s-5.38 12-12 12z"></path>
                  </svg>
                </div>
                <span className="text-nowrap"> ვარკეთილი, ჯავახეთის N 102</span>
              </li>
            </div>
          </ul>
        </div>

        <hr className="" />

        {/* Logo and Navigation */}
        <div className=" flex justify-between px-4 sm:px-20 md:px-8   xl-custom:px-28 shadow-2xl py-5">
          {/* Logo */}
          <Link
            to="https://avtoskola-varketilshi.ge/"
            className="flex gap-1 font-bold hover:text-green-500"
          >
            <img
              src="https://avtoskola-varketilshi.ge/wp-content/uploads/2025/02/WhatsApp_Image_2025-02-06_at_10.42.28_AM-removebg-1024x573.png"
              alt="Logo"
              className=" w-20 md:w-28 md:h-[63px] cursor-pointer"
            />
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu}>
              {!isMenuOpen ? (
                <Menu size={32} className="text-gray-700" />
              ) : (
                <X size={24} className="text-gray-700" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:space-x-1 mx-auto items-center  gap-1  ">
            <div
              className="relative group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button className="" onClick={handleDropdownClick}>
                <Link
                  to="https://avtoskola-varketilshi.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                  className="flex items-center justify-center  font-bold hover:text-green-500 mt-2"
                >
                  <img
                    src="https://s.w.org/images/core/emoji/15.0.3/svg/1f697.svg"
                    alt="Logo"
                    className="h-[18px]"
                  />
                  <span className="text-[15px] leading-none font-bold tracking-tight">
                    მთავარი
                  </span>
                  <ChevronDown
                    size={16}
                    className="text-gray-700 group-hover:text-green-500"
                  />
                </Link>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`${
                  isDropdownOpen ? "block" : "hidden"
                } md:absolute bg-white  shadow-lg mt-0 rounded-md w-52`}
              >
                <Link
                  to="https://avtoskola-varketilshi.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                  className="block px-4 py-3 hover:bg-gray-100 border-b border-gray-200"
                >
                  <span className="w-2 h-full bg-green-500 mr-2 "></span>
                  ჩვენს შესახებ
                </Link>
                <Link
                  to="https://avtoskola-varketilshi.ge/%e1%83%99%e1%83%9d%e1%83%9c%e1%83%a2%e1%83%90%e1%83%a5%e1%83%a2%e1%83%98/"
                  className="block px-4 py-3  hover:bg-gray-100 border-b border-gray-200 "
                >
                  კონტაქტი
                </Link>
              </div>
            </div>

            {/* Other Links */}
            <button>
              <Link
                to="https://avtoskola-varketilshi.ge/%E1%83%A1%E1%83%90%E1%83%92%E1%83%96%E1%83%90%E1%83%9D-%E1%83%9C%E1%83%98%E1%83%A8%E1%83%9C%E1%83%94%E1%83%91%E1%83%98/"
                className="flex items-center  font-bold hover:text-green-500"
              >
                <img
                  src="https://s.w.org/images/core/emoji/15.0.3/svg/1f697.svg"
                  alt="Logo"
                  className="h-[18px]"
                />
                  <span className="text-[15px] leading-none font-bold tracking-tight">საგზაო ნიშნები</span>
              </Link>
            </button>

            <button>
              <Link
                to="https://biletebi.avtoskola-varketilshi.ge/"
                className="flex items-center  font-bold hover:text-green-500"
              >
                <img
                  src="https://s.w.org/images/core/emoji/15.0.3/svg/1f697.svg"
                  alt="Logo"
                  className="h-[18px]"
                />
                  <span className="text-[15px] leading-none font-bold tracking-tight">ბილეთები</span>
              </Link>
            </button>

            <button>
              <Link
                to="https://exam.avtoskola-varketilshi.ge/"
                className={`flex items-center font-bold hover:text-green-500 ${
                  activeButton === "https://exam.avtoskola-varketilshi.ge/"
                    ? "text-[#f32929]"
                    : ""
                }
                }`}
              >
                <img
                  src="https://s.w.org/images/core/emoji/15.0.3/svg/1f697.svg"
                  alt="Logo"
                  className="h-[18px]"
                />
                  <span className="text-[15px] leading-none font-bold tracking-tight">გამოცდა</span>
              </Link>
            </button>
          </nav>
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden z-50`}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex flex-col space-y-4 p-4">
            <div className="relative">
              <button
                className="flex gap-2 font-bold hover:text-green-500"
                onClick={handleDropdownClick}
              >
                <img
                  src="https://s.w.org/images/core/emoji/15.0.3/svg/1f697.svg"
                  alt="Logo"
                  className="h-[18px]"
                />
                <span>მთავარი</span>
                <ChevronDown
                  size={16}
                  className="text-gray-700 group-hover:text-green-500"
                />
              </button>

              {/* Dropdown Menu */}
              <div className={`${isDropdownOpen ? "block" : "hidden"} mt-2`}>
                <Link
                  to="https://avtoskola-varketilshi.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                  className="block px-4 py-3 text-sm hover:bg-gray-100 border-b border-gray-200"
                >
                  <span className="w-2 h-full bg-green-500 mr-2"></span>
                  ჩვენს შესახებ
                </Link>
                <Link
                  to="https://avtoskola-varketilshi.ge/%e1%83%99%e1%83%9d%e1%83%9c%e1%83%a2%e1%83%90%e1%83%a5%e1%83%a2%e1%83%98/"
                  className="block px-4 py-3 text-sm hover:bg-gray-100 border-b border-gray-200"
                >
                  კონტაქტი
                </Link>
              </div>
            </div>

            {/* Other Links */}
            <Link to="https://avtoskola-varketilshi.ge/%E1%83%A1%E1%83%90%E1%83%92%E1%83%96%E1%83%90%E1%83%9D-%E1%83%9C%E1%83%98%E1%83%A8%E1%83%9C%E1%83%94%E1%83%91%E1%83%98/">
              <button className="flex gap-2 font-bold hover:text-green-500">
                <img
                  src="https://s.w.org/images/core/emoji/15.0.3/svg/1f697.svg"
                  alt="Logo"
                  className="h-[18px]"
                />
                <span>საგზაო ნიშნები</span>
              </button>
            </Link>

            <Link to="https://biletebi.avtoskola-varketilshi.ge/">
              <button className="flex gap-2 font-bold hover:text-green-500">
                <img
                  src="https://s.w.org/images/core/emoji/15.0.3/svg/1f697.svg"
                  alt="Logo"
                  className="h-[18px]"
                />
                <span>ბილეთები</span>
              </button>
            </Link>

            <Link to="https://exam.avtoskola-varketilshi.ge/">
              <button
                className={`flex gap-1 font-bold hover:text-green-500 ${
                  activeButton === "https://exam.avtoskola-varketilshi.ge/"
                    ? "text-red-500"
                    : ""
                }
                }`}
              >
                <img
                  src="https://s.w.org/images/core/emoji/15.0.3/svg/1f697.svg"
                  alt="Logo"
                  className="h-[18px]"
                />
                <span>გამოცდა</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Overlay for Mobile Nav */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMenu}
          ></div>
        )}
      </header>
    </div>
  );
};

export default Navbar;
