
import React from "react";

import logo from '/logo.png'


const Footer = () => {


  return (
      <footer className="bg-[#4E4B4B] text-white pt-7 pb-5 mt-10 border-t border-gray-800">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
            <img
              src={logo}
              alt="logo"
              width={160}
              height={160}
              className="w-32 sm:w-48 md:w-72"
            />
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl text-[#FEFF00] mb-3">
                ავტოსკოლა დრიფტი
              </h2>
              <p className="text-lg sm:text-xl md:text-3xl text-[#FEFF00]">
                აიღე მართვის მოწმობა პირველივე ცდაზე.
              </p>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-5xl text-black mb-3">
              სამუშაო საათები
            </h2>
            <div className="text-gray-900 text-base sm:text-lg">
              <p>ორშაბათი-პარასკევი - 09:00 - 19:00</p>
              <p>შაბათი - დაკეტილი</p>
              <p>კვირა - დაკეტილი</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
