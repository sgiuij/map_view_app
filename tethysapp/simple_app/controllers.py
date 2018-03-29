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

    select_input = SelectInput(display_text='test input',
                                name='select2',
                                multiple=False,
                                options=[('One', '1'), ('Two', '2'), ('Three', '3')],
                                initial=['Three'],
                                select2_options={'placeholder': 'Select a number',
                                                 'allowClear': True})
    slider = RangeSlider(display_text='Radius',
                          name='slider2',
                          min=1,
                          max=20,
                          initial=1,
                          step=4,
                          attributes={
                            "onclick": "radius_reader();"
                          }
                        )

    context = {
        'select_input': select_input,
        'slider': slider
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
