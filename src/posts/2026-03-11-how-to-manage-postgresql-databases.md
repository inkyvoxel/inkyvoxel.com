---
title: How to manage PostgreSQL databases
description: A quick guide to managing local PostgreSQL databases for app development, including creating databases and roles, and cleaning up old ones.
tags: [software-engineering, linux]
---

This guide covers creating, listing, and cleaning up databases and roles on a Linux machine. This is more for those building apps on their laptops, rather than those managing production databases.

**Note:** This guide assumes a Linux installation with a default `postgres` admin role. Your setup may vary depending on how PostgreSQL was installed or configured. You may need to adjust the commands accordingly depending on how your admin roles were set up.

## Creating a database and role

To create a new database and a dedicated role for a local app:

```bash
sudo -u postgres createdb my_app_db
sudo -u postgres createuser my_app_user
```

Confusingly, the command name is `createuser`, but in PostgreSQL terms this creates a role that can log in. What many people call a user is typically just a role with the `LOGIN` attribute.

After creating a role, you need to grant it permission to access the database:

```bash
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE my_app_db TO my_app_user;"
```

## Setting a password for the role

If your app connects to PostgreSQL using a connection string, you will need to set a password for the role:

```bash
sudo -u postgres psql -c "ALTER ROLE my_app_user WITH LOGIN PASSWORD 'my_password';"
```

You can also be prompted for the password when creating roles:

```bash
sudo -u postgres createuser my_app_user --pwprompt
```

**Note:** PostgreSQL needs to be configured for password authentication (via `pg_hba.conf`), but that is out of scope for this guide. See the [PostgreSQL docs](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html) for details.

This is typically what a local connection string will look like:

```
postgresql://my_app_user:my_password@localhost:5432/my_app_db
```

## Listing your databases and roles

List all current databases:

```bash
sudo -u postgres psql -l
```

List all current roles:

```bash
sudo -u postgres psql -c "\du"
```

Alternatively, if you are inside a `psql` session (i.e. after running `sudo -u postgres psql`), use `\l` or `\du` directly.

Are you stuck in the `psql` session? Use `\q` to quit!

## System databases and roles you should not remove

Before tidying up, be aware of these built-in components that should not be removed.

Databases:
- `postgres` - the default maintenance database. Removing it will break things.
- `template0` - a clean fallback template, used when restoring databases with `pg_restore`. Leave this alone.
- `template1` - the template used when creating new databases. Modifying or removing it is not recommended.

Admin role:
- `postgres` - the default superuser. Do not delete it unless you have set up an alternative superuser first.

## Deleting unused databases and roles

After some time, you will likely have old databases and roles you no longer need.

To drop (delete) a database:

```bash
sudo -u postgres dropdb my_old_app_db
```

The database must have no active connections when you run this command. If it does, the command will fail.

To drop (delete) a role:

```bash
sudo -u postgres psql -c "DROP ROLE my_old_app_user;"
```

If PostgreSQL says that the role cannot be dropped because it still owns database objects, you must first remove ownership or reassign it. This typically means you did not delete all the databases owned by that role.
