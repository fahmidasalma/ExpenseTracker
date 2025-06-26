# Django imports
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum
from .models import Category, Expense
from userpreferences.models import UserPreferences
import json
import datetime
import csv
import xlwt
import tempfile
from django.template.loader import render_to_string
from weasyprint import HTML


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