import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-softbg">
      <Sidebar />
      <main className="flex-1 max-w-screen-xl mx-auto p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;