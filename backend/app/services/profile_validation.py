from app.models.user import User

def get_missing_profile_fields(user: User) -> list[str]:
    missing = []
    if not user:
        return ['user']
    if not user.first_name and not user.name:
        missing.append('name')
    if not user.bio:
        missing.append('bio')
    # Use role instead of user_type for auth consistency
    role = getattr(user, "role", "client").lower()
    if role == "freelancer":
        if not user.skills:
            missing.append('skills')
    return missing

def is_profile_complete(user: User) -> bool:
    return len(get_missing_profile_fields(user)) == 0

def get_profile_completeness(user: User) -> int:
    """Calculate profile completeness percentage"""
    if not user:
        return 0
    missing = get_missing_profile_fields(user)
    # Define total expected fields (simple version)
    total_fields = 3 if getattr(user, "role", "client").lower() == "client" else 4
    completed = total_fields - len(missing)
    return int((completed / total_fields) * 100)
