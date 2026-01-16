"""
API управления посещаемостью.
Отметка присутствия и автоматическое списание средств.
"""
import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            group_id = body.get('group_id')
            session_date = body.get('session_date')
            present_students = body.get('present_students', [])
            trainer_comment = body.get('trainer_comment', '')
            trainer_id = body.get('trainer_id')
            
            if not group_id or not session_date:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Группа и дата обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT cost_per_session FROM groups WHERE id = %s", (group_id,))
            group = cur.fetchone()
            if not group:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Группа не найдена'}),
                    'isBase64Encoded': False
                }
            
            cost = group['cost_per_session']
            
            cur.execute("SELECT id FROM students WHERE group_id = %s", (group_id,))
            all_students = [row['id'] for row in cur.fetchall()]
            
            for student_id in all_students:
                is_present = student_id in present_students
                
                cur.execute("""
                    INSERT INTO attendance (student_id, group_id, session_date, is_present, trainer_comment, cost_charged)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (student_id, group_id, session_date) 
                    DO UPDATE SET is_present = EXCLUDED.is_present, trainer_comment = EXCLUDED.trainer_comment
                """, (student_id, group_id, session_date, is_present, trainer_comment, cost if is_present else 0))
                
                if is_present:
                    cur.execute("UPDATE students SET balance = balance - %s WHERE id = %s", (cost, student_id))
                    
                    cur.execute("""
                        INSERT INTO transactions (student_id, amount, transaction_type, description, created_by)
                        VALUES (%s, %s, 'charge', %s, %s)
                    """, (student_id, -cost, f'Посещение {session_date}', trainer_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Посещаемость отмечена'}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            group_id = params.get('group_id')
            student_id = params.get('student_id')
            
            if student_id:
                cur.execute("""
                    SELECT a.*, g.name as group_name
                    FROM attendance a
                    JOIN groups g ON a.group_id = g.id
                    WHERE a.student_id = %s
                    ORDER BY a.session_date DESC
                    LIMIT 100
                """, (student_id,))
            elif group_id:
                cur.execute("""
                    SELECT a.*, u.full_name as student_name
                    FROM attendance a
                    JOIN students s ON a.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    WHERE a.group_id = %s
                    ORDER BY a.session_date DESC, u.full_name
                    LIMIT 500
                """, (group_id,))
            else:
                cur.execute("""
                    SELECT a.*, u.full_name as student_name, g.name as group_name
                    FROM attendance a
                    JOIN students s ON a.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    JOIN groups g ON a.group_id = g.id
                    ORDER BY a.session_date DESC
                    LIMIT 100
                """)
            
            records = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'attendance': [dict(r) for r in records]}, default=str),
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
