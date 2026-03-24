export interface GithubUserSummary {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GithubUserDetail {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface SearchState {
  query: string;
  suggestions: GithubUserSummary[];
  profile: GithubUserDetail | null;
  isLoadingSuggestions: boolean;
  isLoadingProfile: boolean;
  error: string | null;
}