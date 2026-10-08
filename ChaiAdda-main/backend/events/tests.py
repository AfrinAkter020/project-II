from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Attendance, Category, Event, User


class EventAttendanceTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='student@example.com',
			username='student',
			first_name='Campus',
			last_name='Student',
			password='test-password-123',
		)
		self.category = Category.objects.create(name='Academic')
		self.event = Event.objects.create(
			title='Study group',
			description='Prepare together',
			category=self.category,
			organizer=self.user,
			date=timezone.localdate() + timedelta(days=2),
			time='15:00',
			location='Library',
			capacity=2,
		)
		self.client.force_authenticate(user=self.user)

	def test_user_can_join_and_leave_event(self):
		events_response = self.client.get('/api/events/')
		self.assertFalse(events_response.data[0]['is_attending'])

		join_response = self.client.post(f'/api/events/{self.event.id}/attendance/')
		self.assertEqual(join_response.status_code, 200)
		self.assertTrue(join_response.data['is_attending'])
		self.assertEqual(join_response.data['attendee_count'], 1)
		self.assertEqual(Attendance.objects.filter(user=self.user, event=self.event).count(), 1)

		joined_events_response = self.client.get('/api/events/')
		self.assertTrue(joined_events_response.data[0]['is_attending'])

		leave_response = self.client.delete(f'/api/events/{self.event.id}/attendance/')
		self.assertEqual(leave_response.status_code, 200)
		self.assertFalse(leave_response.data['is_attending'])
		self.assertEqual(leave_response.data['available_spots'], 2)
		self.assertFalse(Attendance.objects.filter(user=self.user, event=self.event).exists())

	def test_joining_full_event_is_rejected(self):
		Event.objects.create(
			title='Full event',
			description='No seats left',
			category=self.category,
			organizer=self.user,
			date=timezone.localdate() + timedelta(days=3),
			time='15:00',
			location='Hall',
			capacity=1,
		)
		full_event = Event.objects.get(title='Full event')
		other_user = User.objects.create_user(
			email='another@example.com', username='another', password='test-password-123'
		)
		Attendance.objects.create(user=other_user, event=full_event)

		response = self.client.post(f'/api/events/{full_event.id}/attendance/')

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.data['error'], 'This event is full.')
