from django.urls import path
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('', views.index, name='expenses'),
    path('add-expense/', views.add_expense, name='add-expense'),
    path('edit-expense/<int:id>', views.expense_edit, name='expense-edit'),
    path('expense-delete/<int:id>', views.expense_delete, name='expense-delete'),
    path('search-expenses', csrf_exempt(views.search_expenses), name='search-expenses'), 
    
    path('expense_category_summary/', views.expense_category_summary, name='expense-category-summary'),
    
    # Add "expenses/" prefix to match your frontend calls
    path('expense_summary_data/', views.expense_summary_data, name='expense-summary-data'),
    path('income_summary_data/', views.income_summary_data, name='income-summary-data'),
    path('financial_overview/', views.financial_overview, name='financial-overview'),
    
    path('stats/', views.enhanced_stats_view, name='stats'),
    
    path('export_csv/', views.export_csv, name='export-csv'),
    path('export_excel/', views.export_excel, name='export-excel'),
    path('export_pdf/', views.export_pdf, name='export-pdf'),

    path('expense_summary_rest/', views.expense_summary_rest, name='expense-summary-rest'),
    path('last_3months_stats/', views.last_3months_stats, name='last-3months-stats'),
]