"""
API управления финансовыми транзакциями.
Пополнение баланса, просмотр истории операций.
"""
import json
import os
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
            student_id = body.get('student_id')
            amount = body.get('amount')
            description = body.get('description', '').strip()
            created_by = body.get('created_by')
            
            if not student_id or amount is None:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID ученика и сумма обязательны'}),
                    'isBase64Encoded': False
                }
            
            amount = int(amount)
            
            cur.execute("""
                INSERT INTO transactions (student_id, amount, transaction_type, description, created_by)
                VALUES (%s, %s, 'payment', %s, %s)
                RETURNING id, created_at
            """, (student_id, amount, description or 'Пополнение баланса', created_by))
            
            transaction = cur.fetchone()
            
            cur.execute("UPDATE students SET balance = balance + %s WHERE id = %s", (amount, student_id))
            
            cur.execute("SELECT balance FROM students WHERE id = %s", (student_id,))
            new_balance = cur.fetchone()['balance']
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'transaction_id': transaction['id'],
                    'new_balance': new_balance
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            student_id = params.get('student_id')
            
            if student_id:
                cur.execute("""
                    SELECT t.*, u.full_name as created_by_name
                    FROM transactions t
                    LEFT JOIN users u ON t.created_by = u.id
                    WHERE t.student_id = %s
                    ORDER BY t.created_at DESC
                    LIMIT 100
                """, (student_id,))
            else:
                cur.execute("""
                    SELECT t.*, s.id as student_id, u1.full_name as student_name, u2.full_name as created_by_name
                    FROM transactions t
                    JOIN students s ON t.student_id = s.id
                    JOIN users u1 ON s.user_id = u1.id
                    LEFT JOIN users u2 ON t.created_by = u2.id
                    ORDER BY t.created_at DESC
                    LIMIT 100
                """)
            
            transactions = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'transactions': [dict(t) for t in transactions]}, default=str),
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
