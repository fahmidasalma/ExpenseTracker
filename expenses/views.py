from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum
from .models import Category, Expense
from userpreferences.models import UserPreferences
from userincome.models import UserIncome  
import json
import datetime
import csv
import xlwt
import tempfile
from django.template.loader import render_to_string
from weasyprint import HTML
from django.utils import timezone
from datetime import datetime, timedelta
import calendar
from django.db.models import Sum
from django.utils import timezone
from calendar import month_name


def search_expenses(request):
    if request.method == 'POST':
        search_str = json.loads(request.body).get('searchText', '')

        expenses = Expense.objects.filter(
            amount__istartswith=search_str, owner=request.user
        ) | Expense.objects.filter(
            date__istartswith=search_str, owner=request.user
        ) | Expense.objects.filter(
            description__icontains=search_str, owner=request.user
        ) | Expense.objects.filter(
            category__icontains=search_str, owner=request.user
        )
        
        data = expenses.values()
        return JsonResponse(list(data), safe=False)


@login_required(login_url='/authentication/login')
def index(request):
    categories = Category.objects.all()
    expenses = Expense.objects.filter(owner=request.user)
    paginator = Paginator(expenses, 5)  # Adjust page size as needed
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    currency = UserPreferences.objects.get(user=request.user).currency

    context = {
        'expenses': expenses,
        'page_obj': page_obj,
        'categories': categories,
        'currency': currency,
    }
    return render(request, 'expenses/index.html', context)


@login_required(login_url='/authentication/login')
def add_expense(request):
    categories = Category.objects.all()
    context = {
        'categories': categories,
        'values': request.POST or {},  # Use an empty dict if POST is empty
    }

    if request.method == 'GET':
        return render(request, 'expenses/add_expense.html', context)

    if request.method == 'POST':
        amount = request.POST.get('amount', '').strip()
        description = request.POST.get('description', '').strip()
        date = request.POST.get('expense_date', '').strip()
        category = request.POST.get('category', '').strip()

        # Validate inputs
        if not amount:
            messages.error(request, 'Amount is required')
        elif not description:
            messages.error(request, 'Description is required')
        elif not date:
            messages.error(request, 'Expense date is required')
        elif not category:
            messages.error(request, 'Category is required')
        else:
            Expense.objects.create(
                amount=amount,
                date=date,  # Use 'date' to match the model
                category=category,  # Use the category name directly
                description=description,
                owner=request.user  # Set the owner to the current user
            )
            messages.success(request, 'Expense saved successfully')
            return redirect('expenses')

        return render(request, 'expenses/add_expense.html', context)


@login_required(login_url='/authentication/login')
def expense_edit(request, id):
    expense = get_object_or_404(Expense, pk=id)
    categories = Category.objects.all()
    context = {
        'expense': expense,
        'values': expense,  # This should be used for pre-filling the form
        'categories': categories,
    }

    if request.method == 'GET':
        return render(request, 'expenses/edit_expense.html', context)

    if request.method == 'POST':
        amount = request.POST.get('amount', '').strip()
        description = request.POST.get('description', '').strip()
        date = request.POST.get('expense_date', '').strip()
        category = request.POST.get('category', '').strip()

        # Validate inputs
        if not amount:
            messages.error(request, 'Amount is required')
        elif not description:
            messages.error(request, 'Description is required')
        elif not date:
            messages.error(request, 'Expense date is required')
        elif not category:
            messages.error(request, 'Category is required')
        else:
            # Update the expense
            expense.amount = amount
            expense.date = date  # Use 'date' to match the model
            expense.category = category  # Use category name directly
            expense.description = description
            expense.save()
            messages.success(request, 'Expense updated successfully')

            return redirect('expenses')

        return render(request, 'expenses/edit_expense.html', context)


@login_required(login_url='/authentication/login')
def expense_delete(request, id):
    expense = get_object_or_404(Expense, pk=id)
    expense.delete()
    messages.success(request, 'Expense deleted successfully')
    return redirect('expenses')

def expense_category_summary(request):
    todays_date = datetime.date.today()
    six_months_ago = todays_date - datetime.timedelta(days=180)
    expenses = Expense.objects.filter(owner = request.user, date__gte=six_months_ago, date__lte=todays_date)

    finalrep= {}

    def get_category(expense):
        return expense.category
    category_list = list(set(map(get_category, expenses)))

    def get_expense_category_amount(category):
        amount = 0
        filtered_by_category = expenses.filter(category=category)

        for item in filtered_by_category:
            amount += item.amount
        return amount

    for x in expenses:
        for y in category_list:
            finalrep[y] = get_expense_category_amount(y)

    return JsonResponse({'expense_category_data': finalrep}, safe=False)

