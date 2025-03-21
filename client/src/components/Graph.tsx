import { useEffect, useRef, useState } from "react";
import * as d3g from "d3-graphviz";
import * as d3 from "d3";

import "./Graph.css";

const MODES = ["ast", "ddg", "cfg", "pdg", "cdg", "cpg14"] as const;
type Mode = typeof MODES[number];

const fetchMethod = async (method: string, mode: Mode) => {
  const baseUrl = "http://localhost:8000/methods";
  const request = method
    ? fetch(`${baseUrl}/${method}?mode=${mode}`)
    : fetch(baseUrl);
  return (await request).text();
};

const renderMethod = async (
  method: string = "",
  mode: Mode,
  d3Container: React.ReactNode,
  pushToHistory: (graph: string) => void,
  popFromHistory: () => void,
) => {
  try {
    const graph = await fetchMethod(method, mode);
    d3g.graphviz(d3Container)
      .width(globalThis.innerWidth - 100)
      .height(globalThis.innerHeight)
      .renderDot(graph)
      .resetZoom()
      .fit(true);

    d3.selectAll(".node")
      .style("cursor", "pointer")
      .on("click", (e) => {
        pushToHistory(
          e.target?.closest(".node").querySelector("title").textContent,
        );
      });
  } catch {
    popFromHistory();
  }
};

const D3Graph = () => {
  const d3Container = useRef(null);
  const [history, setHistory] = useState([]);
  const [currentMode, setCurrentMode] = useState("ast");

  const pushToHistory = (method: string) => {
    if (history[history.length - 1] === method) {
      return;
    }
    setHistory([...history, method]);
  };

  const popFromHistory = () => {
    setHistory(history.slice(0, -1));
  };

  useEffect(() => {
    (async () => {
      await fetch("http://localhost:8000/init");
    })();
  }, []);

  useEffect(() => {
    if (d3Container.current) {
      console.log({ history });
      renderMethod(
        history[history.length - 1],
        currentMode,
        d3Container.current,
        pushToHistory,
        popFromHistory,
      );
    }
  }, [history, currentMode]);

  return (
    <div className="graphContainer">
      <div className="sidebar">
        <button
          onClick={popFromHistory}
        >
          ⬅
        </button>
        {MODES.map((mode) => (
          <button
            className={mode === currentMode ? "active" : ""}
            key={mode}
            onClick={() => setCurrentMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>
      <div className="d3Container" ref={d3Container}></div>
    </div>
  );
};

export default D3Graph;
