from django.urls import path
from .views import view_tasks,add_task,completed_tasks,delete_edit_task,generate_description,dash_board

urlpatterns = [
    path('tasks/',view_tasks,name='tasks'),
    path("tasks/add/",add_task,name="add_task"),
    path("tasks/completed/",completed_tasks,name="completed_tasks"),
    path("tasks/<int:id>/",delete_edit_task,name="delete_edit_task"),
    path("tasks/generate/",generate_description,name="generate_description"),
    path("tasks/dashboard/",dash_board,name="dash_board")
]
