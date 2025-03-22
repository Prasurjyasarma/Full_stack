from rest_framework import serializers
from .models import Task
from django.contrib.auth.models import User



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', "password"]
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)  
            user.save()
        return user



class TaskSerializer(serializers.ModelSerializer):    
    class Meta:
        model=Task
        fields='__all__'
        read_only_fields = ['user']
        