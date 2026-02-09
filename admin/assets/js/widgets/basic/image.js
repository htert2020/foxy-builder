let displayUrl;

let image = settings['image_content_image'];

if (image.id !== '' && image.url !== '')
{
    displayUrl = FoxyApp.Function.getImageUrl(image.id, image.url, settings['image_content_image-size']);
}
else
{
    displayUrl = FoxyApp.pluginUrl + 'assets/images/default_image.jpg';
}

let linkUrl = null;

switch (settings['image_link_type'])
{
    case '':
        {
            linkUrl = null;
        }
        break;

    case 'full_size_image':
        {
            if (image.url !== '')
                linkUrl = image.url;
        }
        break;

    case 'custom':
        {
            let url = settings['image_link_custom-link'].trim();

            if (url.length > 0)
                linkUrl = url;
        }
        break;
}

if (linkUrl !== null)
{
    print(`<a href="${esc_url(linkUrl)}"`);

    if (settings['image_link_new-window'] === 'yes')
        print(` target="_blank"`);

    if (settings['image_link_no-follow'] === 'yes')
        print(` rel="nofollow"`);

    print(`>`);
}

    print(`<img src="${esc_url(displayUrl)}" />`);

if (linkUrl !== null)
{
    print(`</a>`);
}
