"""
Simple API test script for ChaiAdda backend
Run this to test the API endpoints
"""

import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def test_api():
    print("Testing ChaiAdda API...")
    print("=" * 50)
    
    # Test 1: Get categories
    print("\n1. Testing Categories endpoint:")
    try:
        response = requests.get(f'{BASE_URL}/categories/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            categories = response.json()
            print(f"Found {len(categories)} categories:")
            for cat in categories:
                print(f"  - {cat['name']}: {cat['color']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    # Test 2: Get events (without auth - should work with our settings)
    print("\n2. Testing Events endpoint:")
    try:
        response = requests.get(f'{BASE_URL}/events/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            events = response.json()
            print(f"Found {len(events)} events:")
            for event in events[:3]:  # Show first 3
                print(f"  - {event['title']} ({event['date']})")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    # Test 3: Test user registration
    print("\n3. Testing User Registration:")
    test_user = {
        'email': 'test@example.com',
        'username': 'testuser',
        'first_name': 'Test',
        'last_name': 'User',
        'password': 'testpass123',
        'password_confirm': 'testpass123'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/register/', json=test_user)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            result = response.json()
            print(f"Registration successful: {result['user']['email']}")
        else:
            print(f"Registration response: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")
    
    print("\n" + "=" * 50)
    print("API test completed!")
    print("Django server should be running on http://127.0.0.1:8000/")
    print("Django admin available at http://127.0.0.1:8000/admin/")

if __name__ == '__main__':
    test_api()