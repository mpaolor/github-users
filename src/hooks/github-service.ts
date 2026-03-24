import type {
  GithubUserDetail,
  GithubUserSummary,
  SearchState,
} from "../types";
import { useEffect, useRef, useState } from "react";

import { http } from "../lib/http";

const MIN_CHARS = 3;
const DEBOUNCE_MS = 300;

export function startGithubService() {
  const [ghServiceState, setGhServiceState] = useState<SearchState>({
    query: "",
    suggestions: [],
    profile: null,
    isLoadingSuggestions: false,
    isLoadingProfile: false,
    error: null,
  });

  // When true, the next query change will not trigger a suggestions fetch.
  // Used to prevent the dropdown reappearing after the user selects a suggestion.
  const skipNextSuggestionsRef = useRef<boolean>(false);

  // Reactively fetch suggestions whenever query changes
  useEffect(() => {
    if (skipNextSuggestionsRef.current) {
      skipNextSuggestionsRef.current = false;
      return;
    }

    if (ghServiceState.query.length < MIN_CHARS) {
      setGhServiceState((prev) => ({
        ...prev,
        suggestions: [],
        isLoadingSuggestions: false,
      }));
      return;
    }

    const controller = new AbortController();

    // Debounce — wait before firing the request
    const timer = setTimeout(async () => {
      setGhServiceState((prev) => ({
        ...prev,
        isLoadingSuggestions: true,
        error: null,
      }));

      try {
        const data = await http.get<{ items: GithubUserSummary[] }>(
          `/search/users?q=${encodeURIComponent(ghServiceState.query)}&per_page=10`,
          { signal: controller.signal },
        );

        setGhServiceState((prev) => ({
          ...prev,
          suggestions: data.items ?? [],
          isLoadingSuggestions: false,
        }));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setGhServiceState((prev) => ({
          ...prev,
          isLoadingSuggestions: false,
          error: "Failed to fetch suggestions.",
        }));
      }
    }, DEBOUNCE_MS);

    // Cleanup — cancel both the debounce timer and any in-flight request
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [ghServiceState.query]);

  // Explicit user action — load a full profile
  async function selectUser(username: string): Promise<void> {
    // Setting the query here would normally trigger the suggestions useEffect.
    // We flag it to skip so the dropdown doesn't reappear after selection.
    skipNextSuggestionsRef.current = true;

    setGhServiceState((prev) => ({
      ...prev,
      query: username,
      suggestions: [],
      isLoadingProfile: true,
      error: null,
    }));

    try {
      const profile = await http.get<GithubUserDetail>(
        `/users/${encodeURIComponent(username)}`,
      );

      setGhServiceState((prev) => ({
        ...prev,
        profile,
        isLoadingProfile: false,
      }));
    } catch (err) {
      setGhServiceState((prev) => ({
        ...prev,
        isLoadingProfile: false,
        profile: null,
        error: (err as Error).message,
      }));
    }
  }

  function setQuery(query: string): void {
    setGhServiceState((prev) => ({ ...prev, query }));
  }

  return { state: ghServiceState, setQuery, selectUser };
}
