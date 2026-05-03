#!/usr/bin/env python
"""Test script to verify signals work"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.content.models import ContentDraft
from apps.users.models import CustomUser

# Test creating a draft
user = CustomUser.objects.filter(username='admin').first()
if user:
    draft = ContentDraft.objects.create(
        title='Test Publishing Signal',
        body='This is a test content',
        content_type='blog',
        status='draft',
        created_by=user
    )
    print(f'✅ Created draft: {draft.title}')
    
    # Change status to published (should trigger signal)
    print('\nChanging status to published...')
    draft.status = 'published'
    draft.save()
    print('✅ Signal test complete')
else:
    print('⚠️  Admin user not found')
