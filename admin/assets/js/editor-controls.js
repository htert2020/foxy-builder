var FoxyControls = {};

FoxyControls.Class = {};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONTROL CLASSES
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
            if (e.type === 'click' && e.currentTarget.classList.contains('dashicons'))
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
            case 'SELECT': return new FoxyControls.Class.Select(name, setting, value); break;
            case 'CHOOSE': return new FoxyControls.Class.Choose(name, setting, value); break;
            case 'SWITCHER': return new FoxyControls.Class.Switcher(name, setting, value); break;
            case 'NUMBER': return new FoxyControls.Class.Number(name, setting, value); break;
            case 'SLIDER': return new FoxyControls.Class.Slider(name, setting, value); break;
            case 'DIMENSIONS': return new FoxyControls.Class.Dimensions(name, setting, value); break;
        }
    }
};

FoxyControls.controlDefaultValues = {
    'TEXT': '',
    'TEXTAREA': '',
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
    }
};
