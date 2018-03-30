from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import SelectInput, RangeSlider


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

    context = {
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
