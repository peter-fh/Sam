# Deployment

The database uses Supabase for a managed PostgreSQL instance. Supabase offers an authentication package to ensure we can use a trusted authentication package. It also offers migration to any other PostgreSQL service, allowing easy migration to align with standard deployment practices.

# Schema

The following is an automatically generated SQL Schema for the database, meant as a documentation-only view into the schema. For an actual posgresql migration file, see `supabase/migrations/{timestamp}_remote_schema.sql`.

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.conversations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  summary text,
  title text,
  created_at timestamp with time zone DEFAULT now(),
  course_id bigint,
  mode_id bigint,
  user_id uuid,
  summarized_at timestamp with time zone,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT conversations_mode_id_fkey FOREIGN KEY (mode_id) REFERENCES public.modes(id),
  CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.courses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  role character varying DEFAULT 'user'::character varying,
  content text,
  conversation_id bigint NOT NULL,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.modes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  CONSTRAINT modes_pkey PRIMARY KEY (id)
);
```
