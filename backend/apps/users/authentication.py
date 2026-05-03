from django.contrib.auth.backends import ModelBackend
from apps.users.models import CustomUser

class EmailOrUsernameBackend(ModelBackend):
    """
    Custom authentication backend that allows login with either username or email
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to get user by username or email
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            try:
                # If username is actually an email, try to find by email
                user = CustomUser.objects.get(email=username)
            except CustomUser.DoesNotExist:
                return None
        
        # Check password
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
