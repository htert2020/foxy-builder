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

FoxyApp.Class.Event.Model.Component = {};

FoxyApp.Class.Event.Model.Settings = {};

FoxyApp.Class.Event.Model.Selection = class
{
    type = [ 'Model', 'Selection' ];

    wInstanceID = null;

    constructor(wInstanceID)
    {
        this.wInstanceID = wInstanceID;
    }
};

FoxyApp.Class.Event.Model.Device = class
{
    type = [ 'Model', 'Device' ];
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

FoxyApp.Class.Command.Model.Component = {};

FoxyApp.Class.Command.Model.Settings = {};

FoxyApp.Class.Command.Model.Selection = class
{
    type = [ 'Model', 'Selection' ];

    wInstanceID = null;

    constructor(wInstanceID)
    {
        this.wInstanceID = wInstanceID;
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

    static createTree(data)
    {
        let children = data.children !== undefined ? data.children : [];

        if (data.children !== undefined)
            delete data.children;

        let widgetInstance = new FoxyApp.Class.Model.WidgetInstance(data);

        for (let child of children)
        {
            let childNode = FoxyApp.Class.Model.WidgetInstance.createTree(child);
            widgetInstance.appendChild(childNode);
        }

        return widgetInstance;
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

    destroy()
    {
        super.destroy();

        delete FoxyApp.Model.widgetInstanceMap[this.data.id];
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
            document.querySelector('#foxybdr-editor-screen').classList.add('foxybdr-line-resize-mode');
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

            document.querySelector('#foxybdr-editor-screen').classList.remove('foxybdr-line-resize-mode');
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
    widgetInstanceID = '';

    constructor()
    {
        super('foxybdr-tmpl-settings-module');

        FoxyApp.Manager.modelManager.addEventListener('Device', this);
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
                    command = new FoxyApp.Class.Command.Model.Template.Update(this.widgetInstanceID, e.name, e.value);
                    break;

                case 'C':
                    break;
            }
            
            FoxyApp.Manager.modelManager.submitCommand(this, command);
        }
    }

    activateTabPage(tabIndex)
    {
        for (let i = 0; i < this.#tabs.length; i++)
            this.#tabs[i].activate(i === tabIndex);
    }

    load(domainType, domainID, widgetInstanceID)
    {
        this.unload();

        this.domainType = domainType;
        this.domainID = domainID;
        this.widgetInstanceID = widgetInstanceID;

        let widgetInstance = FoxyApp.Model.widgetInstanceMap[this.widgetInstanceID];

        switch (widgetInstance.data.widgetType)
        {
            case 0:  // based on widget

                let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];

                for (let i = 0; i < widget.tabs.length; i++)
                {
                    let tabData = widget.tabs[i];

                    let tab = new FoxyApp.Class.UI.Component.PanelModule.SettingsModule_Tab(i, tabData, widget.settings, widgetInstance.data.sparseSettings);
                    tab.create(this.#tabsElement, this.#tabBodyElement);
                    tab.addEventListener(this);
                    this.#tabs.push(tab);
                }

                if (this.#tabs.length > 0)
                    this.activateTabPage(0);

                break;

            case 1:  // based on component
                break;
        }
    }

    unload()
    {
        for (let tab of this.#tabs)
            tab.destroy();

        this.#tabs = [];

        this.domainType = '';
        this.domainID = null;
        this.widgetInstanceID = '';
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
        else if (e.type === 'device-change')
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

        for (let settingName of this.#sectionData.settings)
        {
            let settingParams = this.#settingDefinitions[settingName];

            let value = this.#settingValues[settingName] !== undefined ? this.#settingValues[settingName] : null;

            let control = FoxyControls.Class.Factory.create(settingParams.type, settingName, settingParams, value);
            control.create(sectionBodyElement);
            control.addEventListener(this);
            this.#controls.push(control);
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
        else if (e.type === 'device-change')
        {
            for (let control of this.#controls)
                control.handleEvent(e);
        }
    }

    activate(show)
    {
        if (show)
            this.#sectionElement.classList.add('foxybdr-active');
        else
            this.#sectionElement.classList.remove('foxybdr-active');
    }

    destroy()
    {
        super.destroy();

        for (let control of this.#controls)
            control.destroy();

        this.#controls = [];

        if (this.#sectionElement)
        {
            this.#sectionElement.remove();
            this.#sectionElement = null;
        }
    }
};

FoxyApp.Class.UI.Component.PanelModule.WidgetsModule = class extends FoxyApp.Class.UI.Component.PanelModule.BaseModule
{
    #headerElement = null;
    #bodyElement = null;

    #categories = [];

    constructor()
    {
        super('foxybdr-tmpl-widgets-module');
    }

    create()
    {
        super.create();

        let moduleElement = this.getModuleElement();

        this.#headerElement = moduleElement.querySelector('.foxybdr-header');
        this.#bodyElement = moduleElement.querySelector('.foxybdr-body');

        for (let categoryData of FoxyApp.Model.widgetCategories)
        {
            let category = new FoxyApp.Class.UI.Component.PanelModule.WidgetsModule_Category(categoryData);
            category.create(this.#bodyElement);
            this.#categories.push(category);
        }
    }

    destroy()
    {
        super.destroy();

        for (let category of this.#categories)
            category.destroy();

        this.#categories = [];

        this.#headerElement = null;
        this.#bodyElement = null;
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

    }

    #onDragEnd(e)
    {

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

    constructor()
    {
        for (let modelName of Object.keys(FoxyApp.Class.Event.Model))
            this.#eventListeners[modelName] = [];
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
        if (command.type[0] !== 'Model')
            return;

        let events;

        switch (command.type[1])
        {
            case 'Template':
                events = this.#processCommand_template(command);
                break;

            case 'Selection':
                events = this.#processCommand_selection(command);
                break;

            case 'Device':
                events = this.#processCommand_device(command);
                break;
        }

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
    }

    #processCommand_template(command)
    {
        switch (command.type[2])
        {
            case 'Insert':

                {
                    let widgetInstance = FoxyApp.Class.Model.WidgetInstance.createTree(command.wInstanceData);

                    FoxyApp.Class.Node.insertIntoIndexedTree(FoxyApp.Model.widgetInstanceTree, FoxyApp.Model.widgetInstanceMap, widgetInstance, command.targetID, command.insertBefore);

                    return [ new FoxyApp.Class.Event.Model.Template.Insert(widgetInstance, command.targetID, command.insertBefore) ];
                }

                break;

            case 'Update':

                {
                    let widgetInstance = FoxyApp.Model.widgetInstanceMap[command.wInstanceID];

                    widgetInstance.setValue(command.settingName, command.settingValue);

                    return [ new FoxyApp.Class.Event.Model.Template.Update(command.wInstanceID, command.settingName, command.settingValue) ];
                }

                break;
        }
    }

    #processCommand_selection(command)
    {
        if (command instanceof FoxyApp.Class.Command.Model.Selection)
        {
            FoxyApp.Model.selection.wInstanceID = command.wInstanceID;

            return [ new FoxyApp.Class.Event.Model.Selection(command.wInstanceID) ];
        }
    }

    #processCommand_device(command)
    {
        if (command instanceof FoxyApp.Class.Command.Model.Device)
        {
            FoxyApp.Model.device.deviceMode = command.deviceMode;

            return [ new FoxyApp.Class.Event.Model.Device() ];
        }
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

        this.load('S', null, 'S-siteSettings');
    }

    activate(show)
    {
        super.activate(show);

        return 'Site Settings';
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
            let wInstanceID = FoxyApp.Model.selection.wInstanceID;

            // Here, wInstanceID must NOT be null, or something went terribly wrong.

            if (wInstanceID !== this.widgetInstanceID)
            {
                let parts = wInstanceID.split('-');

                this.load(parts[0], null, wInstanceID);
            }

            let panelModuleTitle = '';
            let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];
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
                let command = new FoxyApp.Class.Command.Model.Selection(null);
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

        return 'Insert Widget';
    }
}

FoxyApp.Class.View.Canvas = class extends FoxyApp.Class.UI.Component.BaseComponent
{
    #iFrameElement = null;
    #templateElement = null;

    #dragDropProcessor = null;

    #canvasNodeTree = null;
    #canvasNodeMap = {};

    #stylesheet = null;

    constructor()
    {
        super();

        FoxyApp.Manager.modelManager.addEventListener('Template', this);
        FoxyApp.Manager.modelManager.addEventListener('Selection', this);
    }

    create()
    {
        this.#iFrameElement = document.querySelector('#foxybdr-preview-iframe');

        this.#iFrameElement.contentDocument.addEventListener('readystatechange', this);

        if ([ 'interactive', 'complete' ].includes(this.#iFrameElement.contentDocument.readyState))
            this.onPreviewLoaded();
    }

    onPreviewLoaded()
    {
        this.#iFrameElement.contentDocument.removeEventListener('readystatechange', this);

        if (this.#templateElement === null)
        {
            this.#templateElement = this.#iFrameElement.contentDocument.querySelector(`.foxybdr-template.foxybdr-post-content`);
            this.registerEvent(this.#templateElement, 'click');
        }

        if (this.#dragDropProcessor === null)
        {
            this.#dragDropProcessor = new FoxyApp.Class.UI.ElementDragDrop();
            this.#dragDropProcessor.create(this.#templateElement, this.#iFrameElement.contentWindow, 8.0, '%');
            this.#dragDropProcessor.addSourceType('.foxybdr-widget-card[foxybdr-widget-name="foxybdr.layout.section"]', null, '.foxybdr-template');
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
        else if (e instanceof FoxyApp.Class.Event.Model.Selection)
        {
            this.selectWidgetInstance(e.wInstanceID);
        }
        else if (e.type === 'readystatechange' && [ 'interactive', 'complete' ].includes(e.target.readyState))
        {
            this.onPreviewLoaded();
        }
        else if (e.type === 'element-drop' && e.currentTarget === this.#dragDropProcessor)
        {
            if (e.sourceElement.classList.contains('foxybdr-widget-card'))
            {
                let wInstanceID = this.generateWidgetInstanceID();
                let widgetID = e.sourceElement.getAttribute('foxybdr-widget-name');

                let wInstanceData = {
                    id: wInstanceID,
                    widgetType: 0,
                    widgetID: widgetID,
                    sparseSettings: {}
                };

                let targetID = e.targetElement === this.#templateElement ? null : e.targetElement.closest('.foxybdr-widget').getAttribute('foxybdr-instance-id');

                let command = new FoxyApp.Class.Command.Model.Template.Insert(wInstanceData, targetID, e.insertBefore);
                FoxyApp.Manager.modelManager.submitCommand(null, command);

                command = new FoxyApp.Class.Command.Model.Selection(wInstanceID);
                FoxyApp.Manager.modelManager.submitCommand(null, command);
            }
        }
        else if (e.type === 'click' && e.button === 0 && e.currentTarget === this.#templateElement)
        {
            let widgetElement = e.target.closest('.foxybdr-widget');

            if (widgetElement !== null)
            {
                let wInstanceID = widgetElement.getAttribute('foxybdr-instance-id');
                let command = new FoxyApp.Class.Command.Model.Selection(wInstanceID === FoxyApp.Model.selection.wInstanceID ? null : wInstanceID);
                FoxyApp.Manager.modelManager.submitCommand(null, command);
            }
        }
    }

    generateWidgetInstanceID()
    {
        let templateID = FoxyApp.templateID;
        let timestamp = Date.now();
        return `T-${templateID}-${timestamp}`;
    }

    insertWidgetInstance(widgetInstance, targetID, insertBefore)
    {
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
                        let context = parentNode.isComponent() ? parentNode.generateComponentContext() : parentNode.context;
                        let canvasNode = new FoxyApp.Class.View.Canvas_Node(widgetInstance.data.id, context, this.#canvasNodeMap);
                        canvasNode.render(true);
        
                        parentNode.appendChild(canvasNode);
                    }
                }
            }
        }
        else
        {
            let targetNodes = this.#canvasNodeMap[targetID];

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
                    let context = parentNode.isComponent() ? parentNode.generateComponentContext() : parentNode.context;
                    let canvasNode = new FoxyApp.Class.View.Canvas_Node(widgetInstance.data.id, context, this.#canvasNodeMap);
                    canvasNode.render(true);

                    parentNode.insertBefore(canvasNode, insertBefore ? targetNode : targetNode.nextSibling);
                }
            }
        }

        this.#stylesheet.build();
    }

    updateWidgetInstance(wInstanceID, settingName, settingValue)
    {
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];

        switch (widgetInstance.data.widgetType)
        {
            case 0:  // widget
                {
                    let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];
                    let settingParams = widget.settings[settingName];
                    let cssChanged = settingParams.selector !== undefined || settingParams.selectors !== undefined;

                    if (!cssChanged)
                    {
                        let canvasNodes = this.#canvasNodeMap[wInstanceID];

                        for (let canvasNode of canvasNodes)
                            canvasNode.render(false);
                    }
                    else
                    {
                        this.#stylesheet.update(wInstanceID);
                    }
                }
                break;

            case 1:  // component
                break;
        }
    }

    selectWidgetInstance(wInstanceID)
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
            let nodes = this.#canvasNodeMap[wInstanceID];

            for (let node of nodes)
            {
                node.element.classList.add('foxybdr-selected');
            }
        }
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
    }
};

FoxyApp.Class.View.Canvas_Node = class extends FoxyApp.Class.ElementNode
{
    wInstanceID = '';
    context = null;
    #nodeMap = null;

    constructor(wInstanceID, context, nodeMap)
    {
        super(null, null);

        this.wInstanceID = wInstanceID;
        this.context = context;
        this.#nodeMap = nodeMap;

        if (this.#nodeMap[this.wInstanceID] === undefined)
            this.#nodeMap[this.wInstanceID] = [];

        this.#nodeMap[this.wInstanceID].push(this);
    }

    render(deep)
    {
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[this.wInstanceID];

        if (widgetInstance.data.widgetType === 1)  // 1=component
        {
            this.renderComponent(deep);
            return;
        }

        // widgetInstance.data.widgetType === 0  // 0=widget

        let widgetID = widgetInstance.data.widgetID;

        let widget = FoxyApp.Model.widgets[widgetID];

        let eSettings = FoxyApp.Class.View.Canvas_SettingsProcessor.evaluateContextualSettingsForRender(this.context, widgetInstance.data.sparseSettings, widget.settings);

        let renderFunction = FoxyRender.renderFunctions[widgetID];

        let renderStr = renderFunction(this.wInstanceID, eSettings);

        let wInstanceElement = document.createElement('div');
        wInstanceElement.classList.add('foxybdr-widget');
        wInstanceElement.setAttribute('foxybdr-widget-type', widgetID);
        wInstanceElement.setAttribute('foxybdr-instance-id', this.wInstanceID);

        if (this.element && this.element.classList.contains('foxybdr-selected'))
            wInstanceElement.classList.add('foxybdr-selected');
        
        wInstanceElement.innerHTML = `<div class="foxybdr-overlay"></div>`;

        let widgetContainerElement = document.createElement('div');
        widgetContainerElement.classList.add('foxybdr-widget-container');
        widgetContainerElement.innerHTML = renderStr;
        wInstanceElement.appendChild(widgetContainerElement);

        let childContainerElement = null;

        if (widget.container === true)
        {
            childContainerElement = widgetContainerElement.querySelector('.foxybdr-child-container');

            if (childContainerElement === null && widgetContainerElement.children.length === 0)
                childContainerElement = widgetContainerElement;
        }

        if (deep === true && widget.container === true && childContainerElement !== null)
        {
            let newChildNodes = [];

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
                    let newChildNode = new FoxyApp.Class.View.Canvas_Node(childWidgetInstance.data.id, this.context, this.#nodeMap);
                    newChildNode.render(deep);
                    newChildNodes.push(newChildNode);
                }
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

    renderComponent(deep)
    {
        //this.generateComponentContext();
    }

    hasQuery()
    {
        return false;
    }

    runQuery()
    {
        return [];
    }

    isComponent()
    {
        return false;
    }

    generateComponentContext()
    {
        return this.context;
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

    constructor()
    {
        super();
    }

    create(headElement)
    {
        this.#headElement = headElement;
    }

    build()
    {
        let widgetInstances = [];
        this.#buildWidgetInstanceList(FoxyApp.Model.widgetInstanceTree, widgetInstances);

        // What needs to be deleted from this.#stylesheet?
        for (let wInstanceID in this.#stylesheet)
        {
            let found = false;

            for (let widgetInstance of widgetInstances)
            {
                if (widgetInstance.data.id === wInstanceID)
                {
                    found = true;
                    break;
                }
            }

            if (!found)
                delete this.#stylesheet[wInstanceID];
        }

        // What needs to be added to this.#stylesheet?
        for (let widgetInstance of widgetInstances)
        {
            let wInstanceID = widgetInstance.data.id;

            if (widgetInstance.data.widgetType !== 0)
                continue;

            if (this.#stylesheet[wInstanceID] !== undefined)
                continue;

            this.#evaluateWidgetInstance(widgetInstance);
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
                let stylesheetStr = this.#buildStylesheetStr(wInstanceID);

                let styleElement = document.createElement('style');
                styleElement.setAttribute('id', `foxybdr-stylesheet-${wInstanceID}`);
                styleElement.textContent = stylesheetStr;

                this.#headElement.appendChild(styleElement);
            }
        }
    }

    update(wInstanceID)
    {
        let widgetInstance = FoxyApp.Model.widgetInstanceMap[wInstanceID];

        if (widgetInstance.data.widgetType !== 0)
            return;

        this.#evaluateWidgetInstance(widgetInstance);

        let stylesheetStr = this.#buildStylesheetStr(wInstanceID);
        let styleElement = this.#headElement.querySelector(`style[id="foxybdr-stylesheet-${wInstanceID}"]`);
        styleElement.textContent = stylesheetStr;
    }

    #buildWidgetInstanceList(node, list)
    {
        if (node instanceof FoxyApp.Class.Model.WidgetInstance)
        {
            list.push(node);

            if (node.data.widgetType === 1)  // component
            {
                // TODO: Get component, then get its widget instance tree, then recursively call this method for each widget instance in the tree.
            }
        }

        for (let childNode of node.children)
            this.#buildWidgetInstanceList(childNode, list);
    }

    #evaluateWidgetInstance(widgetInstance)
    {
        let wInstanceID = widgetInstance.data.id;

        this.#stylesheet[wInstanceID] = { desktop: {}, tablet: {}, mobile: {} };

        let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];
        let wSettings = this.#applyConditions(widgetInstance.data.sparseSettings, widget);

        let selectorVariables = {
            'WRAPPER': `[foxybdr-instance-id="${wInstanceID}"] > .foxybdr-widget-container`
        };

        this.#evaluateSettings(wInstanceID, widgetInstance.data.sparseSettings, wSettings, selectorVariables);
    }

    #evaluateSettings(wInstanceID, sparseSettings, wSettings, selectorVariables)
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

                    let currentResponsiveValue = FoxyApp.Class.View.Canvas_SettingsProcessor.evaluateValue(sparseSettings[settingName], settingParams);

                    let selectorData = [];

                    for (let selector in settingParams.selectors)
                    {
                        let eSelector = selector;
                        for (let v in selectorVariables)
                            eSelector = eSelector.replaceAll(`{{${v}}}`, selectorVariables[v]);

                        let selectorValue = settingParams.selectors[selector];

                        let variables = {};
                        let varNames = this.#extractVariableNamesFromString(selectorValue);
                        for (let varName of varNames)
                            variables[varName] = this.#getVariableValue(varName, currentResponsiveValue, sparseSettings, wSettings);

                        selectorData.push({
                            selector: eSelector,
                            selectorValue: selectorValue,
                            variables: variables
                        });
                    }

                    for (let device of [ 'desktop', 'tablet', 'mobile' ])
                    {
                        for (let sd of selectorData)
                        {
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
                                    sd.selectorValue = sd.selectorValue.replaceAll(`{{${varName}}}`, String(value));
                                }
                            }

                            if (valid)
                            {
                                if (this.#stylesheet[wInstanceID][device][sd.selector] === undefined)
                                    this.#stylesheet[wInstanceID][device][sd.selector] = {};

                                let cssProperties = this.#buildCssPropertiesFromString(sd.selectorValue);

                                for (let cssProperty in cssProperties)
                                {
                                    this.#stylesheet[wInstanceID][device][sd.selector][cssProperty] = cssProperties[cssProperty];
                                }
                            }
                        }
                    }

                    break;
            }
        }
    }

    #extractVariableNamesFromString(str)
    {
        let varNames = [];

        let i = 0;

        while (i < str.length)
        {
            let c0 = str.charAt(i + 0);
            let c1 = str.charAt(i + 1);

            if (c0 === '{' && c1 === '{')
            {
                let j = i + 2;
                let varName = '';

                while (j < str.length)
                {
                    let d0 = str.charAt(j + 0);
                    let d1 = str.charAt(j + 1);

                    if (d0 === '}' && d1 === '}')
                    {
                        j += 2;
                        break;
                    }
                    else
                    {
                        varName += d0;
                        j++;
                    }
                }

                i = j;

                if (varName.length > 0)
                    varNames.push(varName);
            }
            else
            {
                i++;
            }
        }

        return varNames;
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

            responsiveValue = FoxyApp.Class.View.Canvas_SettingsProcessor.evaluateValue(sparseSettings[settingName], wSettings[settingName]);
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

    #buildStylesheetStr(wInstanceID)
    {
        let lines = [];
        
        for (let device of [ 'desktop', 'tablet', 'mobile' ])
        {
            let deviceBody = this.#stylesheet[wInstanceID][device];

            if (Object.keys(deviceBody).length === 0)
                continue;

            switch (device)
            {
                case 'tablet':
                    lines.push(`@media(max-width:1023px){`);
                    break;

                case 'mobile':
                    lines.push(`@media(max-width:766px){`);
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

    destroy()
    {
        super.destroy();

        this.#headElement = null;
    }
};

FoxyApp.Class.View.Canvas_SettingsProcessor = class
{
    static evaluateContextualSettingsForRender(context, sparseSettings, widgetSettings)
    {
        let contextualSparseSettings = FoxyApp.Class.View.Canvas_SettingsProcessor.applyContextToSettings(context, sparseSettings);

        let eSettings = FoxyApp.Class.View.Canvas_SettingsProcessor.evaluateSettingsForRender(contextualSparseSettings, widgetSettings);

        return eSettings;
    }

    static applyContextToSettings(context, sparseSettings)
    {
        // TODO: Apply loop context and component context to sparse settings from widget instance.
        // sparseSettings must not be modified. If modification of setting values is necessary, return a new cloned copy of sparseSettings.

        return sparseSettings;
    }

    static evaluateSettingsForRender(sparseSettings, wSettings)
    {
        let eSettings = {};

        for (let settingName of Object.keys(wSettings))
        {
            let settingParams = wSettings[settingName];

            switch (settingParams.type)
            {
                case 'GROUP':
                    break;

                case 'REPEATER':
                    break;

                default:

                    let resp = FoxyApp.Class.View.Canvas_SettingsProcessor.evaluateValue(sparseSettings[settingName], settingParams);

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

    static evaluateValue(sparseValue, settingParams)
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
        if (e.type === 'click' && e.button === 0 && e.currentTarget.classList.contains('foxybdr-device-btn'))
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


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// "GLOBAL" OBJECTS AND VARIABLES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.templateID = -1;
FoxyApp.elementCache = null;

FoxyApp.UI = {};
FoxyApp.UI.panelResizer = null;
FoxyApp.UI.drawerResizer = null;

FoxyApp.Model = {};
FoxyApp.Model.widgetInstanceMap = {};  // Key: Widget instance ID. Value: Pointer to widget instance object.
FoxyApp.Model.widgetInstanceTree = null;
FoxyApp.Model.widgetCategories = null;
FoxyApp.Model.widgets = null;
FoxyApp.Model.Settings = {};
FoxyApp.Model.Settings.siteSettings = null;
FoxyApp.Model.Settings.templateSettings = null;
FoxyApp.Model.selection = {
    wInstanceID: null
};
FoxyApp.Model.device = {
    deviceMode: ''  // 'desktop', 'tablet', 'mobile'
};

FoxyApp.Manager = {};
FoxyApp.Manager.modelManager = null;
FoxyApp.Manager.panelManager = null;

FoxyApp.View = {};
FoxyApp.View.PanelModule = {};
FoxyApp.View.PanelModule.siteSettingsModule = null;
FoxyApp.View.PanelModule.propertiesModule = null;
FoxyApp.View.PanelModule.widgetsModule = null;
FoxyApp.View.canvas = null;
FoxyApp.View.device = null;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Main = class
{
    init()
    {
        FoxyControls.load();

        FoxyApp.templateID = FOXYAPP.templateID;
        FoxyApp.elementCache = new FoxyApp.Class.ElementCache();

        FoxyApp.UI.panelResizer = new FoxyApp.Class.UI.Component.PanelResizer();
        FoxyApp.UI.panelResizer.create();

        FoxyApp.UI.drawerResizer = new FoxyApp.Class.UI.Component.DrawerResizer();
        FoxyApp.UI.drawerResizer.create();

        FoxyApp.Model.widgetInstanceTree = new FoxyApp.Class.Node();

        FoxyApp.Model.widgetCategories = FOXYAPP.widgetCategories;
        FoxyApp.Model.widgets = FOXYAPP.widgets;

        FoxyApp.Model.Settings.siteSettings = new FoxyApp.Class.Model.WidgetInstance({
            id: 'S-siteSettings',
            widgetType: 0,
            widgetID: 'foxybdr.settings.site',
            sparseSettings: {}
        });
        FoxyApp.Model.Settings.templateSettings;
        FoxyApp.Model.device.deviceMode = 'desktop';

        FoxyApp.Manager.modelManager = new FoxyApp.Class.Manager.ModelManager();
        FoxyApp.Manager.panelManager = new FoxyApp.Class.Manager.PanelManager();

        FoxyApp.View.PanelModule.siteSettingsModule = new FoxyApp.Class.View.PanelModule.SiteSettingsModule();
        FoxyApp.View.PanelModule.siteSettingsModule.create();

        FoxyApp.View.PanelModule.propertiesModule = new FoxyApp.Class.View.PanelModule.PropertiesModule();
        FoxyApp.View.PanelModule.propertiesModule.create();

        FoxyApp.View.PanelModule.widgetsModule = new FoxyApp.Class.View.PanelModule.WidgetsModule();
        FoxyApp.View.PanelModule.widgetsModule.create();

        FoxyApp.View.canvas = new FoxyApp.Class.View.Canvas();
        FoxyApp.View.canvas.create();

        FoxyApp.View.device = new FoxyApp.Class.View.Device();
        FoxyApp.View.device.create();
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
