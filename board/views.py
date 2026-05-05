from django.shortcuts import render
from django.conf import settings
import os
import json

def board_view(request):
    json_path = os.path.join(settings.BASE_DIR, 'board', 'static', 'board', 'data', 'data_v3.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        questions_data = json.load(f)

    return render(request, 'board/index.html', {
        "questions_data": questions_data
    })