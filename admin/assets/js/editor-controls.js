var FoxyControls = {};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyControls.Function = {};

/*
 * Function onDropdownClickEvent.
 * "dropdownElement" is assumed to be a descendant of "parentToggleElement" (which is typically a toggle button).
 * "dropdownElement" is typically "position: absolute; top: 100%;" with respect to "parentToggleElement".
 * The event "e" is for a "click" event listener on document.body.
 */
FoxyControls.Function.onDropdownClickEvent = function(e, parentToggleElement, dropdownElement)
{
    let show = null;

    if (parentToggleElement.contains(e.target) === true)
    {
        if (dropdownElement.contains(e.target) === false)
        {
            // parentToggleElement has been clicked, but dropdownElement has not.

            show = dropdownElement.classList.contains('foxybdr-show') === false;

            dropdownElement.classList.toggle('foxybdr-show');
        }
        else
        {
            // dropdownElement has been clicked. Do nothing.
        }
    }
    else
    {
        if (dropdownElement.classList.contains('foxybdr-show') === true)
            show = false;

        dropdownElement.classList.remove('foxybdr-show');
    }

    return show;
}

/*
 * Function convertRgbToHsl.
 * Params: "r", "g", and "b" are each [0, 255].
 * Returns: "h" is hue [0, 360], "s" is saturation [0, 1], and "l" is lightness [0, 1].
 */
FoxyControls.Function.convertRgbToHsl = function(r, g, b)
{
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min)
    {
        h = s = 0; // achromatic
    }
    else
    {
        var d = (max - min);
        s = l >= 0.5 ? d / (2 - (max + min)) : d / (max + min);
        switch(max)
        {
            case r: h = ((g - b) / d + 0) * 60; break;
            case g: h = ((b - r) / d + 2) * 60; break;
            case b: h = ((r - g) / d + 4) * 60; break;
        }
    }

    if (h < 0)
        h += 360;

    return [h, s, l];
}

/*
 * Function convertHslToRgb.
 * Params: "h", "s", and "l" are each [0, 1].
 * Returns: "r", "g", and "b" are each [0, 255].
 */
FoxyControls.Function.convertHslToRgb = function(h, s, l)
{
    function hueToRgb(p, q, t)
    {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }
    
    let r, g, b;
  
    if (s === 0)
    {
      r = g = b = l;  // achromatic
    }
    else
    {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1/3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1/3);
    }
  
    return [ Math.round(r * 255), Math.round(g * 255), Math.round(b * 255) ];
}

FoxyControls.Function.toDoubleDigitHex = function(num)
{
    let str = num.toString(16).toUpperCase();

    if (str.length < 2)
        str = '0' + str;

    return str;
}

