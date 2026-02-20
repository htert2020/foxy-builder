<?php

if (!defined('ABSPATH'))
    exit;

?>

<script id="foxybdr-template-dialog-alert" type="text/html">
    <div class="foxybdr-dialog-alert foxybdr-dialog">
        <div class="foxybdr-dialog-box">
            <div class="foxybdr-dialog-header">Alert Dialog</div>
            <div class="foxybdr-dialog-message">This is an alert message.</div>
            <div class="foxybdr-dialog-buttons">
                <button class="foxybdr-dialog-ok">OK</button>
            </div>
        </div>
    </div>
</script>

<script id="foxybdr-template-dialog-confirm" type="text/html">
    <div class="foxybdr-dialog-confirm foxybdr-dialog">
        <div class="foxybdr-dialog-box">
            <div class="foxybdr-dialog-header">Confirmation Dialog</div>
            <div class="foxybdr-dialog-message">Please confirm.</div>
            <div class="foxybdr-dialog-buttons">
                <button class="foxybdr-dialog-cancel">Cancel</button>
                <button class="foxybdr-dialog-ok">OK</button>
            </div>
        </div>
    </div>
</script>

<script id="foxybdr-template-dialog-prompt" type="text/html">
    <div class="foxybdr-dialog-prompt foxybdr-dialog">
        <div class="foxybdr-dialog-box">
            <div class="foxybdr-dialog-header">Prompt Dialog</div>
            <div class="foxybdr-dialog-message">Enter info</div>
            <div class="foxybdr-dialog-input">
                <input type="text" value="" />
            </div>
            <div class="foxybdr-dialog-buttons">
                <button class="foxybdr-dialog-cancel">Cancel</button>
                <button class="foxybdr-dialog-ok">OK</button>
            </div>
        </div>
    </div>
</script>

<script id="foxybdr-template-dialog-wait" type="text/html">
    <div class="foxybdr-dialog-wait foxybdr-dialog">
        <div class="foxybdr-dialog-box">
            <div class="foxybdr-dialog-header">Please Wait</div>
            <div class="foxybdr-dialog-message">Please wait.</div>
        </div>
    </div>
</script>
