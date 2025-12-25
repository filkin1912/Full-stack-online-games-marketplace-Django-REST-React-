def user_money(request):
    if request.user.is_authenticated:
        return {
            'profile_money': request.user.money,
            'profile_user': request.user,   # if the whole user object is needed
        }
    return {}
