CREATE TABLE users
(
    id       VARCHAR(36) PRIMARY KEY,
    name     varchar(50)  NOT NULL,
    email    varchar(70)  NOT NULL UNIQUE,
    password varchar(255) NULL,
    role     varchar(50)  NOT NULL DEFAULT 'USER',
    verified boolean      NOT NULL DEFAULT FALSE,
    provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);


CREATE TABLE categories
(
    id      VARCHAR(36) PRIMARY KEY,
    title   varchar(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE tasks
(
    id          VARCHAR(36) PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT NULL,
    user_id     VARCHAR(36) NOT NULL,
    done        BOOLEAN     NOT NULL DEFAULT FALSE,
    due_date    DATETIME NULL,
    priority    VARCHAR(50),
    category_id VARCHAR(36),
    created_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by  VARCHAR(255),
    updated_by  VARCHAR(255),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_tasks_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

