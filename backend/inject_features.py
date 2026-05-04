import os
import glob

def safe_replace(filepath, src, dest):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if src not in content:
        print(f"  [Skip] Text not found in {filepath}")
        return
        
    content = content.replace(src, dest)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  [OK] Updated {filepath}")

print("Updating Project Schemas...")
safe_replace('E:/MegiLance/backend/app/schemas/project.py', 
    'skills: List[str] = []\n    status: ProjectStatusEnum = ProjectStatusEnum.OPEN',
    'skills: List[str] = []\n    status: ProjectStatusEnum = ProjectStatusEnum.OPEN\n    attachments: Optional[List[str]] = []\n    timeline: Optional[str] = None'
)

print("Updating Portfolio Schemas...")
safe_replace('E:/MegiLance/backend/app/schemas/portfolio.py',
    'tags: Optional[List[str]] = []',
    'tags: Optional[List[str]] = []\n    skills: Optional[List[str]] = []\n    is_featured: Optional[bool] = False\n    display_order: Optional[int] = 0'
)

print("Updating Proposal Schemas...")
safe_replace('E:/MegiLance/backend/app/schemas/proposal.py',
    'attachments: Optional[List[str]] = []',
    'attachments: Optional[List[str]] = []\n    is_counter_offer: Optional[bool] = False\n    counter_amount: Optional[float] = None\n    negotiation_status: Optional[str] = "pending"'
)

print("Checking Database Models for matching gaps...")
safe_replace('E:/MegiLance/backend/app/models/project.py',
    'skills = Column(JSON, default=list)',
    'skills = Column(JSON, default=list)\n    attachments = Column(JSON, default=list)\n    timeline = Column(String(50), nullable=True)'
)

safe_replace('E:/MegiLance/backend/app/models/portfolio.py',
    'tags = Column(JSON, default=list)',
    'tags = Column(JSON, default=list)\n    skills = Column(JSON, default=list)\n    is_featured = Column(Boolean, default=False)\n    display_order = Column(Integer, default=0)'
)

safe_replace('E:/MegiLance/backend/app/models/proposal.py',
    'attachments = Column(JSON, default=list)',
    'attachments = Column(JSON, default=list)\n    is_counter_offer = Column(Boolean, default=False)\n    counter_amount = Column(Numeric(10, 2), nullable=True)\n    negotiation_status = Column(String(50), default="pending")'
)

print("Flawless schema/model injection complete.")
