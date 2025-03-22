from django.db import models
from django.core.validators import MinValueValidator,MaxValueValidator
from django.contrib.auth.models import User

class Task(models.Model):
    user=models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True)
    
    Status=[
        ('pending','Pending'),
        ('completed','Completed'),
        ('in_progress','In Progress')
    ]
    title=models.CharField(max_length=300)
    description=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now_add=True)
    priority=models.IntegerField(default=1,
        validators=[MinValueValidator(1),MaxValueValidator(5)])
    status=models.CharField(max_length=100,choices=Status,default='pending')
    
    def __str__(self):
        return self.title


