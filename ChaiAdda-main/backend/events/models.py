from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone



class User(AbstractUser):
    
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
   university = models.CharField(max_length=100, blank=True, null=True)
   bio = moels.TextField (blank=True, null=True)
class Category(models.Model):
    """Event categories like Academic, Cultural, Sports, etc."""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6366f1')  # Hex color code
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name

class Event(models.Model):
    """Event model for campus events"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='events')
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    
    # Event details
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=200)
    capacity = models.PositiveIntegerField(default=50)
    image = models.ImageField(upload_to='event_images/', blank=True, null=True)
    
    # Event status
    is_active = models.BooleanField(default=True)
    requires_registration = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.title} - {self.date}"
    
    @property
    def is_past(self):
        """Check if event is in the past"""
        from datetime import datetime, time
        event_datetime = datetime.combine(self.date, self.time)
        return timezone.now() > timezone.make_aware(event_datetime)
    
    @property
    def attendee_count(self):
        """Get number of attendees"""
        return self.attendances.filter(status='attending').count()
    
    @property
    def available_spots(self):
        """Get available spots for the event"""
        return max(0, self.capacity - self.attendee_count)

class Attendance(models.Model):
    """Attendance model for event participation"""
    STATUS_CHOICES = [
        ('attending', 'Attending'),
        ('maybe', 'Maybe'),
        ('not_attending', 'Not Attending'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='attending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'event')
    
    def __str__(self):
        return f"{self.user.first_name} - {self.event.title} ({self.status})"
