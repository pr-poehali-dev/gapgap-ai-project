import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import openai

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Chat with AI and manage chat history
    Args: event with httpMethod, body (userId, chatId, message, action)
    Returns: HTTP response with AI response and chat data
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    openai_key = os.environ.get('OPENAI_API_KEY')
    
    if not openai_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'OpenAI API key not configured'})
        }
    
    openai.api_key = openai_key
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('userId')
            chat_id = event.get('queryStringParameters', {}).get('chatId')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'userId required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if chat_id:
                    cur.execute(
                        "SELECT * FROM messages WHERE chat_id = %s ORDER BY created_at ASC",
                        (chat_id,)
                    )
                    messages = cur.fetchall()
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'messages': [dict(m) for m in messages]}, default=str)
                    }
                else:
                    cur.execute(
                        "SELECT * FROM chats WHERE user_id = %s ORDER BY updated_at DESC",
                        (user_id,)
                    )
                    chats = cur.fetchall()
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'chats': [dict(c) for c in chats]}, default=str)
                    }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'send')
            user_id = body.get('userId')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'userId required'})
                }
            
            if action == 'create':
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "INSERT INTO chats (user_id) VALUES (%s) RETURNING id, title, created_at",
                        (user_id,)
                    )
                    chat = cur.fetchone()
                    conn.commit()
                    
                    return {
                        'statusCode': 201,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'chat': dict(chat)}, default=str)
                    }
            
            elif action == 'send':
                chat_id = body.get('chatId')
                message = body.get('message', '').strip()
                
                if not chat_id or not message:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'chatId and message required'})
                    }
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "INSERT INTO messages (chat_id, role, content) VALUES (%s, %s, %s) RETURNING id, created_at",
                        (chat_id, 'user', message)
                    )
                    user_msg = cur.fetchone()
                    
                    cur.execute(
                        "SELECT role, content FROM messages WHERE chat_id = %s ORDER BY created_at ASC LIMIT 20",
                        (chat_id,)
                    )
                    history = cur.fetchall()
                    
                    messages_for_ai = [{"role": m['role'], "content": m['content']} for m in history]
                    
                    try:
                        response = openai.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=messages_for_ai,
                            max_tokens=2000,
                            temperature=0.7
                        )
                        
                        ai_response = response.choices[0].message.content
                        
                        cur.execute(
                            "INSERT INTO messages (chat_id, role, content) VALUES (%s, %s, %s) RETURNING id, created_at",
                            (chat_id, 'assistant', ai_response)
                        )
                        assistant_msg = cur.fetchone()
                        
                        cur.execute(
                            "UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                            (chat_id,)
                        )
                        
                        conn.commit()
                        
                        return {
                            'statusCode': 200,
                            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                            'body': json.dumps({
                                'userMessage': {'id': user_msg['id'], 'role': 'user', 'content': message, 'created_at': str(user_msg['created_at'])},
                                'assistantMessage': {'id': assistant_msg['id'], 'role': 'assistant', 'content': ai_response, 'created_at': str(assistant_msg['created_at'])}
                            })
                        }
                    
                    except Exception as e:
                        conn.rollback()
                        return {
                            'statusCode': 500,
                            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                            'body': json.dumps({'error': f'OpenAI error: {str(e)}'})
                        }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Invalid action'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        conn.close()
