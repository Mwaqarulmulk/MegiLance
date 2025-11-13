// @AI-HINT: Favorites/Bookmarks component - save and manage favorite projects and profiles
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { favoritesApi } from '@/lib/api';
import type { Favorite } from '@/types/api';
import { Star, Briefcase, User, Trash2, ExternalLink } from 'lucide-react';
import commonStyles from './Favorites.common.module.css';
import lightStyles from './Favorites.light.module.css';
import darkStyles from './Favorites.dark.module.css';

const Favorites: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadFavorites();
  }, [filterType]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      if (filterType !== 'all') {
        filters.target_type = filterType;
      }
      const response = await favoritesApi.list(filters) as { favorites: Favorite[] };
      setFavorites(response.favorites);
    } catch (err: any) {
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId: number) => {
    if (!confirm('Remove this item from favorites?')) return;

    try {
      setError(null);
      await favoritesApi.delete(favoriteId);
      loadFavorites();
    } catch (err: any) {
      setError(err.message || 'Failed to remove favorite');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Briefcase size={20} />;
      case 'freelancer':
      case 'client':
        return <User size={20} />;
      default:
        return <Star size={20} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getItemUrl = (favorite: Favorite) => {
    switch (favorite.target_type) {
      case 'project':
        return `/portal/projects/${favorite.target_id}`;
      case 'freelancer':
        return `/portal/freelancers/${favorite.target_id}`;
      case 'client':
        return `/portal/clients/${favorite.target_id}`;
      default:
        return '#';
    }
  };

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <div>
          <h1 className={cn(commonStyles.title, themeStyles.title)}>Favorites</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Your saved items and bookmarks
          </p>
        </div>
      </div>

      {error && (
        <div className={cn(commonStyles.error, themeStyles.error)}>
          {error}
        </div>
      )}

      <div className={commonStyles.statsRow}>
        <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
          <Star size={24} className={cn(commonStyles.statIcon, themeStyles.statIcon)} />
          <div>
            <div className={cn(commonStyles.statValue, themeStyles.statValue)}>
              {favorites.length}
            </div>
            <div className={cn(commonStyles.statLabel, themeStyles.statLabel)}>
              Total Favorites
            </div>
          </div>
        </div>
        <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
          <Briefcase size={24} className={cn(commonStyles.statIcon, themeStyles.statIcon)} />
          <div>
            <div className={cn(commonStyles.statValue, themeStyles.statValue)}>
              {favorites.filter(f => f.target_type === 'project').length}
            </div>
            <div className={cn(commonStyles.statLabel, themeStyles.statLabel)}>
              Projects
            </div>
          </div>
        </div>
        <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
          <User size={24} className={cn(commonStyles.statIcon, themeStyles.statIcon)} />
          <div>
            <div className={cn(commonStyles.statValue, themeStyles.statValue)}>
              {favorites.filter(f => f.target_type === 'freelancer' || f.target_type === 'client').length}
            </div>
            <div className={cn(commonStyles.statLabel, themeStyles.statLabel)}>
              Profiles
            </div>
          </div>
        </div>
      </div>

      <div className={commonStyles.filterSection}>
        <label className={cn(commonStyles.filterLabel, themeStyles.label)}>
          Filter:
        </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={cn(commonStyles.filterSelect, themeStyles.filterSelect)}
        >
          <option value="all">All Favorites</option>
          <option value="project">Projects</option>
          <option value="freelancer">Freelancers</option>
          <option value="client">Clients</option>
        </select>
      </div>

      {loading ? (
        <div className={cn(commonStyles.loading, themeStyles.loading)}>
          Loading favorites...
        </div>
      ) : favorites.length === 0 ? (
        <div className={cn(commonStyles.empty, themeStyles.empty)}>
          <Star size={48} />
          <p>No favorites yet</p>
          <p className={cn(commonStyles.emptyText, themeStyles.emptyText)}>
            Start saving projects and profiles you're interested in
          </p>
        </div>
      ) : (
        <div className={commonStyles.favoritesGrid}>
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className={cn(commonStyles.favoriteCard, themeStyles.favoriteCard)}
            >
              <div className={commonStyles.cardHeader}>
                <div className={cn(commonStyles.typeIcon, themeStyles.typeIcon)}>
                  {getIcon(favorite.target_type)}
                </div>
                <span
                  className={cn(commonStyles.typeBadge, themeStyles.typeBadge)}
                  data-type={favorite.target_type}
                >
                  {favorite.target_type}
                </span>
              </div>

              <div className={commonStyles.cardBody}>
                <h3 className={cn(commonStyles.itemTitle, themeStyles.itemTitle)}>
                  {favorite.target_type} #{favorite.target_id}
                </h3>

                <div className={cn(commonStyles.savedDate, themeStyles.savedDate)}>
                  Saved on {formatDate(favorite.created_at)}
                </div>
              </div>

              <div className={commonStyles.cardActions}>
                <a
                  href={getItemUrl(favorite)}
                  className={cn(commonStyles.viewBtn, themeStyles.viewBtn)}
                >
                  <ExternalLink size={16} />
                  View
                </a>
                <button
                  onClick={() => handleRemove(favorite.id)}
                  className={cn(commonStyles.removeBtn, themeStyles.removeBtn)}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
