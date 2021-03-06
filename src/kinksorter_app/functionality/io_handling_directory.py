from django.http.response import HttpResponse, JsonResponse

from kinksorter_app.functionality.directory_handling import PornDirectoryHandler, \
    get_porn_directory_ids, get_porn_directory_info_and_content, get_target_porn_directory
from kinksorter_app.models import CurrentTask


def add_new_porn_directory_request(request):
    porn_directory_path = request.GET.get('porn_directory_path')
    if not porn_directory_path:
        return HttpResponse('No porn_directory_path in request', status=400)

    if CurrentTask.objects.exclude(name='Scanning').exists():
        return HttpResponse('Task running! Wait for completion!.', status=503)

    porn_directory_name = request.GET.get('porn_directory_name')
    dir_handler = PornDirectoryHandler(None, init_path=porn_directory_path,
                                       name=porn_directory_name)
    if dir_handler:
        dir_handler.scan()
        return JsonResponse(get_porn_directory_info_and_content(porn_directory=dir_handler.directory), safe=False)
    return HttpResponse('Directory already exists', status=406)


def update_porn_directory_request(request):
    if CurrentTask.objects.exclude(name='Scanning').exists():
        return HttpResponse('Task running! Wait for completion!.', status=503)

    dir_handler, response = get_porn_directory_handler_by_id(request)
    if dir_handler is None:
        return response

    dir_handler.scan()
    return HttpResponse('Directory updating', status=200)


def rescan_target_porn_directory_request(request):
    if CurrentTask.objects.exclude(name='Scanning').exists():
        return HttpResponse('Task running! Wait for completion!.', status=503)

    dir_handler = PornDirectoryHandler(0)
    new_path = request.GET.get('porn_directory_path')
    if new_path is not None and (dir_handler.directory is None or new_path != dir_handler.directory.path):
        dir_handler.delete()

        dir_handler = PornDirectoryHandler(None, init_path=new_path, id_=0, name='Target')

    dir_handler.scan()
    return HttpResponse('Target directory scanning', status=200)


def reset_porn_directory_request(request):
    if CurrentTask.objects.exclude(name='Scanning').exists():
        return HttpResponse('Task running! Wait for completion!.', status=503)

    dir_handler, response = get_porn_directory_handler_by_id(request)
    if dir_handler is None:
        return response

    if dir_handler.reset():
        return HttpResponse('Directory resetting', status=200)
    return HttpResponse('Error resetting directory', status=500)


def rerecognize_porn_directory_request(request):
    dir_handler, response = get_porn_directory_handler_by_id(request)
    if dir_handler is None:
        return response

    unrecognized_movies = dir_handler.rerecognize()
    if unrecognized_movies:
        return JsonResponse(unrecognized_movies, safe=False)
    return HttpResponse('Error rerecognizing direcotry', status=500)


def change_porn_directory_name_request(request):
    dir_handler, response = get_porn_directory_handler_by_id(request)
    if dir_handler is None:
        return response

    new_porn_directory_name = request.GET.get('new_porn_directory_name')
    if new_porn_directory_name:
        if dir_handler.change_name(new_porn_directory_name):
            return HttpResponse('Directory name changed', status=200)


def delete_porn_directory_request(request):
    dir_handler, response = get_porn_directory_handler_by_id(request)
    if dir_handler is None:
        return response

    dir_handler.delete()
    return HttpResponse('Directory deleted', status=200)


def clear_target_porn_directory_request(request):
    target = get_target_porn_directory()
    target.movies.clear()
    return HttpResponse('Target cleared', status=200)


def get_porn_directory_request(request):
    dir_handler, response = get_porn_directory_handler_by_id(request)
    if dir_handler is None:
        return response

    data = get_porn_directory_info_and_content(porn_directory=dir_handler.directory)
    return JsonResponse(data, safe=False)


def get_porn_directory_handler_by_id(request):
    directory_id = request.GET.get('porn_directory_id')
    if directory_id and directory_id.isdigit():
        dir_handler = PornDirectoryHandler(int(directory_id))
        if dir_handler:
            return dir_handler, None
        return None, HttpResponse('Directory does not exist', status=406)
    return None, HttpResponse('Directory-ID malformed', status=400)


def get_porn_directory_ids_request(request):
    return JsonResponse(get_porn_directory_ids(), safe=False)


def change_sort_file_format_request(request):
    new_format = request.GET.get('file_format')
    target = get_target_porn_directory()

    if not target.validate_sort_format(new_format):
        return HttpResponse('Format invalid', status=400)

    target.sort_format = new_format
    target.save()

    return HttpResponse('Format changed', status=200)

