import sys
import requests #type: ignore
from bs4 import BeautifulSoup #type: ignore
import os

def download_images(url):
    print("Downloading images from", url)
    
if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
        download_images(target_url)
    else:
        print("Please provide a URL")