def stats_view(request):
    # This function can be used to render a stats page if needed
    return render(request, 'expenses/stats.html')

@csrf_exempt
def expense_summary_data(request):
    """Enhanced expense summary with monthly breakdown for past 6 months"""
    today = timezone.now().date()
    six_months_ago = today - timedelta(days=180)
    
    expenses = Expense.objects.filter(
        owner=request.user, 
        date__gte=six_months_ago, 
        date__lte=today
    )
    
    # Monthly breakdown
    monthly_data = {}
    categories_data = {}
    total_by_month = {}
    
    # Get monthly totals for past 6 months
    for i in range(6):
        month_date = today.replace(day=1) - timedelta(days=30*i)
        month_start = month_date.replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_expenses = expenses.filter(date__gte=month_start, date__lte=month_end)
        month_total = month_expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        month_key = month_date.strftime('%B %Y')
        total_by_month[month_key] = float(month_total)
        
        # Category breakdown for this month
        month_categories = {}
        for expense in month_expenses:
            category = expense.category or 'Uncategorized'
            month_categories[category] = month_categories.get(category, 0) + float(expense.amount)
        
        monthly_data[month_key] = month_categories
    
    # Overall category totals
    for expense in expenses:
        category = expense.category or 'Uncategorized'
        categories_data[category] = categories_data.get(category, 0) + float(expense.amount)
    
    # Top spending days
    daily_spending = expenses.values('date').annotate(
        total=Sum('amount')
    ).order_by('-total')[:10]
    
    # Average monthly spending
    monthly_totals = list(total_by_month.values())
    avg_monthly = sum(monthly_totals) / len(monthly_totals) if monthly_totals else 0
    
    return JsonResponse({
        'monthly_totals': total_by_month,
        'categories_data': categories_data,
        'monthly_breakdown': monthly_data,
        'daily_spending': list(daily_spending),
        'stats': {
            'total_expenses': float(expenses.aggregate(total=Sum('amount'))['total'] or 0),
            'avg_monthly': float(avg_monthly),
            'total_transactions': expenses.count(),
            'top_category': max(categories_data.items(), key=lambda x: x[1])[0] if categories_data else 'None'
        }
    })

@csrf_exempt
def income_summary_data(request):
    """Income summary with monthly breakdown for past 6 months"""
    today = timezone.now().date()
    six_months_ago = today - timedelta(days=180)
    
    income = UserIncome.objects.filter(
        owner=request.user, 
        date__gte=six_months_ago, 
        date__lte=today
    )
    
    # Monthly breakdown
    monthly_data = {}
    sources_data = {}
    total_by_month = {}
    
    # Get monthly totals for past 6 months
    for i in range(6):
        month_date = today.replace(day=1) - timedelta(days=30*i)
        month_start = month_date.replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_income = income.filter(date__gte=month_start, date__lte=month_end)
        month_total = month_income.aggregate(total=Sum('amount'))['total'] or 0
        
        month_key = month_date.strftime('%B %Y')
        total_by_month[month_key] = float(month_total)
        
        # Source breakdown for this month
        month_sources = {}
        for inc in month_income:
            source = inc.source or 'Uncategorized'
            month_sources[source] = month_sources.get(source, 0) + float(inc.amount)
        
        monthly_data[month_key] = month_sources
    
    # Overall source totals
    for inc in income:
        source = inc.source or 'Uncategorized'
        sources_data[source] = sources_data.get(source, 0) + float(inc.amount)
    
    # Average monthly income
    monthly_totals = list(total_by_month.values())
    avg_monthly = sum(monthly_totals) / len(monthly_totals) if monthly_totals else 0
    
    return JsonResponse({
        'monthly_totals': total_by_month,
        'sources_data': sources_data,
        'monthly_breakdown': monthly_data,
        'stats': {
            'total_income': float(income.aggregate(total=Sum('amount'))['total'] or 0),
            'avg_monthly': float(avg_monthly),
            'total_transactions': income.count(),
            'top_source': max(sources_data.items(), key=lambda x: x[1])[0] if sources_data else 'None'
        }
    })

