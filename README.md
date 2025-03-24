import zipfile

import os


# Path to the uploaded zip file and extraction directory
zip_path = '/mnt/data/payment_wallet_week1-main.zip'
extraction_dir = '/mnt/data/payment_wallet_week1-main/'

# Extract the zip file
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extraction_dir)

# List the extracted files and directories
extracted_files = []
for root, dirs, files in os.walk(extraction_dir):
    for file in files:
        extracted_files.append(os.path.join(root, file))

extracted_files