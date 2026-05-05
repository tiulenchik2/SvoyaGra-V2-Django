from django.shortcuts import render, redirect
from django.conf import settings
import os
import json
from .models import Team, GameState

def index(request):
    json_path = os.path.join(settings.BASE_DIR, 'board', 'static', 'board', 'data', 'data_v3.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        questions_data = json.load(f)
    return render(request, 'board/index.html', {"questions_data": questions_data})

def buzzer_page(request):
    team_id = request.session.get('team_id')
    if team_id:
        try:
            team = Team.objects.get(id=team_id)
            return render(request, 'board/buzzer.html', {'team': team})
        except Team.DoesNotExist:
            del request.session['team_id']
            
    available_teams = Team.objects.filter(is_online=False)
    return render(request, 'board/login.html', {'teams': available_teams})

def login_team(request):
    if request.method == 'POST':
        team_id = request.POST.get('team_id')
        if team_id:
            try:
                team = Team.objects.get(id=team_id)
                team.is_online = True # БЛОКУЄМО КОМАНДУ ДЛЯ ІНШИХ
                team.save()
                request.session['team_id'] = team_id
            except Team.DoesNotExist:
                pass
    return redirect('buzzer')

def logout_team(request):
    team_id = request.session.get('team_id')
    if team_id:
        try:
            team = Team.objects.get(id=team_id)
            team.is_online = False # ЗВІЛЬНЯЄМО КОМАНДУ
            team.save()
        except Team.DoesNotExist:
            pass
        del request.session['team_id']
    return redirect('buzzer')

def admin_panel(request):
    teams = Team.objects.all()
    state = GameState.get_state()
    return render(request, 'board/admin_panel.html', {'teams': teams, 'state': state})