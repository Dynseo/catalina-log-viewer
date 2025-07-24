import React from "react";
import SearchBar from "./SearchBar";

function Layout({ children, searchProps }) {
  return (
    <div>
      <SearchBar {...searchProps} />
      <main className="p-6 w-full min-h-[calc(100vh-60px)] bg-gray-200">{children}</main>
    </div>
  );
}

export default Layout;
