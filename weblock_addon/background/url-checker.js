const css_code = `
#blocked-container {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
}

#blocked-title {
    font-size: 3rem;
    color: red;
    margin: 2rem auto;
}
`
const js_code = `document.querySelector('body').innerHTML = '<div id="blocked-container"><h1 id="blocked-title">This website is blocked</h1><img src="https://image.flaticon.com/icons/png/512/3067/3067941.png" alt="Blocked" width="256" height="256"></div>'`

function tab_or_url_change_listener() {
    browser.tabs.query({active: true}).then(info => {
        let url = info[0].url
        
        if (url.includes('http')) {
            let domain = new URL(url)
            domain = domain.hostname

            browser.storage.local.get('domains')
            .then(store => {
                let domains = store['domains']
                
                for (const dom of domains) {
                    if (domain.includes(dom)) {
                        browser.tabs.executeScript({code: js_code}).then(() => {
                            browser.tabs.insertCSS({code: css_code}).then(() => pass)
                        })
                        break
                    }
                }
            })
        }
    })
}
  
browser.tabs.onActivated.addListener(tab_or_url_change_listener)
browser.tabs.onUpdated.addListener(tab_or_url_change_listener)