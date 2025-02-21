from django.urls import path
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.index, name='expenses'),
    path('add-expense', views.add_expense, name='add-expense'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),  # Add this line
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)