from dotenv import load_dotenv
import os
from src.cli import cli

# Load environment variables
load_dotenv()

# Set up Replicate API token
os.environ["REPLICATE_API_TOKEN"] = os.getenv("REPLICATE_API_TOKEN")

if __name__ == "__main__":
    cli()