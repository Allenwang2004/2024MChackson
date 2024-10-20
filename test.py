import requests
import shutil

def download_image(url):
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(save_path, 'wb') as out_file:
                shutil.copyfileobj(response.raw, out_file)
            print(f"Image successfully downloaded: {save_path}")
        else:
            print(f"Failed to retrieve image. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error downloading image: {e}")

if __name__ == "__main__":
    image_url = 'https://th.bing.com/th/id/OIP.kmK-IOyC3av-SMx4rn0xTAHaHa?rs=1&pid=ImgDetMain'
    save_path = 'images/image1.jpg'
    download_image(image_url)