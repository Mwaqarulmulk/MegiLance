-- Portfolio Items FTS Table
CREATE VIRTUAL TABLE IF NOT EXISTS portfolio_items_fts USING fts5(
    title,
    description,
    content='portfolio_items',
    content_rowid='id'
);

-- Triggers for portfolio_items
CREATE TRIGGER IF NOT EXISTS portfolio_items_ai AFTER INSERT ON portfolio_items BEGIN
  INSERT INTO portfolio_items_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER IF NOT EXISTS portfolio_items_ad AFTER DELETE ON portfolio_items BEGIN
  INSERT INTO portfolio_items_fts(portfolio_items_fts, rowid, title, description)
  VALUES('delete', old.id, old.title, old.description);
END;

CREATE TRIGGER IF NOT EXISTS portfolio_items_au AFTER UPDATE ON portfolio_items BEGIN
  INSERT INTO portfolio_items_fts(portfolio_items_fts, rowid, title, description)
  VALUES('delete', old.id, old.title, old.description);
  INSERT INTO portfolio_items_fts(rowid, title, description)
  VALUES (new.id, new.title, new.description);
END;
