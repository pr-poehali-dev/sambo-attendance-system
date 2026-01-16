"""
API управления группами.
Позволяет создавать, читать, обновлять группы и управлять учениками.
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
                SELECT g.*, u.full_name as trainer_name,
                       COUNT(s.id) as student_count
                FROM groups g
                LEFT JOIN users u ON g.trainer_id = u.id
                LEFT JOIN students s ON s.group_id = g.id
                WHERE g.is_archived = FALSE
                GROUP BY g.id, u.full_name
                ORDER BY g.created_at DESC
            """)
            groups = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'groups': [dict(g) for g in groups]}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name', '').strip()
            trainer_id = body.get('trainer_id')
            schedule = body.get('schedule', '').strip()
            cost_per_session = body.get('cost_per_session', 300)
            
            if not name:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Название группы обязательно'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO groups (name, trainer_id, schedule, cost_per_session)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, trainer_id, schedule, cost_per_session, created_at
            """, (name, trainer_id, schedule, cost_per_session))
            
            new_group = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'group': dict(new_group)}, default=str),
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
