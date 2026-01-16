"""
API управления учениками.
Создание, чтение, обновление учеников и управление балансом.
"""
import json
import os
import random
import string
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor

def generate_login():
    """Генерирует уникальный логин для ученика"""
    random_num = ''.join(random.choices(string.digits, k=5))
    return f'sambokid_{random_num}'

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cur.execute("""
                SELECT s.*, u.full_name, u.login, u.email, u.phone, g.name as group_name,
                       (SELECT COUNT(*) FROM attendance WHERE student_id = s.id AND is_present = TRUE) as total_visits,
                       (SELECT COUNT(*) FROM attendance WHERE student_id = s.id) as total_sessions
                FROM students s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN groups g ON s.group_id = g.id
                ORDER BY u.full_name
            """)
            students = cur.fetchall()
            
            result = []
            for student in students:
                student_dict = dict(student)
                if student_dict['total_sessions'] > 0:
                    student_dict['attendance_percentage'] = round(
                        (student_dict['total_visits'] / student_dict['total_sessions']) * 100
                    )
                else:
                    student_dict['attendance_percentage'] = 0
                result.append(student_dict)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'students': result}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            full_name = body.get('full_name', '').strip()
            birth_date = body.get('birth_date')
            parent_contact = body.get('parent_contact', '').strip()
            group_id = body.get('group_id')
            
            if not full_name:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ФИО ученика обязательно'}),
                    'isBase64Encoded': False
                }
            
            login = generate_login()
            temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            password_hash = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            cur.execute("""
                INSERT INTO users (login, password_hash, role, full_name, phone)
                VALUES (%s, %s, 'student', %s, %s)
                RETURNING id
            """, (login, password_hash, full_name, parent_contact))
            user_id = cur.fetchone()['id']
            
            cur.execute("""
                INSERT INTO students (user_id, group_id, birth_date, parent_contact, balance)
                VALUES (%s, %s, %s, %s, 0)
                RETURNING id
            """, (user_id, group_id, birth_date, parent_contact))
            student_id = cur.fetchone()['id']
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'student_id': student_id,
                    'login': login,
                    'temp_password': temp_password,
                    'message': 'Ученик создан. Передайте логин и пароль родителю.'
                }),
                'isBase64Encoded': False
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
