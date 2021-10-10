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
    user_id    int            NOT NULL,
    email      varchar(255),
    first_name character(100) NOT NULL,
    last_name  character(100) NOT NULL,
    user_type  varchar(20) CHECK (user_type IN ('Student', 'Collaborator', 'Creator')),
    interest   varchar(255),
    location   varchar(255),
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES user_registry (id) ON DELETE CASCADE,
    UNIQUE (email)
);

CREATE INDEX emailIndex
    ON profile_user (email);
