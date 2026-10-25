from rest_framework import serializers
from .models import Room, RoomImage, OccupiedDate, User
from django.contrib.auth.hashers import make_password

class RoomImageSerializer(serializers.ModelSerializer):
    room = serializers.HyperlinkedRelatedField(
        view_name='room-detail',
        queryset=Room.objects.all()
    )
    class Meta:
        model = RoomImage
        fields = ['id', 'image', 'caption', 'room'] 

class OccupiedDataSerializer(serializers.ModelSerializer):
    # Force Django to accept the Room ID number instead of a URL
    room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())
    
    class Meta:
        model = OccupiedDate
        # NO 'user' here! Django handles it via perform_create
        fields = ['id', 'room', 'date'] 

class RoomSerializer(serializers.HyperlinkedModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)
    occupiedDates = OccupiedDataSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['url', 'id', 'name', 'type', 'pricePerNight', 'currency', 'maxOccupancy', 'description', 'images', 'occupiedDates']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'id', 'username', 'password', 'email', 'full_name']

    def validate_password(self, value):
        return make_password(value)