
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

    #evaluateSettings(sparseSettings, wSettings)
    {
        let eSettings = {};

        for (let settingName in wSettings)
        {
            let settingParams = wSettings[settingName];

            switch (settingParams.type)
            {
                case 'GROUP':
                    break;

                case 'REPEATER':
                    break;

                default:

                    let resp = FoxyApp.Function.evaluateValue(sparseSettings[settingName], settingParams);

                    eSettings[`${settingName}`] = resp.desktop;

                    if (resp.tablet !== undefined)
                        eSettings[`${settingName}_tablet`] = resp.tablet;

                    if (resp.mobile !== undefined)
                        eSettings[`${settingName}_mobile`] = resp.mobile;

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
        let wSettings = this.#applyConditions(widgetInstance.data.sparseSettings, widget);

        let selectorVariables = {
            'WIDGET': `.foxybdr-widget[foxybdr-instance-id="${wInstanceID}"]`,
            'WRAPPER': `.foxybdr-widget[foxybdr-instance-id="${wInstanceID}"] > .foxybdr-widget-container`
        };

        this.#evaluateSettings(widgetInstance.data.sparseSettings, wSettings, selectorVariables);

        let stylesheetStr = this.#buildStylesheetStr();

        this.#stylesheet = {};

        return stylesheetStr;
    }

    #evaluateSettings(sparseSettings, wSettings, selectorVariables)
    {
        for (let settingName in wSettings)
        {
            let settingParams = wSettings[settingName];

            switch (settingParams.type)
            {
                case 'GROUP':

                    if (settingParams.selector === undefined)
                        continue;
                    
                    break;

                case 'REPEATER':
                    break;

                default:

                    if (settingParams.selectors === undefined)
                        continue;

                    let currentResponsiveValue = FoxyApp.Function.evaluateValue(sparseSettings[settingName], settingParams);

                    let selectorData = [];

                    for (let selector in settingParams.selectors)
                    {
                        let eSelector = selector;
                        for (let v in selectorVariables)
                            eSelector = eSelector.replaceAll(`{{${v}}}`, selectorVariables[v]);

                        let selectorValue = settingParams.selectors[selector];

                        let variables = {};
                        let match;
                        while ((match = this.#varRegex.exec(selectorValue)) !== null)
                            variables[match[1]] = this.#getVariableValue(match[1], currentResponsiveValue, sparseSettings, wSettings);

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

                    break;
            }
        }
    }

    #getVariableValue(varName, currentResponsiveValue, sparseSettings, wSettings)
    {
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

            responsiveValue = FoxyApp.Function.evaluateValue(sparseSettings[settingName], wSettings[settingName]);
        }

        let newValue = {};

        for (let device of [ 'desktop', 'tablet', 'mobile' ])
        {
            if (responsiveValue[device] !== undefined)
            {
                newValue[device] = fieldName === 'value' ? responsiveValue[device] : responsiveValue[device][fieldName];
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
            let parts = segment.split(':');

            if (parts.length < 2)
                continue;

            let cssProperty = parts[0].trim();
            let cssValue = parts[1].trim();

            result[cssProperty] = cssValue;
        }

        return result;
    }

    #applyConditions(sparseSettings, widget)
    {
        let result = {};

        // TODO: Return a cloned copy of widget.settings with settings removed according to the condition rules in the widget.

        return widget.settings;
    }

    #buildStylesheetStr()
    {
        let lines = [];
        
        for (let device of [ 'desktop', 'tablet', 'mobile' ])
        {
            let deviceBody = this.#stylesheet[device];

            if (Object.keys(deviceBody).length === 0)
                continue;

            switch (device)
            {
                case 'tablet':
                    lines.push(`@media(max-width:${FoxyApp.Model.responsiveBreakpoints['tablet']}px){`);
                    break;

                case 'mobile':
                    lines.push(`@media(max-width:${FoxyApp.Model.responsiveBreakpoints['mobile']}px){`);
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


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// "GLOBAL" OBJECTS AND VARIABLES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Model = {};
FoxyApp.Model.controlDefaultValues = {};
FoxyApp.Model.widgets = {};
FoxyApp.Model.widgetInstances = {};
FoxyApp.Model.responsiveBreakpoints = {};

FoxyApp.renderer = null;
FoxyApp.stylesheetGenerator = null;


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
                this.#init(request.controlDefaultValues, request.widgets);
                break;

            case 'widget-instances':
                this.#setWidgetInstances(request.widgetInstances);
                return { status: 'OK' };
                break;

            case 'update-widget-instance':
                this.#updateWidgetInstance(request.wInstanceID, request.settingName, request.settingValue);
                return { status: 'OK' };
                break;

            case 'responsive-breakpoints':
                this.#setResponsiveBreakpoints(request.tablet, request.mobile);
                return { status: 'OK' };
                break;

            case 'render':
                let renderHTML = this.#render(request.wInstanceID, request.context);
                return { renderHTML: renderHTML };
                break;

            case 'build-stylesheet':
                let stylesheetStr = this.#buildStylesheet(request.wInstanceID);
                return { stylesheetStr: stylesheetStr };
                break;
        }
    }

    #init(controlDefaultValues, widgets)
    {
        FoxyApp.Model.controlDefaultValues = controlDefaultValues;
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
        let widgetInstance = FoxyApp.Model.widgetInstances[wInstanceID];

        if (widgetInstance === undefined)
            return;

        switch (widgetInstance.data.widgetType)
        {
            case 0:  // widget
                {
                    let widgetID = widgetInstance.data.widgetID;
                    let widget = FoxyApp.Model.widgets[widgetID];

                    if (widget === undefined)
                        return;

                    let eSettings = FoxyApp.renderer.buildSettings(wInstanceID, context, widgetInstance.data.sparseSettings, widget.settings);

                    let renderFunction = FoxyRender.renderFunctions[widgetID];
                    let renderHTML = renderFunction(wInstanceID, eSettings);

                    return renderHTML;
                }
                break;

            case 1:  // component
                return '';
                break;
        }
    }

    #buildStylesheet(wInstanceID)
    {
        return FoxyApp.stylesheetGenerator.build(wInstanceID);
    }

    #setResponsiveBreakpoints(tablet, mobile)
    {
        FoxyApp.Model.responsiveBreakpoints = {
            tablet: tablet,
            mobile: mobile
        };
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

    static getOutput()
    {
        return FoxyRender.Printer.textSegments.join("\n");
    }
};

FoxyRender.renderFunctions = {};

