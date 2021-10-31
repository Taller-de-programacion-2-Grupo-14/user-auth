CREATE TABLE user_registry
(
    id       SERIAL,
    email    varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE INDEX emailIndex
    ON user_registry (email);

CREATE TABLE profile_user
(
    user_id    int          NOT NULL,
    email      varchar(255),
    first_name varchar(100) NOT NULL,
    last_name  varchar(100) NOT NULL,
    interest   varchar(255),
    photo_url   varchar(255),
    location   varchar(255),
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES user_registry (id) ON DELETE CASCADE,
    UNIQUE (email)
);

CREATE INDEX emailIndexProfile
    ON profile_user (email);
