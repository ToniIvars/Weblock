document.addEventListener('DOMContentLoaded', function() {
    const domain_input = document.getElementById('domain')
    const domain_list = document.getElementById('domains')

    const domain_template = `<div class="list-item" data-domain="{domain}">
    <p class="domain-name">{domain}</p>
    <button class="delete-btn" data-domain="{domain}">Delete</button>
    </div>`

    const password_template = document.getElementById('password-template')
    const password_input = document.getElementById('password')

    function display_domain(domain) {
        domain_list.insertAdjacentHTML('beforeend', domain_template.replaceAll('{domain}', domain))
    }

    browser.storage.local.get('domains')
    .then(store => {
        if (Object.keys(store).length === 0) {
            browser.storage.local.set({
                domains: []
            })
        } else {
            let data = store['domains']
            data.forEach(domain => display_domain(domain))

            document.querySelectorAll('.delete-btn').forEach(el => {
                let domain = el.getAttribute('data-domain')
                el.onclick = () => delete_domain(domain)
            })
        }
    })

    browser.storage.local.get('password')
    .then(store => {
        if (Object.keys(store).length !== 0) {
            document.getElementById('password-label').innerHTML = 'Password to continue:'
        }

        password_template.classList.remove('hidden')
    })

    function set_password() {
        fetch(`https://api.hashify.net/hash/md5/hex?value=${password_input.value}`)
        .then(response => response.json())
        .then(data => {
            browser.storage.local.set({
                password: data.Digest
            })
        })

        password_template.classList.add('hidden')  
        password_input.value = ''
    }

    function check_password() {
        fetch(`https://api.hashify.net/hash/md5/hex?value=${password_input.value}`)
        .then(response => response.json())
        .then(data => {
            browser.storage.local.get('password').then(store => {
                let password_hash = store['password']
                if (data.Digest === password_hash) {
                    password_template.classList.add('hidden')  
                }

                password_input.value = ''
            })
        })

        password_input.value = ''
    }

    function password_callback() {
        browser.storage.local.get('password')
        .then(store => {
            if (Object.keys(store).length === 0) {
                set_password()
            } else {
                check_password()
            }
        })
    }

    document.getElementById('confirm-password').onclick = () => password_callback()

    function add_new_domains(new_domains) {
        browser.storage.local.get('domains')
        .then(store => {
            let data = store['domains']
            for (const domain of new_domains) {
                data.push(domain)                
            }

            browser.storage.local.set({
                domains: data
            })
        })

        for (const domain of new_domains) {
            domain_list.insertAdjacentHTML('beforeend', domain_template.replaceAll('{domain}', domain))                
        }

        domain_input.value = ''

        document.querySelectorAll('.delete-btn').forEach(el => {
            let domain = el.getAttribute('data-domain')
            el.onclick = () => delete_domain(domain)
        })
    }

    document.getElementById('add-domain').onclick = () => {
        let textarea_domains = domain_input.value.split('\n')

        browser.storage.local.get('domains').then(store => {
            let data = store['domains']
            
            textarea_domains = textarea_domains.filter(e => !data.includes(e))
            add_new_domains(textarea_domains)
        })
    }

    function delete_domain(domain) {
        document.querySelectorAll('.list-item').forEach(el => {
            if (el.getAttribute('data-domain') === domain) {
                domain_list.removeChild(el)

                browser.storage.local.get('domains').then(store => {
                    let data = store['domains']
                    data = data.filter(e => e !== domain)

                    browser.storage.local.set({
                        domains: data
                    })
                })
            }
        })
    }
})