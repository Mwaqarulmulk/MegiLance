-- Projects FTS Table
CREATE VIRTUAL TABLE IF NOT EXISTS projects_fts USING fts5(
    title,
    description,
    skills,
    category,
    content='projects',
    content_rowid='id'
);

-- Triggers for projects
CREATE TRIGGER IF NOT EXISTS projects_ai AFTER INSERT ON projects BEGIN
  INSERT INTO projects_fts(rowid, title, description, skills, category)
  VALUES (new.id, new.title, new.description, new.skills, new.category);
END;

CREATE TRIGGER IF NOT EXISTS projects_ad AFTER DELETE ON projects BEGIN
  INSERT INTO projects_fts(projects_fts, rowid, title, description, skills, category)
  VALUES('delete', old.id, old.title, old.description, old.skills, old.category);
END;

CREATE TRIGGER IF NOT EXISTS projects_au AFTER UPDATE ON projects BEGIN
  INSERT INTO projects_fts(projects_fts, rowid, title, description, skills, category)
  VALUES('delete', old.id, old.title, old.description, old.skills, old.category);
  INSERT INTO projects_fts(rowid, title, description, skills, category)
  VALUES (new.id, new.title, new.description, new.skills, new.category);
END;

-- Users FTS Table
CREATE VIRTUAL TABLE IF NOT EXISTS users_fts USING fts5(
    full_name,
    bio,
    skills,
    location,
    content='users',
    content_rowid='id'
);

-- Triggers for users
CREATE TRIGGER IF NOT EXISTS users_ai AFTER INSERT ON users BEGIN
  INSERT INTO users_fts(rowid, full_name, bio, skills, location)
  VALUES (new.id, COALESCE(new.first_name, '') || ' ' || COALESCE(new.last_name, ''), new.bio, new.skills, new.location);
END;

CREATE TRIGGER IF NOT EXISTS users_ad AFTER DELETE ON users BEGIN
  INSERT INTO users_fts(users_fts, rowid, full_name, bio, skills, location)
  VALUES('delete', old.id, COALESCE(old.first_name, '') || ' ' || COALESCE(old.last_name, ''), old.bio, old.skills, old.location);
END;

CREATE TRIGGER IF NOT EXISTS users_au AFTER UPDATE ON users BEGIN
  INSERT INTO users_fts(users_fts, rowid, full_name, bio, skills, location)
  VALUES('delete', old.id, COALESCE(old.first_name, '') || ' ' || COALESCE(old.last_name, ''), old.bio, old.skills, old.location);
  INSERT INTO users_fts(rowid, full_name, bio, skills, location)
  VALUES (new.id, COALESCE(new.first_name, '') || ' ' || COALESCE(new.last_name, ''), new.bio, new.skills, new.location);
END;
