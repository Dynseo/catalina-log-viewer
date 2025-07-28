import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { VariableSizeList as List } from "react-window";
import LogHeader from "../components/LogHeader";

export default function LogViewer({ user }) {
  const [logs, setLogs] = useState([]);
  const [highlightedLogs, setHighlightedLogs] = useState([]);
  const [matchIndexes, setMatchIndexes] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [search, setSearch] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [page, setPage] = useState(1);

  const searchProps = {
    value: search,
    onChange: setSearch,
    onNext: () => setCurrentMatch((prev) => (prev + 1) % matchIndexes.length),
    onPrev: () => setCurrentMatch((prev) => (prev - 1 + matchIndexes.length) % matchIndexes.length),
    matchIndexes,
    currentMatch,
  };

  const listRef = useRef(null);

  const credentials = btoa(`${user.username}:${user.password}`);
  const headers = React.useMemo(() => ({
    Authorization: `Basic ${credentials}`,
  }), [credentials]);

  const escapeHTML = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const getItemSize = (index) => {
    const line = logs[index] || "";
    const approxCharsPerLine = 60;
    const numLines = Math.ceil(line.length / approxCharsPerLine);
    return 20 * numLines;
  };

  const scrollToCurrentMatch = () => {
    const targetIndex = matchIndexes[currentMatchIndex];
    if (listRef.current && typeof targetIndex === "number") {
      listRef.current.scrollToItem(targetIndex, "center");
    }
  };

  // Scroll automatique en bas uniquement si autoScroll est true
  useEffect(() => {
    if (autoScroll && listRef.current && logs.length > 0) {
      listRef.current.scrollToItem(logs.length - 1, "end");
    }
  }, [logs, autoScroll]);

  // Detecter scroll manuel pour désactiver autoScroll
  const handleScroll = ({ scrollOffset }) => {
    if (listRef.current) {
      const { scrollHeight, clientHeight } = listRef.current._outerRef;
      // On est à moins de 50px du bas => autoScroll reste actif
      if (scrollHeight - (scrollOffset + clientHeight) > 50) {
        setAutoScroll(false);
      } else {
        setAutoScroll(true);
      }
    }
  };

  const fetchLogs = async (start = 0, limit = 100) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/logs?start=${start}&limit=${limit}`,
        { headers }
      );
      setLogs(res.data.content);
    } catch (err) {
      console.error("Erreur chargement logs :", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [headers]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, { extraHeaders: headers });
    socket.on("log", (line) => setLogs((prev) => [...prev, line]));
    return () => socket.disconnect();
  }, [headers]);

  // Highlight search matches
  useEffect(() => {
    const matches = [];
    const highlighted = logs.map((line, index) => {
      const escaped = escapeHTML(line);
      if (!search) return { html: escaped, match: false };

      const regex = new RegExp(`(${search})`, "gi");
      const found = escaped.match(regex);
      if (!found) return { html: escaped, match: false };

      matches.push(index);
      const highlightedLine = escaped.replace(regex, (match) => `<mark>${match}</mark>`);
      return { html: highlightedLine, match: true };
    });

    setHighlightedLogs(highlighted);
    setMatchIndexes(matches);
    setCurrentMatchIndex(0);
  }, [logs, search]);

  useEffect(() => {
    scrollToCurrentMatch();
  }, [currentMatchIndex, matchIndexes]);

  const goToNextMatch = () => {
    setCurrentMatchIndex((prev) => (prev + 1) % matchIndexes.length);
  };

  const goToPreviousMatch = () => {
    setCurrentMatchIndex((prev) =>
      prev - 1 < 0 ? matchIndexes.length - 1 : prev - 1
    );
  };

  const handleFetchLogs = (newPage) => {
    setPage(newPage);
    const fetchLogs = async () => {
      try {
        const start = (newPage - 1) * 100;
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/logs?start=${start}&limit=${100}`,
          { headers }
        );
        setLogs(res.data.content);
      } catch (err) {
        console.error("Erreur chargement logs :", err);
      }
    };
    fetchLogs();
  };

  return (
    <div className="p-6 flex flex-col w-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <LogHeader searchProps={searchProps} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFetchLogs(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-700">Page {page}</span>
          <button
            onClick={() => handleFetchLogs(page + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Suivant
          </button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4">
        <List
          height={500}
          itemCount={highlightedLogs.length}
          itemSize={getItemSize}
          width="100%"
          ref={listRef}
          className="mt-5 font-mono whitespace-pre-wrap custom-scrollbar"
          onScroll={handleScroll}
        >
          {({ index, style }) => {
            const log = highlightedLogs[index];
            const isCurrentMatch = matchIndexes[currentMatchIndex] === index;
            return (
              <div
                style={style}
                key={index}
                dangerouslySetInnerHTML={{ __html: log.html }}
                className={
                  log.match
                    ? isCurrentMatch
                      ? "bg-orange-300 px-4"
                      : "bg-yellow-100 px-4"
                    : "px-4"
                }
              />
            );
          }}
        </List>
      </div>

      {search && matchIndexes.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <button onClick={goToPreviousMatch} className="px-2 rounded border border-gray-300 hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.2084 12.6042L10.0001 7.39584L4.79175 12.6042" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
          <span className="text-sm text-gray-700">{currentMatchIndex + 1} / {matchIndexes.length}</span>
          <button onClick={goToNextMatch} className="px-2 rounded border border-gray-300 hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}