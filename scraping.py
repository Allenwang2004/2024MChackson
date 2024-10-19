import sys
import requests
from bs4 import BeautifulSoup
import os
import json

def download_images(url):
    '''Download images from the given URL and save them to the "images" folder.'''
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')    

    urls = []

    json_ld_script = soup.find('script', type='application/ld+json')

    # 提取 JSON-LD 內容並轉換為 Python 字典
    if json_ld_script:
        json_data = json.loads(json_ld_script.string)
    
        # 如果你想提取圖片 URL，並輸出它們
        if 'image' in json_data:
            # 確保只提取字符串而不是嵌套列表
            if isinstance(json_data['image'], list):
                for img in json_data['image']:
                # 使用 get() 方法來安全地獲取 contentUrl
                    content_url = img.get('contentUrl')
                    if content_url and isinstance(content_url, str):
                    # 過濾掉包含 'scorecardresearch' 的 URL
                        if 'scorecardresearch' not in content_url:
                            urls.append(content_url)
            else:
            # 獲取單一圖片的 URL
                content_url = json_data['image'].get('contentUrl')
                if content_url and isinstance(content_url, str):
                # 過濾掉包含 'scorecardresearch' 的 URL
                    if 'scorecardresearch' not in content_url:
                        urls.append(content_url)

    #print('json')
    #print(urls)

    preload_links = soup.find_all('link', rel='preload')
    image_link_preload = [link['href'] for link in preload_links if link.get('as') == 'image']
    urls.extend(image_link_preload)
    #print("preload")
    #print(urls)

    image_link_image = soup.find('link', rel = 'image_src')
    # 提取 href 屬性中的圖片 URL
    if image_link_image:
        img_url = image_link_image['href']
        urls.append(img_url)
    #print("linking")
    #print(urls)


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
        #if src:
         #   if not src.startswith(('http://', 'https://')):
          #          src = requests.compat.urljoin(url, src)
           #         urls.extend(src)
        if src:
            if style and "display: none" in style:
                continue  # 跳過隱藏的圖片
   
        # 過濾掉 1x1 大小的圖片
            if (width == "1" and height == "1") or (width == "0" and height == "0"):
                continue

        # 過濾掉隱藏到頁面之外的圖片
            if style and "position:absolute" in style:
                continue

            if "scorecardresearch" in src:
                continue

        # 過濾掉來自特定廣告或追蹤域名的圖片
            if src and any(domain in src for domain in ["doubleclick.net", "toast.com", "gssprt.jp"]):
                continue

            if src and src.endswith('.svg'):
                continue

            if src and src.endswith('.png'):
                continue

            if src and src.endswith('.gif'):
                continue

            if src and not src.startswith(('http://', 'https://')):
                continue

        # 如果圖片通過了過濾，加入到 URLs 列表
            if 'src' in img.attrs:
                urls.append(src)
        
            #print("img")
            #print(urls)

        #urls = list(set(urls))
        #print(urls)


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