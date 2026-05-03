#!/usr/bin/env python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.content.models import SocialMediaPlan

plans = SocialMediaPlan.objects.all()
for plan in plans:
    print(f"Saving plan: {plan.title}")
    plan.save()
print(f"Done! Triggered signals for {plans.count()} plans.")
