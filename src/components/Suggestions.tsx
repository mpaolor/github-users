import React from "react";
import type { GithubUserSummary } from "../types";
import "./Suggestions.css";

interface SuggestionsProps {
  suggestions: GithubUserSummary[];
  onSelect: (login: string) => void;
}

export default function Suggestions({ suggestions, onSelect }: SuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ul className="suggestions list-group">
      {suggestions.map((user) => (
        <li
          key={user.id}
          className="suggestions__item list-group-item list-group-item-action"
          onMouseDown={(e) => {
            // Use onMouseDown + preventDefault to prevent input blur before click registers
            e.preventDefault();
            onSelect(user.login);
          }}
        >
          <img
            src={user.avatar_url}
            alt={`${user.login} avatar`}
            className="suggestions__avatar"
          />
          <span className="suggestions__login">{user.login}</span>
          <i className="bi bi-arrow-right suggestions__arrow" />
        </li>
      ))}
    </ul>
  );
}
