#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import CustomUser

# Create admin user with known credentials
username = 'admin'
password = 'admin123'
email = 'admin@example.com'

# Check if admin already exists
if CustomUser.objects.filter(username=username).exists():
    user = CustomUser.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f"✅ Admin password reset!")
else:
    # Create new admin
    user = CustomUser.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    print(f"✅ Admin user created!")

print(f"\n📝 Admin Credentials:")
print(f"Username: {username}")
print(f"Password: {password}")
print(f"Email: {email}")
