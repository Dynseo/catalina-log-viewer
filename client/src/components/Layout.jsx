import SearchBar from "./SearchBar";
import SideBar from "./SideBar";

function Layout({ children }) {
  return (
    <>
      <SideBar />
      <main className="overflow-y-auto p-6 flex-1 h-screen bg-gray-200">
        {children}
      </main>
    </>
  );
}

export default Layout;
