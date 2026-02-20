var FoxyBuilder = {};

FoxyBuilder.BaseClasses = {};

FoxyBuilder.BaseClasses.Dialog = class {

    params = null;
    dialogElement = null;

    constructor(name, params)
    {
        this.params = params;

        const html = document.getElementById(`foxybdr-template-dialog-${name}`).text;
        let doc = document.createElement('div');
        doc.innerHTML = html;

        this.dialogElement = doc.querySelector(`.foxybdr-dialog`);
        this.dialogElement.querySelector('.foxybdr-dialog-header').innerText = this.params['title'];
        this.dialogElement.querySelector('.foxybdr-dialog-message').innerText = this.params['message'];
    }

    create()
    {
        document.body.appendChild(this.dialogElement);

        var self = this;
        setTimeout(function() {
            if (self.dialogElement !== null)
                self.dialogElement.classList.add('foxybdr-show');
        }, 1);

        return this;
    }

    destroy()
    {
        if (this.dialogElement.classList.contains('foxybdr-show'))
        {
            this.dialogElement.classList.remove('foxybdr-show');

            this.dialogElement.addEventListener('transitionend',
                function(e)
                {
                    e.currentTarget.remove();
                }
            );
        }
        else
        {
            this.dialogElement.remove();
        }

        this.params = null;
        this.dialogElement = null;
    }
};

FoxyBuilder.Dialogs = {};

FoxyBuilder.Dialogs.Alert = class extends FoxyBuilder.BaseClasses.Dialog {

    #okButtonElement = null;

    constructor(params)
    {
        super('alert', params);

        this.#okButtonElement = this.dialogElement.querySelector('.foxybdr-dialog-ok');
        this.#okButtonElement.innerText = this.params['okLabel'];
        this.#okButtonElement.addEventListener('click', this);
    }

    handleEvent(e)
    {
        if (e.currentTarget === this.#okButtonElement && e.type === 'click')
        {
            if (typeof this.params['onOK'] === 'function')
            {
                this.params['onOK']();
            }

            this.destroy();
        }
    }

    destroy()
    {
        this.#okButtonElement.removeEventListener('click', this);
        this.#okButtonElement = null;

        super.destroy();
    }
};

FoxyBuilder.Dialogs.Confirm = class extends FoxyBuilder.BaseClasses.Dialog {

    #cancelButtonElement = null;
    #confirmButtonElement = null;

    constructor(params)
    {
        super('confirm', params);

        this.#cancelButtonElement = this.dialogElement.querySelector('.foxybdr-dialog-cancel');
        this.#cancelButtonElement.innerText = this.params['cancelLabel'];
        this.#cancelButtonElement.addEventListener('click', this);

        this.#confirmButtonElement = this.dialogElement.querySelector('.foxybdr-dialog-ok');
        this.#confirmButtonElement.innerText = this.params['confirmLabel'];
        this.#confirmButtonElement.addEventListener('click', this);
    }

    handleEvent(e)
    {
        if (e.currentTarget === this.#cancelButtonElement && e.type === 'click')
        {
            if (typeof this.params['onCancel'] === 'function')
            {
                this.params['onCancel']();
            }

            this.destroy();
        }
        else if (e.currentTarget === this.#confirmButtonElement && e.type === 'click')
        {
            if (typeof this.params['onConfirm'] === 'function')
            {
                this.params['onConfirm']();
            }

            this.destroy();
        }
    }

    destroy()
    {
        this.#cancelButtonElement.removeEventListener('click', this);
        this.#cancelButtonElement = null;

        this.#confirmButtonElement.removeEventListener('click', this);
        this.#confirmButtonElement = null;

        super.destroy();
    }
};

FoxyBuilder.Dialogs.Prompt = class extends FoxyBuilder.BaseClasses.Dialog
{
    #inputElement = null;
    #cancelButtonElement = null;
    #okButtonElement = null;

    constructor(params)
    {
        super('prompt', params);

        this.#inputElement = this.dialogElement.querySelector('.foxybdr-dialog-input > input');
        this.#inputElement.value = this.params['inputValue'];
        this.#inputElement.addEventListener('input', this);

        this.#cancelButtonElement = this.dialogElement.querySelector('.foxybdr-dialog-cancel');
        this.#cancelButtonElement.innerText = this.params['cancelLabel'];
        this.#cancelButtonElement.addEventListener('click', this);

        this.#okButtonElement = this.dialogElement.querySelector('.foxybdr-dialog-ok');
        this.#okButtonElement.innerText = this.params['okLabel'];
        this.#okButtonElement.addEventListener('click', this);

        this.#updateOkButton();
    }

    create()
    {
        let retval = super.create();

        this.#inputElement.focus();
        this.#inputElement.select();

        return retval;
    }

    handleEvent(e)
    {
        if (e.currentTarget === this.#inputElement && e.type === 'input')
        {
            this.#updateOkButton();
        }
        else if (e.currentTarget === this.#cancelButtonElement && e.type === 'click' && e.button === 0)
        {
            if (typeof this.params['onCancel'] === 'function')
            {
                this.params['onCancel']();
            }

            this.destroy();
        }
        else if (e.currentTarget === this.#okButtonElement && e.type === 'click' && e.button === 0)
        {
            if (typeof this.params['onOK'] === 'function')
            {
                this.params['onOK'](this.#inputElement.value);
            }

            this.destroy();
        }
    }

    #updateOkButton()
    {
        if (this.#inputElement.value.trim().length === 0)
        {
            this.#okButtonElement.classList.add('foxybdr-disabled');
            this.#okButtonElement.disabled = true;
        }
        else
        {
            this.#okButtonElement.classList.remove('foxybdr-disabled');
            this.#okButtonElement.disabled = false;
        }
    }

    destroy()
    {
        this.#inputElement.removeEventListener('input', this);
        this.#inputElement = null;

        this.#cancelButtonElement.removeEventListener('click', this);
        this.#cancelButtonElement = null;

        this.#okButtonElement.removeEventListener('click', this);
        this.#okButtonElement = null;

        super.destroy();
    }
};

FoxyBuilder.Dialogs.Wait = class extends FoxyBuilder.BaseClasses.Dialog {

    constructor(params)
    {
        super('wait', params);
    }
};

FoxyBuilder.Ajax = {};

FoxyBuilder.Ajax.fetch = async function(actionName, args)
{
    let argList = [];

    argList.push(`action=${actionName}`);

    for (let key of Object.keys(args))
    {
        let _key = encodeURIComponent(key);
        let _value = encodeURIComponent(String(args[key]));
        argList.push(`${_key}=${_value}`);
    }

    let body = argList.join('&');

    return fetch(FOXYBUILDER.ajaxUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
    });
}

FoxyBuilder.showWait = function(show)
{
    if (show)
    {
        document.body.classList.add('foxybdr-wait');
    }
    else
    {
        document.body.classList.remove('foxybdr-wait');
    }
}

FoxyBuilder.showNonceErrorDialog = function()
{
    (new FoxyBuilder.Dialogs.Alert({
        title: FOXYBUILDER.dialogs.nonceError.title,
        message: FOXYBUILDER.dialogs.nonceError.message,
        okLabel: FOXYBUILDER.dialogs.nonceError.okLabel
    })).create();
}
