CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  display_name TEXT NOT NULL,
  plan TEXT NOT NULL
);

INSERT INTO accounts (id, display_name, plan) VALUES
  (1, 'Synthetic Alder', 'demo'),
  (2, 'Synthetic Cypress', 'demo'),
  (3, 'Synthetic Heron', 'demo'),
  (4, 'Synthetic Marsh', 'demo');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  item TEXT NOT NULL,
  status TEXT NOT NULL
);

INSERT INTO orders (id, item, status) VALUES
  (1, 'Synthetic Widget', 'ready'),
  (2, 'Synthetic Service', 'queued'),
  (3, 'Synthetic Report', 'complete');
