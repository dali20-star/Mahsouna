#!/usr/bin/env python
"""Test script using HTTP requests like the React frontend would"""
import os
import sys
import django
import json
import urllib.request
import urllib.error

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Ensure test user exists
try:
    user = User.objects.get(username='testuser')
    print(f"✓ Test user exists: {user.username} (ID: {user.id})")
except User.DoesNotExist:
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )
    print(f"✓ Created test user: {user.username} (ID: {user.id})")

# Get JWT token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)
print(f"✓ Generated JWT token: {access_token[:50]}...")

# Make HTTP request to the actual running server
print("\n" + "="*60)
print("Testing: POST http://localhost:8000/api/chat/sessions/")
print("="*60)

url = 'http://localhost:8000/api/chat/sessions/'
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {access_token}'
}
data = json.dumps({}).encode('utf-8')

print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Body: {data.decode()}")

try:
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        response_data = response.read().decode('utf-8')
        print(f"\n✓ Status: {response.status}")
        print(f"Response:")
        print(json.dumps(json.loads(response_data), indent=2))
except urllib.error.HTTPError as e:
    print(f"\n✗ Error Status: {e.code}")
    error_data = e.read().decode('utf-8')
    print(f"Error Response:")
    try:
        print(json.dumps(json.loads(error_data), indent=2))
    except:
        print(error_data)
except Exception as e:
    print(f"\n✗ Error: {type(e).__name__}: {str(e)}")

print("\n" + "="*60)
print("Done!")
