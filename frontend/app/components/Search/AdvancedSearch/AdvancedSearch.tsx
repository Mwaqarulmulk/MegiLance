// @AI-HINT: Advanced search - faceted filters, saved searches, autocomplete
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaDollarSign,
  FaClock, FaBookmark, FaSave, FaTimes, FaChevronDown
} from 'react-icons/fa';
import Button from '@/app/components/Button/Button';
import Select from '@/app/components/Select/Select';

import commonStyles from './AdvancedSearch.common.module.css';
import lightStyles from './AdvancedSearch.light.module.css';
import darkStyles from './AdvancedSearch.dark.module.css';

interface SearchFilters {
  query: string;
  category: string;
  budgetMin: string;
  budgetMax: string;
  budgetType: 'fixed' | 'hourly' | 'all';
  experienceLevel: string;
  location: string;
  skills: string[];
  rating: string;
  verified: boolean;
  availability: string;
  sortBy: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  alertsEnabled: boolean;
  createdAt: string;
}

interface SearchSuggestion {
  type: 'project' | 'freelancer' | 'skill' | 'category';
  text: string;
  count?: number;
}

const AdvancedSearch: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    budgetMin: searchParams.get('budgetMin') || '',
    budgetMax: searchParams.get('budgetMax') || '',
    budgetType: (searchParams.get('budgetType') as any) || 'all',
    experienceLevel: searchParams.get('experience') || 'all',
    location: searchParams.get('location') || '',
    skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
    rating: searchParams.get('rating') || 'all',
    verified: searchParams.get('verified') === 'true',
    availability: searchParams.get('availability') || 'all',
    sortBy: searchParams.get('sort') || 'relevance',
  });

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = {
    container: cn(commonStyles.container, themeStyles.container),
    searchBar: cn(commonStyles.searchBar, themeStyles.searchBar),
    searchInput: cn(commonStyles.searchInput, themeStyles.searchInput),
    searchButton: cn(commonStyles.searchButton, themeStyles.searchButton),
    filterToggle: cn(commonStyles.filterToggle, themeStyles.filterToggle),
    filtersPanel: cn(commonStyles.filtersPanel, themeStyles.filtersPanel),
    filterGroup: cn(commonStyles.filterGroup, themeStyles.filterGroup),
    filterLabel: cn(commonStyles.filterLabel, themeStyles.filterLabel),
    suggestionsDropdown: cn(commonStyles.suggestionsDropdown, themeStyles.suggestionsDropdown),
    suggestionItem: cn(commonStyles.suggestionItem, themeStyles.suggestionItem),
    savedSearches: cn(commonStyles.savedSearches, themeStyles.savedSearches),
    savedSearchItem: cn(commonStyles.savedSearchItem, themeStyles.savedSearchItem),
    recentSearches: cn(commonStyles.recentSearches, themeStyles.recentSearches),
    activeFilters: cn(commonStyles.activeFilters, themeStyles.activeFilters),
    filterBadge: cn(commonStyles.filterBadge, themeStyles.filterBadge),
    saveDialog: cn(commonStyles.saveDialog, themeStyles.saveDialog),
  };

  useEffect(() => {
    loadRecentSearches();
    loadSavedSearches();
  }, []);

  useEffect(() => {
    if (filters.query.length > 2) {
      fetchSuggestions(filters.query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [filters.query]);

  const loadRecentSearches = () => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent).slice(0, 5));
    }
  };

  const loadSavedSearches = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/searches/saved', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data);
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    try {
      const response = await fetch(`/backend/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);

    // Add to recent searches
    const recent = [filters.query, ...recentSearches.filter(s => s !== filters.query)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));

    // Build query string
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category !== 'all') params.set('category', filters.category);
    if (filters.budgetMin) params.set('budgetMin', filters.budgetMin);
    if (filters.budgetMax) params.set('budgetMax', filters.budgetMax);
    if (filters.budgetType !== 'all') params.set('budgetType', filters.budgetType);
    if (filters.experienceLevel !== 'all') params.set('experience', filters.experienceLevel);
    if (filters.location) params.set('location', filters.location);
    if (filters.skills.length > 0) params.set('skills', filters.skills.join(','));
    if (filters.rating !== 'all') params.set('rating', filters.rating);
    if (filters.verified) params.set('verified', 'true');
    if (filters.availability !== 'all') params.set('availability', filters.availability);
    if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);

    router.push(`/search/results?${params.toString()}`);
    setShowSuggestions(false);
    setLoading(false);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/searches/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: searchName,
          filters,
          alertsEnabled: false,
        }),
      });

      if (response.ok) {
        await loadSavedSearches();
        setShowSaveDialog(false);
        setSearchName('');
      }
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setFilters(search.filters);
    handleSearch();
  };

  const deleteSavedSearch = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`/backend/api/searches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      await loadSavedSearches();
    } catch (error) {
      console.error('Failed to delete search:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      budgetMin: '',
      budgetMax: '',
      budgetType: 'all',
      experienceLevel: 'all',
      location: '',
      skills: [],
      rating: 'all',
      verified: false,
      availability: 'all',
      sortBy: 'relevance',
    });
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'query' || key === 'sortBy') return false;
    if (key === 'skills') return (value as string[]).length > 0;
    if (typeof value === 'boolean') return value;
    return value && value !== 'all' && value !== '';
  }).length;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchBar}>
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, freelancers, or skills..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className={styles.searchInput}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestionsDropdown}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className={styles.suggestionItem}
                  onClick={() => {
                    setFilters({ ...filters, query: suggestion.text });
                    setShowSuggestions(false);
                  }}
                >
                  <span className="font-medium">{suggestion.text}</span>
                  {suggestion.count && (
                    <span className="text-sm opacity-75">({suggestion.count})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button variant="primary" type="submit" isLoading={loading}>
          <FaSearch className="mr-2" />
          Search
        </Button>

        <button
          type="button"
          className={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter className="mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-primary-500 text-white rounded-full px-2 py-1 text-xs">
              {activeFilterCount}
            </span>
          )}
          <FaChevronDown className={`ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </form>

      {recentSearches.length > 0 && (
        <div className={styles.recentSearches}>
          <span className="text-sm font-semibold">Recent:</span>
          {recentSearches.map((search, index) => (
            <button
              key={index}
              className="text-sm opacity-75 hover:opacity-100"
              onClick={() => {
                setFilters({ ...filters, query: search });
                handleSearch();
              }}
            >
              {search}
            </button>
          ))}
        </div>
      )}

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Category</label>
              <Select
                id="category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'web-dev', label: 'Web Development' },
                  { value: 'mobile-dev', label: 'Mobile Development' },
                  { value: 'design', label: 'Design' },
                  { value: 'writing', label: 'Writing' },
                  { value: 'marketing', label: 'Marketing' },
                ]}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Budget Type</label>
              <Select
                id="budgetType"
                value={filters.budgetType}
                onChange={(e) => setFilters({ ...filters, budgetType: e.target.value as any })}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'fixed', label: 'Fixed Price' },
                  { value: 'hourly', label: 'Hourly Rate' },
                ]}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Experience Level</label>
              <Select
                id="experience"
                value={filters.experienceLevel}
                onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                options={[
                  { value: 'all', label: 'All Levels' },
                  { value: 'entry', label: 'Entry Level' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'expert', label: 'Expert' },
                ]}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <FaDollarSign className="inline mr-1" />
                Budget Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetMin}
                  onChange={(e) => setFilters({ ...filters, budgetMin: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetMax}
                  onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <FaMapMarkerAlt className="inline mr-1" />
                Location
              </label>
              <input
                type="text"
                placeholder="City, country, or remote"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <FaStar className="inline mr-1" />
                Minimum Rating
              </label>
              <Select
                id="rating"
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                options={[
                  { value: 'all', label: 'All Ratings' },
                  { value: '4', label: '4+ Stars' },
                  { value: '4.5', label: '4.5+ Stars' },
                ]}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <FaClock className="inline mr-1" />
                Availability
              </label>
              <Select
                id="availability"
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'immediate', label: 'Available Now' },
                  { value: 'within-week', label: 'Within a Week' },
                  { value: 'within-month', label: 'Within a Month' },
                ]}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className={styles.filterLabel}>Verified Only</span>
              </label>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort By</label>
              <Select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                options={[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'date', label: 'Newest First' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Highest Rated' },
                ]}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={clearFilters}>
              <FaTimes className="mr-2" />
              Clear Filters
            </Button>
            <Button variant="secondary" onClick={() => setShowSaveDialog(true)}>
              <FaSave className="mr-2" />
              Save Search
            </Button>
          </div>
        </div>
      )}

      {savedSearches.length > 0 && (
        <div className={styles.savedSearches}>
          <h3 className="font-semibold mb-3">
            <FaBookmark className="inline mr-2" />
            Saved Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map(search => (
              <div key={search.id} className={styles.savedSearchItem}>
                <button onClick={() => loadSavedSearch(search)}>
                  {search.name}
                </button>
                <button onClick={() => deleteSavedSearch(search.id)} aria-label="Delete saved search">
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSaveDialog && (
        <div className={styles.saveDialog}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-semibold mb-4">Save Search</h3>
            <input
              type="text"
              placeholder="Search name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveSearch}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
