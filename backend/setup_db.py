"""
Database setup script - tries multiple connection methods.
Run: python setup_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# SQL from the schema file
with open(os.path.join(os.path.dirname(__file__), "app", "db", "migrations", "001_schema.sql"), "r") as f:
    SQL_SCHEMA = f.read()


def try_psycopg2(host, port, username, password):
    import psycopg2
    conn = psycopg2.connect(
        host=host,
        port=port,
        dbname="postgres",
        user=username,
        password=password,
        connect_timeout=10,
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute(SQL_SCHEMA)
    cur.close()
    conn.close()
    return True


def main():
    password = "Srikar@@@@10"
    ref = "jytziovekurjzacgjejw"

    methods = [
        ("Tokyo Pooler :5432", f"aws-0-ap-northeast-1.pooler.supabase.com", 5432, f"postgres.{ref}"),
    ]

    for name, host, port, username in methods:
        print(f"Trying {name}...", end=" ")
        try:
            try_psycopg2(host, port, username, password)
            print("SUCCESS!")
            return
        except Exception as e:
            print(f"Failed: {e}")

    print("\nCould not connect to Supabase database directly.")
    print("Please run the SQL manually in Supabase SQL Editor:")
    print("-" * 60)
    print("Go to: https://supabase.com/dashboard/project/" + ref + "/sql/new")
    print("Copy the content from: app/db/migrations/001_schema.sql")
    print("Paste and click 'Run'")


if __name__ == "__main__":
    main()

