"""
Django management command to make a user an admin.
Usage: python manage.py make_admin <email>
"""
from django.core.management.base import BaseCommand
from events.models import User


class Command(BaseCommand):
    help = 'Make a user an admin by their email address'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email address of the user')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_admin:
                self.stdout.write(
                    self.style.WARNING(f'User {user.first_name} {user.last_name} ({email}) is already an admin!')
                )
            else:
                user.is_admin = True
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ User {user.first_name} {user.last_name} ({email}) is now an admin!')
                )
                
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with email {email} does not exist!')
            )
