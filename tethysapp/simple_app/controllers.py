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

