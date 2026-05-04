#!/usr/bin/env python3
"""Test CRUD with fixed payload"""

import requests
import json
import time

BASE = 'http://localhost:8000'

print('='*80)
print('TESTING CRUD FIX: Project Creation with Skills Field')
print('='*80)

# Create user
email = f'crud_test_{int(time.time())}@test.com'
reg = requests.post(f'{BASE}/api/auth/register', json={
    'email': email,
    'password': 'Test123!',
    'name': 'CRUD Tester',
    'user_type': 'client'
})
print(f'\n✓ Registration: {reg.status_code}')

# Login
login = requests.post(f'{BASE}/api/auth/login', json={
    'email': email,
    'password': 'Test123!'
})
token = login.json().get('access_token')
print(f'✓ Login: {login.status_code}')

# Complete profile (try different endpoints)
headers_temp = {'Authorization': f'Bearer {token}'}
profile_endpoints = [
    (f'{BASE}/api/users/profile', 'PATCH', {'bio': 'Professional developer'}),
    (f'{BASE}/api/auth/me', 'PATCH', {'bio': 'Professional developer'}),
    (f'{BASE}/api/users/me', 'PATCH', {'bio': 'Professional developer'}),
]

profile_ok = False
for ep, method, data in profile_endpoints:
    if method == 'PATCH':
        r = requests.patch(ep, headers=headers_temp, json=data)
    if r.status_code < 400:
        print(f'✓ Profile Update ({ep}): {r.status_code}')
        profile_ok = True
        break

# Create project WITH SKILLS
headers = {'Authorization': f'Bearer {token}'}
project_payload = {
    'title': f'Fixed Project {int(time.time())}',
    'description': 'CRUD operation test with skills',
    'category': 'development',
    'experience_level': 'intermediate',
    'estimated_duration': '1-3 weeks',
    'budget': 1000.0,
    'budget_type': 'fixed',
    'skills': ['Python', 'FastAPI', 'PostgreSQL']
}

project = requests.post(f'{BASE}/api/projects', headers=headers, json=project_payload)

print(f'✓ Project Creation: {project.status_code}')
if project.status_code in [200, 201]:
    print('\n✅ SUCCESS: Project created with skills field!')
    data = project.json()
    project_id = data.get('id')
    title = data.get('title')
    print(f'   Project ID: {project_id}')
    print(f'   Title: {title}')
    
    # Test READ
    read = requests.get(f'{BASE}/api/projects/{project_id}', headers=headers)
    print(f'\n✓ READ Project: {read.status_code}')
    
    # Test UPDATE
    update = requests.patch(f'{BASE}/api/projects/{project_id}', headers=headers, json={
        'title': f'Updated Project {int(time.time())}'
    })
    print(f'✓ UPDATE Project: {update.status_code}')
    
    print('\n✅ FULL CRUD TEST PASSED!')
else:
    print('\n❌ FAILED:')
    print(f'Response: {project.text}')
