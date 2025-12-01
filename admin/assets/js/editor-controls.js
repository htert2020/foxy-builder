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

            this.controlElement.querySelector('.foxybdr-control-label').innerText = this.setting.label;

            parentElement.appendChild(this.controlElement);
        }

        handleEvent(e)
        {
            if (e.type === 'device-change')
            {
                this.deviceMode = FoxyApp.Model.device.deviceMode;

                if (this.setting.responsive)
                {
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
            case 'NUMBER': return new FoxyControls.Class.Number(name, setting, value); break;
        }
    }
};

FoxyControls.controlDefaultValues = {
    'TEXT': '',
    'NUMBER': '',
};
