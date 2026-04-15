-- Seed suche buttons from the 2015 buttons.sql dump.
-- Assumes auth_accounts contains rows for 'Erik' and 'Armin'.

SET @uid_erikr := (SELECT id FROM auth_accounts WHERE username = 'Erik'  LIMIT 1);
SET @uid_armin := (SELECT id FROM auth_accounts WHERE username = 'Armin' LIMIT 1);

-- ── Erik rows (13) ─────────────────────────────────────────────────────────────
INSERT INTO s_buttons (user_id, caption, url, variant, sort) VALUES
(@uid_erikr, 'WLAN Kennwort',       'https://edasapp1.wien.tuev.at/start/browse/Webseiten/IT/WLAN-Key%20UpInTheAir', 'btn-danger',    100),
(@uid_erikr, 'Gehaltszettel',       'https://tppsap.wien.tuev.at/irj/portal', 'btn-danger',    110),
(@uid_erikr, 'IT Tickets',          'http://servicedesk.tuev.at',             'btn-danger',    120),
(@uid_erikr, 'Moodle :: Humboldt',  'http://hdl.online-campus.at/login/index.php', 'btn-dark', 200),
(@uid_erikr, 'Moodle :: Akademie',  'https://www.tuv-elearning.at/',          'btn-danger',    210),
(@uid_erikr, 'Moodle :: 2me.org',   'http://2me.org/tuv',                     'btn-success',   220),
(@uid_erikr, 'Umfragen',            'http://survey.jardyx.com/admin/',        'btn-success',   230),
(@uid_erikr, 'Facebook',            'https://www.facebook.com/erik.accart.huemer', 'btn-primary', 300),
(@uid_erikr, 'Dropbox',             'https://www.dropbox.com/home/',          'btn-primary',   400),
(@uid_erikr, 'Doodle',              'https://doodle.com',                     'btn-primary',   410),
(@uid_erikr, 'Ö1',                  'http://oe1.orf.at/konsole?show=live',    'btn-default',   500),
(@uid_erikr, 'Der Standard',        'http://derstandard.at/',                 'btn-default',   510),
(@uid_erikr, 'Die Presse',          'http://diepresse.com/',                  'btn-light',     520);

-- ── Armin rows (4) ─────────────────────────────────────────────────────────────
INSERT INTO s_buttons (user_id, caption, url, variant, sort) VALUES
(@uid_armin, 'Der Standard', 'http://derstandard.at/',                      'btn-default', 100),
(@uid_armin, 'Ö1',           'http://oe1.orf.at/konsole?show=live',         'btn-default', 200),
(@uid_armin, 'Facebook',     'https://www.facebook.com/AtheFUAtheFU',       'btn-primary', 300),
(@uid_armin, 'FroKnowsPhoto','http://froknowsphoto.com/',                   'btn-danger',  400);