@csrf_exempt
def financial_overview(request):
    """Combined expense and income overview"""
    today = timezone.now().date()
    six_months_ago = today - timedelta(days=180)
    
    from userincome.models import UserIncome
    
    expenses = Expense.objects.filter(
        owner=request.user, 
        date__gte=six_months_ago, 
        date__lte=today
    )
    
    income = UserIncome.objects.filter(
        owner=request.user, 
        date__gte=six_months_ago, 
        date__lte=today
    )
    
    # Monthly comparison
    monthly_comparison = {}
    
    for i in range(6):
        month_date = today.replace(day=1) - timedelta(days=30*i)
        month_start = month_date.replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_expenses = expenses.filter(date__gte=month_start, date__lte=month_end)
        month_income = income.filter(date__gte=month_start, date__lte=month_end)
        
        expense_total = float(month_expenses.aggregate(total=Sum('amount'))['total'] or 0)
        income_total = float(month_income.aggregate(total=Sum('amount'))['total'] or 0)
        
        month_key = month_date.strftime('%B %Y')
        monthly_comparison[month_key] = {
            'expenses': expense_total,
            'income': income_total,
            'net': income_total - expense_total
        }
    
    total_expenses = float(expenses.aggregate(total=Sum('amount'))['total'] or 0)
    total_income = float(income.aggregate(total=Sum('amount'))['total'] or 0)
    
    return JsonResponse({
        'monthly_comparison': monthly_comparison,
        'summary': {
            'total_expenses': total_expenses,
            'total_income': total_income,
            'net_savings': total_income - total_expenses,
            'savings_rate': ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
        }
    })
@csrf_exempt
def enhanced_stats_view(request):
    """Enhanced stats page with multiple visualizations"""
    currency = UserPreferences.objects.get(user=request.user).currency
    context = {
        'currency': currency
    }
    return render(request, 'expenses/enhanced_stats.html', context)

@login_required(login_url='/authentication/login')
def expense_summary_rest(request):
    """API endpoint for yearly expense summary data"""
    current_year = timezone.now().year
    expenses = Expense.objects.filter(
        owner=request.user, 
        date__year=current_year
    )
    
    # Group expenses by month
    monthly_data = {}
    for month in range(1, 13):
        month_expenses = expenses.filter(date__month=month)
        total = month_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_data[month] = float(total)
    
    return JsonResponse({
        'this_year_expenses_data': {
            'months': monthly_data,
            'total_year': sum(monthly_data.values())
        }
    }, safe=False)

@login_required(login_url='/authentication/login')
def last_3months_stats(request):
    """API endpoint for last 3 months category statistics"""
    todays_date = datetime.date.today()
    three_months_ago = todays_date - datetime.timedelta(days=90)
    
    expenses = Expense.objects.filter(
        owner=request.user, 
        date__gte=three_months_ago, 
        date__lte=todays_date
    )
    
    # Calculate category totals
    category_data = {}
    categories = expenses.values_list('category', flat=True).distinct()
    
    for category in categories:
        total = expenses.filter(category=category).aggregate(Sum('amount'))['amount__sum'] or 0
        category_data[category] = float(total)
    
    return JsonResponse({
        'expenses_category_data': category_data
    }, safe=False)

def export_csv(request):

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=Expenses'+ str(datetime.datetime.now())+'.csv'

    writer = csv.writer(response)
    writer.writerow(['Amount', 'Description', 'Category', 'Date'])

    expenses = Expense.objects.filter(owner=request.user)

    for expense in expenses:
        writer.writerow([expense.amount, expense.description, expense.category, expense.date])

    return response

def export_excel(request):
    
    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = 'attachment; filename=Expenses'+ str(datetime.datetime.now())+'.xls'
    wb = xlwt.Workbook(encoding='utf-8')
    ws = wb.add_sheet('Expenses')
    row_num = 0
    font_style = xlwt.XFStyle()
    font_style.font.bold = True


    columns = ['Amount', 'Description', 'Category', 'Date']

    for col_num in range(len(columns)):
        ws.write(row_num, col_num, columns[col_num], font_style)

    font_style = xlwt.XFStyle()
    rows = Expense.objects.filter(owner=request.user).values_list('amount', 'description', 'category', 'date')

    for row in rows:
        row_num += 1
        for col_num in range(len(row)):
            ws.write(row_num, col_num, str(row[col_num]), font_style)

    wb.save(response)

    return response

def export_pdf(request):
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'inline; attachment; filename=Expenses'+ str(datetime.datetime.now())+'.pdf'
    response['Content-Transfer-Encoding'] = 'binary'

    expenses = Expense.objects.filter(owner=request.user)
    sum = expenses.aggregate(Sum('amount'))

    html_string = render_to_string('expenses/pdf-output.html', {
        'expenses': expenses, 'total': sum['amount__sum'], 'currency': UserPreferences.objects.get(user=request.user).currency
    })
    
    html = HTML(string=html_string)
    result = html.write_pdf()

    with tempfile.NamedTemporaryFile(delete=True) as output:
        output.write(result)
        output.flush()
        output.seek(0)
        response.write(output.read())

    return response