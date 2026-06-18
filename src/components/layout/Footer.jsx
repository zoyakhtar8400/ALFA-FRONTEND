import React from 'react';

const Footer = () => {
  return (
    <footer className="h-12 border-t border-gray-200 flex items-center justify-center bg-gray-50 text-xs text-gray-500">
      &copy; {new Date().getFullYear()} ALFA Hotel Management System. All rights reserved.
    </footer>
  );
};

export default Footer;
