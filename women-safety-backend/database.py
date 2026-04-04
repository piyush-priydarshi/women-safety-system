import sqlite3
from flask import g


def get_db(app):
    if 'db' not in g:
        g.db = sqlite3.connect(
            app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    with app.app_context():
        db = sqlite3.connect(app.config['DATABASE'])
        db.row_factory = sqlite3.Row
        _create_tables(db)
        db.close()

    app.teardown_appcontext(close_db)


def _create_tables(db):
    db.executescript("""
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            phone       TEXT    NOT NULL UNIQUE,
            email       TEXT    UNIQUE,
            password    TEXT    NOT NULL,
            created_at  TEXT    DEFAULT (datetime('now'))
        );

        -- Emergency contacts per user
        CREATE TABLE IF NOT EXISTS emergency_contacts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name        TEXT    NOT NULL,
            phone       TEXT    NOT NULL,
            relation    TEXT,
            created_at  TEXT    DEFAULT (datetime('now'))
        );

        -- SOS events
        CREATE TABLE IF NOT EXISTS sos_events (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            latitude     REAL,
            longitude    REAL,
            address      TEXT,
            status       TEXT    DEFAULT 'active',   -- active | cancelled | resolved
            triggered_at TEXT    DEFAULT (datetime('now')),
            resolved_at  TEXT
        );

        -- Location history
        CREATE TABLE IF NOT EXISTS location_history (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            latitude    REAL    NOT NULL,
            longitude   REAL    NOT NULL,
            accuracy    REAL,
            recorded_at TEXT    DEFAULT (datetime('now'))
        );

        -- Alerts sent to contacts
        CREATE TABLE IF NOT EXISTS alerts (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            sos_event_id    INTEGER REFERENCES sos_events(id) ON DELETE CASCADE,
            user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            contact_id      INTEGER REFERENCES emergency_contacts(id),
            contact_phone   TEXT,
            message         TEXT,
            status          TEXT    DEFAULT 'sent',   -- sent | delivered | acknowledged
            sent_at         TEXT    DEFAULT (datetime('now')),
            acknowledged_at TEXT
        );
    """)
    db.commit()
