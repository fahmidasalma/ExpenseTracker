from django.urls import path
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('', views.index, name='income'),
    path('add-income/', views.add_income, name='add-income'),
    path('edit-income/<int:id>', views.income_edit, name='income-edit'),
    path('income-delete/<int:id>', views.income_delete, name='income-delete'),
    path('search-income', csrf_exempt(views.search_income), name='search-income'),
    path('export_csv/', views.export_csv, name='income-export-csv'),
    path('export_excel/', views.export_excel, name='income-export-excel'),
    path('export_pdf/', views.export_pdf, name='income-export-pdf'),
]