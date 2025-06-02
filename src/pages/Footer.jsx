import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  return (
    <footer className="  w-full bg-white border-t py-4">
      <hr  className="border border-black w-[90%] mx-auto bg-black  " />
      <div className=" md:w-[90%] mx-auto flex justify-between items-center px-4 py-3 bg-white">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="https://avtoskola-varketilshi.ge/">
            <img
              src="https://avtoskola-varketilshi.ge/wp-content/uploads/2025/02/WhatsApp_Image_2025-02-06_at_10.42.28_AM-removebg-1024x573.png"
              alt="Logo"
              className="h-16 md:h-24 cursor-pointer"
            />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-3 mx-auto">
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-1 text-sm md:text-base font-bold hover:text-green-500"
            >
              <span>მთავარი</span>
              <ChevronDown size={16} className="text-gray-700" />
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div
                className="absolute bg-white border
               border-gray-300  -top-24 shadow-lg
                md:absolute 
                             -left-2  mb-28 mr-4  
                rounded-md w-52 z-20"
              >
                <Link
                  to="https://avtoskola-varketilshi.ge/"
                  className="block px-4 py-3 text-sm hover:bg-gray-100 border-b border-gray-200"
                >
                  ჩვენს შესახებ
                </Link>
                <Link
                  to="https://avtoskola-varketilshi.ge/"
                  className="block px-4 py-3 text-sm hover:bg-gray-100"
                >
                  კონტაქტი
                </Link>
              </div>
            )}
          </div>

          {/* Other Links */}
          <Link
            to="https://avtoskola-varketilshi.ge/"
            className="text-sm md:text-base font-bold text-gray-700 hover:text-green-500"
          >
            ბილეთები
          </Link>
          <Link
            to="https://avtoskola-varketilshi.ge/"
            className="text-sm md:text-base font-bold text-gray-700 hover:text-green-500"
          >
            გამოცდა
          </Link>
        </nav>
      </div>

      <div className="text-sm">
        <p className="flex justify-center gap-3 text-center text-gray-600">
          <span className="text-[12px] md:text-sm font-bold font-serif">
            ყველა უფლება დაცულია
          </span>
          <span className="text-[12px] md:text-sm"> @2025 | ZGLMedia</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
