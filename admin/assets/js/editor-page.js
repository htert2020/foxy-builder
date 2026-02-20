var FoxyApp = {};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Function = {};

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

FoxyApp.Function.evaluateValue = function(sparseValue, settingParams)
{
    if (settingParams.responsive)
    {
        let controlDefaultValue = FoxyControls.controlDefaultValues[settingParams.type];

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
        let finalValue = FoxyControls.controlDefaultValues[settingParams.type];

        if (sparseValue !== undefined)
            finalValue = sparseValue;
        else if (settingParams.default !== undefined)
            finalValue = settingParams.default;

        return { desktop: finalValue };
    }
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

FoxyApp.Function.generateWidgetInstanceID = function(domainType, domainID)
{
    if ([ 'T', 'C' ].includes(domainType) === false)
        return null;

    while (true)
    {
        let widStr = String(Math.round(Math.random() * 999999));

        while (widStr.length < 6)
            widStr = '0' + widStr;

        let wInstanceID = `${domainType}-${domainID}-${widStr}`;

        let exists = false;

        if (FoxyApp.Model.widgetInstanceMap[wInstanceID] !== undefined)
        {
            exists = true;
        }
        else
        {
            for (let action of FoxyApp.Manager.modelManager.undoStack.concat(FoxyApp.Manager.modelManager.redoStack))
            {
                if (action.wInstanceID !== null && action.wInstanceID.includes(wInstanceID))
                {
                    exists = true;
                    break;
                }
            }
        }

        if (exists === false)
            return wInstanceID;
    }
}

FoxyApp.Function.generateComponentID = function()
{
    while (true)
    {
        let id = Math.round(Math.random() * 999999);

        let exists = false;

        if (FoxyApp.Model.componentMap[id] !== undefined)
        {
            exists = true;
        }
        else
        {
            for (let action of FoxyApp.Manager.modelManager.undoStack.concat(FoxyApp.Manager.modelManager.redoStack))
            {
                if (action.componentID === id)
                {
                    exists = true;
                    break;
                }
            }
        }

        if (exists === false)
            return id;
    }
}

FoxyApp.Function.navigateToGlobalColors = function()
{
    FoxyApp.View.PanelModule.siteSettingsModule.navigateToGlobalColors();
}

FoxyApp.Function.navigateToGlobalFonts = function()
{
    FoxyApp.View.PanelModule.siteSettingsModule.navigateToGlobalFonts();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class = {};

FoxyApp.Class.ElementCache = class
{
    #cache = {};

    cloneElement(scriptTemplateID)
    {
        if (this.#cache[scriptTemplateID] === undefined)
        {
            let doc = document.createElement('div');
            doc.innerHTML = document.querySelector(`script#${scriptTemplateID}`).text;
            this.#cache[scriptTemplateID] = doc.children[0];
        }

        return this.#cache[scriptTemplateID].cloneNode(true);
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EVENT CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.Event = {};

FoxyApp.Class.Event.Model = {};

FoxyApp.Class.Event.Model.Template = {};

    FoxyApp.Class.Event.Model.Template.Insert = class
    {
        type = [ 'Model', 'Template', 'Insert' ];

        widgetInstance = null;
        targetID = null;
        insertBefore = null;

        constructor(widgetInstance, targetID, insertBefore)
        {
            this.widgetInstance = widgetInstance;
            this.targetID = targetID;
            this.insertBefore = insertBefore;
        }
    };

    FoxyApp.Class.Event.Model.Template.Update = class
    {
        type = [ 'Model', 'Template', 'Update' ];

        wInstanceID = '';
        settingName = '';
        settingValue = null;

        constructor(wInstanceID, settingName, settingValue)
        {
            this.wInstanceID = wInstanceID;
            this.settingName = settingName;
            this.settingValue = settingValue;
        }
    };

    FoxyApp.Class.Event.Model.Template.ComponentUpdate = class
    {
        type = [ 'Model', 'Template', 'ComponentUpdate' ];

        wInstanceID = '';
        cwInstanceID = '';
        settingName = '';
        settingValue = null;

        constructor(wInstanceID, cwInstanceID, settingName, settingValue)
        {
            this.wInstanceID = wInstanceID;
            this.cwInstanceID = cwInstanceID;
            this.settingName = settingName;
            this.settingValue = settingValue;
        }
    };

    FoxyApp.Class.Event.Model.Template.Delete = class
    {
        type = [ 'Model', 'Template', 'Delete' ];

        wInstanceID = '';

        constructor(wInstanceID)
        {
            this.wInstanceID = wInstanceID;
        }
    };

FoxyApp.Class.Event.Model.Component = {};

    FoxyApp.Class.Event.Model.Component.Insert = class
    {
        type = [ 'Model', 'Component', 'Insert' ];

        component = null;
        targetID = null;
        insertBefore = null;

        constructor(component, targetID, insertBefore)
        {
            this.component = component;
            this.targetID = targetID;
            this.insertBefore = insertBefore;
        }
    };

    FoxyApp.Class.Event.Model.Component.Rename = class
    {
        type = [ 'Model', 'Component', 'Rename' ];

        componentID = null;
        title = null;

        constructor(componentID, title)
        {
            this.componentID = componentID;
            this.title = title;
        }
    };

    FoxyApp.Class.Event.Model.Component.Delete = class
    {
        type = [ 'Model', 'Component', 'Delete' ];

        componentID = null;

        constructor(componentID)
        {
            this.componentID = componentID;
        }
    };

FoxyApp.Class.Event.Model.ComponentWidgetInstance = {};

    FoxyApp.Class.Event.Model.ComponentWidgetInstance.Insert = class
    {
        type = [ 'Model', 'ComponentWidgetInstance', 'Insert' ];

        widgetInstance = null;
        componentID = null;
        targetID = null;
        insertBefore = null;

        constructor(widgetInstance, componentID, targetID, insertBefore)
        {
            this.widgetInstance = widgetInstance;
            this.componentID = componentID;
            this.targetID = targetID;
            this.insertBefore = insertBefore;
        }
    };

    FoxyApp.Class.Event.Model.ComponentWidgetInstance.Update = class
    {
        type = [ 'Model', 'ComponentWidgetInstance', 'Update' ];

        wInstanceID = '';
        settingName = '';
        settingValue = null;

        constructor(wInstanceID, settingName, settingValue)
        {
            this.wInstanceID = wInstanceID;
            this.settingName = settingName;
            this.settingValue = settingValue;
        }
    };

    FoxyApp.Class.Event.Model.ComponentWidgetInstance.Delete = class
    {
        type = [ 'Model', 'ComponentWidgetInstance', 'Delete' ];

        componentID = null;
        wInstanceID = '';

        constructor(componentID, wInstanceID)
        {
            this.componentID = componentID;
            this.wInstanceID = wInstanceID;
        }
    };

FoxyApp.Class.Event.Model.Settings = {};

    FoxyApp.Class.Event.Model.Settings.Update = class
    {
        type = [ 'Model', 'Settings', 'Update' ];

        wInstanceID = '';
        settingName = '';
        settingValue = null;

        constructor(wInstanceID, settingName, settingValue)
        {
            this.wInstanceID = wInstanceID;
            this.settingName = settingName;
            this.settingValue = settingValue;
        }
    };

FoxyApp.Class.Event.Model.Selection = class
{
    type = [ 'Model', 'Selection' ];

    wInstanceID = null;
    cwInstanceID = null;

    constructor(wInstanceID, cwInstanceID)
    {
        this.wInstanceID = wInstanceID;
        this.cwInstanceID = cwInstanceID;
    }
};

FoxyApp.Class.Event.Model.Device = class
{
    type = [ 'Model', 'Device' ];
};

FoxyApp.Class.Event.History = class
{
    type = [ 'History' ];

    constructor() {}
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMAND CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.Command = {};

FoxyApp.Class.Command.Model = {};

FoxyApp.Class.Command.Model.Template = {};

    FoxyApp.Class.Command.Model.Template.Insert = class
    {
        type = [ 'Model', 'Template', 'Insert' ];

        wInstanceData = null;
        targetID = null;
        insertBefore = null;

        constructor(wInstanceData, targetID, insertBefore)
        {
            this.wInstanceData = wInstanceData;
            this.targetID = targetID;
            this.insertBefore = insertBefore;
        }
    };

    FoxyApp.Class.Command.Model.Template.Update = class
    {
        type = [ 'Model', 'Template', 'Update' ];

        wInstanceID = '';
        settingName = '';
        settingValue = null;

        constructor(wInstanceID, settingName, settingValue)
        {
            this.wInstanceID = wInstanceID;
            this.settingName = settingName;
            this.settingValue = settingValue;
        }
    };

    FoxyApp.Class.Command.Model.Template.ComponentUpdate = class
    {
        type = [ 'Model', 'Template', 'ComponentUpdate' ];

        wInstanceID = '';
        cwInstanceID = '';
        settingName = '';
        settingValue = null;

        constructor(wInstanceID, cwInstanceID, settingName, settingValue)
        {
            this.wInstanceID = wInstanceID;
            this.cwInstanceID = cwInstanceID;
            this.settingName = settingName;
            this.settingValue = settingValue;
        }
    };

    FoxyApp.Class.Command.Model.Template.Delete = class
    {
        type = [ 'Model', 'Template', 'Delete' ];

        wInstanceID = '';

        constructor(wInstanceID)
        {
            this.wInstanceID = wInstanceID;
        }
    };

FoxyApp.Class.Command.Model.Component = {};

    FoxyApp.Class.Command.Model.Component.Insert = class
    {
        type = [ 'Model', 'Component', 'Insert' ];

        componentData = null;
        targetID = null;
        insertBefore = null;

        constructor(componentData, targetID, insertBefore)
        {
            this.componentData = componentData;
            this.targetID = targetID;
            this.insertBefore = insertBefore;
        }
    };

    FoxyApp.Class.Command.Model.Component.Rename = class
    {
        type = [ 'Model', 'Component', 'Rename' ];

        componentID = null;
        title = null;

        constructor(componentID, title)
        {
            this.componentID = componentID;
            this.title = title;
        }
    };

    FoxyApp.Class.Command.Model.Component.Delete = class
    {
        type = [ 'Model', 'Component', 'Delete' ];

        componentID = null;

        constructor(componentID)
        {
            this.componentID = componentID;
        }
    };

FoxyApp.Class.Command.Model.ComponentWidgetInstance = {};

    FoxyApp.Class.Command.Model.ComponentWidgetInstance.Insert = class
    {
        type = [ 'Model', 'ComponentWidgetInstance', 'Insert' ];

        wInstanceData = null;
        componentID = null;
        targetID = null;
        insertBefore = null;

        constructor(wInstanceData, componentID, targetID, insertBefore)
        {
            this.wInstanceData = wInstanceData;
            this.componentID = componentID;
            this.targetID = targetID;
            this.insertBefore = insertBefore;
        }
    };

    FoxyApp.Class.Command.Model.ComponentWidgetInstance.Update = class
    {
        type = [ 'Model', 'ComponentWidgetInstance', 'Update' ];

        wInstanceID = '';
        settingName = '';
        settingValue = null;

        constructor(wInstanceID, settingName, settingValue)
        {
            this.wInstanceID = wInstanceID;
            this.settingName = settingName;
            this.settingValue = settingValue;
        }
    };

    FoxyApp.Class.Command.Model.ComponentWidgetInstance.Delete = class
    {
        type = [ 'Model', 'ComponentWidgetInstance', 'Delete' ];

        componentID = null;
        wInstanceID = '';

        constructor(componentID, wInstanceID)
        {
            this.componentID = componentID;
            this.wInstanceID = wInstanceID;
        }
    };

FoxyApp.Class.Command.Model.Settings = {};

    FoxyApp.Class.Command.Model.Settings.Update = class
    {
        type = [ 'Model', 'Settings', 'Update' ];

        wInstanceID = '';
        settingName = '';
        settingValue = null;

        constructor(wInstanceID, settingName, settingValue)
        {
            this.wInstanceID = wInstanceID;
            this.settingName = settingName;
            this.settingValue = settingValue;
        }
    };

FoxyApp.Class.Command.Model.Selection = class
{
    type = [ 'Model', 'Selection' ];

    wInstanceID = null;
    cwInstanceID = null;

    constructor(wInstanceID, cwInstanceID)
    {
        this.wInstanceID = wInstanceID;
        this.cwInstanceID = cwInstanceID;
    }
};

FoxyApp.Class.Command.Model.Device = class
{
    type = [ 'Model', 'Device' ];

    deviceMode = '';  // 'desktop', 'tablet', 'mobile'

    constructor(deviceMode)
    {
        this.deviceMode = deviceMode;
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NODE CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.Node = class
{
    parentNode = null;
    children = [];

    constructor() {}

    appendChild(childNode)
    {
        childNode.parentNode = this;

        this.children.push(childNode);
    }

    removeChild(childNode)
    {
        for (let i = 0; i < this.children.length; i++)
        {
            let c = this.children[i];

            if (c === childNode)
            {
                c.parentNode = null;
                this.children.splice(i, 1);
                break;
            }
        }
    }

    remove()
    {
        if (this.parentNode)
            this.parentNode.removeChild(this);
    }

    get nextSibling()
    {
        if (this.parentNode === null)
            return null;

        let children = this.parentNode.children;

        let index = children.indexOf(this);

        return index >= 0 && index < children.length - 1 ? children[index + 1] : null;
    }

    get previousSibling()
    {
        if (this.parentNode === null)
            return null;

        let children = this.parentNode.children;

        let index = children.indexOf(this);

        return index > 0 ? children[index - 1] : null;
    }

    insertBefore(newNode, referenceNode)
    {
        if (referenceNode === null)
        {
            newNode.parentNode = this;

            this.children.push(newNode);
        }
        else
        {
            let index = this.children.indexOf(referenceNode);

            if (index >= 0)
            {
                newNode.parentNode = this;

                this.children.splice(index, 0, newNode);
            }
        }
    }

    static insertIntoIndexedTree(rootNode, nodeMap, newNode, targetID, insertBefore)
    {
        if (insertBefore === null)
        {
            let parentNode = targetID === null ? rootNode : nodeMap[targetID];

            parentNode.appendChild(newNode);
        }
        else
        {
            let targetNode = nodeMap[targetID];

            targetNode.parentNode.insertBefore(newNode, insertBefore ? targetNode : targetNode.nextSibling);
        }
    }

    destroy()
    {
        this.remove();

        for (let c of [ ...this.children ])
            c.destroy();

        this.children = [];
    }
};


FoxyApp.Class.ElementNode = class extends FoxyApp.Class.Node
{
    element = null;
    containerElement = null;

    /* constructor: The "containerElement" is a descendant of "element". It contains all the elements of all direct child ElementNodes.
     * A null "containerElement" means the ElementNode cannot take any children. */
    constructor(element, containerElement)
    {
        super();
        
        this.element = element;
        this.containerElement = containerElement;
    }

    appendChild(childNode)
    {
        if (this.containerElement === null)
            return;

        super.appendChild(childNode);

        this.containerElement.appendChild(childNode.element);
    }

    removeChild(childNode)
    {
        if (this.containerElement === null)
            return;

        this.containerElement.removeChild(childNode.element);

        super.removeChild(childNode);
    }

    insertBefore(newNode, referenceNode)
    {
        if (this.containerElement === null)
            return;

        super.insertBefore(newNode, referenceNode);

        this.containerElement.insertBefore(newNode.element, referenceNode ? referenceNode.element : null);
    }

    setElement(newElement, newContainerElement)
    {
        if (this.parentNode)
        {
            this.parentNode.containerElement.insertBefore(newElement, this.element);
            this.parentNode.containerElement.removeChild(this.element);
        }

        this.element = newElement;

        for (let childNode of [ ...this.children ])
        {
            if (newContainerElement !== null)
                newContainerElement.appendChild(childNode.element);
            else
            {
                this.removeChild(childNode);
                childNode.destroy();
            }
        }

        this.containerElement = newContainerElement;
    }

    destroy()
    {
        super.destroy();

        this.containerElement = null;
        this.element = null;
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MODEL CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.Model = {};

FoxyApp.Class.Model.WidgetInstance = class extends FoxyApp.Class.Node
{
    data = {
        id: '',  // e.g. T-1234-5678901234567.
        widgetType: 0,  // 0=widget. 1=component.
        widgetID: null,  // Widget name (string) or component ID (int).
        sparseSettings: {}  // Generally, a map of setting names to setting values.
    }

    constructor(data)
    {
        super();

        this.data = data;

        FoxyApp.Model.widgetInstanceMap[this.data.id] = this;
    }

    static loadTree(data)
    {
        let children = data.children !== undefined ? data.children : [];

        if (data.children !== undefined)
            delete data.children;

        let widgetInstance = new FoxyApp.Class.Model.WidgetInstance(data);

        for (let child of children)
        {
            let childNode = FoxyApp.Class.Model.WidgetInstance.loadTree(child);
            widgetInstance.appendChild(childNode);
        }

        return widgetInstance;
    }

    saveTree()
    {
        let data = structuredClone(this.data);

        data.children = [];

        for (let childNode of this.children)
        {
            let childData = childNode.saveTree();
            data.children.push(childData);
        }

        return data;
    }

    static dropComponents(data)
    {
        if (data.children === undefined)
            return;

        let newChildren = [];

        for (let child of data.children)
        {
            if (child.widgetType === 0)
            {
                FoxyApp.Class.Model.WidgetInstance.dropComponents(child);

                newChildren.push(child);
            }
        }

        data.children = newChildren;
    }

    static generateNewIDs(data, domainType, domainID)
    {
        data.id = FoxyApp.Function.generateWidgetInstanceID(domainType, domainID);

        if (data.children !== undefined)
        {
            for (let childData of data.children)
            {
                FoxyApp.Class.Model.WidgetInstance.generateNewIDs(childData, domainType, domainID);
            }
        }
    }

    static getIDs(wInstanceData)
    {
        let ids = [ wInstanceData.id ];

        if (wInstanceData.children === undefined)
            return ids;

        for (let child of wInstanceData.children)
        {
            let cids = FoxyApp.Class.Model.WidgetInstance.getIDs(child);
            ids = ids.concat(cids);
        }

        return ids;
    }

    setValue(settingName, settingValue)
    {
        let sparseSettings = this.data.sparseSettings;

        if (settingValue !== null)
        {
            sparseSettings[settingName] = settingValue;
        }
        else if (sparseSettings[settingName] !== undefined)
        {
            delete sparseSettings[settingName];
        }
    }

    getValue(settingName)
    {
        let sparseSettings = this.data.sparseSettings;

        if (sparseSettings[settingName] !== undefined)
            return sparseSettings[settingName];
        else
            return null;
    }

    setComponentValue(cwInstanceID, settingName, settingValue)
    {
        let componentSettings = this.data.componentSettings;

        if (settingValue !== null)
        {
            if (componentSettings[cwInstanceID] === undefined)
                componentSettings[cwInstanceID] = {};

            componentSettings[cwInstanceID][settingName] = settingValue;
        }
        else if (componentSettings[cwInstanceID] !== undefined)
        {
            if (componentSettings[cwInstanceID][settingName] !== undefined)
                delete componentSettings[cwInstanceID][settingName];

            if (Object.keys(componentSettings[cwInstanceID]).length === 0)
                delete componentSettings[cwInstanceID];
        }
    }

    getComponentValue(cwInstanceID, settingName)
    {
        let componentSettings = this.data.componentSettings;

        if (componentSettings[cwInstanceID] !== undefined && componentSettings[cwInstanceID][settingName] !== undefined)
            return componentSettings[cwInstanceID][settingName];
        else
            return null;
    }

    getInsertParams(rootNode)
    {
        let targetID;
        let insertBefore;

        if (this.nextSibling !== null)
        {
            targetID = this.nextSibling.data.id;
            insertBefore = true;
        }
        else if (this.previousSibling !== null)
        {
            targetID = this.previousSibling.data.id;
            insertBefore = false;
        }
        else
        {
            targetID = this.parentNode === rootNode ? null : this.parentNode.data.id;
            insertBefore = null;
        }

        return { targetID: targetID, insertBefore: insertBefore };
    }

    destroy()
    {
        super.destroy();

        delete FoxyApp.Model.widgetInstanceMap[this.data.id];
    }
};

FoxyApp.Class.Model.Component = class extends FoxyApp.Class.Node
{
    data = {
        id: -1,
        title: ''
    }

    constructor(data)
    {
        super();

        this.data = data;

        FoxyApp.Model.componentMap[this.data.id] = this;
    }

    static loadTree(data)
    {
        let children = data.children !== undefined ? data.children : [];

        if (data.children !== undefined)
            delete data.children;

        let component = new FoxyApp.Class.Model.Component(data);

        for (let child of children)
        {
            let childNode = FoxyApp.Class.Model.WidgetInstance.loadTree(child);
            component.appendChild(childNode);
        }

        return component;
    }

    saveTree()
    {
        let data = structuredClone(this.data);

        data.children = [];

        for (let childNode of this.children)
        {
            let childData = childNode.saveTree();
            data.children.push(childData);
        }

        return data;
    }

    getInsertParams(rootNode)
    {
        let targetID;
        let insertBefore;

        if (this.nextSibling !== null)
        {
            targetID = this.nextSibling.data.id;
            insertBefore = true;
        }
        else if (this.previousSibling !== null)
        {
            targetID = this.previousSibling.data.id;
            insertBefore = false;
        }
        else
        {
            targetID = this.parentNode === rootNode ? null : this.parentNode.data.id;
            insertBefore = null;
        }

        return { targetID: targetID, insertBefore: insertBefore };
    }

    static getWidgetInstanceIDs(componentData)
    {
        let ids = [];

        if (componentData.children === undefined)
            return ids;

        for (let child of componentData.children)
        {
            let cids = FoxyApp.Class.Model.WidgetInstance.getIDs(child);
            ids = ids.concat(cids);
        }

        return ids;
    }

    destroy()
    {
        super.destroy();

        delete FoxyApp.Model.componentMap[this.data.id];
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UI COMPONENT CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.UI = {};

FoxyApp.Class.UI.Component = {};

FoxyApp.Class.UI.Component.BaseComponent = class
{
    #events = [];
    #eventListeners = [];

    registerEvent(element, eventType)
    {
        if (!element || !eventType)
            return;

        element.addEventListener(eventType, this);

        this.#events.push({
            element: element,
            eventType: eventType
        });
    }

    unregisterEvent(element, eventType)
    {
        for (let i = 0; i < this.#events.length; i++)
        {
            if (this.#events[i].element === element && this.#events[i].eventType === eventType)
            {
                element.removeEventListener(eventType, this);
                this.#events.splice(i, 1);
                break;
            }
        }
    }

    addEventListener(eventListener)
    {
        this.#eventListeners.push(eventListener);
    }

    removeEventListener(eventListener)
    {
        for (let i = 0; i < this.#eventListeners.length; i++)
        {
            if (this.#eventListeners[i] === eventListener)
            {
                this.#eventListeners.splice(i, 1);
                break;
            }
        }
    }

    sendEvent(e)
    {
        e.currentTarget = this;

        for (let eventListener of this.#eventListeners)
            eventListener.handleEvent(e);
    }

    destroy()
    {
        this.#eventListeners = [];

        for (let event of this.#events)
            event.element.removeEventListener(event.eventType, this);

        this.#events = [];
    }
};

FoxyApp.Class.UI.Component.LineResizer = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #resizerElement = null;  // the mouse-draggable line element
    #resizerButtonElement = null;  // the mouse-clickable button element that hides the entire target element
    #targetElement = null;   // the element that gets resized
    #horizontalDirection = true;  // whether the resizing happens in the horizontal direction
    #invertDirection = false;  // whether to reverse the direction of resize relative to mouse movement

    #propertyElement = null;  // the element containing the size property that gets updated; this causes a resizing of #targetElement
    #showPropertyName = '';  // the name of a size property
    #livePropertyName = '';  // the name of a size property

    #isDragging = false;
    #originalState = {
        x: 0,
        y: 0,
        elementSize: 0
    };

    #isHidden = false;

    constructor(params)
    {
        super();

        this.#resizerElement = params.resizerElement;
        this.#resizerButtonElement = params.resizerButtonElement;
        this.#targetElement = params.targetElement;
        this.#horizontalDirection = params.horizontalDirection;
        this.#invertDirection = params.invertDirection;
        this.#propertyElement = params.propertyElement;
        this.#showPropertyName = params.showPropertyName;
        this.#livePropertyName = params.livePropertyName;
    }

    create()
    {
        this.registerEvent(this.#resizerElement, 'mousedown');
        this.registerEvent(this.#resizerButtonElement, 'click');
        this.registerEvent(document.body, 'mousemove');
        this.registerEvent(document.body, 'mouseup');
        this.registerEvent(document.body, 'mouseleave');
        this.registerEvent(document.body, 'dragstart');
    }

    handleEvent(e)
    {
        if (e.type === 'mousedown' && e.button === 0 && !this.#isDragging && e.target === this.#resizerElement)
        {
            this.#isDragging = true;
            this.#originalState.x = e.clientX;
            this.#originalState.y = e.clientY;
            this.#originalState.elementSize = this.#horizontalDirection ? this.#targetElement.offsetWidth : this.#targetElement.offsetHeight;

            // Block preview iframe in order to capture mouse move events over the iframe.
            document.querySelector('#foxybdr-editor-screen').classList.add('foxybdr-drag-exclude-iframe');
        }
        else if (e.type === 'mousemove' && this.#isDragging)
        {
            let newSize;
            if (this.#horizontalDirection === true)
                newSize = this.#originalState.elementSize + (e.clientX - this.#originalState.x) * (this.#invertDirection ? -1 : 1);
            else
                newSize = this.#originalState.elementSize + (e.clientY - this.#originalState.y) * (this.#invertDirection ? -1 : 1);

            this.#propertyElement.style.setProperty(this.#showPropertyName, String(newSize) + 'px');
            this.#propertyElement.style.setProperty(this.#livePropertyName, String(newSize) + 'px');

            this.#isHidden = false;
        }
        else if ((e.type === 'mouseup' || e.type === 'mouseleave') && this.#isDragging)
        {
            this.#isDragging = false;

            document.querySelector('#foxybdr-editor-screen').classList.remove('foxybdr-drag-exclude-iframe');
        }
        else if (e.type === 'dragstart' && e.currentTarget.tagName.toLowerCase() === 'body')
        {
            if (e.target.draggable === false)
                e.preventDefault();
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget === this.#resizerButtonElement)
        {
            this.#isHidden = !this.#isHidden;

            if (this.#isHidden)
            {
                this.#propertyElement.style.setProperty(this.#livePropertyName, '0px');
            }
            else
            {
                let showValue = window.getComputedStyle(this.#propertyElement).getPropertyValue(this.#showPropertyName);
                this.#propertyElement.style.setProperty(this.#livePropertyName, showValue);
            }
        }
    }

    destroy()
    {
        super.destroy();

        this.#resizerElement = null;
        this.#resizerButtonElement = null;
        this.#targetElement = null;
        this.#propertyElement = null;
    }
};

FoxyApp.Class.UI.Component.PanelResizer = class extends FoxyApp.Class.UI.Component.LineResizer
{
    constructor()
    {
        super({
            resizerElement: document.querySelector('#foxybdr-panel-resizer'),
            resizerButtonElement: document.querySelector('#foxybdr-panel-resizer-button'),
            targetElement: document.querySelector('#foxybdr-panel-resizable-backplate'),
            horizontalDirection: true,
            invertDirection: false,
            propertyElement: document.querySelector('#foxybdr-panel-and-canvas'),
            showPropertyName: '--foxybdr-left-width-show',
            livePropertyName: '--foxybdr-left-width'
        });
    }
};

FoxyApp.Class.UI.Component.DrawerResizer = class extends FoxyApp.Class.UI.Component.LineResizer
{
    constructor()
    {
        let backplateElement = document.querySelector('#foxybdr-drawer-resizable-backplate');

        super({
            resizerElement: document.querySelector('#foxybdr-drawer-resizer'),
            resizerButtonElement: document.querySelector('#foxybdr-drawer-resizer-button'),
            targetElement: backplateElement,
            horizontalDirection: true,
            invertDirection: true,
            propertyElement: backplateElement,
            showPropertyName: '--foxybdr-width-show',
            livePropertyName: 'width'
        });
    }
};

FoxyApp.Class.UI.Component.PanelModule = {};

FoxyApp.Class.UI.Component.PanelModule.BaseModule = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #templateID = '';
    #moduleElement = null;

    constructor(templateID)
    {
        super();

        this.#templateID = templateID;
    }

    create()
    {
        let docElement = document.createElement('div');
        docElement.innerHTML = document.querySelector(`script#${this.#templateID}`).text;
        this.#moduleElement = docElement.children[0];

        let panelBodyElement = document.querySelector('#foxybdr-panel-body');
        panelBodyElement.appendChild(this.#moduleElement);
    }

    handleEvent(e) {}

    getModuleElement()
    {
        return this.#moduleElement;
    }

    activate(show)
    {
        if (show)
            this.#moduleElement.classList.add('foxybdr-show');
        else
            this.#moduleElement.classList.remove('foxybdr-show');
    }

    isActivated()
    {
        return this.#moduleElement.classList.contains('foxybdr-show');
    }

    destroy()
    {
        super.destroy();

        this.#moduleElement.remove();
        this.#moduleElement = null;
    }
}

FoxyApp.Class.UI.Component.PanelModule.SettingsModule = class extends FoxyApp.Class.UI.Component.PanelModule.BaseModule
{
    #tabsElement = null;
    #tabBodyElement = null;

    #tabs = [];

    domainType = '';
    domainID = null;
    widgetInstanceID = null;
    cWidgetInstanceID = null;

    constructor()
    {
        super('foxybdr-tmpl-settings-module');

        FoxyApp.Manager.modelManager.addEventListener('Device', this);
        FoxyApp.Manager.modelManager.addEventListener('Template', this);
        FoxyApp.Manager.modelManager.addEventListener('Settings', this);
    }

    create()
    {
        super.create();

        let moduleElement = this.getModuleElement();

        this.#tabsElement = moduleElement.querySelector('.foxybdr-tabs');
        this.registerEvent(this.#tabsElement, 'wheel');

        this.#tabBodyElement = moduleElement.querySelector('.foxybdr-tab-body');
    }

    handleEvent(e)
    {
        if (e instanceof FoxyApp.Class.Event.Model.Device)
        {
            let evt = {
                type: 'device-change'
            };

            for (let tab of this.#tabs)
                tab.handleEvent(evt);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Template.Update || e instanceof FoxyApp.Class.Event.Model.Settings.Update)
        {
            if (e.wInstanceID === this.widgetInstanceID && this.cWidgetInstanceID === null)
            {
                let evt = {
                    type: 'setting-update',
                    settingName: e.settingName,
                    settingValue: e.settingValue
                };

                for (let tab of this.#tabs)
                    tab.handleEvent(evt);

                this.#disableConditionalSettings();
            }
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Template.ComponentUpdate)
        {
            if (e.wInstanceID === this.widgetInstanceID && e.cwInstanceID === this.cWidgetInstanceID)
            {
                let evt = {
                    type: 'setting-update',
                    settingName: e.settingName,
                    settingValue: e.settingValue
                };

                for (let tab of this.#tabs)
                    tab.handleEvent(evt);

                this.#disableConditionalSettings();
            }
        }
        else if (e.type === 'wheel' && e.currentTarget === this.#tabsElement)
        {
            e.preventDefault();

            let scrollLeft = this.#tabsElement.scrollLeft;

            switch (e.deltaMode)
            {
                case WheelEvent.DOM_DELTA_PIXEL:
                    scrollLeft += e.deltaY / 3.0;
                    break;

                case WheelEvent.DOM_DELTA_LINE:
                    scrollLeft += e.deltaY * 33.3;
                    break;

                case WheelEvent.DOM_DELTA_PAGE:
                    scrollLeft += e.deltaY * this.#tabsElement.clientWidth;
                    break;
            }

            let scrollRange = this.#tabsElement.scrollWidth - this.#tabsElement.clientWidth;
            if (scrollLeft < 0)
                scrollLeft = 0;
            if (scrollLeft > scrollRange)
                scrollLeft = scrollRange;

            this.#tabsElement.scrollLeft = scrollLeft;
        }
        else if (e.type === 'tab-click')
        {
            this.activateTabPage(e.index);
        }
        else if (e.type === 'setting-change')
        {
            let command;

            switch (this.domainType)
            {
                case 'T':
                    if (this.cWidgetInstanceID === null)
                        command = new FoxyApp.Class.Command.Model.Template.Update(this.widgetInstanceID, e.name, e.value);
                    else
                        command = new FoxyApp.Class.Command.Model.Template.ComponentUpdate(this.widgetInstanceID, this.cWidgetInstanceID, e.name, e.value);
                    break;

                case 'C':
                    command = new FoxyApp.Class.Command.Model.ComponentWidgetInstance.Update(this.widgetInstanceID, e.name, e.value);
                    break;

                case 'S':
                    if (this.cWidgetInstanceID === null)
                        command = new FoxyApp.Class.Command.Model.Settings.Update(this.widgetInstanceID, e.name, e.value);
                    break;
            }
            
            FoxyApp.Manager.modelManager.submitCommand(this, command);

            this.#disableConditionalSettings();
        }
        else if (e.type === 'device-select')
        {
            let command = new FoxyApp.Class.Command.Model.Device(e.deviceMode);

            FoxyApp.Manager.modelManager.submitCommand(null, command);
        }
    }

    activateTabPage(tabIndex)
    {
        for (let i = 0; i < this.#tabs.length; i++)
            this.#tabs[i].activate(i === tabIndex);
    }

    activateTabPageByName(name)
    {
        for (let i = 0; i < this.#tabs.length; i++)
            this.#tabs[i].activate(this.#tabs[i].getName() === name);
    }

    load(domainType, domainID, widgetInstanceID, cWidgetInstanceID)
    {
        this.unload();

        this.domainType = domainType;
        this.domainID = domainID;
        this.widgetInstanceID = widgetInstanceID;
        this.cWidgetInstanceID = cWidgetInstanceID;

        let widgetInstance = FoxyApp.Model.widgetInstanceMap[this.widgetInstanceID];

        let widget;
        let sparseSettings;

        if (this.cWidgetInstanceID === null)
        {
            widget = FoxyApp.Model.widgets[widgetInstance.data.widgetType === 0 ? widgetInstance.data.widgetID : 'foxybdr.layout.component'];

            sparseSettings = widgetInstance.data.sparseSettings;
        }
        else
        {
            let cWidgetInstance = FoxyApp.Model.widgetInstanceMap[this.cWidgetInstanceID];

            widget = FoxyApp.Model.widgets[cWidgetInstance.data.widgetType === 0 ? cWidgetInstance.data.widgetID : 'foxybdr.layout.component'];
            widget = this.#reduceComponentWidget(widget);

            sparseSettings = widgetInstance.data.componentSettings[this.cWidgetInstanceID];
            if (sparseSettings === undefined)
                sparseSettings = {};
        }

        for (let i = 0; i < widget.tabs.length; i++)
        {
            let tabData = widget.tabs[i];

            let tab = new FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Tab(i, tabData, widget.settings, sparseSettings);
            tab.create(this.#tabsElement, this.#tabBodyElement);
            tab.addEventListener(this);
            this.#tabs.push(tab);
        }

        this.#disableConditionalSettings();

        this.#tabsElement.scrollLeft = 0;

        if (this.#tabs.length > 0)
            this.activateTabPage(0);
    }

    unload()
    {
        for (let tab of this.#tabs)
            tab.destroy();

        this.#tabs = [];

        this.domainType = '';
        this.domainID = null;
        this.widgetInstanceID = null;
        this.cWidgetInstanceID = null;
    }

    #disableConditionalSettings()
    {
        if (this.widgetInstanceID === null || this.cWidgetInstanceID !== null)
            return;

        let widgetInstance = FoxyApp.Model.widgetInstanceMap[this.widgetInstanceID];
        let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetType === 0 ? widgetInstance.data.widgetID : 'foxybdr.layout.component'];

        let disabledSections = [];
        let disabledSettingNames = [];

        for (let tab of widget.tabs)
        {
            for (let section of tab.sections)
            {
                if (section.condition === undefined)
                    continue;

                if (FoxyApp.Function.evaluateCondition(section.condition, widgetInstance.data.sparseSettings, widget.settings) === true)
                    continue;

                disabledSections.push(section.name);

                for (let item of section.settings)
                {
                    if (item.type === 'setting')
                    {
                        disabledSettingNames.push(item.name);
                    }
                }
            }
        }

        for (let settingName in widget.settings)
        {
            let settingParams = widget.settings[settingName];

            if (disabledSettingNames.includes(settingName))
                continue;

            if (settingParams.condition !== undefined)
            {
                if (FoxyApp.Function.evaluateCondition(settingParams.condition, widgetInstance.data.sparseSettings, widget.settings, disabledSettingNames) === false)
                {
                    disabledSettingNames.push(settingName);
                }
            }
        }

        for (let tab of this.#tabs)
        {
            tab.disableConditionalSettings(disabledSections, disabledSettingNames);
        }
    }

    #reduceComponentWidget(oldWidget)
    {
        let widget = structuredClone(oldWidget);

        let newTabs = [];

        for (let tab of widget.tabs)
        {
            let newSections = [];

            for (let section of tab.sections)
            {
                let omitSection = section.condition !== undefined;

                let sectionSettings = [];

                for (let item of section.settings)
                {
                    if (item.type !== 'setting')
                        continue;

                    let settingName = item.name;
                    let settingParams = widget.settings[settingName];

                    let omitSetting = false;

                    if ([ 'TEXT', 'TEXTAREA', 'WYSIWYG', 'URL', 'MEDIA', 'ICONS' ].includes(settingParams.type) === false)
                        omitSetting = true;
                    else if (settingParams.selector !== undefined || settingParams.selectors !== undefined || settingParams.render_type === 'ui')
                        omitSetting = true;
                    else if (settingParams.condition !== undefined)
                        omitSetting = true;
                    else if (widget.cssDependencies[settingName] === true)
                        omitSetting = true;
                    else if (omitSection)
                        omitSetting = true;

                    if (omitSetting)
                    {
                        delete widget.settings[settingName];
                    }
                    else
                    {
                        sectionSettings.push(item);

                        if (settingParams.default !== undefined)
                            delete settingParams.default;
                    }
                }

                section.settings = sectionSettings;

                if (section.settings.length > 0)
                    newSections.push(section);
            }

            tab.sections = newSections;

            if (tab.sections.length > 0)
                newTabs.push(tab);
        }

        widget.tabs = newTabs;

        return widget;
    }

    destroy()
    {
        super.destroy();

        this.unload();

        this.#tabsElement = null;
        this.#tabBodyElement = null;
    }
};

FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Tab = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #tabElement = null;
    #tabPageElement = null;

    #sections = [];

    #tabIndex = null;
    #tabData = null;
    #settingDefinitions = null;
    #settingValues = null;

    constructor(tabIndex, tabData, settingDefinitions, settingValues)
    {
        super();

        this.#tabIndex = tabIndex;
        this.#tabData = tabData;
        this.#settingDefinitions = settingDefinitions;
        this.#settingValues = settingValues;
    }

    create(parentTabsElement, parentTabBodyElement)
    {
        this.#tabElement = document.createElement('div');
        this.#tabElement.classList.add('foxybdr-tab');
        this.#tabElement.innerText = this.#tabData.title;
        this.registerEvent(this.#tabElement, 'click');
        parentTabsElement.appendChild(this.#tabElement);

        this.#tabPageElement = document.createElement('div');
        this.#tabPageElement.classList.add('foxybdr-tab-page');
        parentTabBodyElement.appendChild(this.#tabPageElement);

        for (let i = 0; i < this.#tabData.sections.length; i++)
        {
            let sectionData = this.#tabData.sections[i];

            let section = new FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Tab_Section(i, sectionData, this.#settingDefinitions, this.#settingValues);
            section.create(this.#tabPageElement);
            section.addEventListener(this);
            this.#sections.push(section);
        }

        if (this.#sections.length > 0)
            this.activateSection(0, true);
    }

    handleEvent(e)
    {
        if (e.type === 'click' && e.button === 0 && e.currentTarget === this.#tabElement)
        {
            this.sendEvent({
                type: 'tab-click',
                index: this.#tabIndex
            });
        }
        else if (e.type === 'section-click')
        {
            this.activateSection(e.index, e.show);
        }
        else if (e.type === 'setting-change')
        {
            this.sendEvent(e);
        }
        else if (e.type === 'device-select')
        {
            this.sendEvent(e);
        }
        else if (e.type === 'device-change')
        {
            for (let section of this.#sections)
                section.handleEvent(e);
        }
        else if (e.type === 'setting-update')
        {
            for (let section of this.#sections)
                section.handleEvent(e);
        }
    }

    activate(show)
    {
        if (show)
        {
            this.#tabElement.classList.add('foxybdr-active');
            this.#tabPageElement.classList.add('foxybdr-active');
        }
        else
        {
            this.#tabElement.classList.remove('foxybdr-active');
            this.#tabPageElement.classList.remove('foxybdr-active');
        }
    }

    activateSection(sectionIndex, show)
    {
        this.#sections[sectionIndex].activate(show);

        if (show === true)
        {
            for (let i = 0; i < this.#sections.length; i++)
            {
                if (i !== sectionIndex)
                    this.#sections[i].activate(false);
            }
        }
    }

    disableConditionalSettings(disabledSections, disabledSettingNames)
    {
        for (let section of this.#sections)
        {
            section.disableConditionalSettings(disabledSections, disabledSettingNames);
        }
    }

    getName()
    {
        return this.#tabData.name;
    }

    destroy()
    {
        super.destroy();

        for (let section of this.#sections)
            section.destroy();

        this.#sections = [];

        if (this.#tabElement)
        {
            this.#tabElement.remove();
            this.#tabElement = null;
        }

        if (this.#tabPageElement)
        {
            this.#tabPageElement.remove();
            this.#tabPageElement = null;
        }
    }
};

FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Tab_Section = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #sectionElement = null;

    #controls = [];
    #layouts = [];

    #sectionIndex = null;
    #sectionData = null;
    #settingDefinitions = null;
    #settingValues = null;

    constructor(sectionIndex, sectionData, settingDefinitions, settingValues)
    {
        super();

        this.#sectionIndex = sectionIndex;
        this.#sectionData = sectionData;
        this.#settingDefinitions = settingDefinitions;
        this.#settingValues = settingValues;
    }

    create(parentElement)
    {
        this.#sectionElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-settings-module-tab-page-section');
        parentElement.appendChild(this.#sectionElement);

        this.registerEvent(this.#sectionElement.querySelector('.foxybdr-header'), 'click');

        this.#sectionElement.querySelector('.foxybdr-title').innerText = this.#sectionData.title;

        let sectionBodyElement = this.#sectionElement.querySelector('.foxybdr-body');

        let currentLayout = null;

        for (let i = 0; i < this.#sectionData.settings.length; i++)
        {
            let item = this.#sectionData.settings[i];

            switch (item.type)
            {
                case 'setting':
                    {
                        let settingName = item.name;
                        let settingParams = this.#settingDefinitions[settingName];
                        let value = this.#settingValues[settingName] !== undefined ? this.#settingValues[settingName] : null;
            
                        let control = FoxyControls.Class.Factory.create(settingParams.type, settingName, settingParams, value);
                        control.create(currentLayout !== null ? currentLayout.getParentElementForNewControl() : sectionBodyElement);
                        control.addEventListener(this);
                        this.#controls.push(control);

                        if (currentLayout !== null && currentLayout.addControl !== undefined && typeof currentLayout.addControl === 'function')
                            currentLayout.addControl(control);
                    }
                    break;

                case 'start_controls_tabs':
                    {
                        currentLayout = new FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Layout.Tabs();
                        currentLayout.create(sectionBodyElement);
                        currentLayout.addEventListener(this);
                        this.#layouts.push(currentLayout);
                    }
                    break;

                case 'end_controls_tabs':
                    currentLayout = null;
                    break;

                case 'start_controls_tab':
                    if (currentLayout !== null)
                        currentLayout.addTab(item.label);
                    break;

                case 'end_controls_tab':
                    break;

                case 'start_popover':
                    {
                        currentLayout = new FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Layout.Popover();
                        currentLayout.create(sectionBodyElement, item.label);
                        currentLayout.addEventListener(this);
                        this.#layouts.push(currentLayout);
                    }
                    break;

                case 'end_popover':
                    currentLayout = null;
                    break;
            }
        }
    }

    handleEvent(e)
    {
        if (e.type === 'click' && e.button === 0 && e.currentTarget.classList.contains('foxybdr-header'))
        {
            this.sendEvent({
                type: 'section-click',
                index: this.#sectionIndex,
                show: !this.#sectionElement.classList.contains('foxybdr-active')
            });
        }
        else if (e.type === 'control-change')
        {
            this.sendEvent({
                type: 'setting-change',
                name: e.name,
                value: e.value
            });
        }
        else if (e.type === 'control-device-change')
        {
            this.sendEvent({
                type: 'device-select',
                deviceMode: e.deviceMode
            });
        }
        else if (e.type === 'device-change')
        {
            for (let control of this.#controls)
                control.handleEvent(e);
        }
        else if (e.type === 'setting-update')
        {
            for (let control of this.#controls)
            {
                if (control.name === e.settingName)
                    control.setValue(e.settingValue);
            }

            for (let layout of this.#layouts)
            {
                if (layout.handleEvent !== undefined && typeof layout.handleEvent === 'function')
                    layout.handleEvent(e);
            }
        }
    }

    activate(show)
    {
        if (show && this.#sectionElement.classList.contains('foxybdr-active') === false)
        {
            this.#sectionElement.classList.add('foxybdr-active');

            let sectionElement = this.#sectionElement;
            setTimeout(function() {
                sectionElement.classList.add('foxybdr-show-overflow');
            }, 200);
        }
        else if (!show && this.#sectionElement.classList.contains('foxybdr-active') === true)
        {
            this.#sectionElement.classList.remove('foxybdr-show-overflow');
            this.#sectionElement.classList.remove('foxybdr-active');
        }
    }

    disableConditionalSettings(disabledSections, disabledSettingNames)
    {
        if (disabledSections.includes(this.#sectionData.name))
        {
            this.#sectionElement.classList.add('foxybdr-hide');
            return;
        }

        this.#sectionElement.classList.remove('foxybdr-hide');

        for (let control of this.#controls)
        {
            control.show(disabledSettingNames.includes(control.name) === false);
        }
    }

    destroy()
    {
        super.destroy();

        for (let control of this.#controls)
            control.destroy();

        this.#controls = [];

        for (let layout of this.#layouts)
            layout.destroy();

        this.#layouts = [];

        if (this.#sectionElement)
        {
            this.#sectionElement.remove();
            this.#sectionElement = null;
        }
    }
};

FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Layout = {};

FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Layout.Tabs = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #layoutElement = null;
    #tabsElement = null;
    #bodyElement = null;

    constructor()
    {
        super();
    }

    create(parentElement)
    {
        this.#layoutElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-settings-layout-tabs');
        parentElement.appendChild(this.#layoutElement);

        this.#tabsElement = this.#layoutElement.querySelector('.foxybdr--tabs');
        this.#bodyElement = this.#layoutElement.querySelector('.foxybdr--tab--body');
    }

    addTab(label)
    {
        let newIndex = this.#tabsElement.children.length;

        let tabElement = document.createElement('div');
        tabElement.classList.add('foxybdr--tab');
        tabElement.setAttribute('foxybdr-index', String(newIndex));
        tabElement.innerText = label;
        this.#tabsElement.appendChild(tabElement);

        let pageElement = document.createElement('div');
        pageElement.classList.add('foxybdr-tab-page');
        pageElement.setAttribute('foxybdr-index', String(newIndex));
        this.#bodyElement.appendChild(pageElement);

        if (newIndex === 0)
        {
            tabElement.classList.add('foxybdr-active');
            pageElement.classList.add('foxybdr-active');
        }

        this.registerEvent(tabElement, 'click');
    }

    handleEvent(e)
    {
        if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr--tab'))
        {
            for (let i = 0; i < this.#tabsElement.children.length; i++)
            {
                let tabElement = this.#tabsElement.children[i];

                if (tabElement === e.currentTarget)
                    tabElement.classList.add('foxybdr-active');
                else
                    tabElement.classList.remove('foxybdr-active');
            }

            let indexStr = e.currentTarget.getAttribute('foxybdr-index');

            for (let i = 0; i < this.#bodyElement.children.length; i++)
            {
                let pageElement = this.#bodyElement.children[i];

                if (pageElement.getAttribute('foxybdr-index') === indexStr)
                    pageElement.classList.add('foxybdr-active');
                else
                    pageElement.classList.remove('foxybdr-active');
            }
        }
    }

    getParentElementForNewControl()
    {
        let childCount = this.#bodyElement.children.length;

        if (childCount === 0)
            return null;

        return this.#bodyElement.children[childCount - 1];
    }

    destroy()
    {
        super.destroy();

        if (this.#layoutElement !== null)
        {
            this.#layoutElement.remove();
            this.#layoutElement = null;
        }

        this.#tabsElement = null;
        this.#bodyElement = null;
    }
};

FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Layout.Popover = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #layoutElement = null;
    #groupButtonElement = null;
    #groupDropdownElement = null;
    #bodyElement = null;

    #controls = [];

    constructor()
    {
        super();
    }

    create(parentElement, label)
    {
        this.#layoutElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-settings-layout-popover');
        parentElement.appendChild(this.#layoutElement);

        this.#groupButtonElement = this.#layoutElement.querySelector('.foxybdr-group-button');
        this.#groupDropdownElement = this.#layoutElement.querySelector('.foxybdr-group-dropdown');
        this.#bodyElement = this.#layoutElement.querySelector('.foxybdr-body');

        this.#layoutElement.querySelector('.foxybdr-control-label').innerText = label;
        this.#layoutElement.querySelector('.foxybdr-group-dropdown .foxybdr-title').innerText = label;

        this.registerEvent(document.body, 'click');

        let trashElement = this.#layoutElement.querySelector('.foxybdr-group-dropdown .dashicons-trash');
        this.registerEvent(trashElement, 'click');
    }

    handleEvent(e)
    {
        if (e.type === 'click' && e.currentTarget.tagName.toLowerCase() === 'body')
        {
            FoxyControls.Function.onDropdownClickEvent(e, this.#groupButtonElement, this.#groupDropdownElement);
        }
        else if (e.type === 'click' && e.currentTarget.classList.contains('dashicons-trash'))
        {
            for (let control of this.#controls)
            {
                if (control.value !== null)
                {
                    control.setValue(null);

                    this.sendEvent({
                        type: 'control-change',
                        name: control.name,
                        value: control.value
                    });
                }
            }

            this.#updateGroupButton();
        }
        else if (e.type === 'control-change')
        {
            this.#updateGroupButton();
        }
        else if (e.type === 'setting-update')
        {
            this.#updateGroupButton();
        }
    }

    addControl(control)
    {
        control.addEventListener(this);

        this.#controls.push(control);

        this.#updateGroupButton();
    }

    getParentElementForNewControl()
    {
        return this.#bodyElement;
    }

    #updateGroupButton()
    {
        let isDefault = true;

        for (let control of this.#controls)
        {
            if (control.value !== null)
            {
                isDefault = false;
                break;
            }
        }

        if (!isDefault)
            this.#groupButtonElement.classList.add('foxybdr-enabled');
        else
            this.#groupButtonElement.classList.remove('foxybdr-enabled');
    }

    destroy()
    {
        super.destroy();

        if (this.#layoutElement !== null)
        {
            this.#layoutElement.remove();
            this.#layoutElement = null;
        }

        this.#groupButtonElement = null;
        this.#groupDropdownElement = null;
        this.#bodyElement = null;

        /* There is no need to destroy the controls here because they are owned by the SettingsModule_Tab_Section class, which is
         * responsible for destroying them. Here we will just release their references. */
        this.#controls = [];
    }
};

FoxyApp.Class.UI.Component.PanelModule.WidgetsModule = class extends FoxyApp.Class.UI.Component.PanelModule.BaseModule
{
    #tabElements = [];
    #tabPageElements = [];
    #componentContainerElement = null;
    #componentEmptyMessageElement = null;

    #widgetCategories = [];

    constructor()
    {
        super('foxybdr-tmpl-widgets-module');

        FoxyApp.Manager.modelManager.addEventListener('Component', this);
    }

    create()
    {
        super.create();

        let moduleElement = this.getModuleElement();

        let tabElements = moduleElement.querySelectorAll('.foxybdr-tab');
        for (let i = 0; i < tabElements.length; i++)
        {
            this.#tabElements.push(tabElements[i]);
            this.registerEvent(tabElements[i], 'click');
        }

        let pageElements = moduleElement.querySelectorAll('.foxybdr-tab-page');
        for (let i = 0; i < pageElements.length; i++)
        {
            this.#tabPageElements.push(pageElements[i]);
        }

        this.#createWidgetsPage(moduleElement);

        this.#createComponentsPage(moduleElement);

        this.#selectTab('widgets');
    }

    #createWidgetsPage(moduleElement)
    {
        let bodyElement = moduleElement.querySelector('.foxybdr-tab-page[foxybdr-name="widgets"] > .foxybdr-body');

        for (let categoryData of FoxyApp.Model.widgetCategories)
        {
            let category = new FoxyApp.Class.UI.Component.PanelModule.WidgetsModule_Category(categoryData);
            category.create(bodyElement);
            this.#widgetCategories.push(category);
        }
    }

    #createComponentsPage(moduleElement)
    {
        this.#componentContainerElement = moduleElement.querySelector('.foxybdr-tab-page[foxybdr-name="components"] .foxybdr-component-container');
        this.#componentEmptyMessageElement = moduleElement.querySelector('.foxybdr-tab-page[foxybdr-name="components"] .foxybdr-empty-message');

        for (let component of FoxyApp.Model.componentTree.children)
        {
            let cardElement = this.#createComponentCard(component);

            this.#componentContainerElement.appendChild(cardElement);
        }

        this.#updateComponentEmptyMessage();

        this.registerEvent(this.#componentContainerElement, 'dragstart');
        this.registerEvent(this.#componentContainerElement, 'dragend');
    }

    handleEvent(e)
    {
        if (e instanceof FoxyApp.Class.Event.Model.Component.Insert)
        {
            this.#insertComponent(e.component, e.targetID, e.insertBefore);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Component.Rename)
        {
            this.#renameComponent(e.componentID, e.title);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Component.Delete)
        {
            this.#deleteComponent(e.componentID);
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget.classList.contains('foxybdr-tab'))
        {
            let name = e.currentTarget.getAttribute('foxybdr-name');

            this.#selectTab(name);
        }
        else if (e.type === 'dragstart' && e.currentTarget === this.#componentContainerElement)
        {
            let cardElement = e.target.closest('.foxybdr-widget-card');

            if (cardElement)
            {
                e.dataTransfer.setData("text/plain", cardElement.getAttribute('foxybdr-component-id'));

                e.dataTransfer.effectAllowed = "move";
    
                FoxyApp.Class.UI.ElementDragDrop.setSourceElement(cardElement);
            }
        }
        else if (e.type === 'dragend' && e.currentTarget === this.#componentContainerElement)
        {
            FoxyApp.Class.UI.ElementDragDrop.setSourceElement(null);
        }
    }

    #insertComponent(component, targetID, insertBefore)
    {
        let newCardElement = this.#createComponentCard(component);

        if (insertBefore === null)
        {
            this.#componentContainerElement.appendChild(newCardElement);
        }
        else
        {
            let targetElement = this.#componentContainerElement.querySelector(`.foxybdr-widget-card[foxybdr-component-id="${targetID}"]`);

            this.#componentContainerElement.insertBefore(newCardElement, insertBefore ? targetElement : targetElement.nextSibling);
        }

        this.#updateComponentEmptyMessage();
    }

    #renameComponent(componentID, title)
    {
        let cardElement = this.#componentContainerElement.querySelector(`.foxybdr-widget-card[foxybdr-component-id="${componentID}"]`);
        cardElement.querySelector('span').innerText = title;
    }

    #deleteComponent(componentID)
    {
        let cardElement = this.#componentContainerElement.querySelector(`.foxybdr-widget-card[foxybdr-component-id="${componentID}"]`);

        if (cardElement)
            cardElement.remove();

        this.#updateComponentEmptyMessage();
    }

    #selectTab(name)
    {
        for (let tabElement of this.#tabElements)
        {
            if (tabElement.getAttribute('foxybdr-name') === name)
                tabElement.classList.add('foxybdr-active');
            else
                tabElement.classList.remove('foxybdr-active');
        }

        for (let pageElement of this.#tabPageElements)
        {
            if (pageElement.getAttribute('foxybdr-name') === name)
                pageElement.classList.add('foxybdr-active');
            else
                pageElement.classList.remove('foxybdr-active');
        }
    }

    #createComponentCard(component)
    {
        let cardElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-widgets-module-card');
        cardElement.setAttribute('foxybdr-component-id', String(component.data.id));
        cardElement.querySelector('i').className = 'fas fa-cubes';
        cardElement.querySelector('span').innerText = component.data.title;

        return cardElement;
    }

    #updateComponentEmptyMessage()
    {
        if (this.#componentContainerElement.children.length === 0)
        {
            this.#componentEmptyMessageElement.classList.add('foxybdr-show');
        }
        else
        {
            this.#componentEmptyMessageElement.classList.remove('foxybdr-show');
        }
    }

    destroy()
    {
        super.destroy();

        this.#tabElements = [];
        this.#tabPageElements = [];
        this.#componentContainerElement = null;
        this.#componentEmptyMessageElement = null;

        for (let category of this.#widgetCategories)
            category.destroy();

        this.#widgetCategories = [];
    }
};

FoxyApp.Class.UI.Component.PanelModule.WidgetsModule_Category = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #categoryElement = null;

    #cards = [];

    #categoryData = null;

    constructor(categoryData)
    {
        super();

        this.#categoryData = categoryData;
    }

    create(parentElement)
    {
        this.#categoryElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-widgets-module-category');
        parentElement.appendChild(this.#categoryElement);

        this.registerEvent(this.#categoryElement.querySelector('.foxybdr-header'), 'click');

        this.#categoryElement.classList.add('foxybdr-active');
        this.#categoryElement.querySelector('.foxybdr-title').innerText = this.#categoryData.title;

        let bodyElement = this.#categoryElement.querySelector('.foxybdr-body');

        for (let widgetName of this.#categoryData.widgets)
        {
            let widgetData = FoxyApp.Model.widgets[widgetName];

            let card = new FoxyApp.Class.UI.Component.PanelModule.WidgetsModule_Category_Card(widgetName, widgetData);
            card.create(bodyElement);
            this.#cards.push(card);
        }
    }

    handleEvent(e)
    {
        if (e.type === 'click' && e.button === 0 && e.currentTarget.classList.contains('foxybdr-header'))
        {
            this.#categoryElement.classList.toggle('foxybdr-active');
        }
    }

    destroy()
    {
        super.destroy();

        for (let card of this.#cards)
            card.destroy();

        this.#cards = [];

        if (this.#categoryElement)
        {
            this.#categoryElement.remove();
            this.#categoryElement = null;
        }
    }
};

FoxyApp.Class.UI.Component.PanelModule.WidgetsModule_Category_Card = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #cardElement = null;

    #widgetName = '';
    #widgetData = null;

    constructor(widgetName, widgetData)
    {
        super();

        this.#widgetName = widgetName;
        this.#widgetData = widgetData;
    }

    create(parentElement)
    {
        this.#cardElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-widgets-module-card');
        parentElement.appendChild(this.#cardElement);

        this.registerEvent(this.#cardElement, 'dragstart');
        this.registerEvent(this.#cardElement, 'dragend');

        this.#cardElement.setAttribute('foxybdr-widget-name', this.#widgetName);
        this.#cardElement.querySelector('i').className = this.#widgetData.icon;
        this.#cardElement.querySelector('span').innerText = this.#widgetData.title;
    }

    handleEvent(e)
    {
        if (e.type === 'dragstart' && e.currentTarget === this.#cardElement)
        {
            e.dataTransfer.setData("text/plain", this.#widgetName);

            e.dataTransfer.effectAllowed = "move";

            FoxyApp.Class.UI.ElementDragDrop.setSourceElement(this.#cardElement);
        }
        else if (e.type === 'dragend' && e.currentTarget === this.#cardElement)
        {
            FoxyApp.Class.UI.ElementDragDrop.setSourceElement(null);
        }
    }

    destroy()
    {
        super.destroy();

        if (this.#cardElement)
        {
            this.#cardElement.remove();
            this.#cardElement = null;
        }
    }
};

FoxyApp.Class.UI.Component.ContextMenu = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #scopeElement = null;
    #menuElement = null;
    #itemElement = null;
    #windows = [];

    #itemSelector = '';
    
    constructor()
    {
        super();
    }

    create(scopeElement, itemSelector)
    {
        this.#scopeElement = scopeElement;
        this.#itemSelector = itemSelector;

        this.registerEvent(this.#scopeElement, 'contextmenu');
        this.registerEvent(this.#scopeElement, 'mouseup');

        this.#menuElement = document.createElement('div');
        this.#menuElement.classList.add('foxybdr-context-menu');
        this.#scopeElement.closest('body').appendChild(this.#menuElement);

        this.registerEvent(this.#menuElement, 'mouseup');

        let iframeElements = document.querySelectorAll('iframe');
        for (let i = 0; i < iframeElements.length; i++)
        {
            let _window = iframeElements[i].contentWindow;
            this.#windows.push(_window);
            this.registerEvent(_window, 'mouseup');
            this.registerEvent(_window, 'keyup');
        }

        this.registerEvent(window, 'mouseup');
        this.registerEvent(window, 'keyup');
        this.#windows.push(window);
    }

    show(widgetElement, mouseX, mouseY)
    {
        if (this.#itemElement)
        {
            this.#itemElement.classList.remove('foxybdr-context-menu-hover');
        }

        this.#itemElement = widgetElement;
        this.#itemElement.classList.add('foxybdr-context-menu-hover');

        this.#menuElement.classList.add('foxybdr-show');
        this.#menuElement.style.left = String(mouseX) + 'px';
        this.#menuElement.style.top  = String(mouseY) + 'px';

        this.#clearMenuItems();
        this.addMenuItems(this.#itemElement);
    }

    hide()
    {
        if (this.#itemElement === null)
            return;

        this.#itemElement.classList.remove('foxybdr-context-menu-hover');

        this.#itemElement = null;

        this.#menuElement.classList.remove('foxybdr-show');
        this.#menuElement.style.left = '';
        this.#menuElement.style.top  = '';

        this.#clearMenuItems();
    }

    handleEvent(e)
    {
        if (e.type === 'contextmenu' && e.currentTarget === this.#scopeElement && !e.ctrlKey)
        {
            e.preventDefault();
        }
        else if (e.type === 'mouseup' && e.button === 2 && e.currentTarget === this.#scopeElement && !e.ctrlKey)
        {
            let itemElement = e.target.closest(this.#itemSelector);

            if (itemElement !== null)
            {
                this.show(itemElement, e.clientX + 2, e.clientY + 2);

                // prevent hiding of context menu
                e.stopPropagation();
            }
        }
        else if (e.type === 'mouseup' && e.button === 0 && e.currentTarget === this.#menuElement && this.#itemElement !== null)
        {
            let menuItemElement = e.target.closest('.foxybdr-context-menu-item');

            if (menuItemElement)
            {
                let command = menuItemElement.getAttribute('foxybdr-command');

                this.sendEvent({
                    type: 'context-menu-command',
                    command: command,
                    itemElement: this.#itemElement
                });
            }
        }
        else if (e.type === 'mouseup' || (e.type === 'keyup' && e.key === 'Escape'))
        {
            if (this.#windows.includes(e.currentTarget))
            {
                this.hide();
            }
        }
    }

    addMenuItems(itemElement)
    {
        /* This is empty base class implementation. Derived classes should override this method, which should call this.addMenuItem() for every
         * menu item to be added to the context menu, depending on the context. */
    }

    addMenuItem(command, label)
    {
        let menuItemElement = document.createElement('div');
        menuItemElement.classList.add('foxybdr-context-menu-item');
        menuItemElement.setAttribute('foxybdr-command', command);
        this.#menuElement.appendChild(menuItemElement);

        let labelElement = document.createElement('span');
        labelElement.innerText = label;
        menuItemElement.appendChild(labelElement);
    }

    #clearMenuItems()
    {
        this.#menuElement.innerHTML = '';
    }

    destroy()
    {
        super.destroy();

        this.#scopeElement = null;

        if (this.#menuElement)
        {
            this.#menuElement.remove();
            this.#menuElement = null;
        }

        this.#itemElement = null;

        this.#windows = [];
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UI CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/* Class ElementDragDrop: This class handles drag-drop events for the placement of DOM elements within a hierarchical element tree. The class
 * can be used for the insertion of new elements into the tree and the movement of elements to new locations within the tree. It does not
 * actually insert or move elements, but notifies listeners of what element the user has dropped and the exact location in the tree where
 * the drop has occurred. It is the responsibility of the listener to do the actual insertion or movement of elements within the tree.
 * This class only handles the visual special effect of the drag-drop operation as experienced by the user.
 */
FoxyApp.Class.UI.ElementDragDrop = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    /* sourceElement: The element being dragged by the user. */
    static sourceElement = null;

    /* instances: Array of all instantiated objects of this class. */
    static instances = [];

    /* scopeElement: The root element within which all drag-drop events will be monitored by this class object. */
    #scopeElement = null;

    /* scrollElement: The scrollable element or window that contains the element tree. It will scroll when the user drags near an edge of
     * the "scrollElement". This can be either the window object or some <div> element with the CSS 'overflow' property set to 'auto'. */
    #scrollElement = null;
    #scrollThreshold = 0.0;
    #scrollThresholdUnits = 'px';  // 'px' or '%'
    #scrollElementIsWindow = false;

    /* state: Contains stateful information about a drag-drop operation currently in progress. Since multiple 'dragover' events are fired
     * during a single drag-drop operation, there is a need to track the drag-drop operation across these multiple 'dragover' events. */
    #state = {

        /* targetElement: This is the current best neighboring element around which the new element will be inserted or moved into. This
         * can be either the parent or sibling of the new element, depending on the value of "insertBefore". If "insertBefore" is null,
         * then "targetElement" is the parent element of the new element. If "insertBefore" is true, then "targetElement" is the next
         * sibling of the new element. If "insertBefore" is false, then "targetElement" is the previous sibling of the new element. */
        targetElement: null,

        /* insertBefore: See previous note for semantic meaning of "insertBefore". */
        insertBefore: null,

        /* insertElement: This is a temporary rectangular element that serves as a visual indicator of where the new element will be
         * inserted or moved. It appears while the mouse is dragging and disappears when a 'drop' event occurs. */
        insertElement: null,

        /* lastMouseX and lastMouseY: These keep track of the mouse coordinates of the previous 'dragover' event. They are used to decide
         * the distance by which to scroll the page when the drag approaches the top or bottom of the page. */
        lastMouseX: null,
        lastMouseY: null
    };

    /* sourceTypes: Array of objects that each define a type of source element and the range of possible drop targets for that type of
     * source element. For example, column widgets can only be dropped into section widgets and cannot be dropped into other column
     * widgets. Source element types and ranges of possible drop targets are defined by CSS selector strings. */
    #sourceTypes = [];

    constructor()
    {
        super();

        FoxyApp.Class.UI.ElementDragDrop.instances.push(this);
    }

    create(scopeElement, scrollElement, scrollThreshold, scrollThresholdUnits)
    {
        this.#scopeElement = scopeElement;

        this.#scrollElement = scrollElement;
        this.#scrollThreshold = scrollThreshold;
        this.#scrollThresholdUnits = scrollThresholdUnits;
        this.#scrollElementIsWindow = this.#scrollElement.innerWidth !== undefined && this.#scrollElement.innerHeight !== undefined && this.#scrollElement.scrollBy !== undefined;

        this.registerEvent(this.#scopeElement, 'dragover');
        this.registerEvent(this.#scopeElement, 'dragleave');
        this.registerEvent(this.#scopeElement, 'drop');

        this.registerEvent(this.#scopeElement, 'dragstart');
        this.registerEvent(this.#scopeElement, 'dragend');
    }

    /* addSourceType: "sourceSelector" is required. If "parentSelector" is null, then the "#scopeElement" will be selected as parent.
     * "forbiddenSelector" can be null. */
    addSourceType(sourceSelector, parentSelector, forbiddenSelector)
    {
        this.#sourceTypes.push({
            sourceSelector: sourceSelector,
            parentSelector: parentSelector,
            forbiddenSelector: forbiddenSelector
        });
    }

    static setSourceElement(sourceElement)
    {
        FoxyApp.Class.UI.ElementDragDrop.sourceElement = sourceElement;

        for (let instance of FoxyApp.Class.UI.ElementDragDrop.instances)
        {
            instance.handleEvent({
                type: 'source-element-change',
                sourceElement: sourceElement
            });
        }
    }

    handleEvent(e)
    {
        if (e.type === 'source-element-change')
        {
            if (e.sourceElement === null)
                this.#destroyInsertElement();
        }
        else if (e.currentTarget === this.#scopeElement)
        {
            switch (e.type)
            {
                case 'dragover': this.#onDragOver(e); break;
                case 'dragleave': this.#onDragOver(e); break;
                case 'drop': this.#onDrop(e); break;
                case 'dragstart': this.#onDragStart(e); break;
                case 'dragend': this.#onDragEnd(e); break;
            }
        }
    }

    #onDragOver(e)
    {
        let sourceElement = FoxyApp.Class.UI.ElementDragDrop.sourceElement;

        if (sourceElement === null)
            return;

        let sourceTypeFound = false;
        let parentSelector = null;
        let forbiddenSelector = null;

        for (let sourceType of this.#sourceTypes)
        {
            if (sourceElement.matches(sourceType.sourceSelector))
            {
                sourceTypeFound = true;
                parentSelector = sourceType.parentSelector;
                forbiddenSelector = sourceType.forbiddenSelector;
                break;
            }
        }

        if (!sourceTypeFound)
            return;

        // allow the drag operation
        e.preventDefault();

        this.#scrollIfNeeded(e);

        if (this.#state.insertElement !== null)
        {
            let rect = this.#state.insertElement.getBoundingClientRect();
            if (this.#doesRectContain(rect, e.clientX, e.clientY))
                return;
        }
    
        let parentElement = this.#findBestParentElement(parentSelector, forbiddenSelector, e.clientX, e.clientY);

        if (parentElement === null)
        {
            this.#destroyInsertElement();
            return;
        }

        let targetElement = null;
        let insertBefore = null;

        // Goal: Determine targetElement and insertBefore.
        {
            let sides = [];

            for (let i = 0; i < parentElement.children.length; i++)
            {
                let childElement = parentElement.children[i];

                if (childElement.classList.contains('foxybdr-drag-drop-insert'))
                    continue;

                let rect = childElement.getBoundingClientRect();

                if (this.#doesRectContain(rect, e.clientX, e.clientY))
                {
                    targetElement = childElement;
                    insertBefore = e.clientY < (rect.top + rect.bottom) / 2;
                    sides = [];
                    break;
                }
                else
                {
                    sides.push({ x: (rect.left + rect.right) / 2, y: rect.top, targetElement: childElement, insertBefore: true });  // top border
                    sides.push({ x: (rect.left + rect.right) / 2, y: rect.bottom, targetElement: childElement, insertBefore: false });  // bottom border
                }
            }

            let closestDist = null;

            for (let side of sides)
            {
                let dist = Math.sqrt(Math.pow(side.x - e.clientX, 2) + Math.pow(side.y - e.clientY, 2));

                if (closestDist === null || dist < closestDist)
                {
                    closestDist = dist;
                    targetElement = side.targetElement;
                    insertBefore = side.insertBefore;
                }
            }

            if (targetElement === null)
            {
                targetElement = parentElement;
                insertBefore = null;
            }
        }

        let sameAsBefore = targetElement === this.#state.targetElement && insertBefore === this.#state.insertBefore;

        if (this.#state.targetElement !== null)
        {
            if (this.#state.insertBefore === true)
            {
                let previousSibling = this.#state.targetElement.previousSibling;
                if (previousSibling !== null && previousSibling.classList.contains('foxybdr-drag-drop-insert'))
                    previousSibling = previousSibling.previousSibling;

                if (previousSibling === targetElement && insertBefore === false)
                    sameAsBefore = true;
            }
            else if (this.#state.insertBefore === false)
            {
                let nextSibling = this.#state.targetElement.nextSibling;
                if (nextSibling !== null && nextSibling.classList.contains('foxybdr-drag-drop-insert'))
                    nextSibling = nextSibling.nextSibling;

                if (nextSibling === targetElement && insertBefore === true)
                    sameAsBefore = true;
            }
        }

        if (sameAsBefore === true && this.#state.insertElement !== null)
            return;

        this.#destroyInsertElement();

        let insertElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-drag-drop-insert');

        if (insertBefore === null)
            targetElement.appendChild(insertElement);
        else
            targetElement.parentElement.insertBefore(insertElement, insertBefore ? targetElement : targetElement.nextSibling);

        setTimeout(function() {
            insertElement.classList.add('foxybdr-show');
        }, 10);

        this.#state.targetElement = targetElement;
        this.#state.insertBefore = insertBefore;
        this.#state.insertElement = insertElement;
    }

    #onDrop(e)
    {
        if (this.#state.insertElement)
        {
            this.#state.insertElement.remove();
    
            e.preventDefault();

            this.sendEvent({
                type: 'element-drop',
                sourceElement: FoxyApp.Class.UI.ElementDragDrop.sourceElement,
                targetElement: this.#state.targetElement,
                insertBefore: this.#state.insertBefore
            });

            this.#state.targetElement = null;
            this.#state.insertBefore = null;
            this.#state.insertElement = null;
            this.#state.lastMouseX = null;
            this.#state.lastMouseY = null;
        }
    }

    #onDragStart(e)
    {
        if (e.target.draggable === false)
            return;

        for (let sourceType of this.#sourceTypes)
        {
            if (e.target.matches(sourceType.sourceSelector))
            {
                e.dataTransfer.setData("text/plain", '');
                e.dataTransfer.effectAllowed = "move";
                FoxyApp.Class.UI.ElementDragDrop.setSourceElement(e.target);
                break;
            }
        }
    }

    #onDragEnd(e)
    {
        FoxyApp.Class.UI.ElementDragDrop.setSourceElement(null);
    }

    #scrollIfNeeded(e)
    {
        if (this.#state.lastMouseX !== null && this.#state.lastMouseY !== null)
        {
            let scrollRect = this.#scrollElementIsWindow ? new DOMRect(0, 0, this.#scrollElement.innerWidth, this.#scrollElement.innerHeight) : this.#scrollElement.getBoundingClientRect();

            if (this.#doesRectContain(scrollRect, e.clientX, e.clientY))
            {
                let thresholdX = this.#scrollThreshold;
                let thresholdY = this.#scrollThreshold;
                if (this.#scrollThresholdUnits === '%')
                {
                    thresholdX *= 0.01 * scrollRect.width;
                    thresholdY *= 0.01 * scrollRect.height;
                }

                let scrollX = null;
                let scrollY = null;

                if (e.clientX < scrollRect.left + thresholdX)
                    scrollX = -Math.abs(this.#state.lastMouseY - e.clientY);
                else if (e.clientX > scrollRect.right - thresholdX)
                    scrollX = Math.abs(this.#state.lastMouseY - e.clientY);

                if (e.clientY < scrollRect.top + thresholdY)
                    scrollY = -Math.abs(this.#state.lastMouseX - e.clientX);
                else if (e.clientY > scrollRect.bottom - thresholdY)
                    scrollY = Math.abs(this.#state.lastMouseX - e.clientX);

                if (scrollX !== null || scrollY !== null)
                {
                    const growthFactor = 2.0;
                    scrollX = Number(scrollX) * growthFactor;
                    scrollY = Number(scrollY) * growthFactor;

                    this.#scrollBy(scrollX, scrollY);
                }
            }
        }

        this.#state.lastMouseX = e.clientX;
        this.#state.lastMouseY = e.clientY;
    }

    #scrollBy(scrollX, scrollY)
    {
        if (this.#scrollElementIsWindow)
        {
            this.#scrollElement.scrollBy({ left: scrollX, top: scrollY, behavior: 'smooth' });
        }
        else
        {
            let scrollLeft = this.#scrollElement.scrollLeft + scrollX;
            let scrollRangeX = this.#scrollElement.scrollWidth - this.#scrollElement.clientWidth;
            if (scrollLeft < 0)
                scrollLeft = 0;
            if (scrollLeft > scrollRangeX)
                scrollLeft = scrollRangeX;
            this.#scrollElement.scrollLeft = scrollLeft;

            let scrollTop = this.#scrollElement.scrollTop + scrollY;
            let scrollRangeY = this.#scrollElement.scrollHeight - this.#scrollElement.clientHeight;
            if (scrollTop < 0)
                scrollTop = 0;
            if (scrollTop > scrollRangeY)
                scrollTop = scrollRangeY;
            this.#scrollElement.scrollTop = scrollTop;
        }
    }

    #findBestParentElement(parentSelector, forbiddenSelector, mouseX, mouseY)
    {
        let elements;

        if (parentSelector === null)
            elements = [ this.#scopeElement ];
        else
            elements = this.#scopeElement.querySelectorAll(parentSelector);
    
        let parentElements = [];
    
        for (let i = 0; i < elements.length; i++)
        {
            if (forbiddenSelector)
            {
                let forbiddenElement = elements[i].closest(forbiddenSelector);

                if (forbiddenElement !== null && forbiddenElement !== this.#scopeElement && this.#scopeElement.contains(forbiddenElement))
                    continue;
            }

            parentElements.push(elements[i]);
        }
    
        let bestParentElement = null;
    
        for (let parentElement of parentElements)
        {
            let rect = parentElement.getBoundingClientRect();
    
            if (this.#doesRectContain(rect, mouseX, mouseY) === false)
                continue;
    
            if (bestParentElement === null || bestParentElement.contains(parentElement))
                bestParentElement = parentElement;
        }
    
        return bestParentElement;
    }
    
    #doesRectContain(rect, x, y)
    {
        return (rect.left <= x && x <= rect.right &&
                rect.top  <= y && y <= rect.bottom);
    }

    #destroyInsertElement()
    {
        if (this.#state.insertElement)
        {
            let insertElement = this.#state.insertElement;

            if (insertElement.classList.contains('foxybdr-show'))
            {
                insertElement.classList.remove('foxybdr-show');

                setTimeout(function() {
                    insertElement.remove();
                }, 200);
            }
            else
            {
                insertElement.remove();
            }
    
            this.#state.targetElement = null;
            this.#state.insertBefore = null;
            this.#state.insertElement = null;
        }
    }
    
    destroy()
    {
        super.destroy();

        this.#destroyInsertElement();

        this.#scopeElement = null;
        this.#scrollElement = null;
        this.#state = null;

        let newInstanceList = [];
        for (let instance of FoxyApp.Class.UI.ElementDragDrop.instances)
        {
            if (instance !== this)
                newInstanceList.push(instance);
        }
        FoxyApp.Class.UI.ElementDragDrop.instances = newInstanceList;
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MANAGER CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.Manager = {};

FoxyApp.Class.Manager.ModelManager = class
{
    #eventListeners = {};

    undoStack = [];
    redoStack = [];
    saveAction = null;

    constructor()
    {
        for (let modelName of Object.keys(FoxyApp.Class.Event.Model))
            this.#eventListeners[modelName] = [];

        this.#eventListeners['History'] = [];

        this.saveAction = {
            redoCommand: null,
            undoCommand: null,
            wInstanceID: null,
            componentID: null
        };

        this.undoStack.push(this.saveAction);
    }

    /*
     * Method addEventListener.
     * Listener classes must have a method named "handleEvent" with two parameters for: (1) event object, (2) command object.
     * The command object contains the original command submitted by the submitter, in case the listener is interested in
     * specific details leading up to the event. The event object contains only generic information about the event, such as,
     * for example, the ID of the widget instance that has changed. It is the responsibility of the listener to look up full
     * information of the widget instance in FoxyApp.Model.*.
     */
    addEventListener(modelName, listener)
    {
        this.#eventListeners[modelName].push(listener);
    }

    /*
     * Method submitCommand.
     * Anyone can submit a command to change any model in FoxyApp.Model.*. Interested event listeners will get events that
     * correspond to any changes made to FoxyApp.Model.*. If the 'submitter' argument is non-null, the submitter will not
     * receive any event resulting from this command, even if the submitter is a registered event listener to any event
     * types resulting from this command.
     */
    submitCommand(submitter, command)
    {
        return this.#executeCommand(submitter, command, false);
    }

    /*
     * Method #executeCommand.
     * This method is called by the submitCommand() method. It is also called by the undo/redo logic. The boolean parameter
     * "isHistory" is true if the command is from the undo/redo history, so that we know not to push the command onto the
     * undo stack again.
     */
    #executeCommand(submitter, command, isHistory)
    {
        if (command.type[0] !== 'Model')
            return false;

        let events;

        switch (command.type[1])
        {
            case 'Template':
                events = this.#processCommand_template(command, isHistory);
                break;

            case 'Component':
                events = this.#processCommand_component(command, isHistory);
                break;

            case 'ComponentWidgetInstance':
                events = this.#processCommand_component_widget_instance(command, isHistory);
                break;

            case 'Settings':
                events = this.#processCommand_settings(command, isHistory);
                break;

            case 'Selection':
                events = this.#processCommand_selection(command, isHistory);
                break;

            case 'Device':
                events = this.#processCommand_device(command, isHistory);
                break;
        }

        if (events === false)
            return false;

        if (events !== undefined)
        {
            for (let event of events)
            {
                if (event.type[0] !== 'Model')
                    continue;
    
                for (let listener of this.#eventListeners[event.type[1]])
                {
                    if (listener === submitter)
                        continue;
    
                    listener.handleEvent(event, command);
                }
            }
        }

        return true;
    }

    #processCommand_template(command, isHistory)
    {
        switch (command.type[2])
        {
            case 'Insert':

                {
                    if (isHistory === false)
                    {
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.Template.Delete(command.wInstanceData.id), FoxyApp.Class.Model.WidgetInstance.getIDs(command.wInstanceData), null);
                    }

                    let widgetInstance = FoxyApp.Class.Model.WidgetInstance.loadTree(command.wInstanceData);

                    FoxyApp.Class.Node.insertIntoIndexedTree(FoxyApp.Model.widgetInstanceTree, FoxyApp.Model.widgetInstanceMap, widgetInstance, command.targetID, command.insertBefore);

                    return [ new FoxyApp.Class.Event.Model.Template.Insert(widgetInstance, command.targetID, command.insertBefore) ];
                }

                break;

            case 'Update':

                {
                    let widgetInstance = FoxyApp.Model.widgetInstanceMap[command.wInstanceID];

                    if (isHistory === false)
                    {
                        let oldSettingValue = widgetInstance.getValue(command.settingName);
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.Template.Update(command.wInstanceID, command.settingName, oldSettingValue), null, null);
                    }

                    widgetInstance.setValue(command.settingName, command.settingValue);

                    return [ new FoxyApp.Class.Event.Model.Template.Update(command.wInstanceID, command.settingName, command.settingValue) ];
                }

                break;

            case 'ComponentUpdate':
                {
                    let widgetInstance = FoxyApp.Model.widgetInstanceMap[command.wInstanceID];

                    if (isHistory === false)
                    {
                        let oldSettingValue = widgetInstance.getComponentValue(command.cwInstanceID, command.settingName);
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.Template.ComponentUpdate(command.wInstanceID, command.cwInstanceID, command.settingName, oldSettingValue), null, null);
                    }

                    widgetInstance.setComponentValue(command.cwInstanceID, command.settingName, command.settingValue);

                    return [ new FoxyApp.Class.Event.Model.Template.ComponentUpdate(command.wInstanceID, command.cwInstanceID, command.settingName, command.settingValue) ];
                }
                break;

            case 'Delete':

                {
                    let widgetInstance = FoxyApp.Model.widgetInstanceMap[command.wInstanceID];

                    if (isHistory === false)
                    {
                        let wInstanceData = widgetInstance.saveTree();
                        const { targetID, insertBefore } = widgetInstance.getInsertParams(FoxyApp.Model.widgetInstanceTree);
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.Template.Insert(wInstanceData, targetID, insertBefore), FoxyApp.Class.Model.WidgetInstance.getIDs(wInstanceData), null);
                    }

                    widgetInstance.destroy();

                    let events = [ new FoxyApp.Class.Event.Model.Template.Delete(command.wInstanceID) ];

                    if (FoxyApp.Model.selection.wInstanceID !== null && FoxyApp.Model.widgetInstanceMap[FoxyApp.Model.selection.wInstanceID] === undefined)
                    {
                        FoxyApp.Model.selection.wInstanceID = null;
                        FoxyApp.Model.selection.cwInstanceID = null;

                        events.push(new FoxyApp.Class.Event.Model.Selection(null, null));
                    }

                    return events;
                }

                break;
        }
    }

    #processCommand_component(command, isHistory)
    {
        switch (command.type[2])
        {
            case 'Insert':

                {
                    if (isHistory === false)
                    {
                        let wids = FoxyApp.Class.Model.Component.getWidgetInstanceIDs(command.componentData);
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.Component.Delete(command.componentData.id), wids, command.componentData.id);
                    }

                    let component = FoxyApp.Class.Model.Component.loadTree(command.componentData);
            
                    FoxyApp.Class.Node.insertIntoIndexedTree(FoxyApp.Model.componentTree, FoxyApp.Model.componentMap, component, command.targetID, command.insertBefore);

                    return [ new FoxyApp.Class.Event.Model.Component.Insert(component, command.targetID, command.insertBefore) ];
                }

                break;

            case 'Rename':

                {
                    let component = FoxyApp.Model.componentMap[command.componentID];

                    if (isHistory === false)
                    {
                        let oldTitle = component.data.title;
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.Component.Rename(command.componentID, oldTitle), null, null);
                    }

                    component.data.title = command.title;

                    return [ new FoxyApp.Class.Event.Model.Component.Rename(command.componentID, command.title) ];
                }

                break;

            case 'Delete':

                {
                    let hasDependencies = false;
                    for (let wid in FoxyApp.Model.widgetInstanceMap)
                    {
                        let wi = FoxyApp.Model.widgetInstanceMap[wid];
                        if (wi.data.widgetType === 1 && wi.data.widgetID === command.componentID)
                        {
                            hasDependencies = true;
                            break;
                        }
                    }
                    if (hasDependencies)
                    {
                        (new FoxyBuilder.Dialogs.Alert({
                            title: FOXYBUILDER.dialogs.componentDep.title,
                            message: FOXYBUILDER.dialogs.componentDep.message,
                            okLabel: FOXYBUILDER.dialogs.componentDep.okLabel
                        })).create();
                    
                        return false;
                    }

                    let component = FoxyApp.Model.componentMap[command.componentID];

                    if (isHistory === false)
                    {
                        let componentData = component.saveTree();
                        let wids = FoxyApp.Class.Model.Component.getWidgetInstanceIDs(componentData);
                        const { targetID, insertBefore } = component.getInsertParams(FoxyApp.Model.componentTree);
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.Component.Insert(componentData, targetID, insertBefore), wids, command.componentID);
                    }

                    component.destroy();

                    let events = [ new FoxyApp.Class.Event.Model.Component.Delete(command.componentID) ];

                    if (FoxyApp.Model.selection.wInstanceID  !== null && FoxyApp.Model.widgetInstanceMap[FoxyApp.Model.selection.wInstanceID]  === undefined ||
                        FoxyApp.Model.selection.cwInstanceID !== null && FoxyApp.Model.widgetInstanceMap[FoxyApp.Model.selection.cwInstanceID] === undefined)
                    {
                        FoxyApp.Model.selection.wInstanceID = null;
                        FoxyApp.Model.selection.cwInstanceID = null;

                        events.push(new FoxyApp.Class.Event.Model.Selection(null, null));
                    }

                    return events;
                }

                break;
        }
    }

    #processCommand_component_widget_instance(command, isHistory)
    {
        switch (command.type[2])
        {
            case 'Insert':

                {
                    if (isHistory === false)
                    {
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Event.Model.ComponentWidgetInstance.Delete(command.componentID, command.wInstanceData.id), FoxyApp.Class.Model.WidgetInstance.getIDs(command.wInstanceData), null);
                    }

                    let widgetInstance = FoxyApp.Class.Model.WidgetInstance.loadTree(command.wInstanceData);

                    let component = FoxyApp.Model.componentMap[command.componentID];

                    FoxyApp.Class.Node.insertIntoIndexedTree(component, FoxyApp.Model.widgetInstanceMap, widgetInstance, command.targetID, command.insertBefore);

                    return [ new FoxyApp.Class.Event.Model.ComponentWidgetInstance.Insert(widgetInstance, command.componentID, command.targetID, command.insertBefore) ];
                }

                break;

            case 'Update':

                {
                    let widgetInstance = FoxyApp.Model.widgetInstanceMap[command.wInstanceID];

                    if (isHistory === false)
                    {
                        let oldSettingValue = widgetInstance.getValue(command.settingName);
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.ComponentWidgetInstance.Update(command.wInstanceID, command.settingName, oldSettingValue), null, null);
                    }

                    widgetInstance.setValue(command.settingName, command.settingValue);

                    return [ new FoxyApp.Class.Event.Model.ComponentWidgetInstance.Update(command.wInstanceID, command.settingName, command.settingValue) ];
                }

                break;

            case 'Delete':

                {
                    let widgetInstance = FoxyApp.Model.widgetInstanceMap[command.wInstanceID];

                    if (this.#hasComponentDependencies(widgetInstance))
                    {
                        (new FoxyBuilder.Dialogs.Alert({
                            title: FOXYBUILDER.dialogs.componentDep.title,
                            message: FOXYBUILDER.dialogs.componentDep.message,
                            okLabel: FOXYBUILDER.dialogs.componentDep.okLabel
                        })).create();
                    
                        return false;
                    }

                    if (isHistory === false)
                    {
                        let wInstanceData = widgetInstance.saveTree();
                        let component = FoxyApp.Model.componentMap[command.componentID];
                        const { targetID, insertBefore } = widgetInstance.getInsertParams(component);
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.ComponentWidgetInstance.Insert(wInstanceData, command.componentID, targetID, insertBefore), FoxyApp.Class.Model.WidgetInstance.getIDs(wInstanceData), null);
                    }

                    widgetInstance.destroy();

                    let events = [ new FoxyApp.Class.Event.Model.ComponentWidgetInstance.Delete(command.componentID, command.wInstanceID) ];

                    if (FoxyApp.Model.selection.wInstanceID  !== null && FoxyApp.Model.widgetInstanceMap[FoxyApp.Model.selection.wInstanceID]  === undefined ||
                        FoxyApp.Model.selection.cwInstanceID !== null && FoxyApp.Model.widgetInstanceMap[FoxyApp.Model.selection.cwInstanceID] === undefined)
                    {
                        FoxyApp.Model.selection.wInstanceID = null;
                        FoxyApp.Model.selection.cwInstanceID = null;

                        events.push(new FoxyApp.Class.Event.Model.Selection(null, null));
                    }

                    return events;
                }

                break;
        }
    }

    #processCommand_settings(command, isHistory)
    {
        switch (command.type[2])
        {
            case 'Update':

                {
                    let widgetInstance = FoxyApp.Model.widgetInstanceMap[command.wInstanceID];

                    if (isHistory === false)
                    {
                        let oldSettingValue = widgetInstance.getValue(command.settingName);
                        this.#addHistoryAction(this.cloneCommand(command), new FoxyApp.Class.Command.Model.Settings.Update(command.wInstanceID, command.settingName, oldSettingValue), null, null);
                    }

                    widgetInstance.setValue(command.settingName, command.settingValue);

                    return [ new FoxyApp.Class.Event.Model.Settings.Update(command.wInstanceID, command.settingName, command.settingValue) ];
                }

                break;
        }
    }

    #processCommand_selection(command, isHistory)
    {
        if (command instanceof FoxyApp.Class.Command.Model.Selection)
        {
            FoxyApp.Model.selection.wInstanceID  = command.wInstanceID;
            FoxyApp.Model.selection.cwInstanceID = command.cwInstanceID;

            return [ new FoxyApp.Class.Event.Model.Selection(command.wInstanceID, command.cwInstanceID) ];
        }
    }

    #processCommand_device(command, isHistory)
    {
        if (command instanceof FoxyApp.Class.Command.Model.Device)
        {
            FoxyApp.Model.device.deviceMode = command.deviceMode;

            return [ new FoxyApp.Class.Event.Model.Device() ];
        }
    }

    cloneCommand(command)
    {
        let newCommand = Object.assign(Object.create(Object.getPrototypeOf(command)), command);

        if (newCommand instanceof FoxyApp.Class.Command.Model.Template.Insert ||
            newCommand instanceof FoxyApp.Class.Command.Model.ComponentWidgetInstance.Insert)
        {
            newCommand.wInstanceData = structuredClone(command.wInstanceData);
        }
        else if (newCommand instanceof FoxyApp.Class.Command.Model.Component.Insert)
        {
            newCommand.componentData = structuredClone(command.componentData);
        }
        else if (
            newCommand instanceof FoxyApp.Class.Command.Model.Template.Update ||
            newCommand instanceof FoxyApp.Class.Command.Model.Template.ComponentUpdate ||
            newCommand instanceof FoxyApp.Class.Command.Model.ComponentWidgetInstance.Update)
        {
            if (typeof newCommand.settingValue === 'object')
                newCommand.settingValue = structuredClone(command.settingValue);
        }
        else if (newCommand instanceof FoxyApp.Class.Command.Model.Settings.Update)
        {
            if (typeof newCommand.settingValue === 'object')
                newCommand.settingValue = structuredClone(command.settingValue);
        }

        return newCommand;
    }

    #addHistoryAction(redoCommand, undoCommand, wInstanceID, componentID)
    {
        let mergeActions = false;

        if (this.undoStack.length > 0)
        {
            let previousAction = this.undoStack[this.undoStack.length - 1];

            if (previousAction.redoCommand !== null && previousAction !== this.saveAction)
            {
                let previousCommand = previousAction.redoCommand;

                if (previousCommand instanceof FoxyApp.Class.Command.Model.Template.Update && redoCommand instanceof FoxyApp.Class.Command.Model.Template.Update ||
                    previousCommand instanceof FoxyApp.Class.Command.Model.ComponentWidgetInstance.Update && redoCommand instanceof FoxyApp.Class.Command.Model.ComponentWidgetInstance.Update ||
                    previousCommand instanceof FoxyApp.Class.Command.Model.Settings.Update && redoCommand instanceof FoxyApp.Class.Command.Model.Settings.Update)
                {
                    if (previousCommand.wInstanceID === redoCommand.wInstanceID && previousCommand.settingName === redoCommand.settingName)
                    {
                        mergeActions = true;

                        previousAction.redoCommand = redoCommand;
                    }
                }
                else if (previousCommand instanceof FoxyApp.Class.Command.Model.Template.ComponentUpdate && redoCommand instanceof FoxyApp.Class.Command.Model.Template.ComponentUpdate)
                {
                    if (previousCommand.wInstanceID === redoCommand.wInstanceID && previousCommand.cwInstanceID === redoCommand.cwInstanceID && previousCommand.settingName === redoCommand.settingName)
                    {
                        mergeActions = true;

                        previousAction.redoCommand = redoCommand;
                    }
                }
            }
        }

        if (mergeActions === false)
        {
            this.undoStack.push({
                redoCommand: redoCommand,
                undoCommand: undoCommand,
                wInstanceID: wInstanceID,
                componentID: componentID
            });
        }

        if (this.redoStack.includes(this.saveAction))
            this.saveAction = null;

        this.redoStack = [];

        let event = new FoxyApp.Class.Event.History();
        for (let listener of this.#eventListeners['History'])
            listener.handleEvent(event, null);
    }

    undo()
    {
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1].undoCommand !== null)
        {
            let action = this.undoStack.pop();

            let undoCommand = this.cloneCommand(action.undoCommand);

            if (this.#executeCommand(null, undoCommand, true) === false)
            {
                this.undoStack.push(action);
                return false;
            }

            this.redoStack.push(action);
        }

        let event = new FoxyApp.Class.Event.History();
        for (let listener of this.#eventListeners['History'])
            listener.handleEvent(event, null);

        return true;
    }

    redo()
    {
        if (this.redoStack.length > 0)
        {
            let action = this.redoStack.pop();

            let redoCommand = this.cloneCommand(action.redoCommand);

            if (this.#executeCommand(null, redoCommand, true) === false)
            {
                this.redoStack.push(action);
                return false;
            }

            this.undoStack.push(action);
        }

        let event = new FoxyApp.Class.Event.History();
        for (let listener of this.#eventListeners['History'])
            listener.handleEvent(event, null);

        return true;
    }

    #hasComponentDependencies(widgetInstance)
    {
        for (let wid in FoxyApp.Model.widgetInstanceMap)
        {
            let wi = FoxyApp.Model.widgetInstanceMap[wid];

            if (wi.data.widgetType === 1 && wi.data.componentSettings[widgetInstance.data.id] !== undefined)
                return true;
        }

        for (let childNode of widgetInstance.children)
        {
            if (this.#hasComponentDependencies(childNode) === true)
                return true;
        }

        return false;
    }

    destroy()
    {
        this.#eventListeners = {};
    }
};

FoxyApp.Class.Manager.PanelManager = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #panelModules = [];
    #panelButtonElements = [];

    constructor()
    {
        super();
    }

    registerPanelModule(panelModule, buttonID)
    {
        this.#panelModules.push(panelModule);

        if (buttonID !== null)
        {
            let buttonElement = document.getElementById(buttonID);
            this.#panelButtonElements.push(buttonElement);

            this.registerEvent(buttonElement, 'click');
        }
        else
        {
            this.#panelButtonElements.push(null);
        }
    }

    handleEvent(e)
    {
        if (e.type === 'click' && e.button === 0)
        {
            let newTitle = '';

            for (let i = 0; i < this.#panelButtonElements.length; i++)
            {
                let buttonElement = this.#panelButtonElements[i];
                let panelModule = this.#panelModules[i];

                let show = buttonElement === e.currentTarget;

                let title = panelModule.activate(show);

                if (show)
                    newTitle = title;
            }

            document.querySelector('#foxybdr-panel-title > span').innerText = newTitle;
        }
    }

    activate(panelModule)
    {
        let newTitle = '';

        for (let pm of this.#panelModules)
        {
            let show = pm === panelModule;

            let title = pm.activate(show);

            if (show)
                newTitle = title;
        }

        document.querySelector('#foxybdr-panel-title > span').innerText = newTitle;
    }

    destroy()
    {
        super.destroy();

        this.#panelModules = [];
        this.#panelButtonElements = [];
    }
};

FoxyApp.Class.Manager.DrawerManager = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #drawerElement = null;
    #tabsElement = null;
    #tabBodyElement = null;

    #moduleItems = [];

    constructor()
    {
        super();
    }

    create()
    {
        this.#drawerElement = document.querySelector('#foxybdr-drawer');
        this.#tabsElement = this.#drawerElement.querySelector('.foxybdr-tabs');
        this.#tabBodyElement = this.#drawerElement.querySelector('.foxybdr-tab-body');

        this.registerEvent(this.#drawerElement.querySelector('.foxybdr-pin-button'), 'click');

        this.registerEvent(this.#tabsElement, 'wheel');
    }

    registerModule(module, title, tabPageElement)
    {
        let tabElement = document.createElement('div');
        tabElement.classList.add('foxybdr-tab');
        tabElement.innerText = title;
        this.#tabsElement.appendChild(tabElement);

        this.registerEvent(tabElement, 'click');

        this.#tabBodyElement.appendChild(tabPageElement);

        this.#moduleItems.push({
            tabElement: tabElement,
            tabPageElement: tabPageElement,
            module: module
        });

        if (this.#moduleItems.length === 1)
        {
            tabElement.classList.add('foxybdr-active');
            tabPageElement.classList.add('foxybdr-active');
        }
    }

    handleEvent(e)
    {
        if (e.type === 'click' && e.button === 0 && e.currentTarget.classList.contains('foxybdr-tab') && e.currentTarget.classList.contains('foxybdr-active') === false)
        {
            for (let moduleItem of this.#moduleItems)
            {
                if (moduleItem.tabElement === e.currentTarget)
                {
                    moduleItem.tabElement.classList.add('foxybdr-active');
                    moduleItem.tabPageElement.classList.add('foxybdr-active');
                }
                else
                {
                    moduleItem.tabElement.classList.remove('foxybdr-active');
                    moduleItem.tabPageElement.classList.remove('foxybdr-active');
                }
            }
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget.classList.contains('foxybdr-pin-button'))
        {
            e.currentTarget.classList.toggle('foxybdr-active');

            if (e.currentTarget.classList.contains('foxybdr-active'))
                this.#drawerElement.classList.add('foxybdr-pinned');
            else
                this.#drawerElement.classList.remove('foxybdr-pinned');
        }
        else if (e.type === 'wheel' && e.currentTarget === this.#tabsElement)
        {
            e.preventDefault();

            let scrollLeft = this.#tabsElement.scrollLeft;

            switch (e.deltaMode)
            {
                case WheelEvent.DOM_DELTA_PIXEL:
                    scrollLeft += e.deltaY / 3.0;
                    break;

                case WheelEvent.DOM_DELTA_LINE:
                    scrollLeft += e.deltaY * 33.3;
                    break;

                case WheelEvent.DOM_DELTA_PAGE:
                    scrollLeft += e.deltaY * this.#tabsElement.clientWidth;
                    break;
            }

            let scrollRange = this.#tabsElement.scrollWidth - this.#tabsElement.clientWidth;
            scrollLeft = Math.min(Math.max(scrollLeft, 0), scrollRange);

            this.#tabsElement.scrollLeft = scrollLeft;
        }
    }

    activate(module)
    {
        for (let moduleItem of this.#moduleItems)
        {
            if (moduleItem.module === module)
            {
                moduleItem.tabElement.classList.add('foxybdr-active');
                moduleItem.tabPageElement.classList.add('foxybdr-active');
            }
            else
            {
                moduleItem.tabElement.classList.remove('foxybdr-active');
                moduleItem.tabPageElement.classList.remove('foxybdr-active');
            }
        }
    }

    destroy()
    {
        super.destroy();

        this.#drawerElement = null;
        this.#tabsElement = null;
        this.#tabBodyElement = null;

        for (let moduleItem of this.#moduleItems)
        {
            moduleItem.tabElement.remove();
            moduleItem.tabPageElement.remove();
        }

        this.#moduleItems = [];
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VIEW CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.View = {};

FoxyApp.Class.View.PanelModule = {};

FoxyApp.Class.View.PanelModule.SiteSettingsModule = class extends FoxyApp.Class.UI.Component.PanelModule.SettingsModule
{
    constructor()
    {
        super();
    }

    create()
    {
        super.create();

        FoxyApp.Manager.panelManager.registerPanelModule(this, 'foxybdr-toolbar-btn-site-settings');

        this.load('S', null, 'S-siteSettings', null);
    }

    activate(show)
    {
        super.activate(show);

        return 'Site Settings';
    }

    navigateToGlobalColors()
    {
        this.activateTabPageByName('colors');

        FoxyApp.Manager.panelManager.activate(this);
    }

    navigateToGlobalFonts()
    {
        this.activateTabPageByName('fonts');

        FoxyApp.Manager.panelManager.activate(this);
    }
};

FoxyApp.Class.View.PanelModule.PropertiesModule = class extends FoxyApp.Class.UI.Component.PanelModule.SettingsModule
{
    constructor()
    {
        super();

        FoxyApp.Manager.modelManager.addEventListener('Selection', this);
    }

    create()
    {
        super.create();

        FoxyApp.Manager.panelManager.registerPanelModule(this, null);
    }

    handleEvent(e)
    {
        if (e instanceof FoxyApp.Class.Event.Model.Selection)
        {
            if (e.wInstanceID !== null)
            {
                FoxyApp.Manager.panelManager.activate(this);
            }
            else if (e.wInstanceID === null && this.isActivated())
            {
                FoxyApp.Manager.panelManager.activate(null);
            }
        }

        super.handleEvent(e);
    }

    activate(show)
    {
        super.activate(show);

        if (show)
        {
            let wInstanceID  = FoxyApp.Model.selection.wInstanceID;
            let cwInstanceID = FoxyApp.Model.selection.cwInstanceID;

            if (wInstanceID !== this.widgetInstanceID || cwInstanceID !== this.cWidgetInstanceID)
            {
                let parts = wInstanceID.split('-');

                this.load(parts[0], null, wInstanceID, cwInstanceID);
            }

            let panelModuleTitle = '';
            let widgetInstance = FoxyApp.Model.widgetInstanceMap[cwInstanceID !== null ? cwInstanceID : wInstanceID];
            switch (widgetInstance.data.widgetType)
            {
                case 0:  // widget
                    let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];
                    panelModuleTitle = `Edit ${widget.title}`;
                    break;

                case 1:  // component
                    panelModuleTitle = `Edit Component`;
                    break;
            }

            return panelModuleTitle;
        }
        else
        {
            this.unload();

            if (FoxyApp.Model.selection.wInstanceID !== null)
            {
                let command = new FoxyApp.Class.Command.Model.Selection(null, null);
                FoxyApp.Manager.modelManager.submitCommand(this, command);
            }

            return '';
        }
    }
};

FoxyApp.Class.View.PanelModule.WidgetsModule = class extends FoxyApp.Class.UI.Component.PanelModule.WidgetsModule
{
    constructor()
    {
        super();
    }

    create()
    {
        super.create();

        FoxyApp.Manager.panelManager.registerPanelModule(this, 'foxybdr-widgets-button');
    }

    activate(show)
    {
        super.activate(show);

        return 'Add New';
    }
}

FoxyApp.Class.View.DrawerModule = {};

FoxyApp.Class.View.DrawerModule.WidgetInstanceNode = class extends FoxyApp.Class.ElementNode
{
    wInstanceID = '';
    #nodeMap = null;

    constructor(wInstanceID, nodeMap)
    {
        let element = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-tree-item');
        let containerElement = element.querySelector('.foxybdr-container');

        super(element, containerElement);

        this.wInstanceID = wInstanceID;
        this.#nodeMap = nodeMap;

        if (this.#nodeMap[this.wInstanceID] === undefined)
            this.#nodeMap[this.wInstanceID] = [];

        this.#nodeMap[this.wInstanceID].push(this);
    }

    render(deep)
    {
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[this.wInstanceID];
        let widgetType = widgetInstance.data.widgetType;
        let widgetID = widgetInstance.data.widgetID;

        let title;
        let isContainer;

        switch (widgetType)
        {
            case 0:
                {
                    let widget = FoxyApp.Model.widgets[widgetID];
                    title = widget.title;
                    isContainer = widget.container;
                }
                break;

            case 1:
                {
                    let component = FoxyApp.Model.componentMap[widgetID];
                    title = `Component: ${component.data.title}`;
                    isContainer = true;
                }
                break;
        }

        this.element.querySelector('.foxybdr-title').innerText = title;
        this.element.setAttribute('foxybdr-instance-id', this.wInstanceID);
        this.element.setAttribute('foxybdr-widget-type', widgetType === 0 ? widgetID : 'foxybdr.layout.component');

        if (isContainer)
        {
            this.element.classList.add('foxybdr-expandable');
            this.element.classList.add('foxybdr-expanded');
        }
        else
        {
            this.element.classList.remove('foxybdr-expandable');
        }

        if (deep === true)
        {
            let newChildNodes = [];

            switch (widgetType)
            {
                case 0:
                    {
                        for (let childWidgetInstance of widgetInstance.children)
                        {
                            let newChildNode = new FoxyApp.Class.View.DrawerModule.WidgetInstanceNode(childWidgetInstance.data.id, this.#nodeMap);
                            newChildNode.render(deep);
                            newChildNodes.push(newChildNode);
                        }
                    }
                    break;

                case 1:
                    {
                        let component = FoxyApp.Model.componentMap[widgetID];

                        for (let childWidgetInstance of component.children)
                        {
                            let newChildNode = new FoxyApp.Class.View.DrawerModule.WidgetInstanceNode(childWidgetInstance.data.id, this.#nodeMap);
                            newChildNode.render(deep);
                            newChildNodes.push(newChildNode);
                        }
                    }
                    break;
            }

            for (let oldChildNode of [ ...this.children ])
            {
                this.removeChild(oldChildNode);
                oldChildNode.destroy();
            }

            for (let newChildNode of newChildNodes)
                this.appendChild(newChildNode);
        }
    }

    select(select)
    {
        if (select)
            this.element.classList.add('foxybdr-selected');
        else
            this.element.classList.remove('foxybdr-selected');
    }

    destroy()
    {
        super.destroy();

        let index = this.#nodeMap[this.wInstanceID].indexOf(this);
        this.#nodeMap[this.wInstanceID].splice(index, 1);

        if (this.#nodeMap[this.wInstanceID].length === 0)
            delete this.#nodeMap[this.wInstanceID];

        this.#nodeMap = null;
    }
};

FoxyApp.Class.View.DrawerModule.ComponentNode = class extends FoxyApp.Class.ElementNode
{
    componentID = -1;
    #cNodeMap = null;
    #wNodeMap = null;

    constructor(componentID, cNodeMap, wNodeMap)
    {
        let element = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-tree-item');
        let containerElement = element.querySelector('.foxybdr-container');

        super(element, containerElement);

        this.componentID = componentID;
        this.#cNodeMap = cNodeMap;
        this.#wNodeMap = wNodeMap;

        this.#cNodeMap[this.componentID] = this;
    }

    render(deep)
    {
        let component = FoxyApp.Model.componentMap[this.componentID];

        this.element.querySelector('.foxybdr-title').innerText = component.data.title;
        this.element.setAttribute('foxybdr-component-id', String(this.componentID));

        this.element.classList.add('foxybdr-expandable');
        this.element.classList.add('foxybdr-expanded');

        if (deep === true)
        {
            let newChildNodes = [];

            for (let childWidgetInstance of component.children)
            {
                let newChildNode = new FoxyApp.Class.View.DrawerModule.WidgetInstanceNode(childWidgetInstance.data.id, this.#wNodeMap);
                newChildNode.render(deep);
                newChildNodes.push(newChildNode);
            }

            for (let oldChildNode of [ ...this.children ])
            {
                this.removeChild(oldChildNode);
                oldChildNode.destroy();
            }

            for (let newChildNode of newChildNodes)
                this.appendChild(newChildNode);
        }
    }

    select(select)
    {
        if (select)
            this.element.classList.add('foxybdr-selected');
        else
            this.element.classList.remove('foxybdr-selected');
    }

    destroy()
    {
        super.destroy();

        delete this.#cNodeMap[this.componentID];

        this.#cNodeMap = null;
        this.#wNodeMap = null;
    }
};

FoxyApp.Class.View.DrawerModule.Template = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #tabPageElement = null;
    #treeContainerElement = null;

    #nodeTree = null;
    #nodeMap = {};

    #dragDropProcessor = null;

    #contextMenu = null;

    constructor()
    {
        super();

        FoxyApp.Manager.modelManager.addEventListener('Template', this);
        FoxyApp.Manager.modelManager.addEventListener('Component', this);
        FoxyApp.Manager.modelManager.addEventListener('ComponentWidgetInstance', this);
        FoxyApp.Manager.modelManager.addEventListener('Selection', this);
    }

    create()
    {
        this.#tabPageElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-drawer-template');

        FoxyApp.Manager.drawerManager.registerModule(this, 'Document', this.#tabPageElement);

        this.#treeContainerElement = this.#tabPageElement.querySelector('.foxybdr-tree-container');

        this.#nodeTree = new FoxyApp.Class.ElementNode(this.#treeContainerElement, this.#treeContainerElement);

        for (let widgetInstance of FoxyApp.Model.widgetInstanceTree.children)
        {
            let newNode = new FoxyApp.Class.View.DrawerModule.WidgetInstanceNode(widgetInstance.data.id, this.#nodeMap);

            newNode.render(true);

            this.#nodeTree.appendChild(newNode);
        }

        this.registerEvent(this.#treeContainerElement, 'click');

        this.#dragDropProcessor = new FoxyApp.Class.UI.ElementDragDrop();
        this.#dragDropProcessor.create(this.#treeContainerElement, this.#treeContainerElement.closest('#foxybdr-drawer > .foxybdr-tab-body'), 8.0, '%');
        this.#dragDropProcessor.addSourceType(
            '.foxybdr-widget-card[foxybdr-widget-name="foxybdr.layout.section"]',
            null,
            null
        );
        this.#dragDropProcessor.addSourceType(
            '.foxybdr-widget-card[foxybdr-widget-name="foxybdr.layout.column"]',
            '.foxybdr-tree-item[foxybdr-widget-type="foxybdr.layout.section"] > .foxybdr-dropdown > .foxybdr-container',
            null
        );
        this.#dragDropProcessor.addSourceType(
            '.foxybdr-widget-card:not([foxybdr-widget-name="foxybdr.layout.section"], [foxybdr-widget-name="foxybdr.layout.column"])',
            '.foxybdr-tree-item[foxybdr-widget-type="foxybdr.layout.column"] > .foxybdr-dropdown > .foxybdr-container, .foxybdr-tree-item[foxybdr-widget-type="foxybdr.layout.block"][foxybdr-instance-id^="T-"] > .foxybdr-dropdown > .foxybdr-container',
            null
        );
        this.#dragDropProcessor.addEventListener(this);

        this.#contextMenu = new FoxyApp.Class.View.DrawerModule.Template_ContextMenu();
        this.#contextMenu.create(this.#treeContainerElement, '.foxybdr-tree-item');
        this.#contextMenu.addEventListener(this);

        this.#updateEmptyMessage();
    }

    handleEvent(e)
    {
        if (e instanceof FoxyApp.Class.Event.Model.Template.Insert)
        {
            this.insertWidgetInstance(e.widgetInstance, e.targetID, e.insertBefore);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Template.Delete)
        {
            this.deleteWidgetInstance(e.wInstanceID);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Component.Rename)
        {
            this.renameComponent(e.componentID, e.title);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.ComponentWidgetInstance.Insert)
        {
            this.insertCWidgetInstance(e.widgetInstance, e.componentID, e.targetID, e.insertBefore);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.ComponentWidgetInstance.Delete)
        {
            this.deleteWidgetInstance(e.wInstanceID);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Selection)
        {
            for (let wInstanceID in this.#nodeMap)
            {
                for (let node of this.#nodeMap[wInstanceID])
                {
                    let select = false;

                    if (e.wInstanceID !== null && e.cwInstanceID !== null && e.wInstanceID.startsWith('T-') && e.cwInstanceID.startsWith('C-'))
                    {
                        select = wInstanceID === e.cwInstanceID && node.element.matches(`.foxybdr-tree-item[foxybdr-instance-id="${e.wInstanceID}"] .foxybdr-tree-item`);
                    }
                    else if (e.wInstanceID !== null && e.cwInstanceID === null && e.wInstanceID.startsWith('T-'))
                    {
                        select = wInstanceID === e.wInstanceID;
                    }

                    node.select(select);
                }
            }
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget === this.#treeContainerElement)
        {
            if (e.target.matches('.foxybdr-tree-item > .foxybdr-header > .foxybdr-expander, .foxybdr-tree-item > .foxybdr-header > .foxybdr-expander *'))
            {
                let treeItemElement = e.target.closest('.foxybdr-tree-item');

                if (treeItemElement.classList.contains('foxybdr-expandable'))
                {
                    treeItemElement.classList.toggle('foxybdr-expanded');
                }
            }
            else if (e.target.matches('.foxybdr-tree-item > .foxybdr-header > .foxybdr-card, .foxybdr-tree-item > .foxybdr-header > .foxybdr-card *'))
            {
                let treeItemElement = e.target.closest('.foxybdr-tree-item');
                let wInstanceID = treeItemElement.getAttribute('foxybdr-instance-id');
                let cwInstanceID = null;

                if (wInstanceID.startsWith('C-'))
                {
                    cwInstanceID = wInstanceID;
                    wInstanceID = treeItemElement.closest('.foxybdr-tree-item[foxybdr-widget-type="foxybdr.layout.component"]').getAttribute('foxybdr-instance-id');
                }

                let same = FoxyApp.Model.selection.wInstanceID === wInstanceID && FoxyApp.Model.selection.cwInstanceID === cwInstanceID;
                let command = new FoxyApp.Class.Command.Model.Selection(same ? null : wInstanceID, same ? null : cwInstanceID);
                FoxyApp.Manager.modelManager.submitCommand(null, command);
            }
        }
        else if (e.type === 'element-drop' && e.currentTarget === this.#dragDropProcessor)
        {
            if (e.sourceElement.classList.contains('foxybdr-widget-card'))
            {
                let widgetName = e.sourceElement.getAttribute('foxybdr-widget-name');
                let componentIDStr = e.sourceElement.getAttribute('foxybdr-component-id');
                let widgetType = widgetName !== null ? 0 : 1;
                let widgetID = widgetType === 0 ? widgetName : Number(componentIDStr);

                let wInstanceID = FoxyApp.Function.generateWidgetInstanceID('T', FoxyApp.templateID);

                let wInstanceData = {
                    id: wInstanceID,
                    widgetType: widgetType,
                    widgetID: widgetID,
                    sparseSettings: {}
                };
                if (widgetType === 1)
                    wInstanceData.componentSettings = {};

                let targetID = e.targetElement === this.#treeContainerElement ? null : e.targetElement.closest('.foxybdr-tree-item').getAttribute('foxybdr-instance-id');

                let command = new FoxyApp.Class.Command.Model.Template.Insert(wInstanceData, targetID, e.insertBefore);
                FoxyApp.Manager.modelManager.submitCommand(null, command);

                command = new FoxyApp.Class.Command.Model.Selection(wInstanceID, null);
                FoxyApp.Manager.modelManager.submitCommand(null, command);
            }
        }
        else if (e.type === 'context-menu-command')
        {
            let wInstanceID = e.itemElement.getAttribute('foxybdr-instance-id');
            this.#onContextMenuCommand(e.command, wInstanceID, e.itemElement);
        }
    }

    #onContextMenuCommand(contextMenuCommand, wInstanceID, itemElement)
    {
        switch (contextMenuCommand)
        {
            case 'edit':
                {
                    let cwInstanceID = null;

                    if (wInstanceID.startsWith('C-'))
                    {
                        cwInstanceID = wInstanceID;
                        wInstanceID = itemElement.closest('.foxybdr-tree-item[foxybdr-widget-type="foxybdr.layout.component"]').getAttribute('foxybdr-instance-id');
                    }

                    let command = new FoxyApp.Class.Command.Model.Selection(wInstanceID, cwInstanceID);
                    FoxyApp.Manager.modelManager.submitCommand(null, command);
                }
                break;

            case 'delete':
                {
                    if (wInstanceID.startsWith('T-'))
                    {
                        let command = new FoxyApp.Class.Command.Model.Template.Delete(wInstanceID);
                        FoxyApp.Manager.modelManager.submitCommand(null, command);
                    }
                }
                break;

            case 'copy':
                {

                }
                break;

            case 'cut':
                {

                }
                break;

            case 'paste':
                {

                }
                break;

            case 'create-component':
                {
                    let _this = this;

                    (new FoxyBuilder.Dialogs.Prompt({
                        title: 'Create Component',
                        message: 'Name:',
                        inputValue: 'My Component',
                        cancelLabel: 'Cancel',
                        okLabel: 'Create',
                        onCancel: null,
                        onOK: function(inputStr) {
                            _this.createComponent(wInstanceID, inputStr);
                        }
                    })).create();
                }
                break;
        }
    }

    insertWidgetInstance(widgetInstance, targetID, insertBefore)
    {
        if (insertBefore === null)
        {
            let parentNodes = targetID === null ? [ this.#nodeTree ] : this.#nodeMap[targetID];

            if (parentNodes !== undefined)
            {
                for (let parentNode of parentNodes)
                {
                    let newNode = new FoxyApp.Class.View.DrawerModule.WidgetInstanceNode(widgetInstance.data.id, this.#nodeMap);
                    newNode.render(true);
            
                    parentNode.appendChild(newNode);
                }
            }
        }
        else
        {
            let targetNodes = this.#nodeMap[targetID];

            if (targetNodes !== undefined)
            {
                for (let targetNode of targetNodes)
                {
                    let newNode = new FoxyApp.Class.View.DrawerModule.WidgetInstanceNode(widgetInstance.data.id, this.#nodeMap);
                    newNode.render(true);
            
                    let parentNode = targetNode.parentNode;
                    parentNode.insertBefore(newNode, insertBefore ? targetNode : targetNode.nextSibling);
                }
            }
        }

        this.#updateEmptyMessage();
    }

    renameComponent(componentID, title)
    {
        for (let wInstanceID in this.#nodeMap)
        {
            let wi = FoxyApp.Model.widgetInstanceMap[wInstanceID];

            if (wi.data.widgetType === 1 && wi.data.widgetID === componentID)
            {
                let nodes = this.#nodeMap[wInstanceID];

                for (let node of nodes)
                    node.render(false);
            }
        }
    }

    insertCWidgetInstance(widgetInstance, componentID, targetID, insertBefore)
    {
        for (let wInstanceID in this.#nodeMap)
        {
            let wi = FoxyApp.Model.widgetInstanceMap[wInstanceID];

            if (wi.data.widgetType === 1 && wi.data.widgetID === componentID)
            {
                let nodes = this.#nodeMap[wInstanceID];

                for (let node of nodes)
                    node.render(true);
            }
        }
    }

    deleteWidgetInstance(wInstanceID)
    {
        let nodes = this.#nodeMap[wInstanceID];

        if (nodes === undefined)
            return;

        for (let node of nodes)
            node.destroy();

        this.#updateEmptyMessage();
    }

    createComponent(wInstanceID, title)
    {
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];

        // Widget instance must not be part of an existing component.
        if (wInstanceID.split('-')[0] !== 'T')
            return;

        if (widgetInstance.data.widgetType === 0 && [ 'foxybdr.layout.section', 'foxybdr.layout.column' ].includes(widgetInstance.data.widgetID))
            return;

        if (widgetInstance.data.widgetType !== 0)
            return;

        let componentID = FoxyApp.Function.generateComponentID();

        let wInstanceData = widgetInstance.saveTree();
        FoxyApp.Class.Model.WidgetInstance.dropComponents(wInstanceData);
        FoxyApp.Class.Model.WidgetInstance.generateNewIDs(wInstanceData, 'C', componentID);

        let componentData = {
            id: componentID,
            title: title,
            children: [ wInstanceData ]
        }

        let command = new FoxyApp.Class.Command.Model.Component.Insert(componentData, null, null);
        FoxyApp.Manager.modelManager.submitCommand(null, command);
    }

    #updateEmptyMessage()
    {
        let emptyMessageElement = this.#tabPageElement.querySelector('.foxybdr-empty-message');

        if (this.#nodeTree.children.length === 0)
            emptyMessageElement.classList.add('foxybdr-show');
        else
            emptyMessageElement.classList.remove('foxybdr-show');
    }

    destroy()
    {
        super.destroy();

        this.#tabPageElement = null;

        this.#treeContainerElement = null;

        if (this.#nodeTree !== null)
        {
            this.#nodeTree.destroy();
            this.#nodeTree = null;
        }

        this.#nodeMap = {};

        if (this.#dragDropProcessor !== null)
        {
            this.#dragDropProcessor.destroy();
            this.#dragDropProcessor = null;
        }

        if (this.#contextMenu !== null)
        {
            this.#contextMenu.destroy();
            this.#contextMenu = null;
        }
    }
};

FoxyApp.Class.View.DrawerModule.Template_ContextMenu = class extends FoxyApp.Class.UI.Component.ContextMenu
{
    constructor()
    {
        super();
    }

    addMenuItems(itemElement)
    {
        let wInstanceID = itemElement.getAttribute('foxybdr-instance-id');
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];
        let widgetType = widgetInstance.data.widgetType;
        let widgetID = widgetInstance.data.widgetID;

        let isSection = false;
        let isColumn = false;
        let isBlock = false;

        if (widgetType === 0)  // widget
        {
            isSection = widgetID === 'foxybdr.layout.section';
            isColumn = widgetID === 'foxybdr.layout.column';
            isBlock = widgetID === 'foxybdr.layout.block';
        }

        let isTemplate = wInstanceID.split('-')[0] === 'T';

        this.addMenuItem('edit', 'Edit');

        if (isTemplate)
        {
            this.addMenuItem('delete', 'Delete');
            this.addMenuItem('copy', 'Copy');
            this.addMenuItem('cut', 'Cut');
            this.addMenuItem('paste', 'Paste');
        }

        if (!isSection && !isColumn && isTemplate && widgetType === 0)
            this.addMenuItem('create-component', 'Create Component...');
    }

    destroy()
    {
        super.destroy();
    }
};

FoxyApp.Class.View.DrawerModule.Components = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #tabPageElement = null;
    #treeContainerElement = null;

    #nodeTree = null;
    #cNodeMap = {};
    #wNodeMap = {};

    #dragDropProcessor = null;

    #contextMenu = null;

    constructor()
    {
        super();

        FoxyApp.Manager.modelManager.addEventListener('Component', this);
        FoxyApp.Manager.modelManager.addEventListener('ComponentWidgetInstance', this);
        FoxyApp.Manager.modelManager.addEventListener('Selection', this);
    }

    create()
    {
        this.#tabPageElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-drawer-components');

        FoxyApp.Manager.drawerManager.registerModule(this, 'Components', this.#tabPageElement);

        this.#treeContainerElement = this.#tabPageElement.querySelector('.foxybdr-tree-container');

        this.#nodeTree = new FoxyApp.Class.ElementNode(this.#treeContainerElement, this.#treeContainerElement);

        for (let component of FoxyApp.Model.componentTree.children)
        {
            let newNode = new FoxyApp.Class.View.DrawerModule.ComponentNode(component.data.id, this.#cNodeMap, this.#wNodeMap);

            newNode.render(true);

            this.#nodeTree.appendChild(newNode);
        }

        this.registerEvent(this.#treeContainerElement, 'click');

        this.#dragDropProcessor = new FoxyApp.Class.UI.ElementDragDrop();
        this.#dragDropProcessor.create(this.#treeContainerElement, this.#treeContainerElement.closest('#foxybdr-drawer > .foxybdr-tab-body'), 8.0, '%');
        this.#dragDropProcessor.addSourceType(
            '.foxybdr-widget-card:not([foxybdr-widget-name="foxybdr.layout.section"], [foxybdr-widget-name="foxybdr.layout.column"], [foxybdr-component-id])',
            '.foxybdr-tree-item[foxybdr-component-id] > .foxybdr-dropdown > .foxybdr-container, .foxybdr-tree-item[foxybdr-widget-type="foxybdr.layout.block"] > .foxybdr-dropdown > .foxybdr-container',
            null
        );
        this.#dragDropProcessor.addEventListener(this);

        this.#contextMenu = new FoxyApp.Class.View.DrawerModule.Components_ContextMenu();
        this.#contextMenu.create(this.#treeContainerElement, '.foxybdr-tree-item');
        this.#contextMenu.addEventListener(this);

        this.#updateEmptyMessage();
    }

    handleEvent(e)
    {
        if (e instanceof FoxyApp.Class.Event.Model.Component.Insert)
        {
            this.insertComponent(e.component, e.targetID, e.insertBefore);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Component.Rename)
        {
            this.renameComponent(e.componentID, e.title);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Component.Delete)
        {
            this.deleteComponent(e.componentID);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.ComponentWidgetInstance.Insert)
        {
            this.insertCWidgetInstance(e.widgetInstance, e.componentID, e.targetID, e.insertBefore);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.ComponentWidgetInstance.Delete)
        {
            this.deleteCWidgetInstance(e.componentID, e.wInstanceID);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Selection)
        {
            for (let wInstanceID in this.#wNodeMap)
            {
                for (let node of this.#wNodeMap[wInstanceID])
                {
                    node.select(wInstanceID === e.wInstanceID && e.cwInstanceID === null);
                }
            }
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget === this.#treeContainerElement)
        {
            if (e.target.matches('.foxybdr-tree-item > .foxybdr-header > .foxybdr-expander, .foxybdr-tree-item > .foxybdr-header > .foxybdr-expander *'))
            {
                let treeItemElement = e.target.closest('.foxybdr-tree-item');

                if (treeItemElement.classList.contains('foxybdr-expandable'))
                {
                    treeItemElement.classList.toggle('foxybdr-expanded');
                }
            }
            else if (e.target.matches('.foxybdr-tree-item > .foxybdr-header > .foxybdr-card, .foxybdr-tree-item > .foxybdr-header > .foxybdr-card *'))
            {
                let treeItemElement = e.target.closest('.foxybdr-tree-item');
                let wInstanceID = treeItemElement.getAttribute('foxybdr-instance-id');
                if (wInstanceID !== null)
                {
                    let same = FoxyApp.Model.selection.wInstanceID === wInstanceID && FoxyApp.Model.selection.cwInstanceID === null;
                    let command = new FoxyApp.Class.Command.Model.Selection(same ? null : wInstanceID, null);
                    FoxyApp.Manager.modelManager.submitCommand(null, command);
                }
            }
        }
        else if (e.type === 'element-drop' && e.currentTarget === this.#dragDropProcessor)
        {
            if (e.sourceElement.classList.contains('foxybdr-widget-card'))
            {
                let componentItemElement = e.targetElement.closest('.foxybdr-tree-item[foxybdr-component-id]');
                let componentID = Number(componentItemElement.getAttribute('foxybdr-component-id'));

                let wInstanceID = FoxyApp.Function.generateWidgetInstanceID('C', componentID);
                let widgetID = e.sourceElement.getAttribute('foxybdr-widget-name');

                let wInstanceData = {
                    id: wInstanceID,
                    widgetType: 0,
                    widgetID: widgetID,
                    sparseSettings: {}
                };

                let targetItemElement = e.targetElement.closest('.foxybdr-tree-item');
                let targetID = targetItemElement === componentItemElement ? null : targetItemElement.getAttribute('foxybdr-instance-id');

                let command = new FoxyApp.Class.Command.Model.ComponentWidgetInstance.Insert(wInstanceData, componentID, targetID, e.insertBefore);
                FoxyApp.Manager.modelManager.submitCommand(null, command);

                command = new FoxyApp.Class.Command.Model.Selection(wInstanceID, null);
                FoxyApp.Manager.modelManager.submitCommand(null, command);
            }
        }
        else if (e.type === 'context-menu-command')
        {
            this.#onContextMenuCommand(e.command, e.itemElement);
        }
    }

    insertComponent(component, targetID, insertBefore)
    {
        let newNode = new FoxyApp.Class.View.DrawerModule.ComponentNode(component.data.id, this.#cNodeMap, this.#wNodeMap);
        newNode.render(true);

        if (insertBefore === null)
        {
            let parentNode = targetID === null ? this.#nodeTree : this.#cNodeMap[targetID];
            parentNode.appendChild(newNode);
        }
        else
        {
            let targetNode = this.#cNodeMap[targetID];
            let parentNode = targetNode.parentNode;
            parentNode.insertBefore(newNode, insertBefore ? targetNode : targetNode.nextSibling);
        }

        this.#updateEmptyMessage();
    }

    insertCWidgetInstance(widgetInstance, componentID, targetID, insertBefore)
    {
        let componentNode = this.#cNodeMap[componentID];
        componentNode.render(true);
    }

    deleteCWidgetInstance(componentID, wInstanceID)
    {
        let nodes = this.#wNodeMap[wInstanceID];

        if (nodes === undefined)
            return;

        for (let node of [ ...nodes ])
            node.destroy();
    }

    renameComponent(componentID, title)
    {
        let componentNode = this.#cNodeMap[componentID];
        componentNode.render(false);
    }

    deleteComponent(componentID)
    {
        let componentNode = this.#cNodeMap[componentID];
        componentNode.destroy();

        this.#updateEmptyMessage();
    }

    requestRenameComponent(componentID, newTitle)
    {
        let command = new FoxyApp.Class.Command.Model.Component.Rename(componentID, newTitle);
        FoxyApp.Manager.modelManager.submitCommand(null, command);
    }

    #onContextMenuCommand(command, itemElement)
    {
        let componentIdStr = itemElement.getAttribute('foxybdr-component-id');

        if (componentIdStr !== null)
        {
            switch (command)
            {
                case 'rename':
                    {
                        let componentID = Number(componentIdStr);
                        let component = FoxyApp.Model.componentMap[componentID];
                        let _this = this;

                        (new FoxyBuilder.Dialogs.Prompt({
                            title: 'Rename Component',
                            message: 'Name:',
                            inputValue: component.data.title,
                            cancelLabel: 'Cancel',
                            okLabel: 'Rename',
                            onCancel: null,
                            onOK: function(inputStr) {
                                _this.requestRenameComponent(componentID, inputStr);
                            }
                        })).create();
                    }
                    break;

                case 'delete':
                    {
                        let componentID = Number(componentIdStr);

                        let command = new FoxyApp.Class.Command.Model.Component.Delete(componentID);
                        FoxyApp.Manager.modelManager.submitCommand(null, command);
                    }
                    break;
            }
        }
        else
        {
            switch (command)
            {
                case 'edit':
                    {
                        let wInstanceID = itemElement.getAttribute('foxybdr-instance-id');
                        let command = new FoxyApp.Class.Command.Model.Selection(wInstanceID, null);
                        FoxyApp.Manager.modelManager.submitCommand(null, command);
                    }
                    break;

                case 'delete':
                    {
                        let componentItemElement = itemElement.closest('.foxybdr-tree-item[foxybdr-component-id]');
                        let componentID = Number(componentItemElement.getAttribute('foxybdr-component-id'));
        
                        let wInstanceID = itemElement.getAttribute('foxybdr-instance-id');

                        let command = new FoxyApp.Class.Command.Model.ComponentWidgetInstance.Delete(componentID, wInstanceID);
                        FoxyApp.Manager.modelManager.submitCommand(null, command);
                    }
                    break;
                    
                case 'copy':
                    {

                    }
                    break;
                    
                case 'cut':
                    {

                    }
                    break;
                    
                case 'paste':
                    {

                    }
                    break;
            }
        }
    }

    #updateEmptyMessage()
    {
        let emptyMessageElement = this.#tabPageElement.querySelector('.foxybdr-empty-message');

        if (this.#nodeTree.children.length === 0)
            emptyMessageElement.classList.add('foxybdr-show');
        else
            emptyMessageElement.classList.remove('foxybdr-show');
    }

    destroy()
    {
        super.destroy();

        this.#tabPageElement = null;

        this.#treeContainerElement = null;

        if (this.#nodeTree !== null)
        {
            this.#nodeTree.destroy();
            this.#nodeTree = null;
        }

        this.#cNodeMap = {};
        this.#wNodeMap = {};

        if (this.#dragDropProcessor !== null)
        {
            this.#dragDropProcessor.destroy();
            this.#dragDropProcessor = null;
        }

        if (this.#contextMenu !== null)
        {
            this.#contextMenu.destroy();
            this.#contextMenu = null;
        }
    }
};

FoxyApp.Class.View.DrawerModule.Components_ContextMenu = class extends FoxyApp.Class.UI.Component.ContextMenu
{
    constructor()
    {
        super();
    }

    addMenuItems(itemElement)
    {
        if (itemElement.getAttribute('foxybdr-component-id') !== null)
        {
            this.addMenuItem('rename', 'Rename');
            this.addMenuItem('delete', 'Delete');
        }
        else
        {
            this.addMenuItem('edit', 'Edit');
            this.addMenuItem('delete', 'Delete');
            this.addMenuItem('copy', 'Copy');
            this.addMenuItem('cut', 'Cut');
            this.addMenuItem('paste', 'Paste');
        }
    }

    destroy()
    {
        super.destroy();
    }
};

FoxyApp.Class.View.Canvas = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #iFrameElement = null;
    #templateElement = null;

    #dragDropProcessor = null;

    #canvasNodeTree = null;
    #canvasNodeMap = {};

    #stylesheet = null;

    #contextMenu = null;

    #googleFontLoader = null;

    #lastSelectionClick = {
        timestamp: null,
        widgetElement: null
    };

    constructor()
    {
        super();

        FoxyApp.Manager.modelManager.addEventListener('Template', this);
        FoxyApp.Manager.modelManager.addEventListener('ComponentWidgetInstance', this);
        FoxyApp.Manager.modelManager.addEventListener('Settings', this);
        FoxyApp.Manager.modelManager.addEventListener('Selection', this);
        FoxyApp.Manager.modelManager.addEventListener('Device', this);
    }

    create()
    {
        this.#iFrameElement = document.querySelector('#foxybdr-preview-iframe');

        this.#iFrameElement.contentDocument.addEventListener('readystatechange', this);

        if ([ 'interactive', 'complete' ].includes(this.#iFrameElement.contentDocument.readyState))
            this.onPreviewLoaded();

        this.#resizeIFrame();
    }

    onPreviewLoaded()
    {
        this.#iFrameElement.contentDocument.removeEventListener('readystatechange', this);

        this.registerEvent(this.#iFrameElement.contentDocument.body, 'click');
        this.registerEvent(this.#iFrameElement.contentDocument.body, 'keydown');

        if (this.#templateElement === null)
        {
            this.#templateElement = this.#iFrameElement.contentDocument.querySelector(`.foxybdr-template.foxybdr-post-content`);
            this.#templateElement.classList.add('foxybdr-editor');
            this.registerEvent(this.#templateElement, 'click');
        }

        if (this.#dragDropProcessor === null)
        {
            this.#dragDropProcessor = new FoxyApp.Class.UI.ElementDragDrop();
            this.#dragDropProcessor.create(this.#templateElement, this.#iFrameElement.contentWindow, 8.0, '%');
            this.#dragDropProcessor.addSourceType(
                '.foxybdr-widget-card[foxybdr-widget-name="foxybdr.layout.section"]',
                null,
                '.foxybdr-template'
            );
            this.#dragDropProcessor.addSourceType(
                '.foxybdr-widget-card[foxybdr-widget-name="foxybdr.layout.column"]',
                '.foxybdr-widget[foxybdr-widget-type="foxybdr.layout.section"] > .foxybdr-widget-container',
                '.foxybdr-template'
            );
            this.#dragDropProcessor.addSourceType(
                '.foxybdr-widget-card:not([foxybdr-widget-name="foxybdr.layout.section"], [foxybdr-widget-name="foxybdr.layout.column"])',
                '.foxybdr-widget[foxybdr-widget-type="foxybdr.layout.column"] > .foxybdr-widget-container, .foxybdr-widget[foxybdr-widget-type="foxybdr.layout.block"][foxybdr-instance-id^="T-"] > .foxybdr-widget-container',
                '.foxybdr-template'
            );
            this.#dragDropProcessor.addEventListener(this);
        }

        if (this.#canvasNodeTree === null)
        {
            this.#canvasNodeTree = new FoxyApp.Class.ElementNode(this.#templateElement, this.#templateElement);
        }

        if (this.#stylesheet === null)
        {
            let headElement = this.#iFrameElement.contentDocument.querySelector('head');

            this.#stylesheet = new FoxyApp.Class.View.Canvas_Stylesheet();
            this.#stylesheet.create(headElement);
        }

        if (this.#contextMenu === null)
        {
            this.#contextMenu = new FoxyApp.Class.View.Canvas_ContextMenu();
            this.#contextMenu.create(this.#templateElement, '.foxybdr-widget');
            this.#contextMenu.addEventListener(this);
        }

        this.installAssets();

        this.#googleFontLoader = new FoxyApp.Class.GoogleFontLoader();
        this.#googleFontLoader.create(this.#iFrameElement.contentDocument, 0);
        this.#googleFontLoader.registerClient(this);

        this.initWidgetInstances();
    }

    handleEvent(e)
    {
        if (e instanceof FoxyApp.Class.Event.Model.Template.Insert)
        {
            this.insertWidgetInstance(e.widgetInstance, e.targetID, e.insertBefore);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Template.Update)
        {
            this.updateWidgetInstance(e.wInstanceID, e.settingName, e.settingValue);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Template.ComponentUpdate)
        {
            this.cUpdateWidgetInstance(e.wInstanceID, e.cwInstanceID, e.settingName, e.settingValue);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Template.Delete)
        {
            this.deleteWidgetInstance(e.wInstanceID);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.ComponentWidgetInstance.Insert)
        {
            this.insertCWidgetInstance(e.widgetInstance, e.componentID, e.targetID, e.insertBefore);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.ComponentWidgetInstance.Update)
        {
            this.updateWidgetInstance(e.wInstanceID, e.settingName, e.settingValue);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.ComponentWidgetInstance.Delete)
        {
            this.deleteWidgetInstance(e.wInstanceID);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Settings.Update)
        {
            this.updateSettings(e.wInstanceID, e.settingName, e.settingValue);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Selection)
        {
            this.selectWidgetInstance(e.wInstanceID, e.cwInstanceID);
        }
        else if (e instanceof FoxyApp.Class.Event.Model.Device)
        {
            this.#resizeIFrame();
        }
        else if (e.type === 'readystatechange' && [ 'interactive', 'complete' ].includes(e.target.readyState))
        {
            this.onPreviewLoaded();
        }
        else if (e.type === 'element-drop' && e.currentTarget === this.#dragDropProcessor)
        {
            if (e.sourceElement.classList.contains('foxybdr-widget-card'))
            {
                let widgetName = e.sourceElement.getAttribute('foxybdr-widget-name');
                let componentIDStr = e.sourceElement.getAttribute('foxybdr-component-id');
                let widgetType = widgetName !== null ? 0 : 1;
                let widgetID = widgetType === 0 ? widgetName : Number(componentIDStr);

                let wInstanceID = FoxyApp.Function.generateWidgetInstanceID('T', FoxyApp.templateID);

                let wInstanceData = {
                    id: wInstanceID,
                    widgetType: widgetType,
                    widgetID: widgetID,
                    sparseSettings: {}
                };
                if (widgetType === 1)
                    wInstanceData.componentSettings = {};

                let targetID = e.targetElement === this.#templateElement ? null : e.targetElement.closest('.foxybdr-widget').getAttribute('foxybdr-instance-id');

                let command = new FoxyApp.Class.Command.Model.Template.Insert(wInstanceData, targetID, e.insertBefore);
                FoxyApp.Manager.modelManager.submitCommand(null, command);

                command = new FoxyApp.Class.Command.Model.Selection(wInstanceID, null);
                FoxyApp.Manager.modelManager.submitCommand(null, command);
            }
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget === this.#templateElement)
        {
            let widgetElement = e.target.closest('.foxybdr-widget');

            if (widgetElement !== null)
            {
                let now = Date.now();
                if (this.#lastSelectionClick.timestamp !== null && now - this.#lastSelectionClick.timestamp < 500 && this.#lastSelectionClick.widgetElement.contains(widgetElement))
                {
                    let newWidgetElement = this.#lastSelectionClick.widgetElement.parentElement.closest('.foxybdr-widget');
                    if (newWidgetElement)
                        widgetElement = newWidgetElement;
                }
                this.#lastSelectionClick.timestamp = now;
                this.#lastSelectionClick.widgetElement = widgetElement;

                let wInstanceID = widgetElement.getAttribute('foxybdr-instance-id');
                let cwInstanceID = null;

                if (wInstanceID.startsWith('C-'))
                {
                    cwInstanceID = wInstanceID;
                    wInstanceID = widgetElement.closest('.foxybdr-widget[foxybdr-widget-type="foxybdr.layout.component"]').getAttribute('foxybdr-instance-id');
                }

                let same = FoxyApp.Model.selection.wInstanceID === wInstanceID && FoxyApp.Model.selection.cwInstanceID === cwInstanceID;
                let command = new FoxyApp.Class.Command.Model.Selection(same ? null : wInstanceID, same ? null : cwInstanceID);
                FoxyApp.Manager.modelManager.submitCommand(null, command);
            }
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget === this.#iFrameElement.contentDocument.body)
        {
            e.preventDefault();
        }
        else if (e.type === 'keydown' && e.currentTarget === this.#iFrameElement.contentDocument.body)
        {
            if ((e.key === 'z' || e.key === 'Z') && e.ctrlKey === true)
            {
                e.preventDefault();

                FoxyApp.Manager.modelManager.undo();
            }
            else if ((e.key === 'y' || e.key === 'Y') && e.ctrlKey === true)
            {
                e.preventDefault();

                FoxyApp.Manager.modelManager.redo();
            }
        }
        else if (e.type === 'context-menu-command')
        {
            let wInstanceID = e.itemElement.getAttribute('foxybdr-instance-id');
            this.#onContextMenuCommand(e.command, wInstanceID, e.itemElement);
        }
        else if (e.type === 'background-thread-response')
        {
            if (e.request.type === 'find-google-fonts')
            {
                this.#googleFontLoader.requestFonts(this, e.response.fontIds);
            }
            else if (e.request.type === 'find-global-dependencies')
            {
                for (let wInstanceID of e.response.wInstanceIDs)
                {
                    let nodeList = this.#canvasNodeMap[wInstanceID];

                    for (let node of nodeList)
                    {
                        node.render(false);
                    }
                }
            }
        }
    }

    #onContextMenuCommand(contextMenuCommand, wInstanceID, itemElement)
    {
        switch (contextMenuCommand)
        {
            case 'edit':
                {
                    let cwInstanceID = null;

                    if (wInstanceID.startsWith('C-'))
                    {
                        cwInstanceID = wInstanceID;
                        wInstanceID = itemElement.closest('.foxybdr-widget[foxybdr-widget-type="foxybdr.layout.component"]').getAttribute('foxybdr-instance-id');
                    }

                    let command = new FoxyApp.Class.Command.Model.Selection(wInstanceID, cwInstanceID);
                    FoxyApp.Manager.modelManager.submitCommand(null, command);
                }
                break;

            case 'delete':
                {
                    let command = new FoxyApp.Class.Command.Model.Template.Delete(wInstanceID);
                    FoxyApp.Manager.modelManager.submitCommand(null, command);
                }
                break;

            case 'copy':
                {
                    let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];
                    let wInstanceData = widgetInstance.saveTree();
                    let clipboardData = JSON.stringify({
                        type: 'widget-instance',
                        data: wInstanceData
                    });
                    window.localStorage.setItem('clipboard', clipboardData);
                }
                break;

            case 'cut':
                {

                }
                break;

            case 'paste':
                {

                }
                break;

            case 'create-component':
                {
                    let _this = this;

                    (new FoxyBuilder.Dialogs.Prompt({
                        title: 'Create Component',
                        message: 'Name:',
                        inputValue: 'My Component',
                        cancelLabel: 'Cancel',
                        okLabel: 'Create',
                        onCancel: null,
                        onOK: function(inputStr) {
                            _this.createComponent(wInstanceID, inputStr);
                        }
                    })).create();
                }
                break;
        }
    }

    installAssets()
    {
        let frameDocument = this.#iFrameElement.contentDocument;
        let headElement = frameDocument.querySelector('head');

        for (let group in FOXYAPP.assets.fonts)
        {
            if (group === 'google')
                continue;

            let fontList = FOXYAPP.assets.fonts[group].font_list;

            for (let font of fontList)
            {
                if (typeof font === 'string' || font.css_url === undefined)
                    continue;

                let existingLinkElement = frameDocument.querySelector(`link[foxybdr-asset="foxybdr-font"][foxybdr-font-group="${group}"][foxybdr-font-id="${font.id}"]`);
                if (existingLinkElement !== null)
                    continue;

                let linkElement = document.createElement('link');
                linkElement.setAttribute('href', font.css_url);
                linkElement.setAttribute('rel', 'stylesheet');
                linkElement.setAttribute('type', 'text/css');
                linkElement.setAttribute('foxybdr-asset', 'foxybdr-font');
                linkElement.setAttribute('foxybdr-font-group', group);
                linkElement.setAttribute('foxybdr-font-id', String(font.id));
                headElement.appendChild(linkElement);
            }
        }

        let existingLinkElement = frameDocument.querySelector(`link[foxybdr-asset="foxybdr-icons-fa"]`);
        if (existingLinkElement === null)
        {
            let linkElement = document.createElement('link');
            linkElement.setAttribute('href', FOXYAPP.assets.fontAwesomeCssUrl);
            linkElement.setAttribute('rel', 'stylesheet');
            linkElement.setAttribute('type', 'text/css');
            linkElement.setAttribute('foxybdr-asset', 'foxybdr-icons-fa');
            headElement.appendChild(linkElement);
        }

        for (let libName in FOXYAPP.assets.iconLibraries)
        {
            let existingLinkElement = frameDocument.querySelector(`link[foxybdr-asset="foxybdr-icons"][foxybdr-icons-library="${libName}"]`);
            if (existingLinkElement !== null)
                continue;

            let linkElement = document.createElement('link');
            linkElement.setAttribute('href', FOXYAPP.assets.iconLibraries[libName].css_url);
            linkElement.setAttribute('rel', 'stylesheet');
            linkElement.setAttribute('type', 'text/css');
            linkElement.setAttribute('foxybdr-asset', 'foxybdr-icons');
            linkElement.setAttribute('foxybdr-icons-library', libName);
            headElement.appendChild(linkElement);
        }
    }

    initWidgetInstances()
    {
        let widgetInstanceList = {};
        this.#buildWidgetInstanceList(widgetInstanceList);

        FoxyApp.backgroundThread.submitRequest_widgetInstances(widgetInstanceList)

        // Build canvas node tree from widget instance tree.
        let topWidgetInstances = FoxyApp.Model.widgetInstanceTree.children;
        for (let widgetInstance of topWidgetInstances)
        {
            let context = {};
            let canvasNode = new FoxyApp.Class.View.Canvas_Node(widgetInstance.data.id, context, this.#canvasNodeMap);
            canvasNode.render(true);
    
            this.#canvasNodeTree.appendChild(canvasNode);
        }

        this.#stylesheet.build(widgetInstanceList);

        FoxyApp.backgroundThread.submitRequest_findGoogleFonts(this);
    }

    insertWidgetInstance(widgetInstance, targetID, insertBefore)
    {
        let widgetInstanceList = {};
        this.#buildWidgetInstanceList(widgetInstanceList);

        FoxyApp.backgroundThread.submitRequest_widgetInstances(widgetInstanceList);

        if (insertBefore === null)
        {
            if (targetID === null)
            {
                let context = {};
                let canvasNode = new FoxyApp.Class.View.Canvas_Node(widgetInstance.data.id, context, this.#canvasNodeMap);
                canvasNode.render(true);

                this.#canvasNodeTree.appendChild(canvasNode);
            }
            else
            {
                let parentNodes = this.#canvasNodeMap[targetID];

                if (parentNodes !== undefined)
                {
                    for (let parentNode of [ ...parentNodes ])
                    {
                        if (parentNode.parentNode === null)
                            continue;

                        if (parentNode.hasQuery())
                        {
                            /* The parent node has a query loop, so we cannot simply copy the context from the parent node. The query loop alters the context.
                            * The simplest thing to do is re-render the parent node and all of its children, so that new contexts can be generated for its
                            * children, including the new node being inserted. Also, there may be multiple copies of the new node needed, since this is a
                            * query loop. */
                            parentNode.render(true);
                        }
                        else
                        {
                            /* The parent node does not have a query loop. There is only one copy of the new node needed. Just append the new node to the parent
                            * node, and copy the parent node's context to the new node. */
                            let canvasNode = new FoxyApp.Class.View.Canvas_Node(widgetInstance.data.id, parentNode.descendantContext, this.#canvasNodeMap);
                            canvasNode.render(true);
            
                            parentNode.appendChild(canvasNode);
                        }
                    }
                }
            }
        }
        else
        {
            let targetNodes = this.#canvasNodeMap[targetID];

            if (targetNodes !== undefined)
            {
                for (let targetNode of [ ...targetNodes ])
                {
                    let parentNode = targetNode.parentNode;

                    if (parentNode === null)  // Is targetNode still in the tree? Make sure it hasn't been destroyed from previous iterations of this 'for' loop.
                        continue;

                    if (parentNode === this.#canvasNodeTree)
                    {
                        let context = {};
                        let canvasNode = new FoxyApp.Class.View.Canvas_Node(widgetInstance.data.id, context, this.#canvasNodeMap);
                        canvasNode.render(true);

                        this.#canvasNodeTree.insertBefore(canvasNode, insertBefore ? targetNode : targetNode.nextSibling);
                    }
                    else if (parentNode.hasQuery())
                    {
                        /* The parent node has a query loop, so we cannot simply copy the context from the parent node. The query loop alters the context.
                        * The simplest thing to do is re-render the parent node and all of its children, so that new contexts can be generated for its
                        * children, including the new node being inserted. Also, there may be multiple copies of the new node needed, since this is a
                        * query loop. */
                        parentNode.render(true);
                    }
                    else
                    {
                        /* The parent node does not have a query loop. There is only one copy of the new node needed. Just insert the new node to the parent
                        * node, and copy the parent node's context to the new node. */
                        let canvasNode = new FoxyApp.Class.View.Canvas_Node(widgetInstance.data.id, parentNode.descendantContext, this.#canvasNodeMap);
                        canvasNode.render(true);

                        parentNode.insertBefore(canvasNode, insertBefore ? targetNode : targetNode.nextSibling);
                    }
                }
            }
        }

        this.#stylesheet.build(widgetInstanceList);

        FoxyApp.backgroundThread.submitRequest_findGoogleFonts(this);
    }

    insertCWidgetInstance(widgetInstance, componentID, targetID, insertBefore)
    {
        let widgetInstanceList = {};
        this.#buildWidgetInstanceList(widgetInstanceList);

        FoxyApp.backgroundThread.submitRequest_widgetInstances(widgetInstanceList);

        for (let wInstanceID in this.#canvasNodeMap)
        {
            let wi = FoxyApp.Model.widgetInstanceMap[wInstanceID];

            if (wi.data.widgetType === 1 && wi.data.widgetID === componentID)
            {
                let nodes = this.#canvasNodeMap[wInstanceID];

                for (let node of nodes)
                    node.render(true);
            }
        }

        this.#stylesheet.build(widgetInstanceList);

        FoxyApp.backgroundThread.submitRequest_findGoogleFonts(this);
    }

    updateWidgetInstance(wInstanceID, settingName, settingValue)
    {
        FoxyApp.backgroundThread.submitRequest_updateWidgetInstance(wInstanceID, settingName, settingValue);

        let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];
        let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetType === 0 ? widgetInstance.data.widgetID : 'foxybdr.layout.component'];
        let settingParams = widget.settings[settingName];
        let cssChanged = settingParams.selector !== undefined || settingParams.selectors !== undefined || settingParams.render_type === 'ui';

        if (cssChanged === false)
        {
            let canvasNodes = this.#canvasNodeMap[wInstanceID];

            if (canvasNodes !== undefined)
            {
                for (let canvasNode of canvasNodes)
                    canvasNode.render(false);
            }
        }

        if (cssChanged === true || widget.cssDependencies[settingName] === true)
        {
            this.#stylesheet.update(wInstanceID);
        }

        FoxyApp.backgroundThread.submitRequest_findGoogleFonts(this);
    }

    cUpdateWidgetInstance(wInstanceID, cwInstanceID, settingName, settingValue)
    {
        let canvasNodes = this.#canvasNodeMap[wInstanceID];

        if (canvasNodes !== undefined)
        {
            for (let canvasNode of canvasNodes)
                canvasNode.onComponentDescendantUpdate(cwInstanceID, settingName, settingValue);
        }
    }

    deleteWidgetInstance(wInstanceID)
    {
        let widgetInstanceList = {};
        this.#buildWidgetInstanceList(widgetInstanceList);
        FoxyApp.backgroundThread.submitRequest_widgetInstances(widgetInstanceList)

        let canvasNodes = this.#canvasNodeMap[wInstanceID];
        if (canvasNodes !== undefined)
        {
            for (let canvasNode of [ ...canvasNodes ])
            {
                if (canvasNode.parentNode === null)  // Is node still in the tree? Make sure it hasn't been destroyed from previous iterations of this 'for' loop.
                    continue;

                canvasNode.destroy();
            }
        }

        this.#stylesheet.delete(wInstanceID);

        FoxyApp.backgroundThread.submitRequest_findGoogleFonts(this);
    }

    updateSettings(wInstanceID, settingName, settingValue)
    {
        if (wInstanceID === 'S-siteSettings')
        {
            FoxyApp.backgroundThread.submitRequest_updateWidgetInstance(wInstanceID, settingName, settingValue);

            if ([ 'breakpoints_tablet', 'breakpoints_mobile' ].includes(settingName))
            {
                this.#resizeIFrame();

                let widgetInstanceList = {};
                this.#buildWidgetInstanceList(widgetInstanceList);
                this.#stylesheet.reset();
                this.#stylesheet.build(widgetInstanceList);
            }
            else
            {
                let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];
                let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];
                let settingParams = widget.settings[settingName];
                let cssChanged = settingParams.selector !== undefined || settingParams.selectors !== undefined || settingParams.render_type === 'ui';

                if (cssChanged === true || widget.cssDependencies[settingName] === true)
                {
                    this.#stylesheet.update(wInstanceID);
                }

                let match1 = /colors_global_(\d+)/.exec(settingName);
                let match2 = /fonts_global_(\d+)/.exec(settingName);
                if (match1 !== null || match2 !== null)
                {
                    FoxyApp.backgroundThread.submitRequest_findGlobalDependencies(this, settingName);
                }

                FoxyApp.backgroundThread.submitRequest_findGoogleFonts(this);
            }
        }
    }

    selectWidgetInstance(wInstanceID, cwInstanceID)
    {
        for (let id in this.#canvasNodeMap)
        {
            let nodeList = this.#canvasNodeMap[id];

            for (let node of nodeList)
            {
                node.element.classList.remove('foxybdr-selected');
            }
        }

        if (wInstanceID !== null)
        {
            if (wInstanceID !== null && cwInstanceID !== null && wInstanceID.startsWith('T-') && cwInstanceID.startsWith('C-'))
            {
                let nodes = this.#canvasNodeMap[cwInstanceID];

                if (nodes !== undefined)
                {
                    for (let node of nodes)
                    {
                        if (node.element.matches(`.foxybdr-widget[foxybdr-instance-id="${wInstanceID}"] .foxybdr-widget`))
                            node.element.classList.add('foxybdr-selected');
                    }
                }
            }
            else if (wInstanceID !== null && cwInstanceID === null && wInstanceID.startsWith('T-'))
            {
                let nodes = this.#canvasNodeMap[wInstanceID];

                if (nodes !== undefined)
                {
                    for (let node of nodes)
                    {
                        node.element.classList.add('foxybdr-selected');
                    }
                }
            }
        }
    }

    createComponent(wInstanceID, title)
    {
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];

        // Widget instance must not be part of an existing component.
        if (wInstanceID.split('-')[0] !== 'T')
            return;

        if (widgetInstance.data.widgetType === 0 && [ 'foxybdr.layout.section', 'foxybdr.layout.column' ].includes(widgetInstance.data.widgetID))
            return;

        if (widgetInstance.data.widgetType !== 0)
            return;

        let componentID = FoxyApp.Function.generateComponentID();

        let wInstanceData = widgetInstance.saveTree();
        FoxyApp.Class.Model.WidgetInstance.dropComponents(wInstanceData);
        FoxyApp.Class.Model.WidgetInstance.generateNewIDs(wInstanceData, 'C', componentID);

        let componentData = {
            id: componentID,
            title: title,
            children: [ wInstanceData ]
        }

        let command = new FoxyApp.Class.Command.Model.Component.Insert(componentData, null, null);
        FoxyApp.Manager.modelManager.submitCommand(null, command);
    }

    #resizeIFrame()
    {
        let deviceMode = FoxyApp.Model.device.deviceMode;
        let breakpoints = this.#getResponsiveBreakpoints();

        let width;

        switch (deviceMode)
        {
            case 'desktop':
                width = '';
                break;

            case 'tablet':
                width = String(breakpoints['mobile'] + 1) + 'px';
                break;

            case 'mobile':
                width = '360px';
                break;
        }

        this.#iFrameElement.parentElement.style.maxWidth = width;
    }

    #buildWidgetInstanceList(list)
    {
        this.#_buildWidgetInstanceList(FoxyApp.Model.Settings.siteSettings, list);
        this.#_buildWidgetInstanceList(FoxyApp.Model.widgetInstanceTree, list);
    }

    #_buildWidgetInstanceList(node, list)
    {
        if (node instanceof FoxyApp.Class.Model.WidgetInstance)
        {
            list[node.data.id] = { data: node.data };

            if (node.data.widgetType === 1)  // component
            {
                let component = FoxyApp.Model.componentMap[node.data.widgetID];

                for (let widgetInstance of component.children)
                {
                    this.#_buildWidgetInstanceList(widgetInstance, list);
                }
            }
        }

        for (let childNode of node.children)
            this.#_buildWidgetInstanceList(childNode, list);
    }

    #getResponsiveBreakpoints()
    {
        let widgetInstance = FoxyApp.Model.widgetInstanceMap['S-siteSettings'];
        let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];

        let tabletValue = widgetInstance.data.sparseSettings['breakpoints_tablet'];
        if (tabletValue === undefined || tabletValue === '')
            tabletValue = widget.settings['breakpoints_tablet'].default;

        let mobileValue = widgetInstance.data.sparseSettings['breakpoints_mobile'];
        if (mobileValue === undefined || mobileValue === '')
            mobileValue = widget.settings['breakpoints_mobile'].default;

        return {
            tablet: tabletValue,
            mobile: mobileValue
        };
    }

    destroy()
    {
        super.destroy();

        this.#iFrameElement = null;
        this.#templateElement = null;

        if (this.#dragDropProcessor !== null)
        {
            this.#dragDropProcessor.destroy();
            this.#dragDropProcessor = null;
        }

        if (this.#canvasNodeTree !== null)
        {
            this.#canvasNodeTree.destroy();
            this.#canvasNodeTree = null;
        }

        this.#canvasNodeMap = {};

        if (this.#stylesheet !== null)
        {
            this.#stylesheet.destroy();
            this.#stylesheet = null;
        }

        if (this.#contextMenu !== null)
        {
            this.#contextMenu.destroy();
            this.#contextMenu = null;
        }

        if (this.#googleFontLoader !== null)
        {
            this.#googleFontLoader.unregisterClient(this);
            this.#googleFontLoader.destroy();
            this.#googleFontLoader = null;
        }

        this.#lastSelectionClick.widgetElement = null;
    }
};

FoxyApp.Class.View.Canvas_Node = class extends FoxyApp.Class.ElementNode
{
    wInstanceID = '';
    context = null;
    descendantContext = null;
    #nodeMap = null;

    constructor(wInstanceID, context, nodeMap)
    {
        super(document.createElement('div'), null);

        this.wInstanceID = wInstanceID;
        this.context = context;
        this.#nodeMap = nodeMap;

        if (this.#nodeMap[this.wInstanceID] === undefined)
            this.#nodeMap[this.wInstanceID] = [];

        this.#nodeMap[this.wInstanceID].push(this);

        let widgetInstance = FoxyApp.Model.widgetInstanceMap[this.wInstanceID];
        switch (widgetInstance.data.widgetType)
        {
            case 0:
                this.descendantContext = this.context;
                break;

            case 1:
                this.descendantContext = {
                    component: structuredClone(widgetInstance.data.componentSettings)
                };
                break;
        }
    }

    render(deep)
    {
        FoxyApp.backgroundThread.submitRequest_render(this, this.wInstanceID, this.context, deep);
    }

    renderDescendant(wInstanceID)
    {
        if (wInstanceID === this.wInstanceID)
            this.render(false);

        for (let node of this.children)
            node.renderDescendant(wInstanceID);
    }

    #doRender(deep, renderHTML)
    {
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[this.wInstanceID];
        let widgetType = widgetInstance.data.widgetType;
        let widgetID = widgetInstance.data.widgetID;

        let wInstanceElement = document.createElement('div');
        wInstanceElement.classList.add('foxybdr-widget');
        wInstanceElement.setAttribute('foxybdr-widget-type', widgetType === 0 ? widgetID : 'foxybdr.layout.component');
        wInstanceElement.setAttribute('foxybdr-instance-id', this.wInstanceID);

        if (this.element && this.element.classList.contains('foxybdr-selected'))
            wInstanceElement.classList.add('foxybdr-selected');
        
        wInstanceElement.innerHTML = `<div class="foxybdr-overlay"><div class="foxybdr-overlay-action"><span class="dashicons dashicons-menu-alt2"></span></div></div>`;

        let widgetContainerElement = document.createElement('div');
        widgetContainerElement.classList.add('foxybdr-widget-container');
        widgetContainerElement.innerHTML = renderHTML;
        wInstanceElement.appendChild(widgetContainerElement);

        let isContainer;
        switch (widgetType)
        {
            case 0:
                isContainer = FoxyApp.Model.widgets[widgetID].container;
                break;

            case 1:
                isContainer = true;
                break;
        }

        let childContainerElement = null;

        if (isContainer === true)
        {
            childContainerElement = widgetContainerElement.querySelector('.foxybdr-child-container');

            if (childContainerElement === null && widgetContainerElement.children.length === 0)
                childContainerElement = widgetContainerElement;
        }

        if (deep === true && isContainer === true && childContainerElement !== null)
        {
            let newChildNodes = [];

            switch (widgetType)
            {
                case 0:  // widget
                    {
                        if (this.hasQuery())
                        {
                            let postObjects = this.runQuery();

                            for (let postObject of postObjects)
                            {
                                // TODO: Add postObject to cloned copy of this.context
                                let childContext = { ...this.context };

                                for (let childWidgetInstance of widgetInstance.children)
                                {
                                    let newChildNode = new FoxyApp.Class.View.Canvas_Node(childWidgetInstance.data.id, childContext, this.#nodeMap);
                                    newChildNode.render(deep);
                                    newChildNodes.push(newChildNode);
                                }
                            }
                        }
                        else
                        {
                            for (let childWidgetInstance of widgetInstance.children)
                            {
                                let newChildNode = new FoxyApp.Class.View.Canvas_Node(childWidgetInstance.data.id, this.descendantContext, this.#nodeMap);
                                newChildNode.render(deep);
                                newChildNodes.push(newChildNode);
                            }
                        }
                    }
                    break;

                case 1:  // component
                    {
                        let component = FoxyApp.Model.componentMap[widgetID];

                        for (let childWidgetInstance of component.children)
                        {
                            let newChildNode = new FoxyApp.Class.View.Canvas_Node(childWidgetInstance.data.id, this.descendantContext, this.#nodeMap);
                            newChildNode.render(deep);
                            newChildNodes.push(newChildNode);
                        }
                    }
                    break;
            }

            for (let oldChildNode of [ ...this.children ])
            {
                this.removeChild(oldChildNode);
                oldChildNode.destroy();
            }

            this.setElement(wInstanceElement, childContainerElement);

            for (let newChildNode of newChildNodes)
                this.appendChild(newChildNode);
        }
        else
        {
            this.setElement(wInstanceElement, childContainerElement);
        }
    }

    handleEvent(e)
    {
        if (e.type === 'background-thread-response')
        {
            for (let id of e.response.imageUrlFaults)
            {
                FoxyApp.imageUrlLoader.requestImageUrls(this, id);
            }

            this.#doRender(e.returnParams.deep, e.response.renderHTML);
        }
        else if (e.type === 'image-url-loaded')
        {
            this.render(false);
        }
    }

    onComponentDescendantUpdate(cwInstanceID, settingName, settingValue)
    {
        let componentSettings = this.descendantContext.component;

        if (settingValue !== null)
        {
            if (componentSettings[cwInstanceID] === undefined)
                componentSettings[cwInstanceID] = {};

            componentSettings[cwInstanceID][settingName] = settingValue;
        }
        else if (componentSettings[cwInstanceID] !== undefined)
        {
            if (componentSettings[cwInstanceID][settingName] !== undefined)
                delete componentSettings[cwInstanceID][settingName];

            if (Object.keys(componentSettings[cwInstanceID]).length === 0)
                delete componentSettings[cwInstanceID];
        }

        this.renderDescendant(cwInstanceID);
    }

    hasQuery()
    {
        return false;
    }

    runQuery()
    {
        return [];
    }

    destroy()
    {
        super.destroy();

        let index = this.#nodeMap[this.wInstanceID].indexOf(this);
        this.#nodeMap[this.wInstanceID].splice(index, 1);

        if (this.#nodeMap[this.wInstanceID].length === 0)
            delete this.#nodeMap[this.wInstanceID];

        this.#nodeMap = null;
    }
};

FoxyApp.Class.View.Canvas_Stylesheet = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #headElement = null;

    #stylesheet = {};
    #loadingImages = {};

    constructor()
    {
        super();
    }

    create(headElement)
    {
        this.#headElement = headElement;
    }

    build(widgetInstances)
    {
        // What needs to be deleted from this.#stylesheet?
        for (let wInstanceID in this.#stylesheet)
        {
            if (widgetInstances[wInstanceID] === undefined)
                delete this.#stylesheet[wInstanceID];
        }

        // What needs to be added to this.#stylesheet?
        for (let wInstanceID in widgetInstances)
        {
            if (this.#stylesheet[wInstanceID] !== undefined)
                continue;

            this.#stylesheet[wInstanceID] = '';

            FoxyApp.backgroundThread.submitRequest_buildStylesheet(this, wInstanceID);
        }

        // Get list of installed widget instances
        let installedInstances = [];
        let styleElements = this.#headElement.querySelectorAll('style[id^="foxybdr-stylesheet-"]');
        for (let i = 0; i < styleElements.length; i++)
        {
            let parts = styleElements[i].id.split('-');
            parts.shift();
            parts.shift();
            let wInstanceID = parts.join('-');
            installedInstances.push(wInstanceID);
        }

        // Which widget instances need to be uninstalled from <head> element?
        for (let wInstanceID of installedInstances)
        {
            if (this.#stylesheet[wInstanceID] === undefined)
            {
                this.#headElement.querySelector(`style[id="foxybdr-stylesheet-${wInstanceID}"]`).remove();
            }
        }

        // Which widget instances need to be installed to <head> element?
        for (let wInstanceID in this.#stylesheet)
        {
            if (installedInstances.indexOf(wInstanceID) < 0)
            {
                let styleElement = document.createElement('style');
                styleElement.setAttribute('id', `foxybdr-stylesheet-${wInstanceID}`);
                styleElement.textContent = this.#stylesheet[wInstanceID];

                this.#headElement.appendChild(styleElement);
            }
        }
    }

    update(wInstanceID)
    {
        if (this.#stylesheet[wInstanceID] === undefined)
            return;

        FoxyApp.backgroundThread.submitRequest_buildStylesheet(this, wInstanceID);
    }

    delete(wInstanceID)
    {
        if (this.#stylesheet[wInstanceID] !== undefined)
            delete this.#stylesheet[wInstanceID];

        let styleElement = this.#headElement.querySelector(`style[id="foxybdr-stylesheet-${wInstanceID}"]`);
        if (styleElement)
            styleElement.remove();
    }

    reset()
    {
        this.#stylesheet = {};
    }

    handleEvent(e)
    {
        if (e.type === 'background-thread-response')
        {
            let wInstanceID = e.returnParams.wInstanceID;

            if (this.#stylesheet[wInstanceID] !== undefined)
            {
                this.#stylesheet[wInstanceID] = e.response.stylesheetStr;

                let styleElement = this.#headElement.querySelector(`style[id="foxybdr-stylesheet-${wInstanceID}"]`);

                if (styleElement)
                    styleElement.textContent = this.#stylesheet[wInstanceID];

                for (let id of e.response.imageUrlFaults)
                {
                    let idStr = String(id);

                    if (this.#loadingImages[idStr] === undefined)
                        this.#loadingImages[idStr] = {};

                    this.#loadingImages[idStr][wInstanceID] = true;

                    FoxyApp.imageUrlLoader.requestImageUrls(this, id);
                }
            }
        }
        else if (e.type === 'image-url-loaded')
        {
            let wInstanceIDs = [];

            for (let id of e.ids)
            {
                let idStr = String(id);

                if (this.#loadingImages[idStr] !== undefined)
                {
                    for (let wInstanceID in this.#loadingImages[idStr])
                        wInstanceIDs.push(wInstanceID);

                    delete this.#loadingImages[idStr];
                }
            }

            for (let wInstanceID of wInstanceIDs)
            {
                FoxyApp.backgroundThread.submitRequest_buildStylesheet(this, wInstanceID);
            }
        }
    }

    destroy()
    {
        super.destroy();

        this.#headElement = null;
    }
};

FoxyApp.Class.View.Canvas_ContextMenu = class extends FoxyApp.Class.UI.Component.ContextMenu
{
    constructor()
    {
        super();
    }

    addMenuItems(itemElement)
    {
        let wInstanceID = itemElement.getAttribute('foxybdr-instance-id');
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];
        let widgetType = widgetInstance.data.widgetType;

        let isSection = false;
        let isColumn = false;
        let isBlock = false;

        if (widgetType === 0)  // widget
        {
            isSection = widgetInstance.data.widgetID === 'foxybdr.layout.section';
            isColumn = widgetInstance.data.widgetID === 'foxybdr.layout.column';
            isBlock = widgetInstance.data.widgetID === 'foxybdr.layout.block';
        }

        let isTemplate = wInstanceID.split('-')[0] === 'T';

        this.addMenuItem('edit', 'Edit');

        if (isTemplate)
        {
            this.addMenuItem('delete', 'Delete');
            this.addMenuItem('copy', 'Copy');
            this.addMenuItem('cut', 'Cut');
            this.addMenuItem('paste', 'Paste');
        }

        if (!isSection && !isColumn && isTemplate && widgetType === 0)
            this.addMenuItem('create-component', 'Create Component...');
    }

    destroy()
    {
        super.destroy();
    }
};

FoxyApp.Class.View.Device = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #buttons = {};

    constructor()
    {
        super();

        FoxyApp.Manager.modelManager.addEventListener('Device', this);
    }

    create()
    {
        this.#buttons = {
            desktop: document.querySelector('.foxybdr-device-btn.foxybdr-device-desktop'),
            tablet:  document.querySelector('.foxybdr-device-btn.foxybdr-device-tablet'),
            mobile:  document.querySelector('.foxybdr-device-btn.foxybdr-device-mobile')
        };

        for (let buttonName in this.#buttons)
            this.registerEvent(this.#buttons[buttonName], 'click');

        this.#buttons[FoxyApp.Model.device.deviceMode].classList.add('foxybdr-active');
    }

    handleEvent(e)
    {
        if (e instanceof FoxyApp.Class.Event.Model.Device)
        {
            let deviceMode = FoxyApp.Model.device.deviceMode;

            for (let buttonName in this.#buttons)
            {
                if (buttonName === deviceMode)
                    this.#buttons[buttonName].classList.add('foxybdr-active');
                else
                    this.#buttons[buttonName].classList.remove('foxybdr-active');
            }
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget.classList.contains('foxybdr-device-btn'))
        {
            let buttonActivated = null;

            for (let buttonName in this.#buttons)
            {
                let buttonElement = this.#buttons[buttonName];

                if (buttonElement === e.currentTarget)
                {
                    if (!buttonElement.classList.contains('foxybdr-active'))
                    {
                        buttonElement.classList.add('foxybdr-active');

                        buttonActivated = buttonName;
                    }
                }
                else
                {
                    buttonElement.classList.remove('foxybdr-active');
                }
            }

            if (buttonActivated !== null)
            {
                let command = new FoxyApp.Class.Command.Model.Device(buttonActivated);

                FoxyApp.Manager.modelManager.submitCommand(this, command);
            }
        }
    }

    destroy()
    {
        super.destroy();

        this.#buttons = {};
    }
};


FoxyApp.Class.View.Save = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #saveButtonElement = null;

    #saveState = {
        siteSettings: '',
        components: '',
        template: ''
    };

    constructor()
    {
        super();

        FoxyApp.Manager.modelManager.addEventListener('History', this);
    }

    create()
    {
        this.#saveButtonElement = document.querySelector('#foxybdr-save-button');
        this.#saveButtonElement.disabled = true;
        this.#saveButtonElement.classList.remove('foxybdr-enabled');
        this.registerEvent(this.#saveButtonElement, 'click');

        this.#saveState.siteSettings = this.#stringifySiteSettings();
        this.#saveState.components = this.#stringifyComponents();
        this.#saveState.template = this.#stringifyTemplate();
    }

    handleEvent(e)
    {
        if (e instanceof FoxyApp.Class.Event.History)
        {
            let undoStack = FoxyApp.Manager.modelManager.undoStack;
            let saveAction = FoxyApp.Manager.modelManager.saveAction;

            let isSaved = undoStack.length > 0 && undoStack[undoStack.length - 1] === saveAction;

            this.#saveButtonElement.disabled = isSaved;

            if (isSaved)
            {
                this.#saveButtonElement.classList.remove('foxybdr-enabled');
            }
            else
            {
                this.#saveButtonElement.classList.add('foxybdr-enabled');
            }
        }
        else if (e.type === 'click' && e.currentTarget === this.#saveButtonElement)
        {
            this.sendSaveRequest();
        }
    }

    sendSaveRequest()
    {
        var self = this;

        let request = {
            nonce: FOXYAPP.nonce,
            template_id: FoxyApp.templateID,
        };

        let siteSettingsStr = this.#stringifySiteSettings();
        if (siteSettingsStr !== this.#saveState.siteSettings)
            request['site_settings'] = siteSettingsStr;

        let componentsStr = this.#stringifyComponents();
        if (componentsStr !== this.#saveState.components)
            request['components'] = componentsStr;

        let templateStr = this.#stringifyTemplate();
        if (templateStr !== this.#saveState.template)
            request['template'] = templateStr;

        let waitDialog = new FoxyBuilder.Dialogs.Wait({
            title: '',
            message: FOXYBUILDER.dialogs.saveWait.message
        });
        waitDialog.create();

        FoxyBuilder.Ajax.fetch('foxybdr_editor_save', request)
        .then(function(response) {
            if (response.ok)
                return response.json();
            else
                throw new Error('');
        })
        .then(function(data) {
            if (data.status === 'OK')
            {
                self.onSaveComplete();
            }
            else
                throw new Error('');
        })
        .catch(function(e) {
            (new FoxyBuilder.Dialogs.Alert({
                title: FOXYBUILDER.dialogs.saveError.title,
                message: FOXYBUILDER.dialogs.saveError.message,
                okLabel: FOXYBUILDER.dialogs.saveError.okLabel
            })).create();
        })
        .finally(function(e) {
            waitDialog.destroy();
        });
    }

    onSaveComplete()
    {
        this.#saveState.siteSettings = this.#stringifySiteSettings();
        this.#saveState.components = this.#stringifyComponents();
        this.#saveState.template = this.#stringifyTemplate();

        let undoStack = FoxyApp.Manager.modelManager.undoStack;

        if (undoStack.length === 0)
        {
            undoStack.push({
                redoCommand: null,
                undoCommand: null,
                wInstanceID: null,
                componentID: null
            });
        }

        FoxyApp.Manager.modelManager.saveAction = undoStack[undoStack.length - 1];

        this.#saveButtonElement.disabled = true;
        this.#saveButtonElement.classList.remove('foxybdr-enabled');
    }

    #stringifySiteSettings()
    {
        let data = FoxyApp.Model.Settings.siteSettings.saveTree();

        return JSON.stringify(data);
    }

    #stringifyComponents()
    {
        let dataArr = [];

        for (let component of FoxyApp.Model.componentTree.children)
        {
            let data = component.saveTree();
            dataArr.push(data);
        }

        return JSON.stringify(dataArr);
    }

    #stringifyTemplate()
    {
        let dataArr = [];

        for (let widgetInstance of FoxyApp.Model.widgetInstanceTree.children)
        {
            let data = widgetInstance.saveTree();
            dataArr.push(data);
        }

        return JSON.stringify(dataArr);
    }

    destroy()
    {
        super.destroy();

        this.#saveButtonElement = null;
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BACKGROUND THREAD
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.BackgroundThread = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #worker = null;

    #requestQueue = [];
    #currentRequest = null;

    constructor()
    {
        super();
    }

    create()
    {
        let scriptElement = document.querySelector('script#foxybdr-tmpl-thread');
        let workerJs = scriptElement.textContent;
        let blob = new Blob([ workerJs ]);
        let workerUrl = window.URL.createObjectURL(blob);

        this.#worker = new Worker(workerUrl);

        this.registerEvent(this.#worker, 'message');

        this.#worker.postMessage({
            type: 'init',
            pluginUrl: FOXYAPP.pluginUrl,
            controlDefaultValues: FoxyControls.controlDefaultValues,
            groupControls: FOXYAPP.groupControls,
            widgets: FOXYAPP.widgets
        });
    }

    submitRequest_widgetInstances(widgetInstances)
    {
        for (let i = 0; i < this.#requestQueue.length; i++)
        {
            let request = this.#requestQueue[i];

            if (request.request.type === 'widget-instances')
            {
                request.request.widgetInstances = widgetInstances;

                this.#requestQueue.splice(i, 1);
                this.#submitRequest(request);

                return;
            }
        }

        this.#submitRequest({
            request: {
                type: 'widget-instances',
                widgetInstances: widgetInstances
            },
            requester: null,
            returnParams: null
        });
    }

    submitRequest_updateWidgetInstance(wInstanceID, settingName, settingValue)
    {
        for (let i = 0; i < this.#requestQueue.length; i++)
        {
            let request = this.#requestQueue[i];

            if (request.request.type === 'update-widget-instance' &&
                request.request.wInstanceID === wInstanceID &&
                request.request.settingName === settingName)
            {
                request.request.settingValue = settingValue;

                this.#requestQueue.splice(i, 1);
                this.#submitRequest(request);

                return;
            }
        }

        this.#submitRequest({
            request: {
                type: 'update-widget-instance',
                wInstanceID: wInstanceID,
                settingName: settingName,
                settingValue: settingValue
            },
            requester: null,
            returnParams: null
        });
    }

    submitRequest_render(requester, wInstanceID, context, deep)
    {
        for (let i = 0; i < this.#requestQueue.length; i++)
        {
            let request = this.#requestQueue[i];

            if (request.request.type === 'render' && request.requester === requester)
            {
                request.request.context = context;

                if (deep === true)
                {
                    request.returnParams.deep = true;
                }
    
                this.#requestQueue.splice(i, 1);
                this.#submitRequest(request);

                return;
            }
        }

        this.#submitRequest({
            request: {
                type: 'render',
                wInstanceID: wInstanceID,
                context: context
            },
            requester: requester,
            returnParams: {
                deep: deep
            }
        });
    }

    submitRequest_buildStylesheet(requester, wInstanceID)
    {
        for (let i = 0; i < this.#requestQueue.length; i++)
        {
            let request = this.#requestQueue[i];

            if (request.request.type === 'build-stylesheet' &&
                request.request.wInstanceID === wInstanceID)
            {
                this.#requestQueue.splice(i, 1);
                this.#submitRequest(request);
                
                return;
            }
        }

        this.#submitRequest({
            request: {
                type: 'build-stylesheet',
                wInstanceID: wInstanceID
            },
            requester: requester,
            returnParams: {
                wInstanceID: wInstanceID
            }
        });
    }

    submitRequest_cacheImageUrls(id, imageUrls)
    {
        this.#submitRequest({
            request: {
                type: 'cache-image-urls',
                id: id,
                imageUrls: imageUrls
            },
            requester: null,
            returnParams: null
        });
    }

    submitRequest_findGoogleFonts(requester)
    {
        for (let i = 0; i < this.#requestQueue.length; i++)
        {
            let request = this.#requestQueue[i];

            if (request.request.type === 'find-google-fonts' && request.requester === requester)
            {
                this.#requestQueue.splice(i, 1);
                this.#submitRequest(request);

                return;
            }
        }

        this.#submitRequest({
            request: {
                type: 'find-google-fonts'
            },
            requester: requester,
            returnParams: {
            }
        });
    }

    submitRequest_findGlobalDependencies(requester, settingName)
    {
        for (let i = 0; i < this.#requestQueue.length; i++)
        {
            let request = this.#requestQueue[i];

            if (request.request.type === 'find-global-dependencies' && request.requester === requester && request.request.settingName === settingName)
            {
                this.#requestQueue.splice(i, 1);
                this.#submitRequest(request);

                return;
            }
        }

        this.#submitRequest({
            request: {
                type: 'find-global-dependencies',
                settingName: settingName
            },
            requester: requester,
            returnParams: {
            }
        });
    }

    #submitRequest(request)
    {
        this.#requestQueue.unshift(request);

        this.#sendNextRequestIfReady();
    }

    #sendNextRequestIfReady()
    {
        if (this.#currentRequest === null && this.#requestQueue.length > 0)
        {
            this.#currentRequest = this.#requestQueue.pop();

            this.#worker.postMessage(this.#currentRequest.request);
        }
    }

    handleEvent(e)
    {
        if (this.#currentRequest === null)
            return;

        if (this.#currentRequest.requester !== null)
        {
            this.#currentRequest.requester.handleEvent({
                type: 'background-thread-response',
                returnParams: this.#currentRequest.returnParams,
                request: this.#currentRequest.request,
                response: e.data
            });
        }

        this.#currentRequest = null;

        this.#sendNextRequestIfReady();
    }

    destroy()
    {
        super.destroy();

        if (this.#worker)
        {
            this.#worker.terminate();
            this.#worker = null;
        }
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMAGE URL LOADER
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.ImageUrlLoader = class
{
    #imageIds = {};
    #isProcessing = false;

    requestImageUrls(requester, id)
    {
        let idStr = String(id);

        if (this.#imageIds[idStr] === undefined)
            this.#imageIds[idStr] = [];

        if (this.#imageIds[idStr].includes(requester))
            return;

        this.#imageIds[idStr].push(requester);

        this.#sendBatchRequestIfReady();
    }

    #sendBatchRequestIfReady()
    {
        if (this.#isProcessing === true || Object.keys(this.#imageIds).length === 0)
            return;

        this.#isProcessing = true;
        
        let imageIds = [];

        for (let idStr in this.#imageIds)
            imageIds.push(Number(idStr));

        var self = this;

        FoxyBuilder.Ajax.fetch('foxybdr_editor_get_image_urls', {
            id_list: JSON.stringify(imageIds),
            nonce: FOXYAPP.nonce
        })
        .then(function(response) {
            if (response.ok)
                return response.json();
            else
                throw new Error('');
        })
        .then(function(data) {
            if (data.status === 'OK')
            {
                self.onBatchResponse(data.images);
            }
            else
                throw new Error('');
        })
        .catch(function(e) {
            FoxyBuilder.showNonceErrorDialog();
        });
    }

    onBatchResponse(images)
    {
        let ids = [];
        let requesters = [];

        for (let idStr in images)
        {
            ids.push(Number(idStr));

            FoxyApp.backgroundThread.submitRequest_cacheImageUrls(Number(idStr), images[idStr]);

            if (this.#imageIds[idStr] !== undefined)
            {
                for (let requester of this.#imageIds[idStr])
                {
                    if (requesters.includes(requester) === false)
                        requesters.push(requester);
                }

                delete this.#imageIds[idStr];
            }
        }

        for (let requester of requesters)
        {
            requester.handleEvent({
                type: 'image-url-loaded',
                ids: ids
            });
        }

        this.#isProcessing = false;

        this.#sendBatchRequestIfReady();
    }

    destroy()
    {
        this.#imageIds = {};
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MEDIA UPLOADER
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.MediaUploader = class
{
    mediaUploader = null;
    currentRequest = null;
    #currentLibraryType = '';

    show(requester, libraryType, libraryTitle, selectedID)
    {
        this.currentRequest = {
            requester: requester,
            libraryType: libraryType,  // e.g. 'image'
            libraryTitle: libraryTitle,
            selectedID: selectedID,
            oldExtensions: _wpPluploadSettings.defaults.filters.mime_types[0].extensions
        };

        this.#doShow();
    }

    #doShow()
    {
        let _this = this;

        if (FOXYAPP.uploadFileTypes.length > 0)
        {
            _wpPluploadSettings.defaults.filters.mime_types[0].extensions = _this.currentRequest.oldExtensions + ',' + FOXYAPP.uploadFileTypes.join(',');
        }

        if (this.mediaUploader === null || this.#currentLibraryType !== this.currentRequest.libraryType)
        {
            this.mediaUploader = wp.media({
                button: {
                    text: 'Select File',
                },
                multiple: false,
                states: [new wp.media.controller.Library({
                    title: 'Select ' + this.currentRequest.libraryTitle,
                    library: wp.media.query({
                        type: this.currentRequest.libraryType
                    }),
                    multiple: false,
                    date: false
                })]
            });

            this.mediaUploader.on('open',
                function()
                {
                    let id = _this.currentRequest.selectedID;
                    let selection = _this.mediaUploader.state().get('selection');

                    if (id !== null)
                    {
                        selection.add(wp.media.attachment(id));
                    }
                    else
                    {
                        selection.remove(selection.models);
                    }
                }
            );

            this.mediaUploader.on('insert select',
                function()
                {
                    let attachment = _this.mediaUploader.state().get('selection').first().toJSON();

                    _this.currentRequest.requester.handleEvent({
                        type: 'media-select',
                        id: attachment.id,
                        url: attachment.url
                    });
                }
            );

            this.mediaUploader.on('close',
                function()
                {
                    _wpPluploadSettings.defaults.filters.mime_types[0].extensions = _this.currentRequest.oldExtensions;

                    _this.onClose();
                }
            );

            this.#currentLibraryType = this.currentRequest.libraryType;
        }
        
        this.mediaUploader.open();

        if (FOXYAPP.uploadFileTypes.length > 0)
        {
            this.mediaUploader.uploader.uploader.param('foxybdr-media-upload', 'foxybdr-upload-from-editor');
        }
    }

    onClose()
    {
        let _this = this;

        setTimeout(function() {
            _this.currentRequest = null;
        }, 1);
    }

    destroy()
    {
        this.mediaUploader = null;
        this.currentRequest = null;
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GOOGLE FONT LOADER
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.GoogleFontLoader = class
{
    #headElement = null;

    /* #fontMap: Maps Google font names to info objects containing: (1) Last usage timestamp, (2) Reference to the <link> element pointing
     * to the font's CSS resource. */
    #fontMap = {};

    #clients = [];

    #preloadedFontIds = [];

    #cacheSize = 0;

    create(document, cacheSize)
    {
        this.#headElement = document.querySelector('head');

        let linkElements = document.querySelectorAll('link[foxybdr-asset="foxybdr-google-font-list"]');

        for (let i = 0; i < linkElements.length; i++)
        {
            let fontIdListStr = linkElements[i].getAttribute('foxybdr-font-list');
            let fontIdList = fontIdListStr.split('|');

            for (let fontId of fontIdList)
            {
                this.#preloadedFontIds.push(fontId);
            }
        }

        this.#cacheSize = cacheSize;
    }

    registerClient(client)
    {
        this.#clients.push({
            client: client,
            fontIds: []
        });
    }

    unregisterClient(client)
    {
        for (let i = 0; i < this.#clients.length; i++)
        {
            if (this.#clients[i].client === client)
            {
                this.#clients.splice(i, 1);
                break;
            }
        }

        this.#loadFonts();
    }

    requestFonts(client, fontIds)
    {
        for (let item of this.#clients)
        {
            if (item.client === client)
            {
                item.fontIds = fontIds;
                break;
            }
        }

        this.#loadFonts();
    }

    #loadFonts()
    {
        let idMap = {};

        for (let item of this.#clients)
        {
            for (let id of item.fontIds)
            {
                idMap[id] = 1;
            }
        }

        let fontIds = Object.keys(idMap);

        for (let fontId of fontIds)
        {
            if (this.#preloadedFontIds.includes(fontId))
                continue;

            if (this.#fontMap[fontId] === undefined)
            {
                let url = this.#buildFontUrl(fontId);

                let linkElement = document.createElement('link');
                linkElement.setAttribute('href', url);
                linkElement.setAttribute('rel', 'stylesheet');
                linkElement.setAttribute('type', 'text/css');
                linkElement.setAttribute('crossorigin', 'anonymous');

                this.#headElement.appendChild(linkElement);

                this.#fontMap[fontId] = {
                    timestamp: Date.now(),
                    linkElement: linkElement
                };
            }
            else
            {
                this.#fontMap[fontId].timestamp = Date.now();
            }
        }

        let oldFonts = [];

        for (let fontId in this.#fontMap)
        {
            if (fontIds.includes(fontId))
                continue;

            oldFonts.push({
                fontId: fontId,
                timestamp: this.#fontMap[fontId].timestamp
            });
        }

        oldFonts.sort((a, b) => { return a.timestamp - b.timestamp; });

        let numToDelete = oldFonts.length - this.#cacheSize;

        if (numToDelete <= 0)
            return;

        for (let i = 0; i < numToDelete; i++)
        {
            let font = oldFonts.shift();

            this.#fontMap[font.fontId].linkElement.remove();

            delete this.#fontMap[font.fontId];
        }
    }

    #buildFontUrl(fontId)
    {
        let encodedFontId = fontId.replaceAll(' ', '%20');

        return `https://fonts.googleapis.com/css?family=${encodedFontId}:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic`;
    }

    destroy()
    {
        this.#headElement = null;

        for (let fontId in this.#fontMap)
            this.#fontMap[fontId].linkElement.remove();

        this.#fontMap = {};

        this.#clients = [];
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WIDGET CSS DEPENDENCY BUILDER
//
// Purpose: When a setting value changes, we need to know whether or not the stylesheet for the widget instance needs to be rebuilt, which
// is CPU expensive. This class builds a dictionary object that maps (1) setting name, to (2) flag indicating whether or not the stylesheet
// needs to be rebuilt whenever that setting changes. This flag takes into account whether the setting is being referenced by:
// (a) Conditions in other settings.
// (b) Variables in the 'selector' parameters of other settings.
// If the setting is being referenced by other settings, a CSS stylesheet rebuild of the widget instance may be necessary.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.WidgetCssDependencyBuilder = class
{
    #widget = null;
    #dependencies = {};
    #varRegex = /{{([^}]*)}}/g;

    constructor(widget)
    {
        this.#widget = widget;
    }

    build()
    {
        for (let tab of this.#widget.tabs)
        {
            for (let section of tab.sections)
            {
                if (section.condition === undefined)
                    continue;

                for (let key in section.condition)
                {
                    let not = key.endsWith('!');
                    let varName = not ? key.substring(0, key.length - 1) : key;
                    let parts = varName.split('.');
                    let settingName = parts[0];
            
                    if (this.#widget.settings[settingName] === undefined)
                        continue;
        
                    this.#dependencies[settingName] = true;
        
                    this.#processSettingCondition(settingName);
                }
            }
        }

        for (let settingName in this.#widget.settings)
        {
            this.#processSettingCondition(settingName);
        }

        for (let settingName in this.#widget.settings)
        {
            let settingParams = this.#widget.settings[settingName];

            if (settingParams.selectors === undefined)
                continue;

            for (let selector in settingParams.selectors)
            {
                let selectorValue = settingParams.selectors[selector];

                let match;

                while ((match = this.#varRegex.exec(selectorValue)) !== null)
                {
                    let varName = match[1];

                    let varNames = [];
                    if (varName.startsWith('|'))
                    {
                        let items = varName.split('|');
                        items.shift();  // remove empty string
                        items.shift();  // remove function name

                        for (let item of items)
                            varNames.push(item);
                    }
                    else
                        varNames.push(varName);

                    for (let v of varNames)
                    {
                        let parts = v.split('.');

                        if (parts.length < 2)
                            continue;

                        let _settingName = parts[0];

                        if (this.#widget.settings[_settingName] === undefined)
                            continue;
                
                        this.#dependencies[_settingName] = true;

                        this.#processSettingCondition(_settingName);
                    }
                }
            }
        }
    }

    getDependencies()
    {
        return this.#dependencies;
    }

    #processSettingCondition(settingName)
    {
        let settingParams = this.#widget.settings[settingName];

        if (settingParams.condition === undefined)
            return;

        for (let key in settingParams.condition)
        {
            let not = key.endsWith('!');
            let varName = not ? key.substring(0, key.length - 1) : key;
            let parts = varName.split('.');
            let _settingName = parts[0];
    
            if (this.#widget.settings[_settingName] === undefined)
                continue;

            this.#dependencies[_settingName] = true;

            this.#processSettingCondition(_settingName);
        }
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// "GLOBAL" OBJECTS AND VARIABLES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.templateID = -1;
FoxyApp.widgetInstanceIdCounter = -1;
FoxyApp.elementCache = null;
FoxyApp.backgroundThread = null;
FoxyApp.imageUrlLoader = null;
FoxyApp.mediaUploader = null;
FoxyApp.googleFontLoader = null;

FoxyApp.UI = {};
FoxyApp.UI.panelResizer = null;
FoxyApp.UI.drawerResizer = null;

FoxyApp.Model = {};
FoxyApp.Model.widgetInstanceMap = {};  // Key: Widget instance ID. Value: Pointer to widget instance object.
FoxyApp.Model.widgetInstanceTree = null;
FoxyApp.Model.widgetCategories = null;
FoxyApp.Model.widgets = null;
FoxyApp.Model.componentMap = {};
FoxyApp.Model.componentTree = null;
FoxyApp.Model.Settings = {};
FoxyApp.Model.Settings.siteSettings = null;
FoxyApp.Model.Settings.templateSettings = null;
FoxyApp.Model.selection = {
    wInstanceID: null,
    cwInstanceID: null
};
FoxyApp.Model.device = {
    deviceMode: ''  // 'desktop', 'tablet', 'mobile'
};

FoxyApp.Manager = {};
FoxyApp.Manager.modelManager = null;
FoxyApp.Manager.panelManager = null;
FoxyApp.Manager.drawerManager = null;

FoxyApp.View = {};
FoxyApp.View.PanelModule = {};
FoxyApp.View.PanelModule.siteSettingsModule = null;
FoxyApp.View.PanelModule.propertiesModule = null;
FoxyApp.View.PanelModule.widgetsModule = null;
FoxyApp.View.DrawerModule = {};
FoxyApp.View.DrawerModule.template = null;
FoxyApp.View.DrawerModule.components = null;
FoxyApp.View.canvas = null;
FoxyApp.View.device = null;
FoxyApp.View.save = null;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Main = class
{
    init()
    {
        FoxyControls.load();

        FoxyApp.templateID = Number(FOXYAPP.templateID);
        FoxyApp.widgetInstanceIdCounter = Number(FOXYAPP.widgetInstanceIdCounter);
        FoxyApp.elementCache = new FoxyApp.Class.ElementCache();

        FoxyApp.backgroundThread = new FoxyApp.Class.BackgroundThread();
        FoxyApp.backgroundThread.create();

        FoxyApp.imageUrlLoader = new FoxyApp.Class.ImageUrlLoader();

        FoxyApp.mediaUploader = new FoxyApp.Class.MediaUploader();

        FoxyApp.googleFontLoader = new FoxyApp.Class.GoogleFontLoader();
        FoxyApp.googleFontLoader.create(document, 50);

        FoxyApp.UI.panelResizer = new FoxyApp.Class.UI.Component.PanelResizer();
        FoxyApp.UI.panelResizer.create();

        FoxyApp.UI.drawerResizer = new FoxyApp.Class.UI.Component.DrawerResizer();
        FoxyApp.UI.drawerResizer.create();

        FoxyApp.Model.widgetInstanceTree = new FoxyApp.Class.Node();
        for (let data of FOXYAPP.widgetInstances)
        {
            let widgetInstance = FoxyApp.Class.Model.WidgetInstance.loadTree(structuredClone(data));
            FoxyApp.Model.widgetInstanceTree.appendChild(widgetInstance);
        }

        FoxyApp.Model.widgetCategories = FOXYAPP.widgetCategories;
        FoxyApp.Model.widgets = FOXYAPP.widgets;
        this.#buildWidgetCssDependencies();

        FoxyApp.Model.componentTree = new FoxyApp.Class.Node();
        for (let data of FOXYAPP.components)
        {
            let component = FoxyApp.Class.Model.Component.loadTree(structuredClone(data));
            FoxyApp.Model.componentTree.appendChild(component);
        }

        FoxyApp.Model.Settings.siteSettings = new FoxyApp.Class.Model.WidgetInstance(FOXYAPP.siteSettings);
        FoxyApp.Model.Settings.templateSettings;
        FoxyApp.Model.device.deviceMode = 'desktop';

        FoxyApp.Manager.modelManager = new FoxyApp.Class.Manager.ModelManager();
        FoxyApp.Manager.panelManager = new FoxyApp.Class.Manager.PanelManager();

        FoxyApp.Manager.drawerManager = new FoxyApp.Class.Manager.DrawerManager();
        FoxyApp.Manager.drawerManager.create();

        FoxyApp.View.PanelModule.siteSettingsModule = new FoxyApp.Class.View.PanelModule.SiteSettingsModule();
        FoxyApp.View.PanelModule.siteSettingsModule.create();

        FoxyApp.View.PanelModule.propertiesModule = new FoxyApp.Class.View.PanelModule.PropertiesModule();
        FoxyApp.View.PanelModule.propertiesModule.create();

        FoxyApp.View.PanelModule.widgetsModule = new FoxyApp.Class.View.PanelModule.WidgetsModule();
        FoxyApp.View.PanelModule.widgetsModule.create();

        FoxyApp.View.DrawerModule.template = new FoxyApp.Class.View.DrawerModule.Template();
        FoxyApp.View.DrawerModule.template.create();

        FoxyApp.View.DrawerModule.components = new FoxyApp.Class.View.DrawerModule.Components();
        FoxyApp.View.DrawerModule.components.create();

        FoxyApp.View.canvas = new FoxyApp.Class.View.Canvas();
        FoxyApp.View.canvas.create();

        FoxyApp.View.device = new FoxyApp.Class.View.Device();
        FoxyApp.View.device.create();

        FoxyApp.View.save = new FoxyApp.Class.View.Save();
        FoxyApp.View.save.create();

        document.body.addEventListener('keydown', this);

        this.scheduleRefreshNonce();
    }

    handleEvent(e)
    {
        if (e.type === 'keydown' && e.currentTarget === document.body)
        {
            if ((e.key === 'z' || e.key === 'Z') && e.ctrlKey === true)
            {
                e.preventDefault();

                FoxyApp.Manager.modelManager.undo();
            }
            else if ((e.key === 'y' || e.key === 'Y') && e.ctrlKey === true)
            {
                e.preventDefault();

                FoxyApp.Manager.modelManager.redo();
            }
        }
    }

    #buildWidgetCssDependencies()
    {
        for (let widgetID in FoxyApp.Model.widgets)
        {
            let widget = FoxyApp.Model.widgets[widgetID];

            let depBuilder = new FoxyApp.Class.WidgetCssDependencyBuilder(widget);

            depBuilder.build();

            widget.cssDependencies = depBuilder.getDependencies();
        }        
    }

    scheduleRefreshNonce(milliseconds = 3600 * 1000)
    {
        var self = this;

        setTimeout(function() {
            self.refreshNonce();
        }, milliseconds);
    }

    refreshNonce()
    {
        var self = this;

        FoxyBuilder.Ajax.fetch('foxybdr_editor_refresh_nonce', {
            nonce: FOXYAPP.nonce
        })
        .then(function(response) {
            if (response.ok)
                return response.json();
            else
                throw new Error('');
        })
        .then(function(data) {
            if (data.status === 'OK')
            {
                FOXYAPP.nonce = data.nonce;
                self.scheduleRefreshNonce();
            }
            else
                throw new Error('');
        })
        .catch(function(e) {
            FoxyBuilder.showNonceErrorDialog();
        });
    }

    destroy()
    {
        document.body.removeEventListener('keydown', this);
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var FOXY_APP_MAIN = null;

window.addEventListener('load',
    function(e)
    {
        FOXY_APP_MAIN = new FoxyApp.Main();

        FOXY_APP_MAIN.init();
    }
);
