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
    subscription varchar(255) default 'free' check (subscription in ('free', 'platinum', 'black')),
    is_admin boolean default false,
    blocked boolean default false,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES user_registry (id) ON DELETE CASCADE,
    UNIQUE (email)
);

CREATE INDEX emailIndexProfile
    ON profile_user (email);

CREATE TABLE user_tokens (
    user_id int NOT NULL,
    token varchar(1000) default NULL,
    created_at timestamp default now(),
    primary key (user_id),
    FOREIGN KEY (user_id) REFERENCES user_registry (id)
);

CREATE TABLE waiting_update (
    user_id int not null,
    new_subscription varchar(255) default 'free' check (new_subscription in ('free', 'platinum', 'black')),
    txn_hash varchar(255),
    primary key (user_id, new_subscription),
    foreign key (user_id) references user_registry
);
