import os
from app.db.turso_http import execute_query

def update_demo_users():
    # Update Client 1
    execute_query(
        "UPDATE users SET is_verified = 1, bio = ?, location = ?, name = COALESCE(name, 'Demo Client') WHERE email = ?", 
        ['Experienced professional with over 5 years of industry experience.', 'New York, USA', 'client1@example.com']
    )
    
    # Update Freelancer 1
    execute_query(
        "UPDATE users SET is_verified = 1, bio = ?, skills = ?, location = ?, name = COALESCE(name, 'Demo Freelancer') WHERE email = ?", 
        ['Skilled developer specializing in AI and Web Development.', 'Python, FastAPI, Next.js, AI', 'Remote', 'freelancer1@example.com']
    )
    
    # Update Main AI User
    execute_query(
        "UPDATE users SET is_verified = 1, bio = ?, skills = ?, location = ?, name = 'megilance' WHERE email = ?", 
        ['AI Freelancing Expert', 'Next.js, FastAPI, AI Specialist', 'Karachi, Pakistan', 'megilanceofficial@gmail.com']
    )
    
    print("Demo users updated successfully")

if __name__ == "__main__":
    update_demo_users()
