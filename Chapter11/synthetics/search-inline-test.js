step("load homepage", async() => {
    await page.goto('http://<Your-HTML-Frontend>');
});

step('Add backend API', async() => {
    await page.fill('[placeholder="http://my-api-server.com"]', 'http://<Your-API-Backend>');
    await page.click('text=Update');
});

step('Add APM server', async() => {
    await page.fill('[placeholder="http://elastic-apm-server.com"]', 'https://<Your-APM-Server>');
    await page.click(':nth-match(:text("Update"), 2)');
});

step('Search for chicken', async() => {
    await page.fill('input[id=recipesearch]', 'chicken');
});

step('Press Enter', async() => {
    await page.keyboard.press('Enter');
});

step('Check if results found', async() => {
    await page.waitForTimeout(4000);
    const labelValue = await page.evaluate(el => el.innerText, await page.$('#results-list > li:first-child > .result-item > .result-item-details > .result-item-title'))
    expect(labelValue).toBe('Chicken in Pineapple Sauce (Chicken Hamonado)');
});