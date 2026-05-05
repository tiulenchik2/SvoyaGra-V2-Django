from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('buzzer/', views.buzzer_page, name='buzzer'),
    path('login-team/', views.login_team, name='login_team'),
    path('logout-team/', views.logout_team, name='logout_team'),
    path('game-admin/', views.admin_panel, name='admin_panel'),
]