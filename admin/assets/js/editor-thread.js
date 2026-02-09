
self.addEventListener('message',
    function(e)
    {
        let response = FOXY_APP_MAIN.processRequest(e.data);

        if (response !== undefined)
        {
            self.postMessage(response);
        }
    }
);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var FoxyApp = {};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Function = {};

FoxyApp.Function.evaluateValue = function(sparseValue, settingParams)
{
    if (settingParams.responsive)
    {
        let controlDefaultValue = FoxyApp.Model.controlDefaultValues[settingParams.type];

        let resp = {
            desktop: controlDefaultValue,
            tablet: controlDefaultValue,
            mobile: controlDefaultValue
        };

        if (sparseValue !== undefined)
        {
            if (sparseValue.mobile !== undefined)
                resp.mobile = sparseValue.mobile;

            if (sparseValue.tablet !== undefined)
                resp.tablet = sparseValue.tablet;
        }

        if (sparseValue !== undefined && sparseValue.desktop !== undefined)
            resp.desktop = sparseValue.desktop;
        else if (settingParams.default !== undefined)
            resp.desktop = settingParams.default;

        return resp;
    }
    else
    {
        let finalValue = FoxyApp.Model.controlDefaultValues[settingParams.type];

        if (sparseValue !== undefined)
            finalValue = sparseValue;
        else if (settingParams.default !== undefined)
            finalValue = settingParams.default;

        return { desktop: finalValue };
    }
}

FoxyApp.Function.evaluateGlobal = function(value, type)
{
    if ([ 'COLOR', 'FONT' ].includes(type) === false)
        return value;

    let settingName;

    switch (type)
    {
        case 'COLOR':
            {
                let match = /var\(--foxybdr-global-color-(\d+)\)/.exec(value);

                if (match !== null)
                {
                    settingName = `colors_global_${match[1]}`;
                }
            }
            break;

        case 'FONT':
            {
                if (value.group === '.')
                {
                    settingName = `fonts_global_${value.id}`;
                }
            }
            break;
    }

    if (settingName === undefined)
        return value;

    let widgetInstance = FoxyApp.Model.widgetInstances['S-siteSettings'];

    let newValue = widgetInstance.data.sparseSettings[settingName];

    if (newValue !== undefined)
        return newValue;

    let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];

    return widget.settings[settingName].default;
}

FoxyApp.Function.evaluateCondition = function(condition, sparseSettings, wSettings, disabledSettingNames)
{
    let result = true;

    for (let key in condition)
    {
        let not = key.endsWith('!');
        let varName = not ? key.substring(0, key.length - 1) : key;
        let parts = varName.split('.');
        let settingName = parts[0];
        let fieldName = parts.length >= 2 ? parts[1].toLowerCase() : null;

        if (disabledSettingNames !== undefined && disabledSettingNames.includes(settingName))
            return false;

        if (wSettings[settingName].condition !== undefined)
        {
            if (FoxyApp.Function.evaluateCondition(wSettings[settingName].condition, sparseSettings, wSettings, disabledSettingNames) === false)
                return false;
        }

        let compareValue = condition[key];
        let value = FoxyApp.Function.evaluateValue(sparseSettings[settingName], wSettings[settingName]).desktop;
        if (fieldName !== null)
        {
            value = fieldName === 'value' && value[fieldName] === undefined ? value : value[fieldName];
        }

        let termResult;

        if (typeof compareValue === 'string')
        {
            termResult = compareValue === String(value);
        }
        else if (compareValue instanceof Array)
        {
            termResult = compareValue.includes(String(value));
        }

        if (not)
            termResult = !termResult;

        result = result && termResult;
    }

    return result;
}

