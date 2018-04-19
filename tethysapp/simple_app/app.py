from tethys_sdk.base import TethysAppBase, url_map_maker


class SimpleApp(TethysAppBase):
    """
    Tethys app class for Simple App.
    """

    name = 'TEXAS Well Distribution'
    index = 'simple_app:home'
    icon = 'simple_app/images/icon.png'
    package = 'simple_app'
    root_url = 'simple-app'
    color = '#2c3e50'
    description = 'Place a brief description of your app here.'
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='simple-app',
                controller='simple_app.controllers.home'
            ),
            UrlMap(
                name='map_view',
                url='simple-app/map_view',
                controller='simple_app.controllers.map_view'
            ),
        )

        return url_maps
