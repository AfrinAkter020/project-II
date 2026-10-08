from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import connections, transaction

from events.models import Attendance, Category, Event, User


class Command(BaseCommand):
    help = 'Merge records from backend/db.sqlite3 into the configured PostgreSQL database.'

    def handle(self, *args, **options):
        destination = connections['default']
        if destination.vendor != 'postgresql':
            raise CommandError('Set DB_ENGINE=postgresql before importing SQLite data.')

        source_path = Path(settings.BASE_DIR) / 'db.sqlite3'
        if not source_path.is_file():
            raise CommandError(f'SQLite source database not found: {source_path}')

        source_alias = 'sqlite_source'
        destination_alias = 'default'
        source_database = connections.databases[destination_alias].copy()
        source_database.update({
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': source_path,
            'USER': '',
            'PASSWORD': '',
            'HOST': '',
            'PORT': '',
            'OPTIONS': {},
        })
        connections.databases[source_alias] = source_database
        created_counts = {'users': 0, 'categories': 0, 'events': 0, 'attendance': 0}
        user_map = {}
        category_map = {}
        event_map = {}

        try:
            with transaction.atomic(using=destination_alias):
                for source_category in Category.objects.using(source_alias).order_by('id'):
                    category, created = Category.objects.using(destination_alias).get_or_create(
                        name=source_category.name,
                        defaults={
                            'description': source_category.description,
                            'color': source_category.color,
                        },
                    )
                    category_map[source_category.pk] = category
                    created_counts['categories'] += int(created)

                for source_user in User.objects.using(source_alias).order_by('id'):
                    user = User.objects.using(destination_alias).filter(email=source_user.email).first()
                    if user is None:
                        username = source_user.username
                        suffix = f'-sqlite-{source_user.pk}'
                        if User.objects.using(destination_alias).filter(username=username).exists():
                            username = f'{username[:150 - len(suffix)]}{suffix}'

                        user = User(
                            username=username,
                            email=source_user.email,
                            first_name=source_user.first_name,
                            last_name=source_user.last_name,
                            university=source_user.university,
                            bio=source_user.bio,
                            is_admin=source_user.is_admin,
                            is_superuser=source_user.is_superuser,
                            is_staff=source_user.is_staff,
                            is_active=source_user.is_active,
                            date_joined=source_user.date_joined,
                            last_login=source_user.last_login,
                            password=source_user.password,
                        )
                        user.save(using=destination_alias)
                        created_counts['users'] += 1
                    user_map[source_user.pk] = user

                for source_event in Event.objects.using(source_alias).order_by('id'):
                    category = category_map[source_event.category_id]
                    organizer = user_map[source_event.organizer_id]
                    event, created = Event.objects.using(destination_alias).get_or_create(
                        title=source_event.title,
                        date=source_event.date,
                        time=source_event.time,
                        location=source_event.location,
                        category=category,
                        organizer=organizer,
                        defaults={
                            'description': source_event.description,
                            'capacity': source_event.capacity,
                            'image': source_event.image.name if source_event.image else '',
                            'is_active': source_event.is_active,
                            'requires_registration': source_event.requires_registration,
                        },
                    )
                    event_map[source_event.pk] = event
                    created_counts['events'] += int(created)

                for source_attendance in Attendance.objects.using(source_alias).order_by('id'):
                    _, created = Attendance.objects.using(destination_alias).get_or_create(
                        user=user_map[source_attendance.user_id],
                        event=event_map[source_attendance.event_id],
                        defaults={'status': source_attendance.status},
                    )
                    created_counts['attendance'] += int(created)
        except Exception as error:
            raise CommandError(f'SQLite data import failed; PostgreSQL changes were rolled back: {error}') from error

        self.stdout.write(self.style.SUCCESS(
            'SQLite merge complete. New records: '
            f"users={created_counts['users']}, "
            f"categories={created_counts['categories']}, "
            f"events={created_counts['events']}, "
            f"attendance={created_counts['attendance']}"
        ))