FoxyApp.Function.isValueEqual = function(firstObject, secondObject)
{
    if (firstObject === null && secondObject !== null || firstObject !== null && secondObject === null)
        return false;

    if (firstObject === null && secondObject === null)
        return true;

    let firstType  = typeof firstObject;
    let secondType = typeof secondObject;

    if (firstType !== secondType)
        return false;

    if (firstType !== 'object')
        return firstObject === secondObject;

    let keys = Object.keys(firstObject);

    if (keys.length !== Object.keys(secondObject).length)
        return false;

    for (let key of keys)
    {
        if (secondObject[key] === undefined)
            return false;

        if (FoxyApp.Function.isValueEqual(firstObject[key], secondObject[key]) === false)
            return false;
    }

    return true;
}

FoxyApp.Function.getImageUrl = function(id, fullSizeUrl, size)
{
    let idStr = String(id);

    let imageUrls = FoxyApp.Cache.Image.Url.cache[idStr];

    if (imageUrls === undefined)
    {
        FoxyApp.Cache.Image.Url.faults.push(id);
        return fullSizeUrl;
    }

    if (imageUrls[size] === undefined)
        return fullSizeUrl;

    return imageUrls[size];
}

FoxyApp.Function.escapeHtml = function(unsafe)
{
    return unsafe
        .replaceAll("&", '&amp;')
        .replaceAll("<", '&lt;')
        .replaceAll(">", '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#x27;')
        .replaceAll("`", '&#x60;');
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class = {};

FoxyApp.Class.Renderer = class
{
    buildSettings(wInstanceID, context, sparseSettings, widgetSettings)
    {
        let contextualSparseSettings = this.#applyContextToSettings(wInstanceID, context, sparseSettings);

        let eSettings = this.#evaluateSettings(contextualSparseSettings, widgetSettings);

        return eSettings;
    }

    #applyContextToSettings(wInstanceID, context, sparseSettings)
    {
        // TODO: Apply loop context and component context to sparse settings from widget instance.
        // sparseSettings must not be modified. If modification of setting values is necessary, return a new cloned copy of sparseSettings.

        return sparseSettings;
    }

    #evaluateSettings(sparseSettings, wSettings, settingNamePrefix)
    {
        let eSettings = {};

        for (let settingName in wSettings)
        {
            let settingParams = wSettings[settingName];

            switch (settingParams.type)
            {
                case 'GROUP':
                    {
                        let newSparseSettings = sparseSettings[settingName];
                        if (newSparseSettings === undefined)
                            newSparseSettings = settingParams.default;
                        if (newSparseSettings === undefined)
                            newSparseSettings = FoxyApp.Model.controlDefaultValues[settingParams.type];

                        let groupControl = FoxyApp.Model.groupControls[settingParams.sub_type];

                        let subSettings = this.#evaluateSettings(newSparseSettings, groupControl.settings, `${settingName}_`);

                        Object.assign(eSettings, subSettings);
                    }
                    break;

                case 'REPEATER':
                    {
                        let repeaterArr = sparseSettings[settingName];
                        if (repeaterArr === undefined)
                            repeaterArr = settingParams.default;
                        if (repeaterArr === undefined)
                            repeaterArr = FoxyApp.Model.controlDefaultValues[settingParams.type];

                        let result = [];
                        for (let item of repeaterArr)
                        {
                            let eItem = this.#evaluateSettings(item, settingParams.fields.settings);
                            result.push(eItem);
                        }

                        eSettings[settingName] = result;
                    }
                    break;

                default:
                    {
                        let prefix = settingNamePrefix !== undefined ? settingNamePrefix : '';

                        let resp = FoxyApp.Function.evaluateValue(sparseSettings[settingName], settingParams);

                        eSettings[`${prefix}${settingName}`] = FoxyApp.Function.evaluateGlobal(resp.desktop, settingParams.type);

                        if (resp.tablet !== undefined)
                            eSettings[`${prefix}${settingName}_tablet`] = FoxyApp.Function.evaluateGlobal(resp.tablet, settingParams.type);

                        if (resp.mobile !== undefined)
                            eSettings[`${prefix}${settingName}_mobile`] = FoxyApp.Function.evaluateGlobal(resp.mobile, settingParams.type);
                    }
                    break;
            }
        }

        return eSettings;
    }
};

FoxyApp.Class.StylesheetGenerator = class
{
    #stylesheet = {};
    #varRegex = /{{([^}]*)}}/g;

    build(wInstanceID)
    {
        let widgetInstance = FoxyApp.Model.widgetInstances[wInstanceID];

        if (widgetInstance === undefined || widgetInstance.data.widgetType !== 0)
            return '';

        this.#stylesheet = { desktop: {}, tablet: {}, mobile: {} };

        let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];

        let disabledSettingNames = this.#applySectionConditions(widgetInstance.data.sparseSettings, widget);

        let selectorVariables = {
            'WIDGET': `.foxybdr-widget[foxybdr-instance-id="${wInstanceID}"]`,
            'WRAPPER': `.foxybdr-widget[foxybdr-instance-id="${wInstanceID}"] > .foxybdr-widget-container`
        };

        this.#evaluateSettings(widgetInstance.data.sparseSettings, widget.settings, selectorVariables, disabledSettingNames);

        let stylesheetStr = this.#buildStylesheetStr();

        this.#stylesheet = {};

        return stylesheetStr;
    }

    #evaluateSettings(sparseSettings, wSettings, selectorVariables, disabledSettingNames)
    {
        for (let settingName in wSettings)
        {
            let settingParams = wSettings[settingName];

            if (disabledSettingNames !== undefined && disabledSettingNames.includes(settingName))
                continue;

            if (settingParams.condition !== undefined)
            {
                if (FoxyApp.Function.evaluateCondition(settingParams.condition, sparseSettings, wSettings, disabledSettingNames) === false)
                    continue;
            }

            switch (settingParams.type)
            {
                case 'GROUP':
                    {
                        if (settingParams.selector === undefined)
                            continue;

                        let eSelector = settingParams.selector;
                        for (let v in selectorVariables)
                            eSelector = eSelector.replaceAll(`{{${v}}}`, selectorVariables[v]);

                        let items = [];
                        for (let item of eSelector.split(','))
                            items.push(item.trim() + ':hover');
                        let eHoverSelector = items.join(', ');

                        let newSelectorVariables = {
                            ...selectorVariables,
                            'SELECTOR': eSelector,
                            'SELECTOR_HOVER': eHoverSelector
                        };

                        let newSparseSettings = sparseSettings[settingName];
                        if (newSparseSettings === undefined)
                            newSparseSettings = settingParams.default;
                        if (newSparseSettings === undefined)
                            newSparseSettings = FoxyApp.Model.controlDefaultValues[settingParams.type];

                        let groupControl = FoxyApp.Model.groupControls[settingParams.sub_type];

                        this.#evaluateSettings(newSparseSettings, groupControl.settings, newSelectorVariables);
                    }
                    break;

                case 'REPEATER':
                    {
                        let repeaterArr = sparseSettings[settingName];
                        if (repeaterArr === undefined)
                            repeaterArr = settingParams.default;
                        if (repeaterArr === undefined)
                            repeaterArr = FoxyApp.Model.controlDefaultValues[settingParams.type];

                        for (let item of repeaterArr)
                        {
                            this.#evaluateSettings(item, settingParams.fields.settings, selectorVariables);
                        }
                    }
                    break;

                default:
                    {
                        if (settingParams.selectors === undefined && settingParams.selector_value === undefined)
                            continue;

                        let selectorList;
                        if (settingParams.selectors !== undefined)
                        {
                            selectorList = settingParams.selectors;
                        }
                        else if (settingParams.selector_value !== undefined)
                        {
                            selectorList = {
                                '{{SELECTOR}}': settingParams.selector_value
                            };
                        }

                        let currentResponsiveValue = FoxyApp.Function.evaluateValue(sparseSettings[settingName], settingParams);

                        let selectorData = [];

                        for (let selector in selectorList)
                        {
                            let eSelector = selector;
                            for (let v in selectorVariables)
                                eSelector = eSelector.replaceAll(`{{${v}}}`, selectorVariables[v]);

                            let selectorValue = selectorList[selector];

                            let variables = {};
                            let match;
                            while ((match = this.#varRegex.exec(selectorValue)) !== null)
                                variables[match[1]] = this.#getVariableValue(match[1], currentResponsiveValue, sparseSettings, wSettings, disabledSettingNames);

                            selectorData.push({
                                selector: eSelector,
                                selectorValue: selectorValue,
                                variables: variables
                            });
                        }

                        for (let device of [ 'desktop', 'tablet', 'mobile' ])
                        {
                            if (currentResponsiveValue[device] === undefined || FoxyApp.Function.isValueEqual(currentResponsiveValue[device], FoxyApp.Model.controlDefaultValues[settingParams.type]))
                                continue;

                            for (let sd of selectorData)
                            {
                                let selectorValue = `${sd.selectorValue}`;  // clone string

                                let valid = true;

                                for (let varName in sd.variables)
                                {
                                    let value = sd.variables[varName][device];

                                    if (value === undefined || value === '')
                                    {
                                        valid = false;
                                        break;
                                    }
                                    else
                                    {
                                        selectorValue = selectorValue.replaceAll(`{{${varName}}}`, String(value));
                                    }
                                }

                                if (valid)
                                {
                                    if (this.#stylesheet[device][sd.selector] === undefined)
                                        this.#stylesheet[device][sd.selector] = {};

                                    let cssProperties = this.#buildCssPropertiesFromString(selectorValue);

                                    for (let cssProperty in cssProperties)
                                    {
                                        this.#stylesheet[device][sd.selector][cssProperty] = cssProperties[cssProperty];
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
        }
    }

    #getVariableValue(varName, currentResponsiveValue, sparseSettings, wSettings, disabledSettingNames)
    {
        if (varName.startsWith('|'))
        {
            return this.#executeVariableFunction(varName, currentResponsiveValue, sparseSettings, wSettings, disabledSettingNames);
        }

        let responsiveValue;
        let fieldName;

        let parts = varName.split('.');

        if (parts.length === 1)
        {
            responsiveValue = currentResponsiveValue;
            fieldName = parts[0].toLowerCase();
        }
        else if (parts.length >= 2)
        {
            fieldName = parts[1].toLowerCase();

            let settingName = parts[0];

            if (wSettings[settingName] === undefined)
                return {};

            if (disabledSettingNames !== undefined && disabledSettingNames.includes(settingName))
                return {};

            if (wSettings[settingName].condition !== undefined)
            {
                if (FoxyApp.Function.evaluateCondition(wSettings[settingName].condition, sparseSettings, wSettings, disabledSettingNames) === false)
                    return {};
            }

            responsiveValue = FoxyApp.Function.evaluateValue(sparseSettings[settingName], wSettings[settingName]);
        }

        let newValue = {};

        for (let device of [ 'desktop', 'tablet', 'mobile' ])
        {
            if (responsiveValue[device] !== undefined)
            {
                newValue[device] = fieldName === 'value' && responsiveValue[device][fieldName] === undefined ? responsiveValue[device] : responsiveValue[device][fieldName];
            }
        }

        return newValue;
    }

    #executeVariableFunction(functionCallStr, currentResponsiveValue, sparseSettings, wSettings, disabledSettingNames)
    {
        let items = functionCallStr.split('|');

        items.shift();

        let functionName = items.shift();

        let varValues = [];

        for (let varName of items)
        {
            let value = this.#getVariableValue(varName, currentResponsiveValue, sparseSettings, wSettings, disabledSettingNames);

            varValues.push(value);
        }

        let newValue = {};

        for (let device of [ 'desktop', 'tablet', 'mobile' ])
        {
            let v = [];

            for (let varValue of varValues)
            {
                if (varValue[device] === undefined)
                    continue;

                v.push(varValue[device]);
            }

            if (v.length !== varValues.length)
                continue;

            switch (functionName)
            {
                case 'image-url':
                    {
                        if (v.length === 3)
                        {
                            let url = FoxyApp.Function.getImageUrl(Number(v[0]), String(v[1]), String(v[2]));

                            newValue[device] = url.replaceAll('"', '%22');
                        }
                    }
                    break;
            }
        }

        return newValue;
    }

    #buildCssPropertiesFromString(str)
    {
        let result = {};

        let segments = str.split(';');

        for (let segment of segments)
        {
            let colonIndex = segment.indexOf(':');

            if (colonIndex < 0)
                continue;

            let cssProperty = segment.substring(0, colonIndex).trim();
            let cssValue = segment.substring(colonIndex + 1).trim();

            result[cssProperty] = cssValue;
        }

        return result;
    }

    #applySectionConditions(sparseSettings, widget)
    {
        let disabledSettingNames = [];

        for (let tab of widget.tabs)
        {
            for (let section of tab.sections)
            {
                if (section.condition === undefined)
                    continue;

                if (FoxyApp.Function.evaluateCondition(section.condition, sparseSettings, widget.settings) === true)
                    continue;

                for (let item of section.settings)
                {
                    if (item.type === 'setting')
                    {
                        disabledSettingNames.push(item.name);
                    }
                }
            }
        }

        return disabledSettingNames;
    }

    #buildStylesheetStr()
    {
        let widgetInstance = FoxyApp.Model.widgetInstances['S-siteSettings'];
        let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];

        let tabletValue = widgetInstance.data.sparseSettings['breakpoints_tablet'];
        if (tabletValue === undefined || tabletValue === '')
            tabletValue = widget.settings['breakpoints_tablet'].default;

        let mobileValue = widgetInstance.data.sparseSettings['breakpoints_mobile'];
        if (mobileValue === undefined || mobileValue === '')
            mobileValue = widget.settings['breakpoints_mobile'].default;

        let lines = [];
        
        for (let device of [ 'desktop', 'tablet', 'mobile' ])
        {
            let deviceBody = this.#stylesheet[device];

            if (Object.keys(deviceBody).length === 0)
                continue;

            switch (device)
            {
                case 'tablet':
                    lines.push(`@media(max-width:${tabletValue}px){`);
                    break;

                case 'mobile':
                    lines.push(`@media(max-width:${mobileValue}px){`);
                    break;
            }

            for (let selector in deviceBody)
            {
                lines.push(selector + '{');

                for (let cssProperty in deviceBody[selector])
                {
                    let cssValue = deviceBody[selector][cssProperty];
                    lines.push(cssProperty + ':' + cssValue + ';');
                }

                lines.push('}');
            }

            if (device === 'tablet' || device === 'mobile')
                lines.push('}');
        }

        return lines.join('');
    }
};

FoxyApp.Class.AssetFinder = class
{
    #seekGeneralFonts = false;
    #seekGoogleFonts = false;
    #seekIconLibraries = false;

    #generalFonts = {};
    #googleFonts = {};
    #iconLibraries = {};

    enableGeneralFonts(enable)
    {
        this.#seekGeneralFonts = enable;
    }

    enableGoogleFonts(enable)
    {
        this.#seekGoogleFonts = enable;
    }

    enableIconLibraries(enable)
    {
        this.#seekIconLibraries = enable;
    }

    find()
    {
        for (let wInstanceID in FoxyApp.Model.widgetInstances)
        {
            let widgetInstance = FoxyApp.Model.widgetInstances[wInstanceID];

            if (widgetInstance.data.widgetType !== 0)
                return;
    
            let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];
    
            this.#evaluateSettings(widgetInstance.data.sparseSettings, widget.settings);
        }
    }

    getGeneralFonts()
    {
        let generalFonts = [];

        for (let key in this.#generalFonts)
        {
            let items = key.split('/');

            generalFonts.push({
                group: items[0],
                id: items[1]
            });
        }

        return generalFonts;
    }

    getGoogleFonts()
    {
        return Object.keys(this.#googleFonts);
    }

    getIconLibraries()
    {
        for (let library in this.#iconLibraries)
        {
        }
    }

    #evaluateSettings(sparseSettings, wSettings)
    {
        for (let settingName in wSettings)
        {
            let settingParams = wSettings[settingName];

            switch (settingParams.type)
            {
                case 'GROUP':
                    {
                        let newSparseSettings = sparseSettings[settingName];
                        if (newSparseSettings === undefined)
                            newSparseSettings = settingParams.default;
                        if (newSparseSettings === undefined)
                            newSparseSettings = FoxyApp.Model.controlDefaultValues[settingParams.type];

                        let groupControl = FoxyApp.Model.groupControls[settingParams.sub_type];

                        this.#evaluateSettings(newSparseSettings, groupControl.settings);
                    }
                    break;

                case 'REPEATER':
                    {
                        let repeaterArr = sparseSettings[settingName];
                        if (repeaterArr === undefined)
                            repeaterArr = settingParams.default;
                        if (repeaterArr === undefined)
                            repeaterArr = FoxyApp.Model.controlDefaultValues[settingParams.type];

                        for (let item of repeaterArr)
                        {
                            this.#evaluateSettings(item, settingParams.fields.settings);
                        }
                    }
                    break;

                default:
                    {
                        if ((this.#seekGeneralFonts || this.#seekGoogleFonts) && settingParams.type === 'FONT' ||
                            this.#seekIconLibraries && settingParams.type === 'ICONS')
                        {
                            let resp = FoxyApp.Function.evaluateValue(sparseSettings[settingName], settingParams);

                            this.#evaluateValue(resp.desktop, settingParams.type);

                            if (resp.tablet !== undefined)
                            {
                                this.#evaluateValue(resp.tablet, settingParams.type);
                            }

                            if (resp.mobile !== undefined)
                            {
                                this.#evaluateValue(resp.mobile, settingParams.type);
                            }
                        }
                    }
                    break;
            }
        }
    }

    #evaluateValue(value, type)
    {
        switch (type)
        {
            case 'FONT':
                if (this.#seekGeneralFonts && value.group !== 'google' && value.group !== '' && value.group !== '.')
                    this.#generalFonts[`${value.group}/${value.id}`] = 1;
                else if (this.#seekGoogleFonts && value.group === 'google')
                    this.#googleFonts[value.id] = 1;
                break;

            case 'ICONS':
                break;
        }
    }
};

FoxyApp.Class.GlobalDependencyFinder = class
{
    #controlType = '';
    #varValue = '';
    #wInstanceIDs = [];

    #regexColors = /colors_global_(\d+)/;
    #regexFonts = /fonts_global_(\d+)/;

    find(settingName)
    {
        let widgetInstance = FoxyApp.Model.widgetInstances['S-siteSettings'];
        let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];
        let controlType = widget.settings[settingName].type;

        let varValue;

        let match = this.#regexColors.exec(settingName);
        if (match !== null)
            varValue = `var(--foxybdr-global-color-${match[1]})`;

        match = this.#regexFonts.exec(settingName);
        if (match !== null)
            varValue = `var(--foxybdr-global-font-${match[1]})`;

        if (varValue === undefined)
            return;

        this.#controlType = controlType;
        this.#varValue = varValue;

        for (let wInstanceID in FoxyApp.Model.widgetInstances)
        {
            if (wInstanceID === 'S-siteSettings')
                continue;

            let widgetInstance = FoxyApp.Model.widgetInstances[wInstanceID];

            if (widgetInstance.data.widgetType !== 0)
                continue;

            let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];

            let hasDependency = this.#evaluateSettings(widgetInstance.data.sparseSettings, widget.settings);

            if (hasDependency)
                this.#wInstanceIDs.push(wInstanceID);
        }
    }

    getInstanceIDs()
    {
        return this.#wInstanceIDs;
    }

    #evaluateSettings(sparseSettings, wSettings)
    {
        for (let settingName in wSettings)
        {
            let settingParams = wSettings[settingName];

            switch (settingParams.type)
            {
                case 'GROUP':
                    {
                        let newSparseSettings = sparseSettings[settingName];
                        if (newSparseSettings === undefined)
                            newSparseSettings = settingParams.default;
                        if (newSparseSettings === undefined)
                            newSparseSettings = FoxyApp.Model.controlDefaultValues[settingParams.type];

                        let groupControl = FoxyApp.Model.groupControls[settingParams.sub_type];

                        if (this.#evaluateSettings(newSparseSettings, groupControl.settings) === true)
                            return true;
                    }
                    break;

                case 'REPEATER':
                    {
                        let repeaterArr = sparseSettings[settingName];
                        if (repeaterArr === undefined)
                            repeaterArr = settingParams.default;
                        if (repeaterArr === undefined)
                            repeaterArr = FoxyApp.Model.controlDefaultValues[settingParams.type];

                        for (let item of repeaterArr)
                        {
                            if (this.#evaluateSettings(item, settingParams.fields.settings) === true)
                                return true;
                        }
                    }
                    break;

                default:
                    {
                        if (settingParams.type === this.#controlType)
                        {
                            let resp = FoxyApp.Function.evaluateValue(sparseSettings[settingName], settingParams);

                            if (this.#isReferencing(resp.desktop) === true)
                                return true;

                            if (resp.tablet !== undefined)
                            {
                                if (this.#isReferencing(resp.tablet) === true)
                                    return true;
                            }

                            if (resp.mobile !== undefined)
                            {
                                if (this.#isReferencing(resp.mobile) === true)
                                    return true;
                            }
                        }
                    }
                    break;
            }
        }

        return false;
    }

    #isReferencing(value)
    {
        switch (this.#controlType)
        {
            case 'COLOR':
                return value === this.#varValue;
                break;

            case 'FONT':
                return value.value === this.#varValue;
                break;
        }

        return false;
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// "GLOBAL" OBJECTS AND VARIABLES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Cache = {};
FoxyApp.Cache.Image = {};
FoxyApp.Cache.Image.Url = {
    cache: {},
    faults: []
};

FoxyApp.Model = {};
FoxyApp.Model.controlDefaultValues = {};
FoxyApp.Model.groupControls = {};
FoxyApp.Model.widgets = {};
FoxyApp.Model.widgetInstances = {};

FoxyApp.renderer = null;
FoxyApp.stylesheetGenerator = null;

FoxyApp.pluginUrl = '';


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Main = class
{
    processRequest(request)
    {
        switch (request.type)
        {
            case 'init':
                this.#init(request.pluginUrl, request.controlDefaultValues, request.groupControls, request.widgets);
                break;

            case 'widget-instances':
                this.#setWidgetInstances(request.widgetInstances);
                return { status: 'OK' };
                break;

            case 'update-widget-instance':
                this.#updateWidgetInstance(request.wInstanceID, request.settingName, request.settingValue);
                return { status: 'OK' };
                break;

            case 'render':
                return this.#render(request.wInstanceID, request.context);
                break;

            case 'build-stylesheet':
                return this.#buildStylesheet(request.wInstanceID);
                break;

            case 'cache-image-urls':
                this.#cacheImageUrls(request.id, request.imageUrls);
                return { status: 'OK' };
                break;

            case 'find-google-fonts':
                let fontIds = this.#findGoogleFonts();
                return { fontIds: fontIds };
                break;

            case 'find-global-dependencies':
                let wInstanceIDs = this.#findGlobalDependencies(request.settingName);
                return { wInstanceIDs: wInstanceIDs };
                break;
        }
    }

    #init(pluginUrl, controlDefaultValues, groupControls, widgets)
    {
        FoxyApp.pluginUrl = pluginUrl;

        FoxyApp.Model.controlDefaultValues = controlDefaultValues;
        FoxyApp.Model.groupControls = groupControls;
        FoxyApp.Model.widgets = widgets;

        FoxyApp.renderer = new FoxyApp.Class.Renderer();
        FoxyApp.stylesheetGenerator = new FoxyApp.Class.StylesheetGenerator();
    }

    #setWidgetInstances(widgetInstances)
    {
        FoxyApp.Model.widgetInstances = widgetInstances;
    }

    #updateWidgetInstance(wInstanceID, settingName, settingValue)
    {
        let widgetInstance = FoxyApp.Model.widgetInstances[wInstanceID];

        if (widgetInstance === undefined)
            return;

        let sparseSettings = widgetInstance.data.sparseSettings;

        if (settingValue !== null)
        {
            sparseSettings[settingName] = settingValue;
        }
        else if (sparseSettings[settingName] !== undefined)
        {
            delete sparseSettings[settingName];
        }
    }

    #render(wInstanceID, context)
    {
        let result = {
            renderHTML: '',
            imageUrlFaults: []
        }

        let widgetInstance = FoxyApp.Model.widgetInstances[wInstanceID];

        if (widgetInstance === undefined)
            return result;

        switch (widgetInstance.data.widgetType)
        {
            case 0:  // widget
                {
                    let widgetID = widgetInstance.data.widgetID;
                    let widget = FoxyApp.Model.widgets[widgetID];

                    if (widget === undefined)
                        return result;

                    let eSettings = FoxyApp.renderer.buildSettings(wInstanceID, context, widgetInstance.data.sparseSettings, widget.settings);

                    FoxyApp.Cache.Image.Url.faults = [];

                    let renderFunction = FoxyRender.renderFunctions[widgetID];
                    let renderHTML = renderFunction !== undefined ? renderFunction(wInstanceID, eSettings) : '';

                    return {
                        renderHTML: renderHTML,
                        imageUrlFaults: FoxyApp.Cache.Image.Url.faults
                    };
                }
                break;

            case 1:  // component
                return result;
                break;
        }
    }

    #buildStylesheet(wInstanceID)
    {
        FoxyApp.Cache.Image.Url.faults = [];

        let stylesheetStr = FoxyApp.stylesheetGenerator.build(wInstanceID);

        return {
            stylesheetStr: stylesheetStr,
            imageUrlFaults: FoxyApp.Cache.Image.Url.faults
        };
    }

    #cacheImageUrls(id, imageUrls)
    {
        FoxyApp.Cache.Image.Url.cache[String(id)] = imageUrls;
    }

    #findGoogleFonts()
    {
        let assetFinder = new FoxyApp.Class.AssetFinder();
        assetFinder.enableGoogleFonts(true);
        assetFinder.find();
        return assetFinder.getGoogleFonts();
    }

    #findGlobalDependencies(settingName)
    {
        let depFinder = new FoxyApp.Class.GlobalDependencyFinder();

        depFinder.find(settingName);

        return depFinder.getInstanceIDs();
    }
};

var FOXY_APP_MAIN = new FoxyApp.Main();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RENDER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var FoxyRender = {};

FoxyRender.Printer = class
{
    static textSegments = [];

    static clear()
    {
        FoxyRender.Printer.textSegments = [];
    }

    static write(textSegment)
    {
        FoxyRender.Printer.textSegments.push(textSegment);
    }

    static writeEscape(text)
    {
        FoxyRender.Printer.textSegments.push(FoxyApp.Function.escapeHtml(text));
    }

    static getOutput()
    {
        return FoxyRender.Printer.textSegments.join("\n");
    }
};

FoxyRender.renderFunctions = {};

