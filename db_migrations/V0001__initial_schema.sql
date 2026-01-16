-- Создание таблицы пользователей (администраторы, тренеры, ученики)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'trainer', 'student')),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы групп
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    trainer_id INTEGER REFERENCES users(id),
    schedule TEXT,
    cost_per_session INTEGER DEFAULT 300,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы учеников (расширенная информация)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    group_id INTEGER REFERENCES groups(id),
    birth_date DATE,
    parent_contact VARCHAR(200),
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы посещаемости
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    group_id INTEGER REFERENCES groups(id),
    session_date DATE NOT NULL,
    is_present BOOLEAN DEFAULT FALSE,
    trainer_comment TEXT,
    cost_charged INTEGER DEFAULT 300,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, group_id, session_date)
);

-- Создание таблицы финансовых транзакций
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('payment', 'charge', 'adjustment')),
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, session_date);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON transactions(student_id);

-- Вставка администратора по умолчанию (пароль: Itachi7886)
INSERT INTO users (login, password_hash, role, full_name, email)
VALUES ('a.biktashev', '$2b$12$KIXvH8qZ5Y9J8yP5vW8qYeF5XqZ5Y9J8yP5vW8qYeF5XqZ5Y9J8yP', 'admin', 'Бикташев Айдар', 'admin@sambo.ru')
ON CONFLICT (login) DO NOTHING;