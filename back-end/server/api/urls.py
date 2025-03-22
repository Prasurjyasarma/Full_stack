from django.urls import path
from .views import view_tasks,add_task,completed_tasks,delete_edit_task,dash_board,user_details

urlpatterns = [
    path('tasks/',view_tasks,name='tasks'),
    path("tasks/add/",add_task,name="add_task"),
    path("tasks/completed/",completed_tasks,name="completed_tasks"),
    path("tasks/<int:id>/",delete_edit_task,name="delete_edit_task"),
    path("tasks/dashboard/",dash_board,name="dash_board"),
    path("tasks/user_details/",user_details,name="user_details")
]
