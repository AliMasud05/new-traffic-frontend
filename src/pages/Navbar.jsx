
import React, { useState, useEffect } from "react";

import { Link, useLocation } from "react-router-dom"; 
import { ChevronDown, Menu, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import logo from '/logo.png'


function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const location = useLocation(); 
  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    setTimeoutId(id);
  };

  useEffect(() => {
    setIsOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href) => {
    return location.pathname === href;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <div className="sticky top-0 z-50 bg-[#4E4B4B] shadow-sm w-full mb-5">
        <nav className="border-b">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-24">
              <Link
                href="/road-signs"
                className="text-xl font-bold text-red-600"
              >
                <img
                  src={logo}
                  alt="car-logo"
                
                  className="h-14 w-16"
                />
              </Link>
              <div className="hidden md:flex items-center justify-between gap-x-9 text-lg">
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1 px-4 py-1 rounded-lg transition",
                      isActive("/")
                        ? "bg-[#4E4B4B] text-yellow-400 ring-2 ring-yellow-400"
                        : "hover:bg-[#4E4B4B] hover:text-yellow-400 hover:right-2 hover:ring-yellow-400"
                    )}
                  >
                    <Link
                      href="https://avtoskola-drift.ge/"
                      className={cn(
                        "font-bold text-lg",
                        isActive("/") ? "" : ""
                      )}
                    >
                      მთავარი
                    </Link>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0",
                        isActive("/") ? "" : ""
                      )}
                    />
                  </div>
                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#4E4B4B] rounded-md border py-1 z-50 text-lg">
                      <Link
                        href="https://avtoskola-drift.ge/%e1%83%95%e1%83%98%e1%83%93%e1%83%94%e1%83%9d%e1%83%94%e1%83%91%e1%83%98/"
                        className={cn(
                          "block px-4 py-1 font-bold text-black",
                          isActive("/videos")
                            ? "text-yellow-400"
                            : " hover:text-yellow-400"
                        )}
                      >
                        ვიდეოები
                      </Link>
                      <Separator className="my-1 bg-gray-700" />
                      <Link
                        href="https://avtoskola-drift.ge/%e1%83%9b%e1%83%90%e1%83%a1%e1%83%ac%e1%83%90%e1%83%95%e1%83%9a%e1%83%94%e1%83%91%e1%83%9a%e1%83%94%e1%83%91%e1%83%98/"
                        className={cn(
                          "block px-4 py-1 font-bold text-black",
                          isActive("/teachers")
                            ? "text-yellow-400"
                            : "hover:text-yellow-400"
                        )}
                      >
                        მასწავლებლები
                      </Link>
                      <Separator className="my-1 bg-gray-700" />
                      <Link
                        href="https://avtoskola-drift.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                        className={cn(
                          "block px-4 py-21 font-bold text-black",
                          isActive("/about-us")
                            ? "text-yellow-400"
                            : "hover:text-yellow-400"
                        )}
                      >
                        ჩვენს შესახებ
                      </Link>
                      <Separator className="my-1 bg-gray-700" />
                      <Link
                        href="https://avtoskola-drift.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                        className={cn(
                          "block px-4 py-1 font-bold text-black",
                          isActive("/contact")
                            ? "text-yellow-400"
                            : "hover:text-yellow-400"
                        )}
                      >
                        კონტაქტი
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  href="/road-signs"
                  className={cn(
                    "px-4 py-1 font-bold rounded-md transition gap-2",
                    isActive("/road-signs")
                      ? "bg-[#4E4B4B] text-yellow-400 ring-2 ring-yellow-400"
                      : "hover:bg-[#4E4B4B] hover:text-yellow-400 hover:right-2 hover:ring-yellow-400"
                  )}
                >
                  საგზაო ნიშნები
                </Link>
                <Link
                  href="/tickets"
                  className={cn(
                    "px-4 py-1 font-bold rounded-lg transition",
                    isActive("/tickets")
                      ? "bg-[#4E4B4B] text-yellow-400 ring-2 ring-yellow-400"
                      : "hover:bg-[#4E4B4B] hover:text-yellow-400 hover:right-2 hover:ring-yellow-400"
                  )}
                >
                  ბილეთები
                </Link>
                <Link
                  href="/exam"
                  className={cn(
                    "px-4 py-1 font-bold rounded-lg transition",
                    isActive("/exam")
                      ? "bg-[#4E4B4B] text-yellow-400 ring-2 ring-yellow-400"
                      : "hover:bg-[#4E4B4B] hover:text-yellow-400 hover:right-2 hover:ring-yellow-400"
                  )}
                >
                  გამოცდა
                </Link>
              </div>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-yellow-400"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            <div
              className={cn(
                "md:hidden transition-all duration-300",
                mobileMenuOpen ? "max-h-screen py-4" : "max-h-0 overflow-hidden"
              )}
            >
              <div className="flex flex-col space-y-2">
                <div className="relative">
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-1 rounded-lg transition w-full",
                      isActive("/")
                        ? "bg-[#4E4B4B] text-yellow-400 ring-2 ring-yellow-400"
                        : "hover:bg-[#4E4B4B] hover:text-yellow-400 hover:right-2 hover:ring-yellow-400"
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <span className="font-bold">
                      <Link
                        href={"https://avtoskola-drift.ge/"}
                        className="text-lg"
                      >
                        მთავარი
                      </Link>
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "ml-auto transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0",
                        isActive("/") ? "" : ""
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "pl-6 transition-all duration-300",
                      isOpen ? "max-h-screen" : "max-h-0 overflow-hidden"
                    )}
                  >
                    <Link
                      href="https://avtoskola-drift.ge/%e1%83%95%e1%83%98%e1%83%93%e1%83%94%e1%83%9d%e1%83%94%e1%83%91%e1%83%98/"
                      className={cn(
                        "block px-4 py-1 text-lg font-bold text-black",
                        isActive("/videos")
                          ? "text-yellow-400"
                          : "hover:text-yellow-400"
                      )}
                    >
                      ვიდეოები
                    </Link>
                    <Link
                      href="https://avtoskola-drift.ge/%e1%83%95%e1%83%98%e1%83%93%e1%83%94%e1%83%9d%e1%83%94%e1%83%91%e1%83%98/"
                      className={cn(
                        "block px-4 py-1 text-lg font-bold text-black",
                        isActive("/teachers")
                          ? "text-yellow-400"
                          : "hover:text-yellow-400"
                      )}
                    >
                      მასწავლებლები
                    </Link>
                    <Link
                      href="https://avtoskola-drift.ge/%e1%83%a9%e1%83%95%e1%83%94%e1%83%9c%e1%83%a1-%e1%83%a8%e1%83%94%e1%83%a1%e1%83%90%e1%83%ae%e1%83%94%e1%83%91/"
                      className={cn(
                        "block px-4 py-1 text-lg font-bold text-black",
                        isActive("/about-us")
                          ? "text-yellow-400"
                          : "hover:text-yellow-400"
                      )}
                    >
                      ჩვენს შესახებ
                    </Link>
                    <Link
                      href="https://avtoskola-drift.ge/%e1%83%99%e1%83%9d%e1%83%9c%e1%83%a2%e1%83%90%e1%83%a5%e1%83%a2%e1%83%98/"
                      className={cn(
                        "block px-4 py-1 text-lg font-bold text-black",
                        isActive("/contact")
                          ? "text-yellow-400"
                          : "hover:text-yellow-400"
                      )}
                    >
                      კონტაქტი
                    </Link>
                  </div>
                </div>
                <Link
                  href="/road-signs"
                  className={cn(
                    "px-4 py-1 font-bold rounded-lg transition",
                    isActive("/road-signs")
                      ? "bg-[#4E4B4B] text-yellow-400 ring-2 ring-yellow-400"
                      : "hover:bg-[#4E4B4B] hover:text-yellow-400 hover:right-2 hover:ring-yellow-400"
                  )}
                >
                  საგზაო ნიშნები
                </Link>
                <Link
                  href="/tickets"
                  className={cn(
                    "px-4 py-1 font-bold rounded-lg transition",
                    isActive("/tickets")
                      ? "bg-[#4E4B4B] text-yellow-400 ring-2 ring-yellow-400"
                      : "hover:bg-[#4E4B4B] hover:text-yellow-400 hover:right-2 hover:ring-yellow-400"
                  )}
                >
                  ბილეთები
                </Link>
                <Link
                  href="/exam"
                  className={cn(
                    "px-4 py-1 font-bold rounded-lg transition",
                    isActive("/exam")
                      ? "bg-[#4E4B4B] text-yellow-400 ring-2 ring-yellow-400"
                      : "hover:bg-[#4E4B4B] hover:text-yellow-400 hover:right-2 hover:ring-yellow-400"
                  )}
                >
                  გამოცდა
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
