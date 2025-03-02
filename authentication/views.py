from django.shortcuts import render, redirect
from django.views import View
import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
import logging

logger = logging.getLogger(__name__)

class usernameValidationView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')  # Use .get() to avoid KeyError

            if not username:
                return JsonResponse({'username_error': 'Username field is required.'}, status=400)

            if not str(username).isalnum():
                return JsonResponse({'username_error': 'Username should only contain alphanumeric characters.'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'username_error': 'Username is already taken. Choose another one.'}, status=409)

            return JsonResponse({'username_valid': True}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'username_error': 'Invalid JSON data.'}, status=400)
        except Exception as e:
            logger.error(f"Error: {e}")
            return JsonResponse({'username_error': 'An internal server error occurred.'}, status=500)

class RegistrationView(View):
    def get(self, request):
        form = UserCreationForm()
        return render(request, 'authentication/register.html', {'form': form})

    def post(self, request):
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')  # Redirect to login page after successful registration
        return render(request, 'authentication/register.html', {'form': form})