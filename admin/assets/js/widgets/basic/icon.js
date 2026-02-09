let linkUrl = settings['icon_link_link'].trim();

if (linkUrl.length > 0)
{
    print(`<a href="${esc_url(linkUrl)}"`);

    if (settings['icon_link_new-window'] === 'yes')
        print(` target="_blank"`);

    if (settings['icon_link_no-follow'] === 'yes')
        print(` rel="nofollow"`);

}
else
{
    print(`<div`);
}

print(` class="foxybdr-icon">`);

    print(`<i class="${esc_attr(settings['icon_content_icon']['value'])}"></i>`);

if (linkUrl.length > 0)
{
    print(`</a>`);
}
else
{
    print(`</div>`);
}
