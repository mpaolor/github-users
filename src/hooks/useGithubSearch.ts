import { useState, useRef, useCallback } from "react";
import type { GithubUserSummary, GithubUserDetail, SearchState } from "../types";
import { http } from "../lib/http";

const MIN_CHARS = 3;

export function useGithubSearch() {
  const [state, setState] = useState<SearchState>({
    suggestions: [],
    profile: null,
    loadingSuggestions: false,
    loadingProfile: false,
    error: null,
  });

  // Ref to hold the AbortController for the suggestions request
  const suggestionsAbortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    // Cancel any in-flight suggestions request
    if (suggestionsAbortRef.current) {
      suggestionsAbortRef.current.abort();
    }

    if (query.length < MIN_CHARS) {
      setState((prev) => ({ ...prev, suggestions: [], loadingSuggestions: false }));
      return;
    }

    const controller = new AbortController();
    suggestionsAbortRef.current = controller;

    setState((prev) => ({ ...prev, loadingSuggestions: true, error: null }));

    try {
      const data = await http.get<{ items: GithubUserSummary[] }>(
        `/search/users?q=${encodeURIComponent(query)}&per_page=10`,
        { signal: controller.signal }
      );
      const suggestions: GithubUserSummary[] = data.items ?? [];

      setState((prev) => ({
        ...prev,
        suggestions,
        loadingSuggestions: false,
      }));
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // Ignore cancelled requests
      setState((prev) => ({
        ...prev,
        loadingSuggestions: false,
        error: "Failed to fetch suggestions.",
      }));
    }
  }, []);

  const fetchProfile = useCallback(async (username: string) => {
    // Cancel any in-flight suggestions request when committing to a profile
    if (suggestionsAbortRef.current) {
      suggestionsAbortRef.current.abort();
    }

    setState((prev) => ({
      ...prev,
      suggestions: [],
      loadingProfile: true,
      loadingSuggestions: false,
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
  }, []);

  const clearSuggestions = useCallback(() => {
    setState((prev) => ({ ...prev, suggestions: [] }));
  }, []);

  return { state, fetchSuggestions, fetchProfile, clearSuggestions };
}
