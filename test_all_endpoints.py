#!/usr/bin/env python3
"""Test CRUD and AI endpoints with comprehensive debugging"""

import requests
import json
import time

BASE = 'http://localhost:8000'

print('\n' + '='*80)
print('COMPREHENSIVE ENDPOINT & CRUD TESTING')
print('='*80)

# 1. Test User Registration with Profile
email = f'test_{int(time.time())}@debug.com'
print(f'\n[1] Creating user: {email}')

reg = requests.post(f'{BASE}/api/auth/register', json={
    'email': email,
    'password': 'Test123!',
    'name': 'Test User',
    'user_type': 'client'
})
print(f'    ✓ Status: {reg.status_code}')

# 2. Login
print(f'\n[2] Logging in...')
login = requests.post(f'{BASE}/api/auth/login', json={
    'email': email,
    'password': 'Test123!'
})
token = login.json().get('access_token')
print(f'    ✓ Status: {login.status_code}')
print(f'    ✓ Token: {token[:50]}...')

# 3. Test various endpoints
headers = {'Authorization': f'Bearer {token}'}

print(f'\n[3] Testing API Endpoints:')

endpoints_to_test = [
    ('GET', '/api/users', 'List users'),
    ('GET', '/api/categories', 'List categories'),
    ('GET', '/api/skills', 'List skills'),
    ('GET', '/api/auth/me', 'Get current user'),
]

for method, endpoint, desc in endpoints_to_test:
    try:
        if method == 'GET':
            r = requests.get(f'{BASE}{endpoint}', headers=headers, timeout=5)
        status = '✓' if r.status_code < 400 else '✗'
        print(f'    {status} {method:6} {endpoint:30} - {r.status_code} ({desc})')
    except Exception as e:
        print(f'    ✗ {method:6} {endpoint:30} - ERROR: {str(e)[:40]}')

# 4. Test AI endpoints
print(f'\n[4] Testing AI Endpoints:')

ai_tests = [
    ('GET', '/api/ai-advanced/model-stats', None, 'Model stats'),
    ('POST', '/api/ai-advanced/detect-fraud', {'text': 'Suspicious'}, 'Fraud detection'),
    ('POST', '/api/ai-writing/brainstorm', {'topic': 'freelancing'}, 'AI brainstorm'),
]

for method, endpoint, payload, desc in ai_tests:
    try:
        if method == 'GET':
            r = requests.get(f'{BASE}{endpoint}', headers=headers, timeout=5)
        else:
            r = requests.post(f'{BASE}{endpoint}', headers=headers, json=payload, timeout=5)
        status = '✓' if r.status_code < 500 else '✗'
        print(f'    {status} {method:6} {endpoint:40} - {r.status_code} ({desc})')
    except Exception as e:
        print(f'    ✗ {method:6} {endpoint:40} - ERROR')

# 5. Try proposal creation (simpler than project with profile requirement)
print(f'\n[5] Testing Proposal Creation (CRUD):')

proposals_to_test = [
    {
        'project_id': '1',
        'amount': 500,
        'description': 'I can help with this project',
        'timeline_days': 14
    }
]

for proposal in proposals_to_test:
    try:
        r = requests.post(f'{BASE}/api/proposals', headers=headers, json=proposal, timeout=5)
        status = '✓' if r.status_code < 400 else f'✗ ({r.status_code})'
        print(f'    {status} POST /api/proposals')
        if r.status_code >= 400 and r.status_code < 500:
            print(f'       Error: {r.json().get("detail", "Unknown error")[:80]}')
    except Exception as e:
        print(f'    ✗ POST /api/proposals - ERROR: {str(e)[:50]}')

print('\n' + '='*80)
print('TESTING COMPLETE')
print('='*80 + '\n')
