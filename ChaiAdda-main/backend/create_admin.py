#!/usr/bin/env python
"""
Script to create an admin user for ChaiAdda
Run this script from the backend directory to create admin users who can create events.
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chaiadda.settings')
django.setup()

from events.models import User

def create_admin_user():
    print("=== ChaiAdda Admin User Creation ===\n")
    
    # Get user details
    email = input("Enter admin email: ").strip()
    if not email:
        print("Error: Email is required!")
        return
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        print(f"\nUser with email {email} already exists!")
        update = input("Do you want to make this user an admin? (yes/no): ").strip().lower()
        if update == 'yes':
            user = User.objects.get(email=email)
            user.is_admin = True
            user.save()
            print(f"\n✓ User {user.first_name} {user.last_name} ({email}) is now an admin!")
        return
    
    first_name = input("Enter first name: ").strip()
    last_name = input("Enter last name: ").strip()
    university = input("Enter university (optional): ").strip()
    password = input("Enter password: ").strip()
    
    if not all([first_name, last_name, password]):
        print("Error: First name, last name, and password are required!")
        return
    
    # Create username from email
    username = email.split('@')[0]
    
    # Create the admin user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            university=university,
            password=password,
            is_admin=True  # Make them an admin
        )
        
        print(f"\n✓ Admin user created successfully!")
        print(f"  Name: {user.first_name} {user.last_name}")
        print(f"  Email: {user.email}")
        print(f"  University: {user.university or 'Not specified'}")
        print(f"  Admin: Yes")
        print(f"\nThis user can now create events in ChaiAdda!")
        
    except Exception as e:
        print(f"\nError creating user: {str(e)}")

if __name__ == '__main__':
    create_admin_user()
