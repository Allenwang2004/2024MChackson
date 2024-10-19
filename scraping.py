import sys
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import os

def download_images(url):
    '''Download images from the given URL and save them to the "images" folder.'''
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    link_tags = soup.find_all('link', rel=True)
    if not link_tags:
        return "找不到 <link> 標籤"
    
    # 列出所有 <link> 標籤並輸出其 href 和 rel 屬性
    for link in link_tags:
        rel = link.get('rel')
        href = link.get('href')
        print(f"rel: {rel}, href: {href}")
    
    meta_tag = soup.find('meta', attrs={'name': 'image'})
    if meta_tag and 'content' in meta_tag.attrs:
        img_url = meta_tag['content']
        urls.extend(img_url)

    urls = []
    preload_links = soup.find_all('link', rel='preload')
    image_link_preload = [link['href'] for link in preload_links if link.get('as') == 'image']
    urls.extend(image_link_preload)

    image_link_image = soup.find('link', rel = 'image_src')
    # 提取 href 屬性中的圖片 URL
    if image_link_image:
        img_url = image_link_image['href']
        urls.append(img_url)

    # Find all image tags
    img_tags = soup.find_all('img')
    #img_srcs = [img['src'] for img in img_tags if 'src' in img.attrs]
    #urls.extend(img_srcs)

    for img in img_tags:
        src = img.get('src')
        width = img.get('width')
        height = img.get('height')
        style = img.get('style')
        
        #處理相對路徑
        if src:
            if not src.startswith(('http://', 'https://')):
                    src = requests.compat.urljoin(url, img_url)
                    urls.append(src)
            
        # 過濾掉 1x1 大小的圖片
        if width == "1" and height == "1":
            continue

        # 過濾掉隱藏到頁面之外的圖片
        if style and "position:absolute" in style and "top:-9999px" in style and "left:-9999px" in style:
            continue

        # 過濾掉來自特定廣告或追蹤域名的圖片
        if src and any(domain in src for domain in ["doubleclick.net", "toast.com", "gssprt.jp"]):
            continue

        # 如果圖片通過了過濾，加入到 URLs 列表
        if 'src' in img.attrs:
            urls.append(src)

    # Create the images folder if it doesn't exist
    if not os.path.exists('images'):
        os.makedirs('images')

    downloaded_images = []

    # Loop through each image URL and download the image
    for i, img_url in enumerate(urls):
        if not img_url.startswith('http'):  # Handle relative URLs
            img_url = os.path.join(url, img_url)

        if img_url in downloaded_images:
            print(f"Image already downloaded: {img_url}")
            continue  # 如果已經下載過，跳過這個 URL
        
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