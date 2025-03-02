from django.urls import path
from .views import RegistrationView, usernameValidationView

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('validate-username/', usernameValidationView.as_view(), 
         name='validate-username'),
]