# @AI-HINT: Service layer for category CRUD operations - all DB access via Turso HTTP
"""Categories Service - Data access layer for category management."""

from typing import Optional, List, Dict, Any

from app.db.turso_http import execute_query, parse_rows

# Columns selected for category queries
CATEGORY_COLUMNS = "id, name, slug, description, icon, parent_id, sort_order, is_active, project_count, created_at, updated_at"


def check_category_name_exists(name: str, exclude_id: Optional[int] = None) -> bool:
    """Check if a category name already exists (case-insensitive)."""
    if exclude_id is not None:
        result = execute_query(
            "SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?",
            [name, exclude_id]
        )
    else:
        result = execute_query(
            "SELECT id FROM categories WHERE LOWER(name) = LOWER(?)",
            [name]
        )
    return bool(result and result.get("rows"))


def check_category_exists_by_id(category_id: int) -> bool:
    """Check if a category exists by ID."""
    result = execute_query("SELECT id FROM categories WHERE id = ?", [category_id])
    return bool(result and result.get("rows"))


def check_slug_exists(slug: str) -> bool:
    """Check if a slug already exists."""
    result = execute_query("SELECT id FROM categories WHERE slug = ?", [slug])
    return bool(result and result.get("rows"))


def insert_category(
    name: str, slug: str, description: Optional[str], icon: Optional[str],
    parent_id: Optional[int], sort_order: int, now: str
) -> int:
    """Insert a new category and return its ID."""
    result = execute_query(
        f"""INSERT INTO categories ({CATEGORY_COLUMNS.replace(', id', '').strip().lstrip(', ')})
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        [name, slug, description, icon, parent_id, sort_order, 1, 0, now, now]
    )
    if not result:
        return 0

    id_result = execute_query("SELECT last_insert_rowid() as id", [])
    new_id = 0
    if id_result and id_result.get("rows"):
        id_rows = parse_rows(id_result)
        if id_rows:
            new_id = id_rows[0].get("id", 0)
    return new_id


def query_categories(where_sql: str, params: List) -> List[Dict[str, Any]]:
    """Query categories with filter and ordering."""
    result = execute_query(
        f"""SELECT {CATEGORY_COLUMNS}
            FROM categories WHERE {where_sql}
            ORDER BY sort_order, name""",
        params
    )
    if not result:
        return []
    return parse_rows(result)


def fetch_category_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    """Fetch a single category by slug."""
    result = execute_query(
        f"SELECT {CATEGORY_COLUMNS} FROM categories WHERE slug = ?",
        [slug]
    )
    if not result or not result.get("rows"):
        return None
    rows = parse_rows(result)
    return rows[0] if rows else None


def fetch_category_by_id(category_id: int) -> Optional[Dict[str, Any]]:
    """Fetch a single category by ID."""
    result = execute_query(
        f"SELECT {CATEGORY_COLUMNS} FROM categories WHERE id = ?",
        [category_id]
    )
    if not result or not result.get("rows"):
        return None
    rows = parse_rows(result)
    return rows[0] if rows else None


def fetch_category_name_and_slug(category_id: int) -> Optional[Dict[str, Any]]:
    """Fetch category name and slug for update comparisons."""
    result = execute_query(
        "SELECT id, name, slug FROM categories WHERE id = ?",
        [category_id]
    )
    if not result or not result.get("rows"):
        return None
    rows = parse_rows(result)
    return rows[0] if rows else None


def update_category_fields(category_id: int, set_clause: str, params: List) -> None:
    """Update category fields."""
    execute_query(
        f"UPDATE categories SET {set_clause} WHERE id = ?",
        params
    )


def count_child_categories(category_id: int) -> int:
    """Count child categories of a given parent."""
    result = execute_query(
        "SELECT COUNT(*) as count FROM categories WHERE parent_id = ?",
        [category_id]
    )
    if result and result.get("rows"):
        count_rows = parse_rows(result)
        return count_rows[0].get("count", 0) if count_rows else 0
    return 0


def fetch_category_project_count(category_id: int) -> Optional[Dict[str, Any]]:
    """Fetch category with its project count for delete validation."""
    result = execute_query(
        "SELECT id, project_count FROM categories WHERE id = ?",
        [category_id]
    )
    if not result or not result.get("rows"):
        return None
    rows = parse_rows(result)
    return rows[0] if rows else None


def delete_category_record(category_id: int) -> None:
    """Delete a category by ID."""
    execute_query("DELETE FROM categories WHERE id = ?", [category_id])
