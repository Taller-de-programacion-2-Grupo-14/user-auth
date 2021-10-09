CREATE TABLE user_registry (
    id SERIAL,
    email varchar (255) NOT NULL,
    password  varchar (255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE INDEX emailIndex
    ON user_registry (email);