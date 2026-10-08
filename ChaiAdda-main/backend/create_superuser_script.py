from django.contrib.auth import get_user_model

User = get_user_model()

email = 'afrin@gmail.com'
username = 'afrin'
password = 'password123'
first_name = 'Afrin'
last_name = 'Akter'

if User.objects.filter(email=email).exists():
    print('Superuser already exists:', email)
else:
    User.objects.create_superuser(email=email, username=username, password=password, first_name=first_name, last_name=last_name, is_admin=True)
    print('Superuser created:', email)
