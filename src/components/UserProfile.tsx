import React from "react";
import type { GithubUserDetail } from "../types";
import "./UserProfile.css";

interface UserProfileProps {
  profile: GithubUserDetail;
  loading: boolean;
}

export default function UserProfile({ profile, loading }: UserProfileProps) {
  if (loading) {
    return (
      <section className="profile-skeleton">
        <div className="profile-skeleton__avatar placeholder-glow">
          <span className="placeholder" />
        </div>
        <div className="profile-skeleton__lines placeholder-glow">
          <span className="placeholder col-4" />
          <span className="placeholder col-6" />
          <span className="placeholder col-3" />
        </div>
      </section>
    );
  }

  const joinYear = new Date(profile.created_at).getFullYear();

  return (
    <section className="profile">
      <div className="profile__header">
        <a href={profile.html_url} target="_blank" rel="noreferrer" className="profile__avatar-link">
          <img
            src={profile.avatar_url}
            alt={`${profile.login} avatar`}
            className="profile__avatar"
          />
        </a>
        <div className="profile__meta">
          {profile.name && <h2 className="profile__name">{profile.name}</h2>}
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
            className="profile__login"
          >
            <i className="bi bi-github" /> {profile.login}
          </a>
          {profile.bio && <p className="profile__bio">{profile.bio}</p>}
          <div className="profile__tags">
            {profile.location && (
              <span className="profile__tag">
                <i className="bi bi-geo-alt" /> {profile.location}
              </span>
            )}
            {profile.company && (
              <span className="profile__tag">
                <i className="bi bi-building" /> {profile.company}
              </span>
            )}
            {profile.blog && (
              <span className="profile__tag">
                <i className="bi bi-link-45deg" />
                <a href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`}
                  target="_blank" rel="noreferrer" className="profile__tag-link">
                  {profile.blog}
                </a>
              </span>
            )}
            <span className="profile__tag">
              <i className="bi bi-calendar" /> Joined {joinYear}
            </span>
          </div>
        </div>
      </div>

      <div className="profile__stats row g-3">
        <div className="col-6 col-md-3">
          <div className="profile__stat-card">
            <span className="profile__stat-value">{profile.public_repos}</span>
            <span className="profile__stat-label">Repositories</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="profile__stat-card">
            <span className="profile__stat-value">{profile.followers.toLocaleString()}</span>
            <span className="profile__stat-label">Followers</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="profile__stat-card">
            <span className="profile__stat-value">{profile.following.toLocaleString()}</span>
            <span className="profile__stat-label">Following</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="profile__stat-card">
            <span className="profile__stat-value">{profile.public_gists}</span>
            <span className="profile__stat-label">Gists</span>
          </div>
        </div>
      </div>
    </section>
  );
}
