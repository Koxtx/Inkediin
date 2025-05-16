import React from "react";
import { SearchContext } from "../../context/SearchContext";

export default function SearchProvider({ children }) {
  return <SearchContext.Provider>{children}</SearchContext.Provider>;
}
