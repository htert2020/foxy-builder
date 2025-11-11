var FoxyApp = {};

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
// MODEL CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.Model = {};

FoxyApp.Class.Model.Node = class
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

    destroy()
    {
        this.remove();

        for (let c of [ ...this.children ])
            c.destroy();

        this.children = [];
    }
};

FoxyApp.Class.Model.WidgetInstance = class extends FoxyApp.Class.Model.Node
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

    destroy()
    {
        super.destroy();

        delete FoxyApp.Model.widgetInstanceMap[this.data.id];
    }
}


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
        else if (e.type === 'mouseup' && this.#isDragging)
        {
            this.#isDragging = false;
        }
        else if (e.type === 'dragstart' && e.currentTarget.tagName.toLowerCase() === 'body')
        {
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
        if (e.currentTarget === this.#tabsElement && e.type === 'wheel')
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
            //console.log(`setting-change event: name=${e.name}, value=${e.value}`);
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
        if (e.currentTarget === this.#tabElement && e.type === 'click' && e.button === 0)
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
        if (e.currentTargetType !== undefined && e.currentTargetType === 'control' && e.type === 'change')
        {
            this.sendEvent({
                type: 'setting-change',
                name: e.name,
                value: e.value
            });
        }
        else if (e.currentTarget.classList.contains('foxybdr-header') && e.type === 'click' && e.button === 0)
        {
            this.sendEvent({
                type: 'section-click',
                index: this.#sectionIndex,
                show: !this.#sectionElement.classList.contains('foxybdr-active')
            });
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


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MANAGER CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Class.Manager = {};

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

        let buttonElement = document.getElementById(buttonID);
        this.#panelButtonElements.push(buttonElement);

        this.registerEvent(buttonElement, 'click');
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

    activate(show)
    {
        super.activate(show);

        return 'Site Settings';
    }

    create()
    {
        super.create();

        FoxyApp.Manager.panelManager.registerPanelModule(this, 'foxybdr-toolbar-btn-site-settings');

        this.load('S', null, 'S-siteSettings');
    }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// "GLOBAL" OBJECTS AND VARIABLES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.elementCache = null;

FoxyApp.UI = {};
FoxyApp.UI.panelResizer = null;
FoxyApp.UI.drawerResizer = null;

FoxyApp.Model = {};
FoxyApp.Model.widgetInstanceMap = {};  // Key: Widget instance ID. Value: Pointer to widget instance object.
FoxyApp.Model.widgets = null;
FoxyApp.Model.Settings = {};
FoxyApp.Model.Settings.siteSettings = null;
FoxyApp.Model.Settings.templateSettings = null;

FoxyApp.Manager = {};
FoxyApp.Manager.panelManager = null;

FoxyApp.View = {};
FoxyApp.View.PanelModule = {};
FoxyApp.View.PanelModule.siteSettingsModule = null;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN CLASS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyApp.Main = class
{
    init()
    {
        FoxyControls.load();

        FoxyApp.elementCache = new FoxyApp.Class.ElementCache();

        FoxyApp.UI.panelResizer = new FoxyApp.Class.UI.Component.PanelResizer();
        FoxyApp.UI.panelResizer.create();

        FoxyApp.UI.drawerResizer = new FoxyApp.Class.UI.Component.DrawerResizer();
        FoxyApp.UI.drawerResizer.create();

        FoxyApp.Model.widgets = FOXYAPP.widgets;

        FoxyApp.Model.Settings.siteSettings = new FoxyApp.Class.Model.WidgetInstance({
            id: 'S-siteSettings',
            widgetType: 0,
            widgetID: 'foxybdr.settings.site',
            sparseSettings: {}
        });
        FoxyApp.Model.Settings.templateSettings;

        FoxyApp.Manager.panelManager = new FoxyApp.Class.Manager.PanelManager();

        FoxyApp.View.PanelModule.siteSettingsModule = new FoxyApp.Class.View.PanelModule.SiteSettingsModule();
        FoxyApp.View.PanelModule.siteSettingsModule.create();
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
