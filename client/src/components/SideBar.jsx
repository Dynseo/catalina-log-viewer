export default function SideBar() {
  return (
    <aside className="w-64 p-4 bg-white border-r border-gray-200 h-screen">
        <h3 className="text-xs text-gray-400 p-4">MENU</h3>
        <ul>
            <li><a href="/logs" className="block px-4 py-2 text-sm rounded text-gray-700 hover:bg-indigo-100/70 hover:text-indigo-600">Logs</a></li>
            <li><a href="/files" className="block px-4 py-2 text-sm rounded text-gray-700 hover:bg-indigo-100/70 hover:text-indigo-600">Files</a></li>
        </ul>
    </aside>
  );
}
