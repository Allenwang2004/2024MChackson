import requests
import shutil
import sys
import os

def download_image(url, save_path):
    try:
        print(f"Downloading from URL: {url}")
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type')
            if 'image' in content_type:  # 確認是否是圖片類型
                ext = content_type.split('/')[-1]  # 提取文件擴展名
                save_path_with_ext = f"{save_path}.{ext}"
                
                with open(save_path_with_ext, 'wb') as out_file:
                    shutil.copyfileobj(response.raw, out_file)
                print(f"Image successfully downloaded: {save_path_with_ext}")
            else:
                print(f"Failed to download image. Content-Type: {content_type}")
        else:
            print(f"Failed to retrieve image. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error downloading image: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python download.py <image_url>")
        sys.exit(1)

    image_url = sys.argv[1]
    print(f"Received image URL: {image_url}")

    image_file_name = image_url.split('/').pop().split('?')[0]
    print(f"Image file name: {image_file_name}")

    save_dir = 'images'

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
        print(f"Directory {save_dir} created.")

    save_path = os.path.join(save_dir, image_file_name)
    print(f"Saving image to: {save_path}")

    download_image(image_url, save_path)