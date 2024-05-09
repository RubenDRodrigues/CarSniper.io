import subprocess

# List of scripts to run in sequence
scripts = ["OLX_Scrapping.py", "OLX_Scrapping2.py", "facebook_Scrapping.py", "facebook_Scrapping2.py","Add_dics_to_db.py"]

def run_script(script):
    try:
        subprocess.run(["python", script], check=True)
    except subprocess.CalledProcessError:
        print(f"Error occurred while running {script}. Retrying...")
        run_script(script)  # Retry running the script

def main():
    for script in scripts:
        run_script(script)

if __name__ == "__main__":
    main()
