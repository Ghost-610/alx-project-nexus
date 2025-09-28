import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const Header: React.FC = () => {
  const router = useRouter();

  return (
    <header className="h-28 flex items-center bg-[#1A2037] px-4 md:px-16 lg:px-44 text-[#3A97D4]">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-xl md:text-4xl font-semibold">
          Vista<span className="text-[#F2AA4C]">Play</span>
        </h2>

        {/* Center Nav */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-4">
          <Link
            href="/"
            className="hover:text-[#F2AA4C] px-3 md:px-6 text-xl transition-colors duration-300 font-semibold"
          >
            Home
          </Link>
          <Link
            href="/movies"
            className="hover:text-[#F2AA4C] px-3 md:px-6 text-xl transition-colors duration-300 font-semibold"
          >
            Movies
          </Link>
          <Link
            href="/favorite"
            className="hover:text-[#F2AA4C] px-3 md:px-6 text-xl transition-colors duration-300 font-semibold"
          >
            Favorite
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#F2AA4C] px-3 md:px-6 text-xl transition-colors duration-300 font-semibold"
          >
            Contact
          </Link>

          {/* Search Bar */}
          <form
            className="flex items-center bg-[#F2AA4C] rounded-md overflow-hidden ml-2"
            action=""
            method="get"
          >
            <input
              type="search"
              name="s"
              placeholder="Search..."
              className="search-field bg-white text-[#1A2037] placeholder-[#1A2037] px-3 py-1.5 w-44 md:w-56 focus:outline-amber-50"
            />
            {/* changes has been made to the button text  */}
            <button
              type="submit"
              className="px-3 py-1.5 text-white hover:text-black transition-colors"
              aria-label="Search"
              title="Search"
            >
              <i className="fa fa-search" />
            </button>
          </form>
        </nav>
        {/* Sign-in Button */}
        <div className="hidden md:flex items-center ml-17">
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-20 py-0.5  border-2 border-[#F2AA4C] rounded-full hover:bg-[#F2AA4C] hover:text-black transition-colors duration-300"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
