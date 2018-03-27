from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import Button, DatePicker, SelectInput


@login_required()
def home(request):
    """
    Controller for the app home page.
    """

    context = {
    }

    return render(request, 'simple_app/home.html', context)


@login_required()
def map_view(request):
    """
    Controller for the app home page.
    """
    date_picker = DatePicker(name='date1',
                             display_text='Date',
                             autoclose=True,
                             format='MM d, yyyy',
                             start_date='2/15/2014',
                             start_view='decade',
                             today_button=True,
                             initial='February 15, 2014')

    select_input2 = SelectInput(display_text='Select2',
                                name='select2',
                                multiple=False,
                                options=[('One', '1'), ('Two', '2'), ('Three', '3')],
                                initial=['Three'],
                                select2_options={'placeholder': 'Select a number',
                                                 'allowClear': True})

    context = {
        'select_input2': select_input2,
        'date_picker': date_picker
    }

    return render(request, 'simple_app/map_view.html', context)


@login_required()
def data_services(request):
    """
    Controller for the app home page.
    """

    context = {
    }

    return render(request, 'simple_app/data_services.html', context)


@login_required()
def about(request):
    """
    Controller for the app home page.
    """

    context = {
    }

    return render(request, 'simple_app/about.html', context)


@login_required()
def mockup(request):
    """
    Controller for the app home page.
    """

    context = {
    }

    return render(request, 'simple_app/mockup.html', context)


@login_required()
def proposal(request):
    """
    Controller for the app home page.
    """

    context = {
    }

    return render(request, 'simple_app/project_proposal.html', context)
