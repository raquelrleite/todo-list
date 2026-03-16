CREATE TABLE users
(
    id       bigint PRIMARY KEY AUTO_INCREMENT,
    name     varchar(50)  NOT NULL,
    email    varchar(50)  NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    role     varchar(50)  NOT NULL,
    verified boolean      NOT NULL DEFAULT FALSE
);


CREATE TABLE categories
(
    id      bigint PRIMARY KEY AUTO_INCREMENT,
    title   varchar(50) NOT NULL,
    user_id BIGINT      NOT NULL,
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE tasks
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    description TEXT NULL,
    user_id     BIGINT    NOT NULL,
    done        BOOLEAN            DEFAULT FALSE,
    created     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    due_date    TIMESTAMP NULL,
    priority    VARCHAR(50),
    category_id BIGINT,

    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_tasks_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

