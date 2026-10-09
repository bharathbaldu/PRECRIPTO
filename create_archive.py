#!/usr/bin/env python3
"""
Script to create a downloadable ZIP archive of the PRESCRIPTO project
"""

import os
import zipfile
import shutil
from datetime import datetime

def create_zip_archive():
    # Get the parent directory (where PRESCRIPTO folder is)
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    project_name = os.path.basename(parent_dir)
    
    # Create archive name with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    archive_name = f"{project_name}_Complete_{timestamp}.zip"
    archive_path = os.path.join(parent_dir, "..", archive_name)
    
    # Get all directories to include
    dirs_to_include = ['backend', 'frontend']
    files_to_include = ['GET_STARTED.md', 'PROJECT_INFO.txt', 'environment.txt']
    
    print(f"📦 Creating archive: {archive_name}")
    print(f"📁 Source directory: {parent_dir}")
    
    # Create ZIP file
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add files
        for file_name in files_to_include:
            file_path = os.path.join(parent_dir, file_name)
            if os.path.exists(file_path):
                zipf.write(file_path, file_name)
                print(f"✅ Added: {file_name}")
        
        # Add directories
        for dir_name in dirs_to_include:
            dir_path = os.path.join(parent_dir, dir_name)
            if os.path.exists(dir_path):
                # Walk through directory
                for root, dirs, files in os.walk(dir_path):
                    # Skip node_modules, .git, and other unnecessary folders
                    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build', '__pycache__']]
                    
                    for file in files:
                        # Skip certain files
                        if file.startswith('.') or file.endswith('.log'):
                            continue
                            
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, parent_dir)
                        zipf.write(file_path, arcname)
                        print(f"✅ Added: {arcname}")
    
    print(f"\n🎉 Archive created successfully!")
    print(f"📦 Location: {archive_path}")
    print(f"📊 Size: {os.path.getsize(archive_path) / (1024*1024):.2f} MB")
    
    return archive_path

if __name__ == "__main__":
    create_zip_archive()













