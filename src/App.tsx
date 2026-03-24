import "./App.css";

import SearchBar from "./components/SearchBar";
import Suggestions from "./components/Suggestions";
import UserProfile from "./components/UserProfile";
import { startGithubService } from "./hooks/github-service";

export default function App() {
  const { state, setQuery, selectUser } = startGithubService();

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
            value={state.query}
            loading={state.isLoadingSuggestions || state.isLoadingProfile}
            onChange={setQuery}
            onSearch={selectUser}
          />
          <Suggestions
            suggestions={state.suggestions}
            onSelect={selectUser}
          />
        </div>

        {state.error && (
          <div className="alert app-error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" /> {state.error}
          </div>
        )}

        {(state.profile || state.isLoadingProfile) && (
          <UserProfile
            profile={state.profile!}
            loading={state.isLoadingProfile}
          />
        )}

        {!state.profile && !state.isLoadingProfile && !state.error && (
          <div className="app-empty">
            <i className="bi bi-search app-empty__icon" />
            <p>Search for a GitHub user to see their profile</p>
          </div>
        )}

      </div>
    </div>
  );
}