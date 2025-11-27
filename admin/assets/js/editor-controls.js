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
                    let dv = this.getDisplayValue();

                    this.onDisplayValueChanged(dv.displayValue, dv.defaultValue);
                }
            }
        }

        getDisplayValue()
        {
            let displayValue = null;
            let defaultValue = null;

            if (this.setting.responsive)
            {
                if (this.value !== null)
                {
                    if (this.value[this.deviceMode] !== undefined)
                        displayValue = this.value[this.deviceMode];

                    const deviceToIndex = {
                        desktop: 0,
                        tablet:  1,
                        mobile:  2
                    };

                    const indexToDevice = [ 'desktop', 'tablet', 'mobile' ];

                    for (let i = deviceToIndex[this.deviceMode] - 1; i >= 0; i--)
                    {
                        let v = this.value[indexToDevice[i]];

                        if (v !== undefined)
                        {
                            defaultValue = v;
                            break;
                        }
                    }
                }
            }
            else
            {
                displayValue = this.value;
            }

            return {
                displayValue: displayValue,
                defaultValue: defaultValue
            };
        }

        setDisplayValue(newValue)
        {
            if (this.setting.responsive)
            {
                if (newValue !== null)
                {
                    if (this.value === null)
                        this.value = {};

                    this.value[this.deviceMode] = newValue;
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
                this.value = newValue;
            }

            this.sendEvent({
                type: 'control-change',
                name: this.name,
                value: this.value
            });
        }

        onDisplayValueChanged(displayValue, defaultValue) {}  // overridable

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

            let dv = this.getDisplayValue();

            this.onDisplayValueChanged(dv.displayValue, dv.defaultValue);
        }

        handleEvent(e)
        {
            if (e.type === 'input' && e.currentTarget === this.#textInputElement)
            {
                let newValue = this.#textInputElement.value;

                this.setDisplayValue(newValue !== '' ? newValue : null);
            }

            super.handleEvent(e);
        }

        onDisplayValueChanged(displayValue, defaultValue)
        {
            this.#textInputElement.value = String(displayValue !== null ? displayValue : '');
            this.#textInputElement.placeholder = String(defaultValue !== null ? defaultValue : '');
        }

        destroy()
        {
            super.destroy();

            if (this.#textInputElement)
                this.#textInputElement = null;
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
        }
    }
};

FoxyControls.controlDefaultValues = {
    'TEXT': ''
};
