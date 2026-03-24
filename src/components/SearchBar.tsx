import React, { useRef } from "react";
import "./SearchBar.css";

interface SearchBarProps {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
}

export default function SearchBar({ value, loading, onChange, onSearch }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter" && value.trim()) {
      onSearch(value.trim());
    }
  }

  function handleButtonClick(): void {
    if (value.trim()) {
      onSearch(value.trim());
    }
  }

  return (
    <div className="search-bar input-group">
      <span className="input-group-text search-bar__icon">
        {loading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        ) : (
          <i className="bi bi-github" />
        )}
      </span>
      <input
        ref={inputRef}
        type="text"
        className="form-control search-bar__input"
        placeholder="Search GitHub users…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        className="btn search-bar__btn"
        type="button"
        onClick={handleButtonClick}
        disabled={!value.trim() || loading}
      >
        Search
      </button>
    </div>
  );
}
