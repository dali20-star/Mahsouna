#!/usr/bin/env python
"""Test script to create user and test chat API"""
import os
import sys
import django
import json
from django.test import Client
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()

# Ensure test user exists
try:
    user = User.objects.get(username='testuser')
    print(f"✓ Test user exists: {user.username} ({user.id})")
except User.DoesNotExist:
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )
    print(f"✓ Created test user: {user.username} ({user.id})")

# Create Django test client
client = Client()

# Attempt to create a chat session
print("\n--- Testing POST /api/chat/sessions/ ---")
print("Payload: {}")

response = client.post('/api/chat/sessions/', {}, content_type='application/json')
print(f"Status: {response.status_code}")
print(f"Response: {response.content.decode()}")

# Try with authentication
print("\n--- Testing with authentication ---")
response_auth = client.post(
    '/api/chat/sessions/',
    {},
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Bearer {user.id}'  # This won't work, just trying
)
print(f"Status: {response_auth.status_code}")
print(f"Response: {response_auth.content.decode()}")
