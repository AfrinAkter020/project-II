from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth import authenticate
from .models import User, Event, Category, Attendance

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'university', 'password', 'password_confirm')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'university', 'bio', 'is_admin', 'is_superuser', 'created_at')
        read_only_fields = ('id', 'created_at')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'color')

class EventSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    attendee_count = serializers.ReadOnlyField()
    available_spots = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    is_attending = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Event
        fields = (
            'id', 'title', 'description', 'category', 'category_id', 
            'organizer', 'date', 'time', 'location', 'capacity', 'image',
            'is_active', 'requires_registration', 'attendee_count',
            'available_spots', 'is_past', 'is_attending', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'organizer', 'is_active', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        request = self.context['request']
        if request.user.is_authenticated:
            validated_data['organizer'] = request.user
        else:
            # For testing purposes, use the first user if no auth
            from .models import User
            validated_data['organizer'] = User.objects.first()
        return super().create(validated_data)

    def get_is_attending(self, event):
        request = self.context.get('request')
        return bool(
            request
            and request.user.is_authenticated
            and event.attendances.filter(user=request.user, status='attending').exists()
        )

class AttendanceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    event = EventSerializer(read_only=True)
    
    class Meta:
        model = Attendance
        fields = ('id', 'user', 'event', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'event', 'created_at', 'updated_at')

class CreateAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ('event', 'status')
    
    def create(self, validated_data):
        request = self.context['request']
        if request.user.is_authenticated:
            validated_data['user'] = request.user
            return super().create(validated_data)
        else:
            raise ValidationError('Authentication required to create attendance')

