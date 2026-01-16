-- Обновление хеша пароля администратора (правильный bcrypt хеш для пароля Itachi7886)
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYk3b7Y4Iye'
WHERE login = 'a.biktashev';

-- Добавление тестовых тренеров
INSERT INTO users (login, password_hash, role, full_name, email, phone)
VALUES 
('ivanov.s', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYk3b7Y4Iye', 'trainer', 'Иванов Сергей', 'ivanov@sambo.ru', '+79001234567')
ON CONFLICT (login) DO NOTHING;

-- Добавление тестовых групп
INSERT INTO groups (name, trainer_id, schedule, cost_per_session)
SELECT 'САМБО 7-9 лет', u.id, 'ПН, СР, ПТ 16:00', 300
FROM users u WHERE u.login = 'a.biktashev'
ON CONFLICT DO NOTHING;

INSERT INTO groups (name, trainer_id, schedule, cost_per_session)
SELECT 'Юниоры', u.id, 'ВТ, ЧТ, СБ 18:00', 300
FROM users u WHERE u.login = 'a.biktashev'
ON CONFLICT DO NOTHING;

INSERT INTO groups (name, trainer_id, schedule, cost_per_session)
SELECT 'Начинающие', u.id, 'ПН, СР 17:00', 300
FROM users u WHERE u.login = 'ivanov.s'
ON CONFLICT DO NOTHING;