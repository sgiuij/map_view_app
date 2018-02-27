from tethys_sdk.base import TethysAppBase, url_map_maker


class SimpleApp(TethysAppBase):
    """
    Tethys app class for Simple App.
    """

    name = 'Simple App'
    index = 'simple_app:home'
    icon = 'simple_app/images/icon.gif'
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
            UrlMap(
                name='data_services',
                url='simple-app/data_services',
                controller='simple_app.controllers.data_services'
            ),
            UrlMap(
                name='about',
                url='simple-app/about',
                controller='simple_app.controllers.about'
            ),
        )

        return url_maps
