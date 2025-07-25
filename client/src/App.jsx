import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import LogViewer from "./pages/LogViewer";
import Files from "./pages/Files";
import Layout from "./components/Layout";

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/logs" : "/login"} />}
        />
        <Route
          path="/login"
          element={<Login onLogin={setUser} />}
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          }
        >
          <Route path="/logs" element={<LogViewer user={user} />} />
          <Route path="/files" element={<Files />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;