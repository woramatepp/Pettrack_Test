CREATE TABLE users(
    id SERIAL NOT NULL,
    username varchar(50) NOT NULL,
    email varchar(100) NOT NULL,
    password varchar(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    age varchar(5),
    phone varchar(15),
    description text,
    profile_picture text,
    PRIMARY KEY(id)
);

CREATE TABLE pet(
    id SERIAL NOT NULL,
    user_id integer,
    name varchar(50) NOT NULL,
    age varchar(255),
    sex varchar(20),
    weight varchar(255),
    type varchar(20),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image text,
    PRIMARY KEY(id),
    CONSTRAINT pet_user_id_fkey FOREIGN key(user_id) REFERENCES users(id)
);
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    latitude real,
    longitude real,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

\echo '✅ All tables created successfully!'
