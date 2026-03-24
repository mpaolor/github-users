import type { GithubUserDetail, GithubUserSummary, SearchState } from "../types";
import { useEffect, useRef, useState } from "react";

import { http } from "../lib/http";

const MIN_CHARS = 3;
const DEBOUNCE_MS = 300;

export function useGithubSearch() {
  const [state, setState] = useState<SearchState>({
    query: "",
    suggestions: [],
    profile: null,
    loadingSuggestions: false,
    loadingProfile: false,
    error: null,
  });

  // When true, the next query change will not trigger a suggestions fetch.
  // Used to prevent the dropdown reappearing after the user selects a suggestion.
  const skipNextSuggestions = useRef<boolean>(false);

  // Reactively fetch suggestions whenever query changes
  useEffect(() => {
    if (skipNextSuggestions.current) {
      skipNextSuggestions.current = false;
      return;
    }

    if (state.query.length < MIN_CHARS) {
      setState((prev) => ({ ...prev, suggestions: [], loadingSuggestions: false }));
      return;
    }

    const controller = new AbortController();

    // Debounce — wait before firing the request
    const timer = setTimeout(async () => {
      setState((prev) => ({ ...prev, loadingSuggestions: true, error: null }));

      try {
        const data = await http.get<{ items: GithubUserSummary[] }>(
          `/search/users?q=${encodeURIComponent(state.query)}&per_page=10`,
          { signal: controller.signal }
        );

        setState((prev) => ({
          ...prev,
          suggestions: data.items ?? [],
          loadingSuggestions: false,
        }));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState((prev) => ({
          ...prev,
          loadingSuggestions: false,
          error: "Failed to fetch suggestions.",
        }));
      }
    }, DEBOUNCE_MS);

    // Cleanup — cancel both the debounce timer and any in-flight request
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [state.query]);

  // Explicit user action — load a full profile
  async function selectUser(username: string): Promise<void> {
    // Setting the query here would normally trigger the suggestions useEffect.
    // We flag it to skip so the dropdown doesn't reappear after selection.
    skipNextSuggestions.current = true;

    setState((prev) => ({
      ...prev,
      query: username,
      suggestions: [],
      loadingProfile: true,
      error: null,
    }));

    try {
      const profile = await http.get<GithubUserDetail>(
        `/users/${encodeURIComponent(username)}`
      );

      setState((prev) => ({
        ...prev,
        profile,
        loadingProfile: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loadingProfile: false,
        profile: null,
        error: (err as Error).message,
      }));
    }
  }

  function setQuery(query: string): void {
    setState((prev) => ({ ...prev, query }));
  }

  return { state, setQuery, selectUser };
}