import { TaskFilters } from './TaskApp';

interface TaskFilterProps {
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  categories: string[];
}

function TaskFilter({ filters, setFilters, categories }: TaskFilterProps) {
  // Handle filter changes
  const handleFilterChange = (filterName: keyof TaskFilters, value: string | null) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: null,
      priority: null,
      category: null,
      searchQuery: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.status || filters.priority || filters.category || filters.searchQuery;

  return (
    <div className="task-filter">
      <div className="filter-header">
        <h3>Filter Tasks</h3>
        <button 
          onClick={clearFilters}
          className="clear-filters-button"
          disabled={!hasActiveFilters}
        >
          Clear All
        </button>
      </div>
      
      <div className="filter-content">
        {/* Search row - always at the top for prominence */}
        <div className="search-row">
          <div className="search-group">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        {/* Filter options in a flex layout */}
        <div className="filter-options">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">Priority</label>
            <select
              id="priority-filter"
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value || null)}
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || null)}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="active-filters">
            {filters.status && (
              <span className="filter-tag status-tag">
                Status: {filters.status.replace('_', ' ')}
                <button onClick={() => handleFilterChange('status', null)}>×</button>
              </span>
            )}
            {filters.priority && (
              <span className="filter-tag priority-tag">
                Priority: {filters.priority}
                <button onClick={() => handleFilterChange('priority', null)}>×</button>
              </span>
            )}
            {filters.category && (
              <span className="filter-tag category-tag">
                Category: {filters.category}
                <button onClick={() => handleFilterChange('category', null)}>×</button>
              </span>
            )}
            {filters.searchQuery && (
              <span className="filter-tag search-tag">
                Search: "{filters.searchQuery}"
                <button onClick={() => handleFilterChange('searchQuery', '')}>×</button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskFilter;
