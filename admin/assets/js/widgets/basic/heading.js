let tag = settings['heading_content_tag'];
let url = settings['heading_content_link'].trim();

print(`<${tag} class="foxybdr-title">`);

    if (url.length > 0)
    {
        print(`<a href="${esc_url(url)}"`);

        if (settings['heading_content_link-new-window'] === 'yes')
            print(` target="_blank"`);

        if (settings['heading_content_link-no-follow'] === 'yes')
            print(` rel="nofollow"`);

        print(`>`);
    }

        printEscape(settings['heading_content_title']);

    if (url.length > 0)
    {
        print(`</a>`);
    }

print(`</${tag}>`);
