#!/usr/bin/env python3
"""
Fix migration file by removing all ix_{table}_id index creation lines
"""
import re

migration_file = r'E:\MegiLance\backend\alembic\versions\b39ccee56d98_initial_migration_all_18_models_with_.py'

with open(migration_file, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# Pattern to match lines like: op.create_index(op.f('ix_skills_id'), 'skills', ['id'], unique=False)
# with optional leading whitespace and optional trailing newline
pattern = r'^\s*op\.create_index\(op\.f\(\'ix_\w+_id\'\), \'\w+\', \[\'id\'\], unique=False\)\s*$'

# Remove all matching lines
lines = content.split('\n')
fixed_lines = []
removed_count = 0

for line in lines:
    if re.match(pattern, line):
        removed_count += 1
        print(f"Removing: {line.strip()}")
    else:
        fixed_lines.append(line)

content = '\n'.join(fixed_lines)

if content != original:
    with open(migration_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"\n✅ Fixed migration file!")
    print(f"   Removed {removed_count} problematic ix_{{table}}_id indexes")
    print(f"   (Oracle automatically indexes PRIMARY KEY columns)")
else:
    print("⚠️  No changes needed")
