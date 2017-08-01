from django.conf.urls import url

from kinksorter_app.functionality import io_handling
from kinksorter_app import views

urlpatterns = [
    url(r'^$', views.index),
]

urlpatterns += [
    url(r'^storage/add/?$', io_handling.add_new_storage_request),
    url(r'^storage/delete/?$', io_handling.delete_storage_request),
    url(r'^storage/update/?$', io_handling.update_storage_request),
    url(r'^storage/change_name/?$', io_handling.change_storage_name_request),
    url(r'^storage/get_storage/?$', io_handling.get_storage_request),
    url(r'^storage/get_storage_ids/?$', io_handling.get_storage_ids_request),
]

urlpatterns += [
    url(r'^movie/recognize/?$', io_handling.recognize_movie_request),
    url(r'^movie/delete/?$', io_handling.delete_movie_request),
    url(r'^movie/add_to_main/?$', io_handling.add_movie_to_main_request),
]