FoxyControls.Function.parseColorHexCode = function(code)
{
    if (code.length === 0 || code[0] !== '#')
        return null;

    let red = NaN;
    let green = NaN;
    let blue = NaN;
    let alpha = 1;

    switch (code.length)
    {
        case 4:
            {
                red   = parseInt(code[1] + code[1], 16);
                green = parseInt(code[2] + code[2], 16);
                blue  = parseInt(code[3] + code[3], 16);
            }
            break;

        case 7:
            {
                red   = parseInt(code.substring(1, 3), 16);
                green = parseInt(code.substring(3, 5), 16);
                blue  = parseInt(code.substring(5, 7), 16);
            }
            break;

        case 9:
            {
                red   = parseInt(code.substring(1, 3), 16);
                green = parseInt(code.substring(3, 5), 16);
                blue  = parseInt(code.substring(5, 7), 16);
                alpha = parseInt(code.substring(7, 9), 16) / 255;
            }
            break;
    }

    if (isNaN(red) || isNaN(green) || isNaN(blue) || isNaN(alpha))
        return null;

    return {
        red: red,
        green: green,
        blue: blue,
        alpha: alpha
    };
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONTROL CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyControls.Class = {};

FoxyControls.load = function()
{

    FoxyControls.Class.BaseControl = class extends FoxyApp.Class.UI.Component.BaseComponent
    {
        name = null;
        setting = null;
        value = null;

        deviceMode = '';
        #deviceIcons = {
            desktop: 'dashicons dashicons-desktop',
            tablet: 'dashicons dashicons-tablet',
            mobile: 'dashicons dashicons-smartphone'
        };

        controlElement = null;

        constructor(name, setting, value)
        {
            super();

            this.name = name;
            this.setting = setting;
            this.value = value;

            this.deviceMode = FoxyApp.Model.device.deviceMode;
        }

        create(parentElement)
        {
            this.controlElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-control');

            parentElement.appendChild(this.controlElement);

            this.controlElement.querySelector('.foxybdr-control-label').innerText = this.setting.label;

            if (this.setting.responsive)
            {
                let responsiveButtonElement = this.controlElement.querySelector('.foxybdr-responsive-button');
                responsiveButtonElement.classList.add('foxybdr-show');

                this.controlElement.querySelector('.foxybdr-responsive-button > .dashicons').className = this.#deviceIcons[this.deviceMode];

                let iconElements = responsiveButtonElement.querySelectorAll('.foxybdr-responsive-dropdown > .dashicons');
                for (let i = 0; i < iconElements.length; i++)
                {
                    this.registerEvent(iconElements[i], 'click');
                }
            }
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget.matches('.foxybdr-responsive-dropdown > .dashicons'))
            {
                let selectedDevice;

                for (let device in this.#deviceIcons)
                {
                    if (this.#deviceIcons[device] === e.currentTarget.className)
                    {
                        selectedDevice = device;
                        break;
                    }
                }

                this.sendEvent({
                    type: 'control-device-change',
                    deviceMode: selectedDevice
                });
            }
            else if (e.type === 'device-change')
            {
                this.deviceMode = FoxyApp.Model.device.deviceMode;

                if (this.setting.responsive)
                {
                    this.controlElement.querySelector('.foxybdr-responsive-button > .dashicons').className = this.#deviceIcons[this.deviceMode];

                    let d = this.getDisplayValue();

                    this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
                }
            }
        }

        getDisplayValue()
        {
            let controlDefaultValue = FoxyControls.controlDefaultValues[this.setting.type];
            let settingDefaultValue = this.setting.default !== undefined ? this.setting.default : controlDefaultValue;

            let displayValue;
            let placeholderValue = controlDefaultValue;

            if (this.setting.placeholder !== undefined)
                placeholderValue = this.setting.placeholder;

            if (this.setting.responsive)
            {
                const devices = [ 'desktop', 'tablet', 'mobile' ];

                let dv = {};  // Holds display value of each device mode.

                for (let device of devices)
                {
                    if (this.value !== null && this.value[device] !== undefined)
                        dv[device] = this.value[device];
                    else if (device === 'desktop')
                        dv[device] = settingDefaultValue;
                    else
                        dv[device] = controlDefaultValue;
                }

                displayValue = dv[this.deviceMode];

                for (let i = devices.indexOf(this.deviceMode) - 1; i >= 0; i--)
                {
                    if (FoxyApp.Function.isValueEqual(dv[devices[i]], controlDefaultValue) === false)
                    {
                        placeholderValue = dv[devices[i]];
                        break;
                    }
                }
            }
            else
            {
                displayValue = this.value !== null ? this.value : settingDefaultValue;
            }

            return {
                displayValue: displayValue,
                placeholderValue: placeholderValue
            };
        }

        setDisplayValue(newValue)
        {
            let controlDefaultValue = FoxyControls.controlDefaultValues[this.setting.type];
            let settingDefaultValue = this.setting.default !== undefined ? this.setting.default : controlDefaultValue;

            if (this.setting.responsive)
            {
                let defaultValue = this.deviceMode === 'desktop' ? settingDefaultValue : controlDefaultValue;
                let _newValue = FoxyApp.Function.isValueEqual(newValue, defaultValue) ? null : newValue;

                if (_newValue !== null)
                {
                    if (this.value === null)
                        this.value = {};

                    this.value[this.deviceMode] = _newValue;
                }
                else
                {
                    if (this.value !== null)
                    {
                        if (this.value[this.deviceMode] !== undefined)
                            delete this.value[this.deviceMode];

                        if (Object.keys(this.value).length === 0)
                            this.value = null;
                    }
                }
            }
            else
            {
                this.value = FoxyApp.Function.isValueEqual(newValue, settingDefaultValue) ? null : newValue;
            }

            this.sendEvent({
                type: 'control-change',
                name: this.name,
                value: this.value
            });
        }

        onDisplayValueChanged(displayValue, placeholderValue) {}  // overridable

        destroy()
        {
            super.destroy();

            if (this.controlElement)
            {
                this.controlElement.remove();
                this.controlElement = null;
            }
        }
    };

    FoxyControls.Class.Text = class extends FoxyControls.Class.BaseControl
    {
        #textInputElement = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#textInputElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-text');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#textInputElement);

            this.registerEvent(this.#textInputElement, 'input');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'input' && e.currentTarget === this.#textInputElement)
            {
                let newValue = this.#textInputElement.value;

                this.setDisplayValue(newValue);
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            this.#textInputElement.value = String(displayValue);
            this.#textInputElement.placeholder = String(placeholderValue);
        }

        destroy()
        {
            super.destroy();

            if (this.#textInputElement)
                this.#textInputElement = null;
        }
    };

    FoxyControls.Class.TextArea = class extends FoxyControls.Class.BaseControl
    {
        #textAreaInputElement = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#textAreaInputElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-textarea');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#textAreaInputElement);

            this.registerEvent(this.#textAreaInputElement, 'input');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'input' && e.currentTarget === this.#textAreaInputElement)
            {
                let newValue = this.#textAreaInputElement.value;

                this.setDisplayValue(newValue);
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            this.#textAreaInputElement.value = String(displayValue);
            this.#textAreaInputElement.placeholder = String(placeholderValue);
        }

        destroy()
        {
            super.destroy();

            if (this.#textAreaInputElement)
                this.#textAreaInputElement = null;
        }
    };

    FoxyControls.Class.Wysiwyg = class extends FoxyControls.Class.BaseControl
    {
        #textAreaInputElement = null;
        #editor = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#textAreaInputElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-wysiwyg');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#textAreaInputElement);

            this.controlElement.classList.add('foxybdr-control-multirow');

            var _this = this;

            let maxHeight = window.innerHeight - 250;
            if (maxHeight < 450)
                maxHeight = 450;

            tinymce.init({
                target: this.#textAreaInputElement,
                license_key: 'gpl',
                plugins: 'lists link charmap fullscreen wpautoresize colorpicker textcolor',
                toolbar: 'formatselect bold italic underline forecolor backcolor alignleft aligncenter alignright alignjustify bullist numlist link charmap fullscreen',
                menubar: false,
                statusbar: false,
                width: '100%',
                min_height: 350,
                max_height: maxHeight,
                link_list: function(successCallback) { _this.fetchLinkList(successCallback); },
                relative_urls: false,
                remove_script_host: false,
                convert_urls: false,
                content_css: FOXYAPP.pluginUrl + 'admin/assets/css/editor-tinymce.css',
                wp_autoresize_on: true,
                autoresize_min_height: 250,
                autoresize_max_height: maxHeight,
            }).
            then((editors) => {

                _this.#editor = editors[0];

                let d = _this.getDisplayValue();
                _this.onDisplayValueChanged(d.displayValue, d.placeholderValue);

                _this.#editor.on('input cut FormatApply FormatRemove Undo Redo Change InsertCustomChar keyup',
                    function()
                    {
                        setTimeout(function() {
                            _this.onContentChanged();
                        }, 1);
                    }
                );

            });
        }

        onContentChanged()
        {
            if (this.#editor)
            {
                let newValue = this.#editor.getContent();

                this.setDisplayValue(newValue);
            }
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            if (this.#editor)
                this.#editor.setContent(displayValue);
        }

        fetchLinkList(successCallback)
        {
            FoxyBuilder.showWait(true);

            FoxyBuilder.Ajax.fetch('foxybdr_editor_get_wysiwyg_links', {
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
                    successCallback(data.links);
                }
                else
                    throw new Error('');
            })
            .catch(function(e) {
                FoxyBuilder.showNonceErrorDialog();
            })
            .finally(function() {
                FoxyBuilder.showWait(false);
            });
        }

        destroy()
        {
            super.destroy();

            this.#textAreaInputElement = null;

            if (this.#editor)
            {
                this.#editor.remove();
                this.#editor.destroy(false);
                this.#editor = null;
            }
        }
    };

    FoxyControls.Class.Select = class extends FoxyControls.Class.BaseControl
    {
        #selectElement = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#selectElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-select');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#selectElement);

            this.registerEvent(this.#selectElement, 'input');

            for (let option in this.setting.options)
            {
                let optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.innerText = this.setting.options[option];
                this.#selectElement.appendChild(optionElement);
            }

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'input' && e.currentTarget === this.#selectElement)
            {
                let newValue = this.#selectElement.selectedIndex === -1 ? '' : this.#selectElement.value;

                this.setDisplayValue(newValue);
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            if (displayValue === '')
                this.#selectElement.selectedIndex = -1;
            else
                this.#selectElement.value = String(displayValue);
        }

        destroy()
        {
            super.destroy();

            this.#selectElement = null;
        }
    };

    FoxyControls.Class.Choose = class extends FoxyControls.Class.BaseControl
    {
        #chooseElement = null;
        #buttonElements = [];

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#chooseElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-choose');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#chooseElement);

            for (let option in this.setting.options)
            {
                let buttonElement = document.createElement('div');
                buttonElement.classList.add('foxybdr-button');
                buttonElement.setAttribute('foxybdr-value', option);
                buttonElement.title = this.setting.options[option].title;
                this.#chooseElement.appendChild(buttonElement);

                let iElement = document.createElement('i');
                iElement.className = this.setting.options[option].icon;
                buttonElement.appendChild(iElement);

                this.registerEvent(buttonElement, 'click');

                this.#buttonElements.push(buttonElement);
            }

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-button'))
            {
                e.currentTarget.classList.toggle('foxybdr-selected');

                if (e.currentTarget.classList.contains('foxybdr-selected'))
                {
                    for (let buttonElement of this.#buttonElements)
                    {
                        if (buttonElement !== e.currentTarget)
                            buttonElement.classList.remove('foxybdr-selected');
                    }
                }

                let newValue = '';
                for (let buttonElement of this.#buttonElements)
                {
                    if (buttonElement.classList.contains('foxybdr-selected'))
                    {
                        newValue = buttonElement.getAttribute('foxybdr-value');
                        break;
                    }
                }

                this.setDisplayValue(newValue);
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            for (let buttonElement of this.#buttonElements)
            {
                if (buttonElement.getAttribute('foxybdr-value') === displayValue)
                    buttonElement.classList.add('foxybdr-selected');
                else
                    buttonElement.classList.remove('foxybdr-selected');
            }
        }

        destroy()
        {
            super.destroy();

            this.#chooseElement = null;
            this.#buttonElements = [];
        }
    };

    FoxyControls.Class.Switcher = class extends FoxyControls.Class.BaseControl
    {
        #switcherElement = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#switcherElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-switcher');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#switcherElement);

            this.#switcherElement.querySelector('.foxybdr-label:nth-child(1) > span').innerText = this.setting.label_on;
            this.#switcherElement.querySelector('.foxybdr-label:nth-child(2) > span').innerText = this.setting.label_off;

            this.registerEvent(this.#switcherElement, 'click');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget === this.#switcherElement)
            {
                this.#switcherElement.classList.toggle('foxybdr-selected');

                let newValue = this.#switcherElement.classList.contains('foxybdr-selected') ? 'yes' : '';

                this.setDisplayValue(newValue);
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            if (displayValue === 'yes')
                this.#switcherElement.classList.add('foxybdr-selected');
            else
                this.#switcherElement.classList.remove('foxybdr-selected');
        }

        destroy()
        {
            super.destroy();

            this.#switcherElement = null;
        }
    };

    FoxyControls.Class.Number = class extends FoxyControls.Class.BaseControl
    {
        #numberInputElement = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#numberInputElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-number');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#numberInputElement);

            this.registerEvent(this.#numberInputElement, 'input');

            if (this.setting.step !== undefined)
                this.#numberInputElement.step = String(this.setting.step);

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'input' && e.currentTarget === this.#numberInputElement)
            {
                let newValue = this.#numberInputElement.value;

                this.setDisplayValue(newValue !== '' ? Number(newValue) : '');
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            this.#numberInputElement.value = String(displayValue);
            this.#numberInputElement.placeholder = String(placeholderValue);
        }

        destroy()
        {
            super.destroy();

            if (this.#numberInputElement)
                this.#numberInputElement = null;
        }
    };

    FoxyControls.Class.Slider = class extends FoxyControls.Class.BaseControl
    {
        #sliderElement = null;
        #numberInputElement = null;
        #handleElement = null;
        #trackElement = null;
        #unitSelectElement = null;

        #isDragging = false;
        #originalState = {
            x: 0,
            handlePosPercent: 0
        };
    
        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.controlElement.classList.add('foxybdr-control-multirow');

            this.#sliderElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-slider');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#sliderElement);

            this.#numberInputElement = this.#sliderElement.querySelector('input[type="number"]');
            this.registerEvent(this.#numberInputElement, 'input');

            this.#handleElement = this.#sliderElement.querySelector('.foxybdr-handle');
            this.registerEvent(this.#handleElement, 'mousedown');
            this.registerEvent(document.body, 'mousemove');
            this.registerEvent(document.body, 'mouseup');
            this.registerEvent(document.body, 'mouseleave');
            this.registerEvent(document.body, 'dragstart');

            this.#trackElement = this.#sliderElement.querySelector('.foxybdr-track');
            this.registerEvent(this.#trackElement, 'click');

            this.#unitSelectElement = this.controlElement.querySelector('.foxybdr-unit-select');
            this.#unitSelectElement.classList.add('foxybdr-show');
            for (let unit of this.setting.size_units)
            {
                let optionElement = document.createElement('option');
                optionElement.value = unit;
                optionElement.innerText = unit;
                this.#unitSelectElement.appendChild(optionElement);
            }
            this.registerEvent(this.#unitSelectElement, 'input');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'input' && e.currentTarget === this.#numberInputElement)
            {
                this.#onNumberInputElementChanged();
            }
            else if (e.type === 'input' && e.currentTarget === this.#unitSelectElement)
            {
                this.#onUnitSelectElementChanged();
            }
            else if (e.type === 'mousedown' && e.button === 0 && !this.#isDragging && e.target === this.#handleElement)
            {
                this.#isDragging = true;
                this.#originalState.x = e.clientX;
                this.#originalState.handlePosPercent = Number(window.getComputedStyle(this.#handleElement).getPropertyValue('--foxybdr-position').replace('%', ''));

                this.#handleElement.classList.add('foxybdr-dragging');

                // Block preview iframe in order to capture mouse move events over the iframe.
                document.querySelector('#foxybdr-editor-screen').classList.add('foxybdr-drag-exclude-iframe');
            }
            else if (e.type === 'mousemove' && this.#isDragging)
            {
                let newPosPercent = this.#originalState.handlePosPercent + (e.clientX - this.#originalState.x) / this.#trackElement.offsetWidth * 100.0;

                if (newPosPercent < 0.0)
                    newPosPercent = 0.0;
                if (newPosPercent > 100.0)
                    newPosPercent = 100.0;

                if (this.#unitSelectElement.selectedIndex === -1)
                    this.#unitSelectElement.selectedIndex = 0;

                let min  = this.setting.range[this.#unitSelectElement.value].min;
                let max  = this.setting.range[this.#unitSelectElement.value].max;
                let step = this.setting.range[this.#unitSelectElement.value].step;
                if (step === undefined)
                    step = 1;

                let newNum = (max - min) * (newPosPercent / 100.0) + min;
                newNum = Math.round(newNum / step) * step;  // round to nearest step mark

                this.#numberInputElement.value = String(newNum);

                this.#onNumberInputElementChanged();
            }
            else if ((e.type === 'mouseup' || e.type === 'mouseleave') && this.#isDragging)
            {
                this.#isDragging = false;

                this.#handleElement.classList.remove('foxybdr-dragging');
    
                document.querySelector('#foxybdr-editor-screen').classList.remove('foxybdr-drag-exclude-iframe');
            }
            else if (e.type === 'dragstart' && e.currentTarget.tagName.toLowerCase() === 'body')
            {
                if (e.target.draggable === false)
                    e.preventDefault();
            }
            else if (e.type === 'click' && e.currentTarget === this.#trackElement)
            {
                let trackRect = this.#trackElement.getBoundingClientRect();
                let newPosPercent = (e.clientX - trackRect.left) / this.#trackElement.offsetWidth * 100.0;

                if (this.#unitSelectElement.selectedIndex === -1)
                    this.#unitSelectElement.selectedIndex = 0;

                let min  = this.setting.range[this.#unitSelectElement.value].min;
                let max  = this.setting.range[this.#unitSelectElement.value].max;
                let step = this.setting.range[this.#unitSelectElement.value].step;
                if (step === undefined)
                    step = 1;

                let newNum = (max - min) * (newPosPercent / 100.0) + min;
                newNum = Math.round(newNum / step) * step;  // round to nearest step mark

                this.#numberInputElement.value = String(newNum);

                this.#onNumberInputElementChanged();
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            this.#numberInputElement.value = String(displayValue.size);
            this.#numberInputElement.placeholder = String(placeholderValue.size);

            if (displayValue.unit === '')
                if (placeholderValue.unit === '')
                    this.#unitSelectElement.selectedIndex = -1;
                else
                    this.#unitSelectElement.value = placeholderValue.unit;
            else
                this.#unitSelectElement.value = displayValue.unit;

            this.#updateHandlePosition();
            this.#updateStep();
        }

        #onNumberInputElementChanged()
        {
            let newValue = this.#numberInputElement.value;

            if (newValue !== '' && this.#unitSelectElement.selectedIndex === -1)
                this.#unitSelectElement.selectedIndex = 0;  // just select something

            this.setDisplayValue({
                'unit': newValue !== '' ? this.#unitSelectElement.value : '',
                'size': newValue !== '' ? Number(newValue) : ''
            });

            this.#updateHandlePosition();
            this.#updateStep();
        }

        #onUnitSelectElementChanged()
        {
            let newValue = this.#numberInputElement.value;

            this.setDisplayValue({
                'unit': newValue !== '' ? this.#unitSelectElement.value : '',
                'size': newValue !== '' ? Number(newValue) : ''
            });

            this.#updateHandlePosition();
            this.#updateStep();
        }

        #updateHandlePosition()
        {
            let posPercent = 0.0;

            let numValue = this.#numberInputElement.value;

            if (numValue !== '' && this.#unitSelectElement.selectedIndex !== -1)
            {
                let min = this.setting.range[this.#unitSelectElement.value].min;
                let max = this.setting.range[this.#unitSelectElement.value].max;
                posPercent = (Number(numValue) - min) / (max - min) * 100.0;
            }

            if (posPercent < 0.0)
                posPercent = 0.0;
            if (posPercent > 100.0)
                posPercent = 100.0;

            this.#handleElement.style.setProperty('--foxybdr-position', String(posPercent) + '%');
        }

        #updateStep()
        {
            let unit = this.#unitSelectElement.selectedIndex === -1 ? this.setting.size_units[0] : this.#unitSelectElement.value;

            let step = this.setting.range[unit].step;

            if (step === undefined)
                step = 1;

            this.#numberInputElement.step = String(step);
        }

        destroy()
        {
            super.destroy();

            this.#sliderElement = null;
            this.#numberInputElement = null;
            this.#handleElement = null;
            this.#trackElement = null;
            this.#unitSelectElement = null;
        }
    };

    FoxyControls.Class.Dimensions = class extends FoxyControls.Class.BaseControl
    {
        #dimElement = null;
        #leftElement = null;
        #topElement = null;
        #rightElement = null;
        #bottomElement = null;
        #lockElement = null;
        #unitSelectElement = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.controlElement.classList.add('foxybdr-control-multirow');

            this.#dimElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-dimensions');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#dimElement);

            if (this.setting.sub_type !== undefined && this.setting.sub_type === 'corners')
                this.#dimElement.classList.add('foxybdr-corners');

            this.#leftElement   = this.#dimElement.querySelector('.foxybdr-left');
            this.#topElement    = this.#dimElement.querySelector('.foxybdr-top');
            this.#rightElement  = this.#dimElement.querySelector('.foxybdr-right');
            this.#bottomElement = this.#dimElement.querySelector('.foxybdr-bottom');

            this.registerEvent(this.#leftElement, 'input');
            this.registerEvent(this.#topElement, 'input');
            this.registerEvent(this.#rightElement, 'input');
            this.registerEvent(this.#bottomElement, 'input');

            this.#lockElement = this.#dimElement.querySelector('.foxybdr-lock-button');
            this.registerEvent(this.#lockElement, 'click');

            this.#unitSelectElement = this.controlElement.querySelector('.foxybdr-unit-select');
            this.#unitSelectElement.classList.add('foxybdr-show');
            for (let unit of this.setting.size_units)
            {
                let optionElement = document.createElement('option');
                optionElement.value = unit;
                optionElement.innerText = unit;
                this.#unitSelectElement.appendChild(optionElement);
            }
            this.registerEvent(this.#unitSelectElement, 'input');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'input' && e.currentTarget.tagName.toLowerCase() === 'input')
            {
                this.#enforceLockStateOnNumbers(e.currentTarget);

                this.#onNumberInputElementChanged();
            }
            else if (e.type === 'input' && e.currentTarget === this.#unitSelectElement)
            {
                this.#onNumberInputElementChanged();
            }
            else if (e.type === 'click' && e.currentTarget === this.#lockElement)
            {
                this.#lockElement.classList.toggle('foxybdr-locked');

                this.#enforceLockStateOnNumbers();

                this.#onNumberInputElementChanged();
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            this.#leftElement.value   = String(displayValue.left);
            this.#topElement.value    = String(displayValue.top);
            this.#rightElement.value  = String(displayValue.right);
            this.#bottomElement.value = String(displayValue.bottom);

            this.#leftElement.placeholder   = String(placeholderValue.left);
            this.#topElement.placeholder    = String(placeholderValue.top);
            this.#rightElement.placeholder  = String(placeholderValue.right);
            this.#bottomElement.placeholder = String(placeholderValue.bottom);

            if (displayValue.unit === '')
                if (placeholderValue.unit === '')
                    this.#unitSelectElement.selectedIndex = -1;
                else
                    this.#unitSelectElement.value = placeholderValue.unit;
            else
                this.#unitSelectElement.value = displayValue.unit;

            if (displayValue.locked)
                this.#lockElement.classList.add('foxybdr-locked');
            else
                this.#lockElement.classList.remove('foxybdr-locked');
        }

        #onNumberInputElementChanged()
        {
            let leftValue   = this.#leftElement.value;
            let topValue    = this.#topElement.value;
            let rightValue  = this.#rightElement.value;
            let bottomValue = this.#bottomElement.value;

            if (leftValue !== '' && this.#unitSelectElement.selectedIndex === -1)
                this.#unitSelectElement.selectedIndex = 0;  // just select something

            this.setDisplayValue({
                'left':   leftValue   !== '' ? Number(leftValue) : '',
                'top':    topValue    !== '' ? Number(topValue) : '',
                'right':  rightValue  !== '' ? Number(rightValue) : '',
                'bottom': bottomValue !== '' ? Number(bottomValue) : '',
                'unit': leftValue !== '' ? this.#unitSelectElement.value : '',
                'locked': this.#lockElement.classList.contains('foxybdr-locked')
            });
        }

        #enforceLockStateOnNumbers(changedNumberElement)
        {
            if (this.#lockElement.classList.contains('foxybdr-locked'))
            {
                let value = changedNumberElement !== undefined ? changedNumberElement.value : this.#leftElement.value;

                this.#leftElement.value = value;
                this.#topElement.value = value;
                this.#rightElement.value = value;
                this.#bottomElement.value = value;
            }
            else
            {
                if (this.#leftElement.value === '')
                    this.#leftElement.value = '0';

                if (this.#topElement.value === '')
                    this.#topElement.value = '0';

                if (this.#rightElement.value === '')
                    this.#rightElement.value = '0';

                if (this.#bottomElement.value === '')
                    this.#bottomElement.value = '0';
            }
        }

        destroy()
        {
            super.destroy();

            this.#dimElement = null;
            this.#leftElement = null;
            this.#topElement = null;
            this.#rightElement = null;
            this.#bottomElement = null;
            this.#lockElement = null;
            this.#unitSelectElement = null;
        }
    };

    FoxyControls.Class.Url = class extends FoxyControls.Class.BaseControl
    {
        #urlInputElement = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.controlElement.classList.add('foxybdr-control-multirow');

            this.#urlInputElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-url');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#urlInputElement);

            this.registerEvent(this.#urlInputElement, 'input');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'input' && e.currentTarget === this.#urlInputElement)
            {
                let newValue = this.#urlInputElement.value;

                this.setDisplayValue(newValue);
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            this.#urlInputElement.value = String(displayValue);
            this.#urlInputElement.placeholder = String(placeholderValue);
        }

        destroy()
        {
            super.destroy();

            if (this.#urlInputElement)
                this.#urlInputElement = null;
        }
    };

    FoxyControls.Class.Color = class extends FoxyControls.Class.BaseControl
    {
        #colorElement = null;
        #colorButtonElement = null;
        #globalButtonElement = null;
        #customDropdownElement = null;
        #globalDropdownElement = null;

        #colorPicker = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#colorElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-color');
            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#colorElement);

            this.#colorButtonElement = this.#colorElement.querySelector('.foxybdr-color-button');
            this.#globalButtonElement = this.#colorElement.querySelector('.foxybdr-global-button');

            this.#customDropdownElement = this.#colorButtonElement.querySelector('.foxybdr-custom-dropdown');
            this.#globalDropdownElement = this.#globalButtonElement.querySelector('.foxybdr-global-dropdown');

            this.#colorPicker = new FoxyControls.Class.ColorPicker();
            this.#colorPicker.create(this.#customDropdownElement.querySelector('.foxybdr-color-picker-container'));
            this.#colorPicker.addEventListener(this);

            if (this.setting.is_global === true)
            {
                this.#colorElement.classList.add('foxybdr-is-global');
                this.#colorPicker.allowEmptyColor(false);
            }
            else
            {
                let dropdownBodyElement = this.#globalDropdownElement.querySelector('.foxybdr-body');

                for (let i = 1; i <= 10; i++)
                {
                    let widgetInstance = FoxyApp.Model.Settings.siteSettings;
                    let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];

                    let settingName = `colors_global_${i}`;
                    let color = widgetInstance.data.sparseSettings[settingName];
                    if (color === undefined)
                        color = widget.settings[settingName].default;

                    settingName = `colors_name_${i}`;
                    let name = widgetInstance.data.sparseSettings[settingName];
                    if (name === undefined)
                        name = widget.settings[settingName].default;

                    let rowElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-color-global-row');
                    rowElement.setAttribute('foxybdr-id', String(i));
                    rowElement.setAttribute('foxybdr-color', color);
                    rowElement.children[0].children[0].style.backgroundColor = color;
                    rowElement.children[1].children[0].innerText = name;

                    dropdownBodyElement.appendChild(rowElement);

                    this.registerEvent(rowElement, 'click');
                }
            }

            this.registerEvent(document.body, 'click');
            this.registerEvent(this.#customDropdownElement.querySelector('.dashicons-trash'), 'click');
            this.registerEvent(this.#globalDropdownElement.querySelector('.dashicons-trash'), 'click');
            this.registerEvent(this.#globalDropdownElement.querySelector('.dashicons-admin-generic'), 'click');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget.tagName.toLowerCase() === 'body')
            {
                let show = FoxyControls.Function.onDropdownClickEvent(e, this.#colorButtonElement, this.#customDropdownElement);

                if (show !== null)
                    this.#colorPicker.show(show);

                FoxyControls.Function.onDropdownClickEvent(e, this.#globalButtonElement, this.#globalDropdownElement);
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-input-color-global-row'))
            {
                let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-color-global-row');

                for (let i = 0; i < rowElements.length; i++)
                {
                    if (rowElements[i] === e.currentTarget)
                        rowElements[i].classList.add('foxybdr-selected');
                    else
                        rowElements[i].classList.remove('foxybdr-selected');
                }

                this.#colorPicker.setColor(null);

                this.onColorSelected();
            }
            else if (e.type === 'color-picker-change')
            {
                if (e.value !== null)
                {
                    let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-color-global-row');

                    for (let i = 0; i < rowElements.length; i++)
                        rowElements[i].classList.remove('foxybdr-selected');
                }

                this.onColorSelected();
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('dashicons-trash'))
            {
                if (this.#customDropdownElement.contains(e.currentTarget))
                {
                    this.#colorPicker.setColor(null);

                    this.onColorSelected();
                }
                else if (this.#globalDropdownElement.contains(e.currentTarget))
                {
                    let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-color-global-row');

                    for (let i = 0; i < rowElements.length; i++)
                        rowElements[i].classList.remove('foxybdr-selected');

                    this.onColorSelected();
                }
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('dashicons-admin-generic'))
            {
                FoxyApp.Function.navigateToGlobalColors();
            }

            super.handleEvent(e);
        }

        onColorSelected()
        {
            let hexCode = '';  // e.g. #808080
            let color = '';  // e.g. var(--foxybdr-global-color-1) or #808080 - this is saved in widget instance settings.

            let selectedGlobalRow = this.#globalDropdownElement.querySelector('.foxybdr-input-color-global-row.foxybdr-selected');

            if (selectedGlobalRow)
            {
                hexCode = selectedGlobalRow.getAttribute('foxybdr-color');

                let id = selectedGlobalRow.getAttribute('foxybdr-id');
                color = `var(--foxybdr-global-color-${id})`;
            }

            let cv = this.#colorPicker.getColor();

            if (cv !== null)
            {
                let redHex = FoxyControls.Function.toDoubleDigitHex(cv.red);
                let greenHex = FoxyControls.Function.toDoubleDigitHex(cv.green);
                let blueHex = FoxyControls.Function.toDoubleDigitHex(cv.blue);

                hexCode = `#${redHex}${greenHex}${blueHex}`;

                if (cv.alpha !== 1)
                    hexCode += FoxyControls.Function.toDoubleDigitHex(Math.round(cv.alpha * 255));

                color = hexCode;
            }

            if (hexCode !== '')
            {
                this.#colorButtonElement.style.setProperty('--foxybdr-color', hexCode);
                this.#colorButtonElement.classList.add('foxybdr-enabled');
            }
            else
            {
                this.#colorButtonElement.classList.remove('foxybdr-enabled');
            }

            if (selectedGlobalRow)
                this.#globalButtonElement.classList.add('foxybdr-enabled');
            else
                this.#globalButtonElement.classList.remove('foxybdr-enabled');

            this.setDisplayValue(color);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            if (displayValue === '')
            {
                this.#colorPicker.setColor(null);

                let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-color-global-row');
                for (let i = 0; i < rowElements.length; i++)
                    rowElements[i].classList.remove('foxybdr-selected');

                this.#colorButtonElement.classList.remove('foxybdr-enabled');

                this.#globalButtonElement.classList.remove('foxybdr-enabled');
            }
            else if (displayValue[0] === '#')
            {
                let value = FoxyControls.Function.parseColorHexCode(displayValue);
                this.#colorPicker.setColor(value);

                let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-color-global-row');
                for (let i = 0; i < rowElements.length; i++)
                    rowElements[i].classList.remove('foxybdr-selected');

                this.#colorButtonElement.style.setProperty('--foxybdr-color', displayValue);
                this.#colorButtonElement.classList.add('foxybdr-enabled');

                this.#globalButtonElement.classList.remove('foxybdr-enabled');
            }
            else
            {
                let match = /var\(--foxybdr-global-color-(\d+)\)/.exec(displayValue);

                if (match !== null)
                {
                    this.#colorPicker.setColor(null);

                    let hexCode;
                    let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-color-global-row');
                    for (let i = 0; i < rowElements.length; i++)
                    {
                        if (rowElements[i].getAttribute('foxybdr-id') === match[1])
                        {
                            rowElements[i].classList.add('foxybdr-selected');
                            hexCode = rowElements[i].getAttribute('foxybdr-color');
                        }
                        else
                        {
                            rowElements[i].classList.remove('foxybdr-selected');
                        }
                    }

                    this.#colorButtonElement.style.setProperty('--foxybdr-color', hexCode);
                    this.#colorButtonElement.classList.add('foxybdr-enabled');
    
                    this.#globalButtonElement.classList.add('foxybdr-enabled');
                }
            }
        }

        destroy()
        {
            super.destroy();

            this.#colorElement = null;
            this.#colorButtonElement = null;
            this.#globalButtonElement = null;
            this.#customDropdownElement = null;
            this.#globalDropdownElement = null;

            if (this.#colorPicker)
            {
                this.#colorPicker.destroy();
                this.#colorPicker = null;
            }
        }
    };

    FoxyControls.Class.ColorPicker = class extends FoxyApp.Class.UI.Component.BaseComponent
    {
        #value = null;

        #colorPickerElement = null;

        #mainTrackElement = null;
        #hueTrackElement = null;
        #opacityTrackElement = null;

        #mainCanvasElement = null;
        static mainCanvasWidth = 360;
        static mainCanvasHeight = 150;

        #codeInputElement = null;
        #codeButtonsElement = null;

        #dragHandleElement = null;
        #dragState = {
            x: 0,
            y: 0,
            handlePosPercentX: 0,
            handlePosPercentY: 0
        };

        #allowEmptyColor = true;
    
        constructor()
        {
            super();
        }

        create(parentElement)
        {
            this.#colorPickerElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-color-picker');
            parentElement.appendChild(this.#colorPickerElement);

            this.#mainTrackElement = this.#colorPickerElement.querySelector('.foxybdr-main-track');
            this.#hueTrackElement = this.#colorPickerElement.querySelector('.foxybdr-hue-track');
            this.#opacityTrackElement = this.#colorPickerElement.querySelector('.foxybdr-opacity-track');

            this.#codeInputElement = this.#colorPickerElement.querySelector('.foxybdr-code-container input[type="text"]');
            this.#codeButtonsElement = this.#colorPickerElement.querySelector('.foxybdr-code-buttons');

            this.registerEvent(this.#mainTrackElement.querySelector('.foxybdr-handle'), 'mousedown');
            this.registerEvent(this.#hueTrackElement.querySelector('.foxybdr-handle'), 'mousedown');
            this.registerEvent(this.#opacityTrackElement.querySelector('.foxybdr-handle'), 'mousedown');
            this.registerEvent(document.body, 'mousemove');
            this.registerEvent(document.body, 'mouseup');
            this.registerEvent(document.body, 'mouseleave');
            this.registerEvent(document.body, 'dragstart');

            this.registerEvent(this.#mainTrackElement, 'click');
            this.registerEvent(this.#hueTrackElement, 'click');
            this.registerEvent(this.#opacityTrackElement, 'click');

            this.registerEvent(this.#codeInputElement, 'input');

            let codeButtonElements = this.#codeButtonsElement.querySelectorAll('span');
            for (let i = 0; i < codeButtonElements.length; i++)
                this.registerEvent(codeButtonElements[i], 'click');
        }

        handleEvent(e)
        {
            if (e.type === 'mousedown' && e.button === 0 && this.#dragHandleElement === null && e.target.classList.contains('foxybdr-handle'))
            {
                this.#dragHandleElement = e.target;
                this.#dragState.x = e.clientX;
                this.#dragState.y = e.clientY;
                this.#dragState.handlePosPercentX = Number(window.getComputedStyle(this.#dragHandleElement).getPropertyValue('--foxybdr-position-x').replace('%', ''));
                this.#dragState.handlePosPercentY = Number(window.getComputedStyle(this.#dragHandleElement).getPropertyValue('--foxybdr-position-y').replace('%', ''));

                // Block preview iframe in order to capture mouse move events over the iframe.
                document.querySelector('#foxybdr-editor-screen').classList.add('foxybdr-drag-exclude-iframe');
            }
            else if (e.type === 'mousemove' && this.#dragHandleElement !== null)
            {
                let newPosPercentX = this.#dragState.handlePosPercentX + (e.clientX - this.#dragState.x) / this.#dragHandleElement.parentElement.offsetWidth  * 100.0;
                let newPosPercentY = this.#dragState.handlePosPercentY + (e.clientY - this.#dragState.y) / this.#dragHandleElement.parentElement.offsetHeight * 100.0;

                newPosPercentX = Math.min(Math.max(newPosPercentX, 0), 100);
                newPosPercentY = Math.min(Math.max(newPosPercentY, 0), 100);

                this.#dragHandleElement.style.setProperty('--foxybdr-position-x', String(newPosPercentX) + '%');
                this.#dragHandleElement.style.setProperty('--foxybdr-position-y', String(newPosPercentY) + '%');

                this.#onHandleChanged(this.#dragHandleElement.parentElement);
            }
            else if ((e.type === 'mouseup' || e.type === 'mouseleave') && this.#dragHandleElement !== null)
            {
                this.#dragHandleElement = null;

                document.querySelector('#foxybdr-editor-screen').classList.remove('foxybdr-drag-exclude-iframe');
            }
            else if (e.type === 'dragstart' && e.currentTarget.tagName.toLowerCase() === 'body')
            {
                if (e.target.draggable === false)
                    e.preventDefault();
            }
            else if (e.type === 'click' && [ this.#mainTrackElement, this.#hueTrackElement, this.#opacityTrackElement ].includes(e.currentTarget))
            {
                let trackRect = e.currentTarget.getBoundingClientRect();

                let xPercent = (e.clientX - trackRect.left) / e.currentTarget.offsetWidth * 100.0;
                let yPercent = (e.clientY - trackRect.top) / e.currentTarget.offsetHeight * 100.0;

                xPercent = Math.min(Math.max(xPercent, 0), 100);
                yPercent = Math.min(Math.max(yPercent, 0), 100);

                let handleElement = e.currentTarget.querySelector('.foxybdr-handle');
                handleElement.style.setProperty('--foxybdr-position-x', String(xPercent) + '%');
                handleElement.style.setProperty('--foxybdr-position-y', String(yPercent) + '%');

                this.#onHandleChanged(e.currentTarget);
            }
            else if (e.type === 'input' && e.currentTarget === this.#codeInputElement)
            {
                this.#onCodeChanged();
            }
            else if (e.type === 'click' && e.currentTarget.matches('.foxybdr-code-buttons > span'))
            {
                let codeButtonElements = this.#codeButtonsElement.querySelectorAll('span');

                for (let i = 0; i < codeButtonElements.length; i++)
                {
                    if (codeButtonElements[i] === e.currentTarget)
                        codeButtonElements[i].classList.add('foxybdr-selected');
                    else
                        codeButtonElements[i].classList.remove('foxybdr-selected');
                }

                this.#updateCode();
            }
        }

        setColor(value)
        {
            this.#value = value;

            if (this.#mainCanvasElement !== null)
            {
                this.#updateHandles();
                this.#updateCode();
            }
        }

        getColor()
        {
            return this.#value;
        }

        allowEmptyColor(allow)
        {
            this.#allowEmptyColor = allow;
        }

        show(show)
        {
            if (show)
            {
                if (this.#mainCanvasElement === null)
                {
                    this.#mainCanvasElement = document.createElement('canvas');
                    this.#mainCanvasElement.width = FoxyControls.Class.ColorPicker.mainCanvasWidth;
                    this.#mainCanvasElement.height = FoxyControls.Class.ColorPicker.mainCanvasHeight;

                    let handleElement = this.#mainTrackElement.querySelector('.foxybdr-handle');
                    this.#mainTrackElement.insertBefore(this.#mainCanvasElement, handleElement);

                    this.#updateHandles();
                    this.#updateCode();
                }
            }
            else
            {
                if (this.#mainCanvasElement !== null)
                {
                    this.#mainCanvasElement.remove();
                    this.#mainCanvasElement = null;
                }
            }
        }

        #onHandleChanged(trackElement)
        {
            if (trackElement === this.#hueTrackElement || !trackElement)
                this.#renderMainTrack();

            let canvasElement = this.#mainTrackElement.querySelector('canvas');
            let context = canvasElement.getContext("2d");

            let handleElement = this.#mainTrackElement.querySelector('.foxybdr-handle');
            let computedStyle = window.getComputedStyle(handleElement);
            let xPercent = Number(computedStyle.getPropertyValue('--foxybdr-position-x').replace('%', ''));
            let yPercent = Number(computedStyle.getPropertyValue('--foxybdr-position-y').replace('%', ''));

            let xPixel = Math.round((canvasElement.width - 1) * xPercent / 100.0);
            let yPixel = Math.round((canvasElement.height - 1) * yPercent / 100.0);

            let imageData = context.getImageData(xPixel, yPixel, 1, 1);
            let uintArray = imageData.data;
            
            handleElement = this.#opacityTrackElement.querySelector('.foxybdr-handle');
            computedStyle = window.getComputedStyle(handleElement);
            xPercent = Number(computedStyle.getPropertyValue('--foxybdr-position-x').replace('%', ''));
            let alpha = xPercent / 100.0;

            this.#value = {
                red: uintArray[0],
                green: uintArray[1],
                blue: uintArray[2],
                alpha: alpha
            };

            this.#updateCode();

            this.sendEvent({
                type: 'color-picker-change',
                value: this.#value
            });
        }

        #onCodeChanged()
        {
            let valueChanged = false;

            let code = this.#codeInputElement.value.replace(' ', '').toLowerCase();
            let codeMode = this.#codeButtonsElement.querySelector('.foxybdr-selected').getAttribute('foxybdr-name');

            if (code === '')
            {
                if (this.#allowEmptyColor)
                {
                    this.#value = null;
                    valueChanged = true;
                }
            }
            else
            {
                switch (codeMode)
                {
                    case 'foxybdr-hexa':
                        {
                            let value = FoxyControls.Function.parseColorHexCode(code);

                            if (value !== null)
                            {
                                this.#value = value;
                                valueChanged = true;
                            }
                        }
                        break;

                    case 'foxybdr-rgba':
                        {
                            let match = /rgba\((.*),(.*),(.*),(.*)\)/.exec(code);

                            if (match !== null)
                            {
                                let red   = Number(match[1]);
                                let green = Number(match[2]);
                                let blue  = Number(match[3]);
                                let alpha = Number(match[4]);

                                if (!isNaN(red) && !isNaN(green) && !isNaN(blue) && !isNaN(alpha))
                                {
                                    this.#value = {
                                        red   : Math.round(Math.min(Math.max(red, 0), 255)),
                                        green : Math.round(Math.min(Math.max(green, 0), 255)),
                                        blue  : Math.round(Math.min(Math.max(blue, 0), 255)),
                                        alpha : Math.min(Math.max(alpha, 0), 1)
                                    };

                                    valueChanged = true;
                                }
                            }
                        }
                        break;

                    case 'foxybdr-hsla':
                        {
                            let match = /hsla\((.*),(.*)%,(.*)%,(.*)\)/.exec(code);

                            if (match !== null)
                            {
                                let hue = Number(match[1]);
                                let saturation = Number(match[2]);
                                let lightness = Number(match[3]);
                                let alpha = Number(match[4]);

                                if (!isNaN(hue) && !isNaN(saturation) && !isNaN(lightness) && !isNaN(alpha))
                                {
                                    hue = Math.min(Math.max(hue, 0), 360);
                                    saturation = Math.min(Math.max(saturation, 0), 100);
                                    lightness = Math.min(Math.max(lightness, 0), 100);
                                    alpha = Math.min(Math.max(alpha, 0), 1);

                                    let rgbArray = FoxyControls.Function.convertHslToRgb(hue / 360, saturation / 100, lightness / 100);

                                    this.#value = {
                                        red: rgbArray[0],
                                        green: rgbArray[1],
                                        blue: rgbArray[2],
                                        alpha: alpha
                                    };

                                    valueChanged = true;
                                }
                            }
                        }
                        break;
                }
            }

            if (valueChanged)
            {
                this.#updateHandles();

                this.sendEvent({
                    type: 'color-picker-change',
                    value: this.#value
                });
            }
        }

        #renderMainTrack()
        {
            let handleElement = this.#hueTrackElement.querySelector('.foxybdr-handle');
            let huePercent = Number(window.getComputedStyle(handleElement).getPropertyValue('--foxybdr-position-x').replace('%', ''));
            let hue = (huePercent / 100) * 360.0;

            let canvasElement = this.#mainCanvasElement;
            let context = canvasElement.getContext("2d");

            let hueGradient = context.createLinearGradient(canvasElement.width - 2, 1, 1, 1);
            hueGradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
            hueGradient.addColorStop(1, `hsl(${hue}, 100%, 100%)`);
            context.fillStyle = hueGradient;
            context.fillRect(0, 0, canvasElement.width, canvasElement.height);

            let darkGradient = context.createLinearGradient(1, canvasElement.height - 2, 1, 1);
            darkGradient.addColorStop(0, `hsla(0, 0%, 0%, 1)`);
            darkGradient.addColorStop(1, `hsla(0, 0%, 0%, 0)`);
            context.fillStyle = darkGradient;
            context.fillRect(0, 0, canvasElement.width, canvasElement.height);
        }

        #updateHandles()
        {
            let targetColor;

            if (this.#value !== null)
            {
                targetColor = {
                    red:   this.#value.red,
                    green: this.#value.green,
                    blue:  this.#value.blue,
                    alpha: this.#value.alpha
                };
            }
            else
            {
                targetColor = {
                    red:   0,
                    green: 0,
                    blue:  0,
                    alpha: 1
                };
            }

            let hslArray = FoxyControls.Function.convertRgbToHsl(targetColor.red, targetColor.green, targetColor.blue);
            let hue = hslArray[0];

            let handleElement = this.#opacityTrackElement.querySelector('.foxybdr-handle');
            handleElement.style.setProperty('--foxybdr-position-x', String(targetColor.alpha * 100) + '%');

            handleElement = this.#hueTrackElement.querySelector('.foxybdr-handle');
            handleElement.style.setProperty('--foxybdr-position-x', String(hue / 360.0 * 100.0) + '%');

            this.#renderMainTrack();

            let canvasElement = this.#mainTrackElement.querySelector('canvas');
            let context = canvasElement.getContext("2d");

            let imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
            let uintArray = imageData.data;

            let bestDiff = null;
            let bestX = null;
            let bestY = null;
            for (let y = 0; y < canvasElement.height; y++)
            {
                for (let x = 0; x < canvasElement.width; x++)
                {
                    let index = (y * canvasElement.width + x) * 4;

                    let red   = uintArray[index + 0];
                    let green = uintArray[index + 1];
                    let blue  = uintArray[index + 2];

                    let diff = Math.abs(red - targetColor.red) + Math.abs(green - targetColor.green) + Math.abs(blue - targetColor.blue);

                    if (bestDiff === null || diff < bestDiff)
                    {
                        bestDiff = diff;
                        bestX = x;
                        bestY = y;
                    }
                }
            }

            let xPercent = bestX / (canvasElement.width - 1) * 100.0;
            let yPercent = bestY / (canvasElement.height - 1) * 100.0;

            handleElement = this.#mainTrackElement.querySelector('.foxybdr-handle');
            handleElement.style.setProperty('--foxybdr-position-x', String(xPercent) + '%');
            handleElement.style.setProperty('--foxybdr-position-y', String(yPercent) + '%');
        }

        #updateCode()
        {
            if (this.#value === null)
            {
                this.#codeInputElement.value = '';
                return;
            }

            let code;
            let codeMode = this.#codeButtonsElement.querySelector('.foxybdr-selected').getAttribute('foxybdr-name');
            switch (codeMode)
            {
                case 'foxybdr-hexa':
                    {
                        let redHex = FoxyControls.Function.toDoubleDigitHex(this.#value.red);
                        let greenHex = FoxyControls.Function.toDoubleDigitHex(this.#value.green);
                        let blueHex = FoxyControls.Function.toDoubleDigitHex(this.#value.blue);
        
                        code = `#${redHex}${greenHex}${blueHex}`;

                        if (this.#value.alpha !== 1)
                            code += FoxyControls.Function.toDoubleDigitHex(Math.round(this.#value.alpha * 255));
                    }
                    break;

                case 'foxybdr-rgba':
                    {
                        let alpha = Math.round(this.#value.alpha * 10000) / 10000;
                        code = `rgba(${this.#value.red}, ${this.#value.green}, ${this.#value.blue}, ${alpha})`;
                    }
                    break;

                case 'foxybdr-hsla':
                    {
                        let hslArray = FoxyControls.Function.convertRgbToHsl(this.#value.red, this.#value.green, this.#value.blue);
                        let hue = Math.round(hslArray[0]);
                        let saturation = Math.round(hslArray[1] * 100);
                        let lightness = Math.round(hslArray[2] * 100);
                        let alpha = Math.round(this.#value.alpha * 10000) / 10000;
                        code = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
                    }
                    break;
            }

            this.#codeInputElement.value = code;
        }

        destroy()
        {
            super.destroy();

            if (this.#colorPickerElement)
            {
                this.#colorPickerElement.remove();
                this.#colorPickerElement = null;
            }

            this.#mainTrackElement = null;
            this.#hueTrackElement = null;
            this.#opacityTrackElement = null;

            if (this.#mainCanvasElement !== null)
            {
                this.#mainCanvasElement.remove();
                this.#mainCanvasElement = null;
            }

            this.#codeInputElement = null;
            this.#codeButtonsElement = null;

            this.#dragHandleElement = null;
        }
    };

    FoxyControls.Class.Media = class extends FoxyControls.Class.BaseControl
    {
        #mediaElement = null;

        #assetID = '';
        #assetUrl = '';

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.controlElement.classList.add('foxybdr-control-multirow');

            this.#mediaElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-media');

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#mediaElement);

            this.registerEvent(this.#mediaElement, 'click');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget === this.#mediaElement)
            {
                if (e.target.classList.contains('dashicons-trash'))
                {
                    this.#assetID = '';
                    this.#assetUrl = '';

                    this.#mediaElement.classList.remove('foxybdr-assigned');
                    this.#mediaElement.style.setProperty('--foxybdr-background-image-url', 'none');
    
                    this.setDisplayValue({
                        id: this.#assetID,
                        url: this.#assetUrl
                    });
                }
                else
                {
                    let mimeType = this.setting.media_type !== undefined ? this.setting.media_type : 'image';
                    let mimeTitle = this.setting.media_title !== undefined ? this.setting.media_title : 'Media File';

                    FoxyApp.mediaUploader.show(this, mimeType, mimeTitle, this.#assetID !== '' ? this.#assetID : null);
                }

            }
            else if (e.type === 'media-select')
            {
                this.#assetID = e.id;
                this.#assetUrl = e.url;

                this.#mediaElement.classList.add('foxybdr-assigned');
                this.#mediaElement.style.setProperty('--foxybdr-background-image-url', `url(${this.#assetUrl})`);

                this.setDisplayValue({
                    id: this.#assetID,
                    url: this.#assetUrl
                });
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            this.#assetID = displayValue.id;
            this.#assetUrl = displayValue.url;

            if (this.#assetID === '')
            {
                this.#mediaElement.classList.remove('foxybdr-assigned');
                this.#mediaElement.style.setProperty('--foxybdr-background-image-url', 'none');
            }
            else
            {
                this.#mediaElement.classList.add('foxybdr-assigned');
                this.#mediaElement.style.setProperty('--foxybdr-background-image-url', `url(${this.#assetUrl})`);
            }
        }

        destroy()
        {
            super.destroy();

            this.#mediaElement = null;
        }
    };

}  // end FoxyControls.load function


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CLASS FACTORY
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


FoxyControls.Class.Factory = class
{
    static create(controlType, name, setting, value)
    {
        switch (controlType)
        {
            case 'TEXT': return new FoxyControls.Class.Text(name, setting, value); break;
            case 'TEXTAREA': return new FoxyControls.Class.TextArea(name, setting, value); break;
            case 'WYSIWYG': return new FoxyControls.Class.Wysiwyg(name, setting, value); break;
            case 'SELECT': return new FoxyControls.Class.Select(name, setting, value); break;
            case 'CHOOSE': return new FoxyControls.Class.Choose(name, setting, value); break;
            case 'SWITCHER': return new FoxyControls.Class.Switcher(name, setting, value); break;
            case 'NUMBER': return new FoxyControls.Class.Number(name, setting, value); break;
            case 'SLIDER': return new FoxyControls.Class.Slider(name, setting, value); break;
            case 'DIMENSIONS': return new FoxyControls.Class.Dimensions(name, setting, value); break;
            case 'URL': return new FoxyControls.Class.Url(name, setting, value); break;
            case 'COLOR': return new FoxyControls.Class.Color(name, setting, value); break;
            case 'MEDIA': return new FoxyControls.Class.Media(name, setting, value); break;
        }
    }
};

FoxyControls.controlDefaultValues = {
    'TEXT': '',
    'TEXTAREA': '',
    'WYSIWYG': '',
    'SELECT': '',
    'CHOOSE': '',
    'SWITCHER': '',
    'NUMBER': '',
    'SLIDER': {
        'size': '',
        'unit': ''
    },
    'DIMENSIONS': {
        'left': '',
        'top': '',
        'right': '',
        'bottom': '',
        'unit': '',
        'locked': true
    },
    'URL': '',
    'COLOR': '',
    'MEDIA': {
        'id': '',
        'url': ''
    }
};
