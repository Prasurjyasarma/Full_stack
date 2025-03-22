from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Task
from .serializer import TaskSerializer

#! view the pending and in progress tasks
@api_view(['GET'])
def view_tasks(request):
    tasks=Task.objects.filter(status__in=["pending","in_progress"])
    serialized_tasks=TaskSerializer(tasks,many=True).data
    return Response(serialized_tasks,status=status.HTTP_200_OK)

#! view the completed tasks
@api_view(['GET'])
def completed_tasks(request):
    tasks=Task.objects.filter(status="completed")
    serialized_tasks=TaskSerializer(tasks,many=True).data
    return Response(serialized_tasks,status=status.HTTP_200_OK)
    
     
    # #?sorting the tasks
    # sort_tasks=request.GET.get('sort',"-priority")
    # tasks = Task.objects.filter(
    #     user=request.user
    # ).filter(
    #     Q(status="pending") | Q(status="in_progress")
    # ).order_by(sort_tasks)
    # return render(request,'index.html',{'tasks':tasks,'sort_tasks':sort_tasks})
    
#! add a task
@api_view(['POST'])
def add_task(request):
    data=request.data
    serializer=TaskSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.data,status=status.HTTP_400_BAD_REQUEST)


#! delele and edit the task 
@api_view(['PUT',"DELETE"])
def delete_edit_task(request, id):
    try:
        task = Task.objects.get(id=id)
        if request.method == "DELETE":
            task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        elif request.method == "PUT":
            data = request.data
            serializer = TaskSerializer(task, data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Task.DoesNotExist:
        return Response(
            {"error": f"Task with ID {id} does not exist."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    
@api_view(["GET"])   
def dash_board(requset):
    total_tasks=Task.objects.all().count()
    
    tasks_completed=Task.objects.filter(status="completed").count()
    tasks_pending=Task.objects.filter(status="pending").count()
    tasks_in_progress=Task.objects.filter(status="in_progress").count()
    
    data={
        "total_tasks":total_tasks,
        "tasks_completed":tasks_completed,
        "tasks_pending":tasks_pending,
        "tasks_in_progress":tasks_in_progress
    }
    return Response(data,status=status.HTTP_200_OK)
    
      
        
#! AI generate task description
@api_view(['POST'])
def generate_description(request):
    data = request.data
    task_name = data.get('title', '')
    

    if task_name:
        ai_description = f"This task involves completing {task_name}. Make sure to allocate sufficient time and resources to accomplish it efficiently."
    else:
        ai_description = "Please provide a task name to generate a detailed description."
    
    return Response({"description": ai_description}, status=status.HTTP_200_OK)
