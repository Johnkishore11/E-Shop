import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} E-Shop E-Commerce. Built with Next.js, Express, and PostgreSQL.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
