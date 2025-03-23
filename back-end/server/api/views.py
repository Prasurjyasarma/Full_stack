from django.shortcuts import render
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Task
from .serializer import TaskSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.contrib.auth.models import User
from .serializer import UserSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
import requests


"""
User registration view that allows creating new user accounts.
Uses AllowAny permission to allow registration without authentication.
"""
@permission_classes([AllowAny])
class UserRegistrationView(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=UserSerializer
    permission_classes=[AllowAny]


#! log in a user
"""
Authenticates a user and provides JWT tokens for access.
Requires username and password in the request data.
"""
@api_view(['POST'])
@permission_classes([AllowAny])
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            'error': 'Please provide both username and password'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user_id': user.id,
        'username': user.username,
        'email': user.email
    }, status=status.HTTP_200_OK)




#! view the pending and in progress tasks
"""
Gets all tasks with 'pending' or 'in_progress' status for the authenticated user.
"""
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_tasks(request):
    tasks=Task.objects.filter(user=request.user,status__in=["pending","in_progress"])
    serialized_tasks=TaskSerializer(tasks,many=True).data
    return Response(serialized_tasks,status=status.HTTP_200_OK)

#! view the completed tasks
"""
Gets all tasks with 'completed' status for the authenticated user.
"""
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def completed_tasks(request):
    tasks=Task.objects.filter(user=request.user,status="completed")
    serialized_tasks=TaskSerializer(tasks,many=True).data
    return Response(serialized_tasks,status=status.HTTP_200_OK)

    
#! add a task
"""
Creates a new task for the authenticated user.
Validates task data through the TaskSerializer.
"""
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_task(request):
    data=request.data
    serializer=TaskSerializer(data=data,context={'user':request.user})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


#! delele and edit the task 
"""
Updates or deletes a task with the specified ID.
Only allows the task owner to modify their own tasks.
"""
@api_view(['PUT',"DELETE"])
@permission_classes([IsAuthenticated])
def delete_edit_task(request, id):
    try:
        task = Task.objects.get(id=id)
        
        if task.user !=request.user:
            return Response({"error": "You do not have permission to modify this task."},
                status=status.HTTP_403_FORBIDDEN)
            
            
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
    
#! Dashboard    
"""
Provides task statistics for the authenticated user.
Counts total, completed, pending, and in-progress tasks.
"""
@api_view(["GET"])
@permission_classes([IsAuthenticated])   
def dash_board(request):

    total_tasks=Task.objects.filter(user=request.user).count()
    tasks_completed=Task.objects.filter(user=request.user,status="completed").count()
    tasks_pending=Task.objects.filter(user=request.user,status="pending").count()
    tasks_in_progress=Task.objects.filter(user=request.user,status="in_progress").count()
    
    data={
        "total_tasks":total_tasks,
        "tasks_completed":tasks_completed,
        "tasks_pending":tasks_pending,
        "tasks_in_progress":tasks_in_progress
    }
    return Response(data,status=status.HTTP_200_OK)
    
      
      
#! Current user details
"""
Retrieves details about the currently authenticated user.
Currently returns only the user's first name.
"""
@api_view(["GET"])
@permission_classes([IsAuthenticated])   
def user_details(request):
    user=request.user
    return Response(
        {
            "first_name":user.first_name,
        },
        status=status.HTTP_200_OK,
    )