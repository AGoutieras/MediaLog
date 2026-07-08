CREATE TABLE users (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_username_lower_key ON users (LOWER(username));

CREATE TABLE media_types (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL
);

CREATE TABLE medias (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id BIGINT NOT NULL,
  slug VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  cover_url VARCHAR(255),
  year VARCHAR(4),
  media_type_id UUID NOT NULL,
  FOREIGN KEY (media_type_id) REFERENCES media_types(id),
  UNIQUE (external_id, media_type_id)
);

CREATE TABLE user_media (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_id UUID NOT NULL,
  status VARCHAR(255) NOT NULL,
  rating NUMERIC(3,1),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  start_date DATE,
  end_date DATE,
  watched_before BOOLEAN DEFAULT false,
  platform VARCHAR(255),
  completion_percentage SMALLINT,
  playtime_hours INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (media_id) REFERENCES medias(id),
  UNIQUE (user_id, media_id)
);