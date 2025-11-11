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

        controlElement = null;

        constructor(name, setting, value)
        {
            super();

            this.name = name;
            this.setting = setting;
            this.value = value;
        }

        create(parentElement)
        {
            this.controlElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-control');

            this.controlElement.querySelector('.foxybdr-control-label').innerText = this.setting.label;

            parentElement.appendChild(this.controlElement);
        }

        onChanged(newValue)
        {
            this.sendEvent({
                currentTargetType: 'control',
                type: 'change',
                name: this.name,
                value: newValue
            });
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

    FoxyControls.Class.Text = class extends FoxyControls.Class.BaseControl
    {
        #textInputElement = null;
        #oldValue = '';

        constructor(name, setting, value)
        {
            super(name, setting, value);
        }

        create(parentElement)
        {
            super.create(parentElement);

            this.#textInputElement = FoxyApp.elementCache.cloneElement('foxybdr-tmpl-input-text');

            if (this.value !== null)
                this.#textInputElement.value = String(this.value);

            this.#oldValue = this.#textInputElement.value;

            this.controlElement.querySelector('.foxybdr-control-input').appendChild(this.#textInputElement);

            this.registerEvent(this.#textInputElement, 'keydown');
            this.registerEvent(this.#textInputElement, 'keyup');
            this.registerEvent(this.#textInputElement, 'keypress');
            this.registerEvent(this.#textInputElement, 'change');
        }

        handleEvent(e)
        {
            let newValue = this.#textInputElement.value;

            if (newValue === this.#oldValue)
                return;

            this.#oldValue = newValue;

            this.onChanged(newValue !== '' ? newValue : null);
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
