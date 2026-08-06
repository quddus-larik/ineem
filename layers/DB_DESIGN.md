## DB DESIGN

Mainly DBMS used as a Postgresql and Provider is `Supabase` provides **Auth, Storage, DB (vector).** 

### Tables

1. **users** - table to store user information and it is relation with **auth (Table)**
2. **companies** - table to store companies many to one reation with **users**
3. **documents** - table to store documents metadata and storage references **Many to Many** Relation with **companies <-> documents**
4. **companies_data** - table to store companies data (contracts, hr, IT, HIPAA, ISO and other polices) **combanies_data -> companies**

### Schema

./schema.png

## Table `users`

### Columns

| Name           | Type            | Constraints |
| -------------- | --------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `email`      | `text`        | Nullable    |
| `full_name`  | `text`        | Nullable    |
| `avatar_url` | `text`        | Nullable    |
| `created_at` | `timestamptz` | Nullable    |
| `updated_at` | `timestamptz` | Nullable    |

## Table `companies`

### Columns

| Name           | Type            | Constraints |
| -------------- | --------------- | ----------- |
| `id`         | `uuid`        | Primary     |
| `user_id`    | `uuid`        |             |
| `name`       | `text`        |             |
| `size`       | `text`        | Nullable    |
| `industry`   | `text`        | Nullable    |
| `metadata`   | `jsonb`       | Nullable    |
| `created_at` | `timestamptz` | Nullable    |

## Table `documents`

### Columns

| Name             | Type            | Constraints |
| ---------------- | --------------- | ----------- |
| `id`           | `uuid`        | Primary     |
| `user_id`      | `uuid`        |             |
| `company_id`   | `uuid`        |             |
| `storage_path` | `text`        | Nullable    |
| `content`      | `text`        |             |
| `metadata`     | `jsonb`       | Nullable    |
| `embedding`    | `vector`      | Nullable    |
| `created_at`   | `timestamptz` | Nullable    |

## Table `companies_data`

### Columns

| Name                                            | Type            | Constraints |
| ----------------------------------------------- | --------------- | ----------- |
| `id`                                          | `uuid`        | Nullable    |
| `company_id`                                  | `uuid`        |             |
| `policy_area`                                 | `text`        | Nullable    |
| `pilot_objective`                             | `text`        | Nullable    |
| `departments_in_scope`                        | `text`        | Nullable    |
| `current_process_and_pain_points`             | `text`        | Nullable    |
| `baseline_metrics`                            | `jsonb`       | Nullable    |
| `proposed_pilot_timeline`                     | `text`        | Nullable    |
| `key_stakeholders_and_approvers`              | `text`        | Nullable    |
| `legal_compliance_constraints`                | `text`        | Nullable    |
| `data_sources_available`                      | `text`        | Nullable    |
| `success_criteria_and_reporting_requirements` | `text`        | Nullable    |
| `created_at`                                  | `timestamptz` |             |
| `updated_at`                                  | `timestamptz` |             |

## RLS Policies

### `users`

| Policy                           | Command | Roles  | Action     | USING                 | WITH CHECK |
| -------------------------------- | ------- | ------ | ---------- | --------------------- | ---------- |
| `Users can update own profile` | UPDATE  | public | PERMISSIVE | `(auth.uid() = id)` | —         |
| `Users can view own profile`   | SELECT  | public | PERMISSIVE | `(auth.uid() = id)` | —         |

### `companies`

| Policy                                   | Command | Roles  | Action     | USING                      | WITH CHECK                 |
| ---------------------------------------- | ------- | ------ | ---------- | -------------------------- | -------------------------- |
| `Users can manage their own companies` | ALL     | public | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `documents`

| Policy                                   | Command | Roles  | Action     | USING                      | WITH CHECK                 |
| ---------------------------------------- | ------- | ------ | ---------- | -------------------------- | -------------------------- |
| `Users can manage their own documents` | ALL     | public | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
