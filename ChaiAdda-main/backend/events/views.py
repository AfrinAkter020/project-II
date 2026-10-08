from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from .models import User, Event, Category, Attendance
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    EventSerializer, CategorySerializer
)

# CSRF Token endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    return Response({'csrfToken': get_token(request)})

# Authentication Views
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    print(f"Login attempt - Session key before: {request.session.session_key}")
    print(f"Login attempt - Request data: {request.data}")
    
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        print(f"Login successful - Session key after: {request.session.session_key}")
        print(f"Login successful - User: {user.email}")
        
        # Ensure session is saved
        request.session.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    print(f"Login failed - Errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    print(f"Current User - Session key: {request.session.session_key}")
    print(f"Current User - User: {request.user}")
    print(f"Current User - Cookies: {dict(request.COOKIES)}")
    
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    else:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    categories = Category.objects.all().order_by('name')
    return Response(CategorySerializer(categories, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_event(request):
    if not request.user.is_admin and not request.user.is_superuser:
        return Response(
            {'error': 'Only admin users can create events.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = EventSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        event = serializer.save()
        return Response(EventSerializer(event, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_list(request):
    events = Event.objects.filter(is_active=True).select_related('category', 'organizer')
    return Response(EventSerializer(events, many=True, context={'request': request}).data)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def event_attendance(request, event_id):
    try:
        event = Event.objects.get(id=event_id, is_active=True)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

    attendance = Attendance.objects.filter(user=request.user, event=event).first()
    if request.method == 'POST':
        if event.is_past:
            return Response({'error': 'This event has already passed.'}, status=status.HTTP_400_BAD_REQUEST)
        if not attendance or attendance.status != 'attending':
            if event.available_spots <= 0:
                return Response({'error': 'This event is full.'}, status=status.HTTP_400_BAD_REQUEST)
            Attendance.objects.update_or_create(
                user=request.user,
                event=event,
                defaults={'status': 'attending'},
            )
        is_attending = True
    else:
        if attendance:
            attendance.delete()
        is_attending = False

    return Response({
        'is_attending': is_attending,
        'attendee_count': event.attendee_count,
        'available_spots': event.available_spots,
    })


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def event_detail(request, event_id):
    try:
        event = Event.objects.select_related('category', 'organizer').get(id=event_id)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

    can_manage = request.user.is_superuser or request.user.is_admin or event.organizer_id == request.user.id
    if not can_manage:
        return Response({'error': 'You do not have permission to manage this event.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = EventSerializer(event, data=request.data, context={'request': request})
    if serializer.is_valid():
        updated_event = serializer.save()
        return Response(EventSerializer(updated_event, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
