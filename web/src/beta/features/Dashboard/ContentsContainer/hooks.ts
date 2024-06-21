import { useState } from "react";

export default () => {
  const state = localStorage.getItem("viewState");
  const [viewState, setViewState] = useState(state ? state : "grid");

  const handleViewChange = (newView: "grid" | "list") => {
    localStorage.setItem("viewState", newView);
    setViewState(newView);
  };

  return {
    viewState,
    handleViewChange,
  };
};
