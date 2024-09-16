# Execution Instructions

## Operating System
Any operating system (Windows, macOS, Linux, etc.)

## Preparing the Environment Before Execution


1. **Installing Python and Setting Up a Virtual Environment:**
   - Download and install the latest version of Python from [Python's official website](https://www.python.org/downloads/)
   - After installing Python, create a virtual environment:
     ```bash
     python3 -m venv env
     ```
   - Activate the virtual environment:
     - **Windows:**
       ```bash
       .\env\Scripts\activate
       ```
     - **macOS/Linux:**
       ```bash
       source env/bin/activate
       ```

2. **Installing Required Packages:**
   - Install the dependencies listed in the `requirements.txt` file located in the project root directory:
     ```bash
     pip3 install -r requirements.txt
     ```

## Running the Python Application
   - Start your Python application from the project root directory using the following command:
     ```bash
     python3 app.py
     ```

## Accessing the Application
- After running the application, you can view it in your browser by navigating to [http://localhost:5000](http://localhost:5000)
