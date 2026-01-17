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
        #beforeSeparatorElement = null;
        #afterSeparatorElement = null;
        #descriptionElement = null;

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
            if ([ 'before', 'both' ].includes(this.setting.separator))
            {
                this.#beforeSeparatorElement = document.createElement('div');
                this.#beforeSeparatorElement.classList.add('foxybdr-input-separator');
                parentElement.appendChild(this.#beforeSeparatorElement);
            }

            this.controlElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-control');
            parentElement.appendChild(this.controlElement);

            if (this.setting.description !== undefined)
            {
                this.#descriptionElement = document.createElement('div');
                this.#descriptionElement.classList.add('foxybdr-input-description');
                this.#descriptionElement.innerText = this.setting.description;
                parentElement.appendChild(this.#descriptionElement);
            }

            if ([ 'after', 'both' ].includes(this.setting.separator))
            {
                this.#afterSeparatorElement = document.createElement('div');
                this.#afterSeparatorElement.classList.add('foxybdr-input-separator');
                parentElement.appendChild(this.#afterSeparatorElement);
            }

            this.controlElement.querySelector('.foxybdr-control-label').innerText = this.setting.label !== undefined ? this.setting.label : '';

            if (this.setting.label_block === true)
                this.controlElement.classList.add('foxybdr-control-multirow');

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

        setValue(newValue)
        {
            this.value = newValue;

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        show(show)
        {
            if (show)
            {
                this.controlElement.classList.remove('foxybdr-hide');

                if (this.#beforeSeparatorElement)
                    this.#beforeSeparatorElement.classList.remove('foxybdr-hide');
                
                if (this.#afterSeparatorElement)
                    this.#afterSeparatorElement.classList.remove('foxybdr-hide');
                
                if (this.#descriptionElement)
                    this.#descriptionElement.classList.remove('foxybdr-hide');
            }
            else
            {
                this.controlElement.classList.add('foxybdr-hide');

                if (this.#beforeSeparatorElement)
                    this.#beforeSeparatorElement.classList.add('foxybdr-hide');
                
                if (this.#afterSeparatorElement)
                    this.#afterSeparatorElement.classList.add('foxybdr-hide');
                
                if (this.#descriptionElement)
                    this.#descriptionElement.classList.add('foxybdr-hide');
            }
        }

        destroy()
        {
            super.destroy();

            if (this.controlElement)
            {
                this.controlElement.remove();
                this.controlElement = null;
            }

            if (this.#beforeSeparatorElement !== null)
            {
                this.#beforeSeparatorElement.remove();
                this.#beforeSeparatorElement = null;
            }

            if (this.#afterSeparatorElement !== null)
            {
                this.#afterSeparatorElement.remove();
                this.#afterSeparatorElement = null;
            }

            if (this.#descriptionElement !== null)
            {
                this.#descriptionElement.remove();
                this.#descriptionElement = null;
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
            {
                if (this.setting.options[''] !== undefined)
                    this.#selectElement.value = '';
                else
                    this.#selectElement.selectedIndex = -1;
            }
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
                newPosPercent = Math.min(Math.max(newPosPercent, 0), 100);

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
            else if (e.type === 'click' && e.currentTarget === this.#trackElement && e.target === this.#trackElement)
            {
                let trackRect = this.#trackElement.getBoundingClientRect();
                let newPosPercent = (e.clientX - trackRect.left) / this.#trackElement.offsetWidth * 100.0;
                newPosPercent = Math.min(Math.max(newPosPercent, 0), 100);

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

            if (this.setting.prevent_empty === true)
            {
                this.#colorElement.classList.add('foxybdr-prevent-empty');
                this.#colorPicker.allowEmptyColor(false);
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
            else if (e.type === 'click' && [ this.#mainTrackElement, this.#hueTrackElement, this.#opacityTrackElement ].includes(e.currentTarget) &&
                    e.target.classList.contains('foxybdr-handle') === false)
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

    FoxyControls.Class.Font = class extends FoxyControls.Class.BaseControl
    {
        #fontElement = null;
        #fontButtonElement = null;
        #globalButtonElement = null;
        #customDropdownElement = null;
        #globalDropdownElement = null;

        #fontPicker = null;

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#fontElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-font');
            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#fontElement);

            this.#fontButtonElement = this.#fontElement.querySelector('.foxybdr-font-button');
            this.#globalButtonElement = this.#fontElement.querySelector('.foxybdr-global-button');

            this.#customDropdownElement = this.#fontButtonElement.querySelector('.foxybdr-custom-dropdown');
            this.#globalDropdownElement = this.#globalButtonElement.querySelector('.foxybdr-global-dropdown');

            this.#fontPicker = new FoxyControls.Class.FontPicker();
            this.#fontPicker.create(this.#customDropdownElement.querySelector('.foxybdr-body'));
            this.#fontPicker.addEventListener(this);

            if (this.setting.is_global === true)
            {
                this.#fontElement.classList.add('foxybdr-is-global');
            }
            else
            {
                let dropdownBodyElement = this.#globalDropdownElement.querySelector('.foxybdr-body');
                let widgetInstance = FoxyApp.Model.Settings.siteSettings;
                let widget = FoxyApp.Model.widgets[widgetInstance.data.widgetID];

                for (let i = 1; i <= 10; i++)
                {
                    let settingName = `fonts_global_${i}`;
                    let fontValue = widgetInstance.data.sparseSettings[settingName];
                    if (fontValue === undefined)
                        fontValue = widget.settings[settingName].default;

                    settingName = `fonts_name_${i}`;
                    let name = widgetInstance.data.sparseSettings[settingName];
                    if (name === undefined)
                        name = widget.settings[settingName].default;

                    let rowElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-font-global-row');
                    rowElement.setAttribute('foxybdr-id', String(i));
                    rowElement.setAttribute('foxybdr-font-group', fontValue.group);
                    rowElement.setAttribute('foxybdr-font-id', fontValue.id);
                    rowElement.setAttribute('foxybdr-font-value', fontValue.value);
                    rowElement.children[0].children[0].innerText = name;
                    rowElement.children[0].children[1].innerText = fontValue.value;
                    rowElement.children[0].children[1].style.fontFamily = fontValue.value;

                    dropdownBodyElement.appendChild(rowElement);

                    this.registerEvent(rowElement, 'click');
                }
            }

            this.registerEvent(document.body, 'click');
            this.registerEvent(this.#customDropdownElement.querySelector('.dashicons-trash'), 'click');
            this.registerEvent(this.#globalDropdownElement.querySelector('.dashicons-trash'), 'click');
            this.registerEvent(this.#globalDropdownElement.querySelector('.dashicons-admin-generic'), 'click');

            FoxyApp.googleFontLoader.registerClient(this);

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget.tagName.toLowerCase() === 'body')
            {
                let show = FoxyControls.Function.onDropdownClickEvent(e, this.#fontButtonElement, this.#customDropdownElement);

                if (show !== null)
                    this.#fontPicker.show(show);

                FoxyControls.Function.onDropdownClickEvent(e, this.#globalButtonElement, this.#globalDropdownElement);
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-input-font-global-row'))
            {
                let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-font-global-row');

                for (let i = 0; i < rowElements.length; i++)
                {
                    if (rowElements[i] === e.currentTarget)
                        rowElements[i].classList.add('foxybdr-selected');
                    else
                        rowElements[i].classList.remove('foxybdr-selected');
                }

                this.#fontPicker.setValue(null);

                this.onFontSelected();
            }
            else if (e.type === 'font-picker-change')
            {
                if (e.value !== null)
                {
                    let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-font-global-row');

                    for (let i = 0; i < rowElements.length; i++)
                        rowElements[i].classList.remove('foxybdr-selected');
                }

                this.onFontSelected();
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('dashicons-trash'))
            {
                if (this.#customDropdownElement.contains(e.currentTarget))
                {
                    this.#fontPicker.setValue(null);

                    this.onFontSelected();
                }
                else if (this.#globalDropdownElement.contains(e.currentTarget))
                {
                    let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-font-global-row');

                    for (let i = 0; i < rowElements.length; i++)
                        rowElements[i].classList.remove('foxybdr-selected');

                    this.onFontSelected();
                }
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('dashicons-admin-generic'))
            {
                FoxyApp.Function.navigateToGlobalFonts();
            }

            super.handleEvent(e);
        }

        onFontSelected()
        {
            let fontTitle;

            let value = {
                'group': '',
                'id': '',
                'value': ''
            };

            let selectedGlobalRow = this.#globalDropdownElement.querySelector('.foxybdr-input-font-global-row.foxybdr-selected');

            if (selectedGlobalRow)
            {
                fontTitle = selectedGlobalRow.getAttribute('foxybdr-font-value');

                let id = selectedGlobalRow.getAttribute('foxybdr-id');

                value = {
                    group: '.',
                    id: id,
                    value: `var(--foxybdr-global-font-${id})`
                };
            }

            let fv = this.#fontPicker.getValue();

            if (fv !== null)
            {
                fontTitle = fv.value;
                value = fv;
            }

            let fontNameElement = this.#fontButtonElement.querySelector('.foxybdr-font-name');
            if (value.value !== '')
            {
                fontNameElement.innerText = fontTitle;
                fontNameElement.style.fontFamily = fontTitle;
            }
            else
            {
                fontNameElement.innerText = 'Default';
                fontNameElement.style.fontFamily = '';
            }

            if (selectedGlobalRow)
                this.#globalButtonElement.classList.add('foxybdr-enabled');
            else
                this.#globalButtonElement.classList.remove('foxybdr-enabled');

            this.setDisplayValue(value);

            this.#loadGoogleFonts();
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            let fontNameElement = this.#fontButtonElement.querySelector('.foxybdr-font-name');

            if (displayValue.value === '')
            {
                this.#fontPicker.setValue(null);

                let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-font-global-row');
                for (let i = 0; i < rowElements.length; i++)
                    rowElements[i].classList.remove('foxybdr-selected');

                fontNameElement.innerText = 'Default';
                fontNameElement.style.fontFamily = '';

                this.#globalButtonElement.classList.remove('foxybdr-enabled');
            }
            else if (displayValue.group === '.')
            {
                this.#fontPicker.setValue(null);

                let fontTitle;
                let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-font-global-row');
                for (let i = 0; i < rowElements.length; i++)
                {
                    if (rowElements[i].getAttribute('foxybdr-id') === displayValue.id)
                    {
                        rowElements[i].classList.add('foxybdr-selected');
                        fontTitle = rowElements[i].getAttribute('foxybdr-font-value');
                    }
                    else
                    {
                        rowElements[i].classList.remove('foxybdr-selected');
                    }
                }

                fontNameElement.innerText = fontTitle;
                fontNameElement.style.fontFamily = fontTitle;

                this.#globalButtonElement.classList.add('foxybdr-enabled');
            }
            else
            {
                this.#fontPicker.setValue(displayValue);

                let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-font-global-row');
                for (let i = 0; i < rowElements.length; i++)
                    rowElements[i].classList.remove('foxybdr-selected');

                fontNameElement.innerText = displayValue.value;
                fontNameElement.style.fontFamily = displayValue.value;

                this.#globalButtonElement.classList.remove('foxybdr-enabled');
            }

            this.#loadGoogleFonts();
        }

        #loadGoogleFonts()
        {
            let fontIds = [];

            let rowElements = this.#globalDropdownElement.querySelectorAll('.foxybdr-input-font-global-row');

            for (let i = 0; i < rowElements.length; i++)
            {
                if (rowElements[i].getAttribute('foxybdr-font-group') === 'google')
                {
                    let fontId = rowElements[i].getAttribute('foxybdr-font-id');
                    fontIds.push(fontId);
                }
            }

            let fv = this.#fontPicker.getValue();

            if (fv !== null && fv.group === 'google')
                fontIds.push(fv.id);

            FoxyApp.googleFontLoader.requestFonts(this, fontIds);
        }

        destroy()
        {
            super.destroy();

            this.#fontElement = null;
            this.#fontButtonElement = null;
            this.#globalButtonElement = null;
            this.#customDropdownElement = null;
            this.#globalDropdownElement = null;

            if (this.#fontPicker)
            {
                this.#fontPicker.destroy();
                this.#fontPicker = null;
            }

            FoxyApp.googleFontLoader.unregisterClient(this);
        }
    };

    FoxyControls.Class.FontPicker = class extends FoxyApp.Class.UI.Component.BaseComponent
    {
        #value = null;

        #fontPickerElement = null;
        #searchInputElement = null;
        #fontListElement = null;

        googleFontTimeoutHandle = null;

        constructor()
        {
            super();
        }

        create(parentElement)
        {
            this.#fontPickerElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-font-picker');
            parentElement.appendChild(this.#fontPickerElement);

            this.#searchInputElement = this.#fontPickerElement.querySelector('.foxybdr-search-bar input[type="text"]');
            this.#fontListElement = this.#fontPickerElement.querySelector('.foxybdr-font-list');

            this.registerEvent(this.#searchInputElement, 'input');
            this.registerEvent(this.#fontListElement, 'scroll');

            let sortedGroups = [];
            
            for (let group in FOXYAPP.assets.fonts)
            {
                sortedGroups.push({
                    group: group,
                    order: FOXYAPP.assets.fonts[group].order
                });
            }

            sortedGroups.sort(function(a, b) {
                return a.order - b.order;
            });

            for (let sortedGroup of sortedGroups)
            {
                let group = sortedGroup.group;
                let groupInfo = FOXYAPP.assets.fonts[group];
                let groupTitle = groupInfo.title;

                let groupElement = document.createElement('div');
                groupElement.classList.add('foxybdr-font-group');
                groupElement.setAttribute('foxybdr-group', group);
                groupElement.innerText = groupTitle;
                this.#fontListElement.appendChild(groupElement);

                for (let font of groupInfo.font_list)
                {
                    let fontId;
                    let fontTitle;

                    if (typeof font === 'string')
                    {
                        fontId = font;
                        fontTitle = font;
                    }
                    else
                    {
                        fontId = String(font.id);
                        fontTitle = font.title;
                    }

                    let fontElement = document.createElement('div');
                    fontElement.classList.add('foxybdr-font-item');
                    fontElement.setAttribute('foxybdr-group', group);
                    fontElement.setAttribute('foxybdr-id', fontId);
                    fontElement.setAttribute('foxybdr-title', fontTitle);
                    fontElement.style.fontFamily = fontTitle;
                    fontElement.innerText = fontTitle;
                    this.#fontListElement.appendChild(fontElement);

                    this.registerEvent(fontElement, 'click');
                }
            }

            FoxyApp.googleFontLoader.registerClient(this);
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-font-item'))
            {
                let fontItemElements = this.#fontListElement.querySelectorAll('.foxybdr-font-item');

                for (let i = 0; i < fontItemElements.length; i++)
                {
                    if (fontItemElements[i] === e.currentTarget)
                        fontItemElements[i].classList.add('foxybdr-selected');
                    else
                        fontItemElements[i].classList.remove('foxybdr-selected');
                }

                this.#value = {
                    group: e.currentTarget.getAttribute('foxybdr-group'),
                    id: e.currentTarget.getAttribute('foxybdr-id'),
                    value: e.currentTarget.getAttribute('foxybdr-title')
                };

                this.sendEvent({
                    type: 'font-picker-change',
                    value: this.#value
                });
            }
            else if (e.type === 'input' && e.currentTarget === this.#searchInputElement)
            {
                this.#onSearchInputChanged();
            }
            else if (e.type === 'scroll' && e.currentTarget === this.#fontListElement)
            {
                if (this.googleFontTimeoutHandle !== null)
                    clearTimeout(this.googleFontTimeoutHandle);

                let _this = this;
                this.googleFontTimeoutHandle = setTimeout(function() {
                    _this.googleFontTimeoutHandle = null;
                    _this.loadGoogleFonts();
                }, 200);
            }
        }

        setValue(value)
        {
            this.#value = value !== null ? structuredClone(value) : null;

            let fontItemElements = this.#fontListElement.querySelectorAll('.foxybdr-font-item');

            for (let i = 0; i < fontItemElements.length; i++)
            {
                let group = fontItemElements[i].getAttribute('foxybdr-group');
                let id = fontItemElements[i].getAttribute('foxybdr-id');

                if (this.#value !== null && this.#value.group === group && this.#value.id === id)
                    fontItemElements[i].classList.add('foxybdr-selected');
                else
                    fontItemElements[i].classList.remove('foxybdr-selected');
            }
        }

        getValue()
        {
            return this.#value !== null ? structuredClone(this.#value) : null;
        }

        show(show)
        {
            if (show)
            {
                this.#clearSearch();
            }
        }

        #onSearchInputChanged()
        {
            let keyword = this.#searchInputElement.value.trim().toLowerCase();

            if (keyword.length === 0)
            {
                this.#clearSearch();
                return;
            }

            let fontItemElements = this.#fontListElement.querySelectorAll('.foxybdr-font-item');
            let matchingGroups = {};

            for (let i = 0; i < fontItemElements.length; i++)
            {
                let title = fontItemElements[i].getAttribute('foxybdr-title');

                if (title.toLowerCase().indexOf(keyword) >= 0)
                {
                    fontItemElements[i].classList.remove('foxybdr-hide');
                    matchingGroups[fontItemElements[i].getAttribute('foxybdr-group')] = 1;
                }
                else
                {
                    fontItemElements[i].classList.add('foxybdr-hide');
                }
            }

            let groupElements = this.#fontListElement.querySelectorAll('.foxybdr-font-group');

            for (let i = 0; i < groupElements.length; i++)
            {
                let group = groupElements[i].getAttribute('foxybdr-group');

                if (matchingGroups[group] !== undefined)
                    groupElements[i].classList.remove('foxybdr-hide');
                else
                    groupElements[i].classList.add('foxybdr-hide');
            }

            let emptyMessageElement = this.#fontPickerElement.querySelector('.foxybdr-empty-message');
            if (Object.keys(matchingGroups).length === 0)
                emptyMessageElement.classList.remove('foxybdr-hide');
            else
                emptyMessageElement.classList.add('foxybdr-hide');

            this.#scrollToSelection();
        }

        #clearSearch()
        {
            this.#searchInputElement.value = '';

            let fontItemElements = this.#fontListElement.querySelectorAll('.foxybdr-font-item');
            for (let i = 0; i < fontItemElements.length; i++)
                fontItemElements[i].classList.remove('foxybdr-hide');

            let groupElements = this.#fontListElement.querySelectorAll('.foxybdr-font-group');
            for (let i = 0; i < groupElements.length; i++)
                groupElements[i].classList.remove('foxybdr-hide');

            this.#fontPickerElement.querySelector('.foxybdr-empty-message').classList.add('foxybdr-hide');

            this.#scrollToSelection();
        }

        #scrollToSelection()
        {
            let selectedElement = this.#fontListElement.querySelector('.foxybdr-font-item.foxybdr-selected:not(.foxybdr-hide)');

            if (selectedElement !== null)
            {
                let selectedRect = selectedElement.getBoundingClientRect();
                let containerRect = this.#fontListElement.getBoundingClientRect();
                let centerY = (containerRect.top + containerRect.bottom) / 2;
                let targetY = centerY - selectedRect.height / 2;
                let scrollAmountNeeded = selectedRect.top - targetY;

                let scrollRange = this.#fontListElement.scrollHeight - this.#fontListElement.clientHeight;
                let newScrollPos = this.#fontListElement.scrollTop + scrollAmountNeeded;
                newScrollPos = Math.min(Math.max(newScrollPos, 0), scrollRange);

                this.#fontListElement.scrollTop = newScrollPos;
            }
            else
            {
                this.#fontListElement.scrollTop = 0;
            }

            this.loadGoogleFonts();
        }

        loadGoogleFonts()
        {
            let fontIds = [];

            let elements = this.#fontListElement.querySelectorAll(':not(.foxybdr-hide)');

            if (elements.length > 0)
            {
                let containerRect = this.#fontListElement.getBoundingClientRect();

                let topIndex = this.#findTopListElementIndex(elements);

                for (let i = topIndex; i < elements.length; i++)
                {
                    let childElement = elements[i];
    
                    let rect = childElement.getBoundingClientRect();
                    if (rect.top > containerRect.bottom)
                        break;
    
                    if (childElement.classList.contains('foxybdr-font-item') === false)
                        continue;
    
                    if (childElement.getAttribute('foxybdr-group') !== 'google')
                        continue;
    
                    let fontId = childElement.getAttribute('foxybdr-id');
    
                    fontIds.push(fontId);
                }
            }

            FoxyApp.googleFontLoader.requestFonts(this, fontIds);
        }

        /* Method #findTopListElementIndex. Finds the index of the child element that intersects with the top edge of this.#fontListElement.
         * Since there are about 1,500 Google fonts, there are about 1,500 child elements. For performance reasons, this function uses
         * recursion to traverse the child elements in about log[base 2](N) operations instead of linearly in N operations. */
        #findTopListElementIndex(elements, topY, startIndex, endIndex)
        {
            let childRect;

            if (topY === undefined)  // This is the starting condition.
            {
                let containerRect = this.#fontListElement.getBoundingClientRect();

                topY = containerRect.top;
                startIndex = 0;
                endIndex = elements.length - 1;

                childRect = elements[startIndex].getBoundingClientRect();
                if (topY >= childRect.top && topY <= childRect.bottom)
                    return startIndex;

                childRect = elements[endIndex].getBoundingClientRect();
                if (topY >= childRect.top && topY <= childRect.bottom)
                    return endIndex;
            }

            if (endIndex - startIndex <= 1)  // This is the terminating condition.
                return startIndex;

            let medianIndex = Math.round((startIndex + endIndex) / 2);

            childRect = elements[medianIndex].getBoundingClientRect();
            if (topY >= childRect.top && topY <= childRect.bottom)
                return medianIndex;

            if (childRect.top < topY && childRect.bottom < topY)
                return this.#findTopListElementIndex(elements, topY, medianIndex, endIndex);
            else
                return this.#findTopListElementIndex(elements, topY, startIndex, medianIndex);
        }

        destroy()
        {
            super.destroy();

            if (this.#fontPickerElement)
            {
                this.#fontPickerElement.remove();
                this.#fontPickerElement = null;
            }

            this.#searchInputElement = null;
            this.#fontListElement = null;

            FoxyApp.googleFontLoader.unregisterClient(this);
        }
    };

    FoxyControls.Class.Icons = class extends FoxyControls.Class.BaseControl
    {
        #iconsElement = null;
        #iElement = null;

        #dialog = null;

        #library = '';
        #icon = '';

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.controlElement.classList.add('foxybdr-control-multirow');

            this.#iconsElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-icons');
            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#iconsElement);

            this.#iElement = this.#iconsElement.querySelector('i');

            this.#dialog = new FoxyControls.Class.IconsDialog();
            this.#dialog.create(this.controlElement);
            this.#dialog.addEventListener(this);

            this.registerEvent(this.#iconsElement, 'click');

            let d = this.getDisplayValue();

            this.onDisplayValueChanged(d.displayValue, d.placeholderValue);
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget === this.#iconsElement)
            {
                if (e.target.classList.contains('dashicons-trash'))
                {
                    this.#library = '';
                    this.#icon = '';

                    this.#iconsElement.classList.remove('foxybdr-assigned');
                    this.#iElement.className = '';

                    this.setDisplayValue({
                        library: '',
                        value: ''
                    });
                }
                else
                {
                    this.#dialog.show(this.#library, this.#icon);
                }

            }
            else if (e.type === 'icon-change')
            {
                this.#library = e.library;
                this.#icon = e.icon;

                if (this.#library !== '' && FOXYAPP.assets.iconLibraries[this.#library] !== undefined)
                {
                    let cssPrefix = FOXYAPP.assets.iconLibraries[this.#library].css_prefix;

                    this.#iconsElement.classList.add('foxybdr-assigned');
                    this.#iElement.className = cssPrefix + this.#icon;

                    this.setDisplayValue({
                        library: this.#library,
                        value: cssPrefix + this.#icon
                    });
                }
                else
                {
                    this.#iconsElement.classList.remove('foxybdr-assigned');
                    this.#iElement.className = '';
    
                    this.setDisplayValue({
                        library: '',
                        value: ''
                    });
                }
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, placeholderValue)
        {
            if (displayValue.library === '')
            {
                this.#library = '';
                this.#icon = '';

                this.#iconsElement.classList.remove('foxybdr-assigned');
                this.#iElement.className = '';
            }
            else if (FOXYAPP.assets.iconLibraries[displayValue.library] !== undefined)
            {
                this.#library = displayValue.library;

                let cssPrefix = FOXYAPP.assets.iconLibraries[this.#library].css_prefix;

                if (displayValue.value.indexOf(cssPrefix) === 0)
                {
                    this.#icon = displayValue.value.substring(cssPrefix.length);
                }
                else
                {
                    this.#icon = displayValue.value;
                }

                this.#iconsElement.classList.add('foxybdr-assigned');
                this.#iElement.className = cssPrefix + this.#icon;
            }
        }

        destroy()
        {
            super.destroy();

            this.#iconsElement = null;
            this.#iElement = null;

            if (this.#dialog !== null)
            {
                this.#dialog.destroy();
                this.#dialog = null;
            }
        }
    };

    FoxyControls.Class.IconsDialog = class extends FoxyApp.Class.UI.Component.BaseComponent
    {
        #dialogElement = null;
        #selectElement = null;
        #searchInputElement = null;

        #selectedLibrary = '';
        #selectedIcon = '';

        constructor()
        {
            super();
        }

        create(parentElement)
        {
            this.#dialogElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-icons-dialog');
            parentElement.appendChild(this.#dialogElement);

            let containerElement = this.#dialogElement.querySelector('.foxybdr-side-panel > div');
            for (let libName in FOXYAPP.assets.iconLibraries)
            {
                let library = FOXYAPP.assets.iconLibraries[libName];

                let libraryElement = document.createElement('div');
                libraryElement.classList.add('foxybdr-library');
                libraryElement.setAttribute('foxybdr-library', libName);
                libraryElement.innerText = library.title;
                containerElement.appendChild(libraryElement);

                this.registerEvent(libraryElement, 'click');
            }

            let gridElement = this.#dialogElement.querySelector('.foxybdr-icon-list .foxybdr-grid');
            this.registerEvent(gridElement, 'click');

            this.registerEvent(this.#dialogElement.querySelector('.dashicons-no'), 'click');

            this.#selectElement = this.#dialogElement.querySelector('.foxybdr-select-button');
            this.registerEvent(this.#selectElement, 'click');

            this.#searchInputElement = this.#dialogElement.querySelector('.foxybdr-search-bar input[type="text"]');
            this.registerEvent(this.#searchInputElement, 'input');
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget.classList.contains('dashicons-no'))
            {
                this.#disappear();
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-library'))
            {
                if (e.currentTarget.classList.contains('foxybdr-selected') === false)
                    this.#selectLibrary(e.currentTarget.getAttribute('foxybdr-library'));
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-grid'))
            {
                let cardElement = e.target.closest('.foxybdr-icon-card');

                if (cardElement !== null)
                {
                    let selectedLibraryElement = this.#dialogElement.querySelector('.foxybdr-library.foxybdr-selected');

                    this.#selectedLibrary = selectedLibraryElement.getAttribute('foxybdr-library');
                    this.#selectedIcon = cardElement.getAttribute('foxybdr-name');

                    let oldSelectedCardElement = this.#dialogElement.querySelector('.foxybdr-icon-card.foxybdr-selected');
                    if (oldSelectedCardElement !== null)
                        oldSelectedCardElement.classList.remove('foxybdr-selected');

                    cardElement.classList.add('foxybdr-selected');

                    this.#updateSelectButton();
                }
            }
            else if (e.type === 'click' && e.currentTarget === this.#selectElement)
            {
                this.sendEvent({
                    type: 'icon-change',
                    library: this.#selectedLibrary,
                    icon: this.#selectedIcon
                });

                this.#disappear();
            }
            else if (e.type === 'input' && e.currentTarget === this.#searchInputElement)
            {
                this.#onSearchInputChanged();
            }
        }

        show(library, icon)
        {
            this.#dialogElement.classList.add('foxybdr-show');
            document.body.classList.add('foxybdr-showing-dialog');

            let _this = this;
            setTimeout(function() {
                _this.appear();
            }, 1);

            this.#selectedLibrary = library;
            this.#selectedIcon = icon;

            this.#selectLibrary(library);

            this.#updateSelectButton();
        }

        appear()
        {
            this.#dialogElement.classList.add('foxybdr-appear');
        }

        #disappear()
        {
            this.#dialogElement.classList.remove('foxybdr-appear');

            let _this = this;
            setTimeout(function() {
                _this.hide();
            }, 200);
        }

        hide()
        {
            this.#dialogElement.querySelector('.foxybdr-icon-list .foxybdr-grid').innerHTML = '';

            this.#dialogElement.classList.remove('foxybdr-show');
            document.body.classList.remove('foxybdr-showing-dialog');
        }

        #selectLibrary(library)
        {
            let libraryElements = this.#dialogElement.querySelectorAll('.foxybdr-library');

            for (let i = 0; i < libraryElements.length; i++)
            {
                let libraryElement = libraryElements[i];

                let libraryAttr = libraryElement.getAttribute('foxybdr-library');

                if (library === '' && i === 0)
                    library = libraryAttr;

                if (libraryAttr === library)
                    libraryElement.classList.add('foxybdr-selected');
                else
                    libraryElement.classList.remove('foxybdr-selected');
            }

            let gridElement = this.#dialogElement.querySelector('.foxybdr-icon-list .foxybdr-grid');

            gridElement.innerHTML = '';

            this.#clearSearch();

            if (FOXYAPP.assets.iconLibraries[library] === undefined)
                return;

            let icons = FOXYAPP.assets.iconLibraries[library].icons.icons;
            let prefix = FOXYAPP.assets.iconLibraries[library].css_prefix;
            let selectedCardElement = null;

            for (let icon of icons)
            {
                let title = icon.name.replaceAll('-', ' ');

                let cardElement = document.createElement('div');
                cardElement.classList.add('foxybdr-icon-card');
                if (library === this.#selectedLibrary && icon.name === this.#selectedIcon)
                {
                    cardElement.classList.add('foxybdr-selected');
                    selectedCardElement = cardElement;
                }
                cardElement.setAttribute('foxybdr-name', icon.name);
                cardElement.setAttribute('foxybdr-title', title);
                gridElement.appendChild(cardElement);

                let iElement = document.createElement('i');
                iElement.className = prefix + icon.name;
                cardElement.appendChild(iElement);

                let spanElement = document.createElement('span');
                spanElement.innerText = title;
                cardElement.appendChild(spanElement);
            }

            if (selectedCardElement !== null)
            {
                let selectedRect = selectedCardElement.getBoundingClientRect();
                let containerRect = gridElement.getBoundingClientRect();
                let centerY = (containerRect.top + containerRect.bottom) / 2;
                let targetY = centerY - selectedRect.height / 2;
                let scrollAmountNeeded = selectedRect.top - targetY;

                let scrollRange = gridElement.scrollHeight - gridElement.clientHeight;
                let newScrollPos = gridElement.scrollTop + scrollAmountNeeded;
                newScrollPos = Math.min(Math.max(newScrollPos, 0), scrollRange);

                gridElement.scrollTop = newScrollPos;
            }
            else
            {
                gridElement.scrollTop = 0;
            }
        }

        #updateSelectButton()
        {
            if (this.#selectedLibrary !== '' && this.#selectedIcon !== '')
                this.#selectElement.classList.add('foxybdr-enabled');
            else
                this.#selectElement.classList.remove('foxybdr-enabled');
        }

        #onSearchInputChanged()
        {
            let keyword = this.#searchInputElement.value.trim().toLowerCase();

            if (keyword.length === 0)
            {
                this.#clearSearch();
                return;
            }

            let cardElements = this.#dialogElement.querySelectorAll('.foxybdr-icon-card');
            let itemsFound = 0;

            for (let i = 0; i < cardElements.length; i++)
            {
                let title = cardElements[i].getAttribute('foxybdr-title');

                if (title.toLowerCase().indexOf(keyword) >= 0)
                {
                    cardElements[i].classList.remove('foxybdr-hide');
                    itemsFound++;
                }
                else
                {
                    cardElements[i].classList.add('foxybdr-hide');
                }
            }

            if (itemsFound > 0)
            {
                this.#dialogElement.querySelector('.foxybdr-icon-list').classList.remove('foxybdr-hide');
                this.#dialogElement.querySelector('.foxybdr-empty-message').classList.add('foxybdr-hide');
            }
            else
            {
                this.#dialogElement.querySelector('.foxybdr-icon-list').classList.add('foxybdr-hide');
                this.#dialogElement.querySelector('.foxybdr-empty-message').classList.remove('foxybdr-hide');
            }
        }

        #clearSearch()
        {
            this.#searchInputElement.value = '';

            let cardElements = this.#dialogElement.querySelectorAll('.foxybdr-icon-card');
            for (let i = 0; i < cardElements.length; i++)
                cardElements[i].classList.remove('foxybdr-hide');

            this.#dialogElement.querySelector('.foxybdr-icon-list').classList.remove('foxybdr-hide');
            this.#dialogElement.querySelector('.foxybdr-empty-message').classList.add('foxybdr-hide');
        }

        destroy()
        {
            super.destroy();

            if (this.#dialogElement !== null)
            {
                this.#dialogElement.remove();
                this.#dialogElement = null;
            }

            this.#selectElement = null;
            this.#searchInputElement = null;
        }
    };

    FoxyControls.Class.Group = class extends FoxyControls.Class.BaseControl
    {
        #groupElement = null;
        #groupButtonElement = null;
        #groupDropdownElement = null;

        #groupControlDef = null;
        #controls = [];

        #groupValue = {};

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#groupControlDef = FOXYAPP.groupControls[this.setting.sub_type];

            if (this.#groupControlDef.isDropdown === false)
            {
                this.controlElement.classList.add('foxybdr-control-multirow');
                this.controlElement.classList.add('foxybdr-control-hide-prompt');
            }

            let title = this.setting.label !== undefined ? this.setting.label : this.#groupControlDef.title;
            this.controlElement.querySelector('.foxybdr-control-label').innerText = title;

            let cloneID = this.#groupControlDef.isDropdown === true ? 'foxybdr-tmpl-input-group-with-dropdown' : 'foxybdr-tmpl-input-group-inline';
            this.#groupElement = FoxyApp.elementCache.cloneElement(cloneID);
            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#groupElement);

            this.#groupValue = structuredClone(this.getDisplayValue().displayValue);

            let controlWrapperElement;

            if (this.#groupControlDef.isDropdown)
            {
                controlWrapperElement = this.#groupElement.querySelector('.foxybdr-control-wrapper');

                this.#groupButtonElement = this.#groupElement.querySelector('.foxybdr-group-button');
                this.#groupDropdownElement = this.#groupElement.querySelector('.foxybdr-group-dropdown');

                this.#groupDropdownElement.querySelector('.foxybdr-title').innerText = title;

                if (Object.keys(this.#groupValue).length > 0)
                    this.#groupButtonElement.classList.add('foxybdr-enabled');
                else
                    this.#groupButtonElement.classList.remove('foxybdr-enabled');

                this.registerEvent(document.body, 'click');
                this.registerEvent(this.#groupDropdownElement.querySelector('.dashicons-trash'), 'click');
            }
            else
            {
                controlWrapperElement = this.#groupElement;
            }

            for (let settingName of this.#groupControlDef.orderedSettings)
            {
                let settingParams = this.#groupControlDef.settings[settingName];

                let value = this.#groupValue[settingName] !== undefined ? this.#groupValue[settingName] : null;

                let control = FoxyControls.Class.Factory.create(settingParams.type, settingName, settingParams, value);
                control.create(controlWrapperElement);
                control.addEventListener(this);
                this.#controls.push(control);
            }

            this.#disableConditionalSettings();
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget.tagName.toLowerCase() === 'body')
            {
                FoxyControls.Function.onDropdownClickEvent(e, this.#groupButtonElement, this.#groupDropdownElement);
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('dashicons-trash'))
            {
                this.#groupValue = {};

                for (let control of this.#controls)
                    control.setValue(null);

                this.onGroupValueChanged();
            }
            else if (e.type === 'control-change')  // A sub-control has changed value.
            {
                if (e.value !== null)
                {
                    this.#groupValue[e.name] = e.value;
                }
                else if (this.#groupValue[e.name] !== undefined)
                {
                    delete this.#groupValue[e.name];
                }

                this.onGroupValueChanged();
            }
            else if (e.type === 'control-device-change')  // A sub-control has initiated a device mode change.
            {
                this.sendEvent(e);
            }
            else if (e.type === 'device-change')
            {
                for (let control of this.#controls)
                    control.handleEvent(e);
            }

            super.handleEvent(e);
        }

        onGroupValueChanged()
        {
            if (this.#groupControlDef.isDropdown)
            {
                if (Object.keys(this.#groupValue).length > 0)
                    this.#groupButtonElement.classList.add('foxybdr-enabled');
                else
                    this.#groupButtonElement.classList.remove('foxybdr-enabled');
            }

            this.setDisplayValue(structuredClone(this.#groupValue));

            this.#disableConditionalSettings();
        }

        #disableConditionalSettings()
        {
            for (let control of this.#controls)
            {
                let settingName = control.name;
                let settingParams = this.#groupControlDef.settings[settingName];
                let show = true;

                if (settingParams.condition !== undefined)
                {
                    show = FoxyApp.Function.evaluateCondition(settingParams.condition, this.#groupValue, this.#groupControlDef.settings);
                }

                control.show(show);
            }
        }

        destroy()
        {
            super.destroy();

            this.#groupElement = null;
            this.#groupButtonElement = null;
            this.#groupDropdownElement = null;
    
            for (let control of this.#controls)
                control.destroy();

            this.#controls = [];
        }
    };

    FoxyControls.Class.Repeater = class extends FoxyControls.Class.BaseControl
    {
        #repeaterElement = null;
        #itemContainerElement = null;

        #dragDropProcessor = null;

        #repeaterControlDef = null;

        #repeaterValue = [];

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#repeaterControlDef = this.setting.fields;

            this.controlElement.classList.add('foxybdr-control-multirow');

            this.#repeaterElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-repeater');
            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#repeaterElement);

            this.#itemContainerElement = this.#repeaterElement.querySelector('.foxybdr-item-container');

            this.#repeaterValue = structuredClone(this.getDisplayValue().displayValue);

            for (let item of this.#repeaterValue)
            {
                let itemElement = this.#createItemElement(item);

                this.#itemContainerElement.appendChild(itemElement);
            }

            this.#updateDeleteDisabled();

            let addButtonElement = this.#repeaterElement.querySelector('.foxybdr-input-repeater > .foxybdr-add-button');
            this.registerEvent(addButtonElement, 'click');

            this.#dragDropProcessor = new FoxyApp.Class.UI.ElementDragDrop();
            this.#dragDropProcessor.create(this.#itemContainerElement, this.controlElement.closest('.foxybdr-settings-module > .foxybdr-tab-body'), 8.0, '%');
            this.#dragDropProcessor.addSourceType('.foxybdr-label', null, null);
            this.#dragDropProcessor.addEventListener(this);
        }

        handleEvent(e)
        {
            if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-label'))
            {
                e.currentTarget.closest('.foxybdr-input-repeater-item').classList.toggle('foxybdr-expand');
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-duplicate-button'))
            {
                let itemElement = e.currentTarget.closest('.foxybdr-input-repeater-item');

                let index;
                for (let i = 0; i < this.#itemContainerElement.children.length; i++)
                {
                    if (this.#itemContainerElement.children[i] === itemElement)
                    {
                        index = i;
                        break;
                    }
                }

                let newItem = structuredClone(this.#repeaterValue[index]);
                let newItemElement = this.#createItemElement(newItem);

                if (index < this.#repeaterValue.length - 1)
                {
                    this.#repeaterValue.splice(index + 1, 0, newItem);
                    this.#itemContainerElement.insertBefore(newItemElement, itemElement.nextSibling);
                }
                else
                {
                    this.#repeaterValue.push(newItem);
                    this.#itemContainerElement.appendChild(newItemElement);
                }

                this.#updateDeleteDisabled();

                this.setDisplayValue(structuredClone(this.#repeaterValue));
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-delete-button'))
            {
                let itemElement = e.currentTarget.closest('.foxybdr-input-repeater-item');

                for (let i = 0; i < this.#itemContainerElement.children.length; i++)
                {
                    if (this.#itemContainerElement.children[i] === itemElement)
                    {
                        this.#repeaterValue.splice(i, 1);
                        this.#destroyItemElement(itemElement);
                        itemElement.remove();
                        break;
                    }
                }

                this.#updateDeleteDisabled();

                this.setDisplayValue(structuredClone(this.#repeaterValue));
            }
            else if (e.type === 'click' && e.currentTarget.classList.contains('foxybdr-add-button'))
            {
                let newItem = {};
                this.#repeaterValue.push(newItem);

                let itemElement = this.#createItemElement(newItem);
                this.#itemContainerElement.appendChild(itemElement);

                this.#updateDeleteDisabled();

                this.setDisplayValue(structuredClone(this.#repeaterValue));
            }
            else if (e.type === 'repeater-item-change')
            {
                let index;

                for (let i = 0; i < this.#itemContainerElement.children.length; i++)
                {
                    if (this.#itemContainerElement.children[i].foxybdrRepeaterItem === e.repeaterItem)
                    {
                        index = i;
                        break;
                    }
                }

                if (e.value !== null)
                    this.#repeaterValue[index][e.name] = e.value;
                else
                    delete this.#repeaterValue[index][e.name];

                this.#updateLabel(this.#itemContainerElement.children[index], this.#repeaterValue[index]);

                this.setDisplayValue(structuredClone(this.#repeaterValue));
            }
            else if (e.type === 'element-drop' && e.currentTarget === this.#dragDropProcessor)
            {
                if (e.sourceElement.classList.contains('foxybdr-label') && this.#repeaterElement.contains(e.sourceElement))
                {
                    let sourceElement = e.sourceElement.closest('.foxybdr-input-repeater-item');

                    let sourceIndex;
                    let targetIndex;

                    for (let i = 0; i < this.#itemContainerElement.children.length; i++)
                    {
                        if (this.#itemContainerElement.children[i] === sourceElement)
                        {
                            sourceIndex = i;
                        }

                        if (this.#itemContainerElement.children[i] === e.targetElement)
                        {
                            targetIndex = i;
                        }
                    }

                    if (sourceIndex !== targetIndex)
                    {
                        let sourceItem = this.#repeaterValue[sourceIndex];

                        let newRepeaterValue = [];
                        for (let i = 0; i < this.#repeaterValue.length; i++)
                        {
                            if (i === sourceIndex)
                                continue;

                            if (i === targetIndex && e.insertBefore === true)
                                newRepeaterValue.push(sourceItem);

                            newRepeaterValue.push(this.#repeaterValue[i]);

                            if (i === targetIndex && e.insertBefore === false)
                                newRepeaterValue.push(sourceItem);
                        }

                        this.#repeaterValue = newRepeaterValue;

                        this.#itemContainerElement.insertBefore(sourceElement, e.insertBefore === true ? e.targetElement : e.targetElement.nextSibling);

                        this.setDisplayValue(structuredClone(this.#repeaterValue));
                    }
                }
            }
            else if (e.type === 'device-change')
            {
                for (let i = 0; i < this.#itemContainerElement.children.length; i++)
                    this.#itemContainerElement.children[i].foxybdrRepeaterItem.handleEvent(e);
            }
            else if (e.type === 'control-device-change')
            {
                this.sendEvent(e);
            }

            super.handleEvent(e);
        }

        #createItemElement(item)
        {
            let itemElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-repeater-item');
            let bodyElement = itemElement.querySelector('.foxybdr-body');

            this.#updateLabel(itemElement, item);

            let repeaterItem = new FoxyControls.Class.RepeaterItem(item, this.#repeaterControlDef);
            repeaterItem.create(bodyElement);
            repeaterItem.addEventListener(this);

            itemElement.foxybdrRepeaterItem = repeaterItem;

            let labelElement = itemElement.querySelector('.foxybdr-input-repeater-item > .foxybdr-header > .foxybdr-label');
            this.registerEvent(labelElement, 'click');

            let duplicateButtonElement = itemElement.querySelector('.foxybdr-input-repeater-item > .foxybdr-header > .foxybdr-duplicate-button');
            this.registerEvent(duplicateButtonElement, 'click');

            let deleteButtonElement = itemElement.querySelector('.foxybdr-input-repeater-item > .foxybdr-header > .foxybdr-delete-button');
            this.registerEvent(deleteButtonElement, 'click');

            return itemElement;
        }

        #destroyItemElement(itemElement)
        {
            itemElement.foxybdrRepeaterItem.destroy();
            delete itemElement.foxybdrRepeaterItem;

            let labelElement = itemElement.querySelector('.foxybdr-input-repeater-item > .foxybdr-header > .foxybdr-label');
            this.unregisterEvent(labelElement, 'click');

            let duplicateButtonElement = itemElement.querySelector('.foxybdr-input-repeater-item > .foxybdr-header > .foxybdr-duplicate-button');
            this.unregisterEvent(duplicateButtonElement, 'click');

            let deleteButtonElement = itemElement.querySelector('.foxybdr-input-repeater-item > .foxybdr-header > .foxybdr-delete-button');
            this.unregisterEvent(deleteButtonElement, 'click');
        }

        #updateLabel(itemElement, item)
        {
            let label = 'Item';

            let titleField = this.setting.title_field;

            if (titleField !== undefined && typeof titleField === 'string')
            {
                if (titleField[0] === '"')
                {
                    label = titleField.replaceAll('"', '');
                }
                else if (this.#repeaterControlDef.settings[titleField] !== undefined)
                {
                    let respValue = FoxyApp.Function.evaluateValue(item[titleField], this.#repeaterControlDef.settings[titleField]);

                    if (typeof respValue.desktop === 'string' || typeof respValue.desktop === 'number')
                        label = String(respValue.desktop);
                    else if (respValue.desktop.value !== undefined)
                        label = String(respValue.desktop.value);
                }
            }

            itemElement.querySelector('.foxybdr-input-repeater-item > .foxybdr-header > .foxybdr-label > span').innerText = label;
        }

        #updateDeleteDisabled()
        {
            if (this.setting.prevent_empty !== true)
                return;

            if (this.#repeaterValue.length === 1)
                this.#repeaterElement.classList.add('foxybdr-delete-disabled');
            else
                this.#repeaterElement.classList.remove('foxybdr-delete-disabled');
        }

        destroy()
        {
            super.destroy();

            for (let i = 0; i < this.#itemContainerElement.children.length; i++)
            {
                let itemElement = this.#itemContainerElement.children[i];

                this.#destroyItemElement(itemElement);
            }

            this.#repeaterElement = null;
            this.#itemContainerElement = null;

            if (this.#dragDropProcessor !== null)
            {
                this.#dragDropProcessor.destroy();
                this.#dragDropProcessor = null;
            }
        }
    };

    FoxyControls.Class.RepeaterItem = class extends FoxyApp.Class.UI.Component.BaseComponent
    {
        #item = null;

        #repeaterControlDef = null;

        #controls = [];

        constructor(item, repeaterControlDef)
        {
            super();

            this.#item = structuredClone(item);
            this.#repeaterControlDef = repeaterControlDef;
        }

        create(parentElement)
        {
            for (let settingName of this.#repeaterControlDef.orderedSettings)
            {
                let settingParams = this.#repeaterControlDef.settings[settingName];

                let value = this.#item[settingName] !== undefined ? this.#item[settingName] : null;

                let control = FoxyControls.Class.Factory.create(settingParams.type, settingName, settingParams, value);
                control.create(parentElement);
                control.addEventListener(this);
                this.#controls.push(control);
            }

            this.#disableConditionalSettings();
        }

        handleEvent(e)
        {
            if (e.type === 'control-change')
            {
                if (e.value !== null)
                    this.#item[e.name] = e.value;
                else
                    delete this.#item[e.name];

                this.sendEvent({
                    type: 'repeater-item-change',
                    repeaterItem: this,
                    name: e.name,
                    value: e.value
                });

                this.#disableConditionalSettings();
            }
            else if (e.type === 'device-change')
            {
                for (let control of this.#controls)
                    control.handleEvent(e);
            }
            else if (e.type === 'control-device-change')
            {
                this.sendEvent(e);
            }
        }

        #disableConditionalSettings()
        {
            for (let control of this.#controls)
            {
                let settingName = control.name;
                let settingParams = this.#repeaterControlDef.settings[settingName];
                let show = true;

                if (settingParams.condition !== undefined)
                {
                    show = FoxyApp.Function.evaluateCondition(settingParams.condition, this.#item, this.#repeaterControlDef.settings);
                }

                control.show(show);
            }
        }

        destroy()
        {
            super.destroy();

            for (let control of this.#controls)
                control.destroy();

            this.#controls = [];
        }
    };

    FoxyControls.Class.DatalessControl = class extends FoxyApp.Class.UI.Component.BaseComponent
    {
        name = null;
        setting = null;
        value = null;

        controlElement = null;

        constructor(name, setting, value)
        {
            super();

            this.name = name;
            this.setting = setting;
            this.value = value;
        }

        create(parentElement) {}

        handleEvent(e) {}

        setValue(newValue) {}
        
        show(show)
        {
            if (this.controlElement === null)
                return;

            if (show)
                this.controlElement.classList.remove('foxybdr-hide');
            else
                this.controlElement.classList.add('foxybdr-hide');
        }

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

    FoxyControls.Class.Hidden = class extends FoxyControls.Class.DatalessControl
    {
    };

    FoxyControls.Class.Heading = class extends FoxyControls.Class.DatalessControl
    {
        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            this.controlElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-heading');
            parentElement.appendChild(this.controlElement);

            this.controlElement.innerText = this.setting.label;
        }
    };

    FoxyControls.Class.Divider = class extends FoxyControls.Class.DatalessControl
    {
        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            this.controlElement = document.createElement('div');
            this.controlElement.classList.add('foxybdr-input-separator');
            parentElement.appendChild(this.controlElement);

            if (this.setting.margin_top_small === true)
                this.controlElement.classList.add('foxybdr-margin-top-small');
            if (this.setting.margin_bottom_small === true)
                this.controlElement.classList.add('foxybdr-margin-bottom-small');
        }
    };

    FoxyControls.Class.RawHtml = class extends FoxyControls.Class.DatalessControl
    {
        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            this.controlElement = document.createElement('div');
            parentElement.appendChild(this.controlElement);

            this.controlElement.className = this.setting.content_classes;
            this.controlElement.innerHTML = this.setting.raw;
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
            case 'FONT': return new FoxyControls.Class.Font(name, setting, value); break;
            case 'ICONS': return new FoxyControls.Class.Icons(name, setting, value); break;
            case 'GROUP': return new FoxyControls.Class.Group(name, setting, value); break;
            case 'REPEATER': return new FoxyControls.Class.Repeater(name, setting, value); break;
            case 'HIDDEN': return new FoxyControls.Class.Hidden(name, setting, value); break;
            case 'HEADING': return new FoxyControls.Class.Heading(name, setting, value); break;
            case 'DIVIDER': return new FoxyControls.Class.Divider(name, setting, value); break;
            case 'RAW_HTML': return new FoxyControls.Class.RawHtml(name, setting, value); break;
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
    },
    'FONT': {
        'group': '',
        'id': '',
        'value': ''
    },
    'ICONS': {
        'library': '',
        'value': ''
    },
    'GROUP': {},
    'REPEATER': [],
    'HIDDEN': '',
    'HEADING': '',
    'DIVIDER': '',
    'RAW_HTML': ''
};
