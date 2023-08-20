import time
from selenium import webdriver
from selenium.webdriver import Keys, ActionChains
from selenium.webdriver.common.by import By


def click_accept(driver):
    divs = driver.find_elements(By.CSS_SELECTOR, 'div')
    for div in divs:
        try:
            if div.text.lower() in [
                'accept all cookies',
                'accept',
                '同意',
                '接受',
            ]:
                div.click()
        except:
            pass


def open_one_page_and_scroll_and_get_all_img(driver, link):
    driver.get(link)
    print('open done')
    click_accept(driver)
    print('click accept done')
    html_length = driver.execute_script('return document.documentElement.scrollHeight')
    print('length', html_length)
    images = driver.find_elements(By.CSS_SELECTOR, 'img')
    last_location = 0
    counter = 0
    for img in images:
        if img.get_attribute('src') == 'data:image/gif;base64,R0lGODlhAQABAIABAAAAAP///yH5BAEAAAEALAAAAAABAAEAQAICTAEAOw%3D%3D':
            # get image position
            x, y = img.location['x'], img.location['y']
            print(x, y)
            ActionChains(driver).scroll_by_amount(0, y - last_location).perform()
            last_location = y
            time.sleep(0.1)
            counter += 1
    print('scroll over')
    time.sleep(10)
    print('sleep over')
    for img in images:
        if img.get_attribute('src') == 'data:image/gif;base64,R0lGODlhAQABAIABAAAAAP///yH5BAEAAAEALAAAAAABAAEAQAICTAEAOw%3D%3D':
            print(img.get_attribute('src'))
            counter -= 1
    print('counter', counter)
    urls = [img.get_attribute('src') for img in images]
    return urls


if __name__ == '__main__':
    driver = webdriver.Chrome()
    urls = open_one_page_and_scroll_and_get_all_img(
        # driver, 'https://genshin-impact.fandom.com/wiki/Genius_Invokation_TCG/Card_List'
        driver, 'https://genshin-impact.fandom.com/wiki/Bennett_(Character_Card)'
    )
    input('press any key to quit')
    print(urls)
    driver.quit()
