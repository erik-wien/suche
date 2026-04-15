SET @uid_erikr := (SELECT id FROM auth_accounts WHERE username = 'Erik'  LIMIT 1);
SET @uid_armin := (SELECT id FROM auth_accounts WHERE username = 'Armin' LIMIT 1);

INSERT INTO s_feeds (user_id, title, url, sort, enabled) VALUES
(@uid_erikr, 'MacTechNews.de', 'https://www.mactechnews.de/Rss/News.x',     100, 1),
(@uid_erikr, 'Standard',       'https://www.derstandard.at/rss',            200, 1),
(@uid_erikr, 'Standard / Web', 'https://www.derstandard.at/rss/web',        300, 1),
(@uid_erikr, 'ORF Science',    'https://rss.orf.at/science.xml',            400, 1),
(@uid_armin, 'MacTechNews.de', 'https://www.mactechnews.de/Rss/News.x',     100, 1),
(@uid_armin, 'Standard',       'https://www.derstandard.at/rss',            200, 1),
(@uid_armin, 'Standard / Web', 'https://www.derstandard.at/rss/web',        300, 1),
(@uid_armin, 'ORF Science',    'https://rss.orf.at/science.xml',            400, 1);
