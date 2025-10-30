var FoxyBuilder_IncludesTable = {};

FoxyBuilder_IncludesTable.onLoad = function(e)
{
    let pagingInputElements = document.querySelectorAll('.foxybdr-paging-input');

    for (let i = 0; i < pagingInputElements.length; i++)
    {
        let pagingInputElement = pagingInputElements[i];

        pagingInputElement.addEventListener('blur', FoxyBuilder_IncludesTable.Paging.onInputBlurred);
        pagingInputElement.addEventListener('keypress', FoxyBuilder_IncludesTable.Paging.onInputKeyPress);

        FoxyBuilder_IncludesTable.Paging.originalPageNumber = Number(pagingInputElement.value);
    }
}

FoxyBuilder_IncludesTable.Paging = {};

FoxyBuilder_IncludesTable.Paging.originalPageNumber = null;

FoxyBuilder_IncludesTable.Paging.onInputBlurred = function(e)
{
    let pageNumber = Number(e.currentTarget.value);
    pageNumber = !isNaN(pageNumber) ? Math.floor(pageNumber) : pageNumber;

    let maxPageNumber = Number(e.currentTarget.closest('.foxybdr-paging-page').querySelector('.foxybdr-paging-max').innerText);

    if (pageNumber === FoxyBuilder_IncludesTable.Paging.originalPageNumber)
    {
        e.currentTarget.value = String(pageNumber);
        return;
    }

    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > maxPageNumber)
    {
        e.currentTarget.value = String(FoxyBuilder_IncludesTable.Paging.originalPageNumber);

        return;
    }

    let urlParamsJsonStr = document.querySelector("input[name='foxybdr-url-params']").value;

    let urlParams = JSON.parse(urlParamsJsonStr);
    urlParams['foxybdr_page_num'] = String(pageNumber);

    let argList = [];
    for (let key of Object.keys(urlParams))
    {
        let _key = encodeURIComponent(key);
        let _value = encodeURIComponent(String(urlParams[key]));
        argList.push(`${_key}=${_value}`);
    }

    let encodedUrlParams = argList.join('&');
    let baseUrl = document.querySelector("input[name='foxybdr-base-url']").value;
    let finalUrl = baseUrl + '?' + encodedUrlParams;

    window.location.href = finalUrl;
}

FoxyBuilder_IncludesTable.Paging.onInputKeyPress = function(e)
{
    if (e.key === 'Enter')
    {
        e.currentTarget.blur();
    }
}

window.addEventListener('load', FoxyBuilder_IncludesTable.onLoad);
