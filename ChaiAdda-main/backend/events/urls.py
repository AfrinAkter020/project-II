from django.urls import path
from . import views

urlpatterns = [
    path('csrf-token/', views.get_csrf_token, name='csrf-token'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/user/', views.current_user, name='current_user'),
    path('categories/', views.category_list, name='categories'),
    path('events/', views.event_list, name='event-list'),
    path('events/create/', views.create_event, name='create-event'),
    path('events/<int:event_id>/attendance/', views.event_attendance, name='event-attendance'),
    path('events/<int:event_id>/', views.event_detail, name='event-detail'),
]