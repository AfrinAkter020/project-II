from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from events.models import User, Category, Event, Attendance

class Command(BaseCommand):
    help = 'Populate database with sample data for ChaiAdda'
    
    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create categories
        categories_data = [
            {'name': 'Academic', 'description': 'Academic events like workshops, seminars', 'color': '#3b82f6'},
            {'name': 'Cultural', 'description': 'Cultural events like festivals, performances', 'color': '#ef4444'},
            {'name': 'Sports', 'description': 'Sports tournaments and activities', 'color': '#10b981'},
            {'name': 'Technical', 'description': 'Technical workshops and hackathons', 'color': '#8b5cf6'},
            {'name': 'Social', 'description': 'Social gatherings and networking', 'color': '#f59e0b'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Create sample users (Gmail accounts only)
        users_data = [
            {
                'email': 'afrin@gmail.com',
                'username': 'afrin',
                'first_name': 'Afrin',
                'last_name': 'Akter',
                'university': 'Shanto-Mariam University of Creative Technology'
            },
            {
                'email': 'antora@gmail.com',
                'username': 'antora',
                'first_name': 'Antora',
                'last_name': 'Akter',
                'university': 'Shanto-Mariam University of Creative Technology'
            },
            {
                'email': 'nusrat@gmail.com',
                'username': 'nusrat',
                'first_name': 'Nusrat Jahan',
                'last_name': 'Konka',
                'university': 'Shanto-Mariam University of Creative Technology'
            }
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={**user_data, 'password': 'password123'}
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created user: {user.email}')
            users.append(user)
        
        # Create sample events
        events_data = [
            {
                'title': 'SMUCT Django Workshop 2025',
                'description': 'Learn Django web development from scratch at SMUCT. This comprehensive workshop covers models, views, templates, and REST APIs. Perfect for CSE students!',
                'category': categories[3],  # Technical
                'organizer': users[0],  # Afrin
                'date': timezone.now().date() + timedelta(days=7),
                'time': timezone.datetime.strptime('14:00', '%H:%M').time(),
                'location': 'SMUCT Computer Lab 401',
                'capacity': 40,
            },
            {
                'title': 'SMUCT Cultural Night 2025',
                'description': 'Annual cultural celebration at Shanto-Mariam University featuring dance, music, and traditional Bengali performances. Join us for a night of creativity and culture!',
                'category': categories[1],  # Cultural
                'organizer': users[1],  # Antora
                'date': timezone.now().date() + timedelta(days=14),
                'time': timezone.datetime.strptime('18:30', '%H:%M').time(),
                'location': 'SMUCT Main Auditorium',
                'capacity': 300,
            },
            {
                'title': 'Inter-Department Cricket Tournament',
                'description': 'SMUCT inter-department cricket tournament. Teams from CSE, BBA, and other departments will compete. Register your department team now!',
                'category': categories[2],  # Sports
                'organizer': users[2],  # Nusrat Jahan
                'date': timezone.now().date() + timedelta(days=21),
                'time': timezone.datetime.strptime('09:00', '%H:%M').time(),
                'location': 'SMUCT Sports Ground',
                'capacity': 150,
            },
            {
                'title': 'SMUCT Career Fair 2025',
                'description': 'Meet recruiters from top tech companies and startups. Exclusive for SMUCT students. Bring your resume and dress professionally.',
                'category': categories[0],  # Academic
                'organizer': users[1],  # Antora
                'date': timezone.now().date() + timedelta(days=10),
                'time': timezone.datetime.strptime('10:00', '%H:%M').time(),
                'location': 'SMUCT Exhibition Hall',
                'capacity': 400,
            },
            {
                'title': 'Creative Technology Showcase',
                'description': 'Showcase your innovative projects! SMUCT students present their creative technology solutions, apps, and digital art. Open to all departments.',
                'category': categories[3],  # Technical
                'organizer': users[0],  # Afrin
                'date': timezone.now().date() + timedelta(days=12),
                'time': timezone.datetime.strptime('15:30', '%H:%M').time(),
                'location': 'SMUCT Innovation Hub',
                'capacity': 200,
            },
            {
                'title': 'SMUCT Alumni Meetup',
                'description': 'Connect with SMUCT alumni working in leading tech companies. Share experiences, get career advice, and build your professional network.',
                'category': categories[4],  # Social
                'organizer': users[2],  # Nusrat Jahan
                'date': timezone.now().date() + timedelta(days=5),
                'time': timezone.datetime.strptime('17:00', '%H:%M').time(),
                'location': 'SMUCT Student Center',
                'capacity': 120,
            },
            {
                'title': 'Photography Workshop: Campus Life',
                'description': 'Learn photography techniques while capturing the beautiful SMUCT campus. Bring your camera or smartphone. Perfect for beginners!',
                'category': categories[1],  # Cultural
                'organizer': users[1],  # Antora
                'date': timezone.now().date() + timedelta(days=8),
                'time': timezone.datetime.strptime('16:00', '%H:%M').time(),
                'location': 'SMUCT Campus Grounds',
                'capacity': 25,
            },
            {
                'title': 'Code & Coffee: Programming Meetup',
                'description': 'Join fellow programmers for an informal coding session! Bring your laptop and current projects. We\'ll discuss algorithms, share coding tips, and solve problems together while enjoying coffee and snacks.',
                'category': categories[3],  # Technical
                'organizer': users[0],  # Afrin
                'date': timezone.now().date() + timedelta(days=3),
                'time': timezone.datetime.strptime('15:30', '%H:%M').time(),
                'location': 'SMUCT Cafeteria - Corner Tables',
                'capacity': 15,
            }
        ]
        
        events = []
        for event_data in events_data:
            event, created = Event.objects.get_or_create(
                title=event_data['title'],
                defaults=event_data
            )
            events.append(event)
            if created:
                self.stdout.write(f'Created event: {event.title}')
        
        # Create some attendance records
        for i, event in enumerate(events[:3]):  # Only for first 3 events
            for j, user in enumerate(users):
                if i != j:  # Don't let organizer attend their own event in sample data
                    attendance, created = Attendance.objects.get_or_create(
                        user=user,
                        event=event,
                        defaults={'status': 'attending'}
                    )
                    if created:
                        self.stdout.write(f'Created attendance: {user.first_name} -> {event.title}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created sample data for SMUCT ChaiAdda:\n'
                f'- {len(categories)} categories\n'
                f'- {len(users)} users (Gmail accounts: Afrin, Antora, Nusrat Jahan)\\n'
                f'- {len(events)} events (SMUCT-focused events)\n'
                f'- Sample attendance records\n'
                f'- University: Shanto-Mariam University of Creative Technology'
            )
        )