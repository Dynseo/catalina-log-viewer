import { useState } from "react";
import Login from "./pages/Login";
import LogViewer from "./pages/LogViewer";
import Layout from "./components/Layout";

function App() {
  const [user, setUser] = useState(null); // { username, password }
  const [search, setSearch] = useState("");
  const [matchIndexes, setMatchIndexes] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);

  const searchProps = {
    value: search,
    onChange: setSearch,
    onNext: () => setCurrentMatch((prev) => (prev + 1) % matchIndexes.length),
    onPrev: () => setCurrentMatch((prev) => (prev - 1 + matchIndexes.length) % matchIndexes.length),
    matchIndexes,
    currentMatch,
  };

  return (
    <>
    {user ? (
        <Layout searchProps={searchProps}>
          <LogViewer user={user} search={search} setMatchIndexes={setMatchIndexes} />
        </Layout>
      ) : (
        <Login onLogin={setUser} />
      )}
    </>
  );
}

export default App;