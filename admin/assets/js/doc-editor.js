var FoxyApp = {};

FoxyApp.Main = class {

    editMode = false;
    #fxbEditorElement = null;

    constructor()
    {
    }

    init()
    {
        var self = this;

        this.editMode = !!FOXYAPP.editMode;

        this.applyEditMode();

        wp.data.subscribe(
            function()
            {
                setTimeout(function() {
                    self.initElements();
                }, 1);
            }
        );

        this.scheduleRefreshNonce();
    }

    initElements()
    {
        var self = this;

        let editorElement = document.querySelector('#editor');

        if (editorElement.querySelector('#foxybdr-switch-mode') === null)
        {
            let doc = document.createElement('div');
            doc.innerHTML = document.querySelector('#foxybdr-template-switch-mode').text;
            let switchModeElement = doc.querySelector('#foxybdr-switch-mode');
            editorElement.querySelector('.edit-post-header-toolbar').appendChild(switchModeElement);

            switchModeElement.querySelector('button').addEventListener('click', function(e) { self.onSwitchModeButtonClicked(e); });
        }

        if (editorElement.querySelector('#foxybdr-editor') === null)
        {
            let doc = document.createElement('div');
            doc.innerHTML = document.querySelector('#foxybdr-template-editor').text;
            this.#fxbEditorElement = doc.querySelector('#foxybdr-editor');
            editorElement.querySelector('.is-desktop-preview').appendChild(this.#fxbEditorElement);

            this.#fxbEditorElement.querySelector('button').addEventListener('click', function(e) { self.onEditorButtonClicked(e); });
        }
    }

    onSwitchModeButtonClicked(e)
    {
        var self = this;

        if (this.editMode)
        {
            let dialog = new FoxyBuilder.Dialogs.Confirm({
                title: FOXYAPP.dialogs.switchMode.title,
                message: FOXYAPP.dialogs.switchMode.message,
                cancelLabel: FOXYAPP.dialogs.switchMode.cancelLabel,
                confirmLabel: FOXYAPP.dialogs.switchMode.confirmLabel,
                onCancel: null,
                onConfirm: function()
                {
                    self.onSwitchModeConfirmed();
                }
            });

            dialog.create();
        }
        else
        {
            this.editMode = !this.editMode;
            this.applyEditMode();

            if (this.#fxbEditorElement)
                this.#fxbEditorElement.querySelector('button').click();
        }
    }

    onSwitchModeConfirmed()
    {
        var self = this;

        FoxyBuilder.showWait(true);

        let docIDStr = document.querySelector('#post_ID').value;

        FoxyBuilder.Ajax.fetch('foxybdr_doc-editor_edit_mode', {
            id: docIDStr,
            edit_mode: !this.editMode,
            nonce: FOXYAPP.nonce
        })
        .then(function(response) {
            if (response.ok)
                return response.json();
        })
        .then(function(data) {
            if (data.status === 'OK')
            {
                self.editMode = !!data.edit_mode;
                self.applyEditMode();
            }
        })
        .finally(function() {
            FoxyBuilder.showWait(false);
        });
    }

    onEditorButtonClicked(e)
    {
        var self = this;

        e.preventDefault();

        this.#fxbEditorElement.classList.add('foxybdr-animate');

        FoxyBuilder.showWait(true);

        var isNewPost = wp.data.select('core/editor').getCurrentPost().status === 'auto-draft';
        if (isNewPost)
        {
            var docTitle = wp.data.select('core/editor').getEditedPostAttribute('title');

            if (!docTitle)
            {
                wp.data.dispatch('core/editor').editPost({
                    title: 'Foxy Builder #' + document.querySelector('#post_ID').value
                });
            }

            wp.data.dispatch('core/editor').savePost();

            setTimeout(function() {
                self.redirectUrl();
            }, 300);
        }
        else
        {
            this.redirectUrl();
        }
    }

    redirectUrl()
    {
        var self = this;

        if (wp.data.select('core/editor').isSavingPost())
        {
            setTimeout(function() {
                self.redirectUrl();
            }, 300);
        }
        else
        {
            window.location.href = FOXYAPP.editUrl;
        }
    }

    applyEditMode()
    {
        if (this.editMode)
        {
            document.body.classList.add('foxybdr-editor-active');
        }
        else
        {
            document.body.classList.remove('foxybdr-editor-active');
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

        FoxyBuilder.Ajax.fetch('foxybdr_doc-editor_refresh_nonce', {
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
};

var FOXY_APP_MAIN = new FoxyApp.Main();

window.addEventListener('load',
    function(e)
    {
        FOXY_APP_MAIN.init();
    }
);
