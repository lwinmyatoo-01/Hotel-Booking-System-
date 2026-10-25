"""
URL configuration for Booking_Backend project.
"""
from django.contrib import admin
from django.urls import path, include

# 1. You MUST import these for media files to work
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include("Room_Booking.urls")),
    path('api-auth/', include('rest_framework.urls')), 
]

# 2. This block serves your images during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)