# Database Schema - ACG OJT

## Users Table

| Column      | Type        | Constraints                  | Description                  |
|-------------|-------------|------------------------------|------------------------------|
| id          | UUID        | PRIMARY KEY, Auto-generated  | Unique user identifier       |
| email       | TEXT        | UNIQUE, NOT NULL             | User's email address         |
| name        | TEXT        | NOT NULL                     | User's display name          |
| avatar      | TEXT        | NULLABLE                     | Profile picture URL          |
| google_id   | TEXT        | UNIQUE, NOT NULL             | Google OAuth ID              |
| created_at  | TIMESTAMPTZ | DEFAULT NOW()                | Account creation timestamp   |
| updated_at  | TIMESTAMPTZ | DEFAULT NOW()                | Last update timestamp        |

## Relationships

- One user can have many projects (future feature)
- One user can have many agent activities (future feature)

## RLS Policies

| Policy        | Operation | Description                    |
|---------------|-----------|--------------------------------|
| Allow inserts | INSERT    | Backend can create new users   |
| Allow reads   | SELECT    | Anyone can read user data      |
| Allow updates | UPDATE    | Users can update their records |

## Run Schema

Execute `database/schema.sql` in Supabase SQL Editor to create the table.
