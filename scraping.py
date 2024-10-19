import sys
import requests
from bs4 import BeautifulSoup
import os

def download_images(url):
    '''Download images from the given URL and save them to the "images" folder.'''
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all image tags
    img_tags = soup.find_all('img')
    urls = [img['src'] for img in img_tags if 'src' in img.attrs]
    
    # Create the images folder if it doesn't exist
    if not os.path.exists('images'):
        os.makedirs('images')

    downloaded_images = []

    # Loop through each image URL and download the image
    for i, img_url in enumerate(urls):
        if not img_url.startswith('http'):  # Handle relative URLs
            img_url = os.path.join(url, img_url)
        
        try:
            img_data = requests.get(img_url).content
            img_name = f'image_{i+1}.jpg'
            img_path = os.path.join('images', img_name)
            
            with open(img_path, 'wb') as img_file:
                img_file.write(img_data)
            
            downloaded_images.append(img_path)
        except Exception as e:
            print(f"Failed to download image {img_url}: {e}")
    
    return downloaded_images

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
        images = download_images(target_url)
        
        # Print the list of downloaded image paths
        print('\n'.join(images))
    else:
        print("No URL provided.")