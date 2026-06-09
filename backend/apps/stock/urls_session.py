from django.urls import path
from .views.session_views import (
    get_current_session, open_session, close_session,
    get_session_history, add_expense, list_expenses,
)

urlpatterns = [
    path('current/',    get_current_session),
    path('open/',       open_session),
    path('close/',      close_session),
    path('history/',    get_session_history),
    path('expenses/',       list_expenses),
    path('expenses/add/',   add_expense),
]