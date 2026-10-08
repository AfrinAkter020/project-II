#!/usr/bin/env python
"""
Quick script to reset a user's password
Usage: python reset_password.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chaiadda.settings')
django.setup()

from events.models import User

def reset_password():
    email = input("Enter user email: ")
    new_password = input("Enter new password: ")
    
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        print(f"✅ Password updated successfully for {email}")
        print(f"   Admin status: {user.is_admin}")
        print(f"   Active status: {user.is_active}")
    except User.DoesNotExist:
        print(f"❌ User with email {email} not found")

if __name__ == '__main__':
    reset_password()
