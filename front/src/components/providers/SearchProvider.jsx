import React, { useReducer } from "react";
import { SearchContext } from "../../context/SearchContext";

export function SearchProvider({ children }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  function searchReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case ACTIONS.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    case ACTIONS.SET_ACTIVE_RESULT_TAB:
      return { ...state, activeResultTab: action.payload };
    case ACTIONS.SET_SELECTED_STYLE:
      return { ...state, selectedStyle: action.payload };
    case ACTIONS.TOGGLE_STYLE:
      const style = action.payload;
      if (style === "Tous") {
        return { ...state, selectedStyles: [] };
      }
      
      if (state.selectedStyles.includes(style)) {
        return { 
          ...state, 
          selectedStyles: state.selectedStyles.filter(s => s !== style) 
        };
      } else {
        return { 
          ...state, 
          selectedStyles: [...state.selectedStyles, style] 
        };
      }
    case ACTIONS.SET_LOCATION:
      return { ...state, location: action.payload };
    case ACTIONS.SET_RADIUS:
      return { ...state, radius: action.payload };
    case ACTIONS.SET_MAX_PRICE:
      return { ...state, maxPrice: action.payload };
    case ACTIONS.SET_AVAILABILITY:
      return { ...state, availability: action.payload };
    case ACTIONS.SET_MIN_RATING:
      return { ...state, minRating: action.payload };
    case ACTIONS.RESET_FILTERS:
      return {
        ...state,
        selectedStyles: [],
        maxPrice: 250,
        radius: "10 km",
        availability: "Cette semaine",
        minRating: 3,
      };
    default:
      return state;
  }
}
  
  const value = {
    state,
    dispatch,
    // Méthodes d'aide pour dispatches courants
    setSearchQuery: (query) => 
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
    setActiveTab: (tab) => 
      dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab }),
    setActiveResultTab: (tab) => 
      dispatch({ type: ACTIONS.SET_ACTIVE_RESULT_TAB, payload: tab }),
    setSelectedStyle: (style) => 
      dispatch({ type: ACTIONS.SET_SELECTED_STYLE, payload: style }),
    toggleStyle: (style) => 
      dispatch({ type: ACTIONS.TOGGLE_STYLE, payload: style }),
    setLocation: (location) => 
      dispatch({ type: ACTIONS.SET_LOCATION, payload: location }),
    setRadius: (radius) => 
      dispatch({ type: ACTIONS.SET_RADIUS, payload: radius }),
    setMaxPrice: (price) => 
      dispatch({ type: ACTIONS.SET_MAX_PRICE, payload: price }),
    setAvailability: (availability) => 
      dispatch({ type: ACTIONS.SET_AVAILABILITY, payload: availability }),
    setMinRating: (rating) => 
      dispatch({ type: ACTIONS.SET_MIN_RATING, payload: rating }),
    resetFilters: () => 
      dispatch({ type: ACTIONS.RESET_FILTERS }),
  };
  
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}
