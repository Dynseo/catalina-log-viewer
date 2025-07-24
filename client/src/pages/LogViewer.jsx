import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { VariableSizeList as List } from "react-window";

export default function LogViewer({ user, search }) {
  const [logs, setLogs] = useState([]);
  const [highlightedLogs, setHighlightedLogs] = useState([]);
  const [matchIndexes, setMatchIndexes] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

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

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/logs", { headers });
        setLogs(res.data.content);
      } catch (err) {
        console.error("Erreur chargement logs :", err);
      }
    };
    fetchLogs();
  }, [headers]);

  useEffect(() => {
    const socket = io("http://localhost:4000", { extraHeaders: headers });
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

  return (
    <div className="p-6 flex flex-col w-full rounded-lg border border-gray-200 bg-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 1.5C0 1.22386 0.223858 1 0.5 1H2.5C2.77614 1 3 1.22386 3 1.5C3 1.77614 2.77614 2 2.5 2H0.5C0.223858 2 0 1.77614 0 1.5ZM4 1.5C4 1.22386 4.22386 1 4.5 1H14.5C14.7761 1 15 1.22386 15 1.5C15 1.77614 14.7761 2 14.5 2H4.5C4.22386 2 4 1.77614 4 1.5ZM4 4.5C4 4.22386 4.22386 4 4.5 4H11.5C11.7761 4 12 4.22386 12 4.5C12 4.77614 11.7761 5 11.5 5H4.5C4.22386 5 4 4.77614 4 4.5ZM0 7.5C0 7.22386 0.223858 7 0.5 7H2.5C2.77614 7 3 7.22386 3 7.5C3 7.77614 2.77614 8 2.5 8H0.5C0.223858 8 0 7.77614 0 7.5ZM4 7.5C4 7.22386 4.22386 7 4.5 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H4.5C4.22386 8 4 7.77614 4 7.5ZM4 10.5C4 10.2239 4.22386 10 4.5 10H11.5C11.7761 10 12 10.2239 12 10.5C12 10.7761 11.7761 11 11.5 11H4.5C4.22386 11 4 10.7761 4 10.5ZM0 13.5C0 13.2239 0.223858 13 0.5 13H2.5C2.77614 13 3 13.2239 3 13.5C3 13.7761 2.77614 14 2.5 14H0.5C0.223858 14 0 13.7761 0 13.5ZM4 13.5C4 13.2239 4.22386 13 4.5 13H14.5C14.7761 13 15 13.2239 15 13.5C15 13.7761 14.7761 14 14.5 14H4.5C4.22386 14 4 13.7761 4 13.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Log Viewer</h1>
        </div>
        {search && matchIndexes.length > 0 && (
          <div className="flex items-center gap-2">
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
  );
}