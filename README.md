# ENIGMA Stroke Recovery Group Data Viewer Installation and Running Guide

Welcome to the Data Viewer App! This guide provides comprehensive instructions for installing and running the application, including prerequisites, setup, and operational guidance.

## Prerequisites

- **Python**: Ensure Python 3.x is installed on your system. Python's package manager `pip` should also be available for installing dependencies.
- **Access**: Confirm you have read access to the required directories for behavior and imaging data.
- **Node.js**: Ensure Node.js is installed for managing the React application.
- **Git**: Required for cloning the repository.

## Mount the Volume 

1. Make sure you are connected to GlobalProtect.
2. Open the finder, type ⌘ + K (or, Go >> Connect to Server…).
3. Type or select `smb://smb-ifs.ini.usc.edu` >> Connect.
4. Select/mount the faculty folder.
5. A new location should pop up in your finder. Navigate to sliew → enigma → new.

## Clone the repository

Clone the project repository to your local machine using the following command:
```bash
git clone https://github.com/npnl/enigma-data-request-form.git
cd enigma-data-request-form
```

## Installation

**Setup Python venv**: 

```bash
python3 -m venv venv
source venv/bin/activate
```

**Install NPM**: 
 Go to the Node.js download page and download the installer for your operating system (Windows, macOS, or Linux).

**Install Dependencies**: Run the following command in your terminal to install the necessary Python libraries:

```bash
pip install -r requirements.txt
cd react-data-request-form
npm install
npm run build
```

**Add AWS Access Keys**: Replace `<<your_aws_access_key>>`, `<<your_aws_secret_key>>` keys in the `.env` file with values provided via Slack.

## Running the Application

1. **Navigate to the App Directory**: Change to the directory where the Data Viewer App is located:

    ```plaintext
    cd ..
    ```

2. **Execute the App**: Start the application by running:

    ```bash
    flask --app application run --debug
    ```

    This launches the app, making it accessible via a web browser.

3. **Access the App**: Open a web browser and visit `http://127.0.0.1:5000/` to interface with the Data Viewer App.

## Requirements and Limitations

- **Behavior Data**: Ensure you have access to behavior data in the directory:

    ```plaintext
    /Volumes/faculty/sliew/enigma/new/octavio/behavior_renamed_20240126/
    ```

- **Imaging Data**: For imaging data, access is required to:

    ```plaintext
    /Volumes/faculty/sliew/enigma/new/BIDS/
    ```

    Note: The application provides paths to imaging data but does not display the images directly.

## Troubleshooting Steps

- **Error Description**:

    ```plaintext
    Traceback (most recent call last):
    File "/Volumes/faculty/sliew/enigma/new/Lahari/DataRequestForm/app.py", line 1, in <module>
        from flask import Flask, render_template, request, jsonify, session, url_for, Response
    File "/Users/laharireddy/opt/anaconda3/lib/python3.9/site-packages/flask/__init__.py", line 14, in <module>
        from jinja2 import escape
    ImportError: cannot import name 'escape' from 'jinja2' 
    ```

- **Fix**: 

    Run the following command 
    ```bash
    pip install --upgrade Flask
    pip install --upgrade Jinja2
    ```
    
Follow these instructions carefully to ensure a smooth setup and operation. For any issues or feedback, please feel free to contact Lahari via Slack or email at lmuthyal@usc.edu