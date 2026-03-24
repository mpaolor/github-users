import { useState, useCallback, useRef } from "react";
import { useGithubSearch } from "./hooks/useGithubSearch";
import SearchBar from "./components/SearchBar";
import Suggestions from "./components/Suggestions";
import UserProfile from "./components/UserProfile";
import "./App.css";

const DEBOUNCE_MS = 300;

export default function App() {
  const [query, setQuery] = useState<string>("");
  const { state, fetchSuggestions, fetchProfile, clearSuggestions } = useGithubSearch();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value.trim());
    }, DEBOUNCE_MS);
  }, [fetchSuggestions]);

  const handleSelect = useCallback((login: string) => {
    setQuery(login);
    clearSuggestions();
    fetchProfile(login);
  }, [fetchProfile, clearSuggestions]);

  const handleSearch = useCallback((login: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    clearSuggestions();
    fetchProfile(login);
  }, [fetchProfile, clearSuggestions]);

  const isLoading = state.loadingSuggestions || state.loadingProfile;

  return (
    <div className="app-wrapper">
      <div className="container app-container">

        <header className="app-header">
          <i className="bi bi-github app-header__icon" />
          <h1 className="app-header__title">GitHub User Search</h1>
          <p className="app-header__subtitle">Type 3+ characters to search</p>
        </header>

        <div className="app-search-area">
          <SearchBar
            value={query}
            loading={isLoading}
            onChange={handleQueryChange}
            onSearch={handleSearch}
          />
          <Suggestions
            suggestions={state.suggestions}
            onSelect={handleSelect}
          />
        </div>

        {state.error && (
          <div className="alert app-error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" /> {state.error}
          </div>
        )}

        {(state.profile || state.loadingProfile) && (
          <UserProfile
            profile={state.profile!}
            loading={state.loadingProfile}
          />
        )}

        {!state.profile && !state.loadingProfile && !state.error && (
          <div className="app-empty">
            <i className="bi bi-search app-empty__icon" />
            <p>Search for a GitHub user to see their profile</p>
          </div>
        )}

      </div>
    </div>
  );
}
