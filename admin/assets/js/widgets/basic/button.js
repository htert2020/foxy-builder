let iconClassName = settings['button_content_icon']['value'];

let linkUrl = settings['button_link_link'].trim();

print(`<a`);

if (linkUrl.length > 0)
{
    print(` href="${esc_url(linkUrl)}"`);

    if (settings['button_link_new-window'] === 'yes')
        print(` target="_blank"`);

    if (settings['button_link_no-follow'] === 'yes')
        print(` rel="nofollow"`);

}

print(` class="foxybdr-button">`);

    print(`<div></div>`);

    print(`<span>`);

        if (iconClassName !== '')
        {
            print(`<i class="${esc_attr(iconClassName)}"></i>`);
        }

        print(`<span>${esc_html(settings['button_content_text'])}</span>`);

    print(`</span>`);

print(`</a>`);
