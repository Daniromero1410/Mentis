import os
import time

search_root = "backend"
target_string = "ACTA"

print(f"Searching for files containing '{target_string}' in name in {search_root}...")

for root, dirs, files in os.walk(search_root):
    for file in files:
        if target_string in file:
            print(f"FOUND FILE: {os.path.join(root, file)}")

print("Done.")
