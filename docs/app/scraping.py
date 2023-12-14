from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
import re


def scraping(race, year):
    race_dictionary = {
        "フェブラリーS": "feb",
        "高松宮記念": "takamatsu",
        "大阪杯": "osaka",
        "桜花賞": "ouka",
        "皐月賞": "satsuki",
        "天皇賞（春）": "haruten",
        "NHKマイルカップ": "nmc",
        "ヴィクトリアマイル": "victoria",
        "オークス": "oaks",
        "日本ダービー": "derby",
        "安田記念": "yasuda",
        "宝塚記念": "takara",
        "スプリンターズS": "sprint",
        "秋華賞": "shuka",
        "菊花賞": "kikka",
        "天皇賞（秋）": "akiten",
        "エリザベス女王杯": "eliza",
        "マイルCS": "mile",
        "ジャパンC": "jc",
        "チャンピオンズC": "jcd",
        "阪神JF": "hjf",
        "朝日杯FS": "afs",
        "中山大障害": "daishogai",
        "有馬記念": "arima",
        "ホープフルS": "hopeful",
    }
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(
        service=ChromeService(ChromeDriverManager().install()), options=options
    )
    driver.get(
        "https://www.jra.go.jp/datafile/seiseki/g1/"
        + race_dictionary[race]
        + "/index.html"
    )
    year_element = driver.find_element(
        "xpath", f'//td[@class="year" and contains(text(), "{year}")]'
    )
    tr_element = year_element.find_element("xpath", "./parent::tr")
    movie_a_tag = tr_element.find_element("xpath", './/td[@class="movie"]/a')
    onclick_content = movie_a_tag.get_attribute("onclick")
    url_match = re.search(r"window\.open\('([^']+)'", onclick_content)
    print(url_match.group(1))
    return url_match.group(1)
