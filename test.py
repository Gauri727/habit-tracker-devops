from selenium import webdriver

driver = webdriver.Chrome()
driver.get("http://localhost:8082")

assert "Vitals" in driver.title

driver.quit()
