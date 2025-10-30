<?php

if (!defined('ABSPATH'))
    exit;

?>

<script id="foxybdr-template-switch-mode" type="text/html">
    <div id="foxybdr-switch-mode">
        <button id="foxybdr-switch-mode-button" type="button" class="button button-primary button-large">
            <span class="foxybdr-on">
                <?php echo esc_html('&#8592; ' . __('Restore WordPress Editing', 'foxy-builder')); ?>
            </span>
            <span class="foxybdr-off">
                <?php echo esc_html__('Edit with Foxy Builder', 'foxy-builder'); ?>
            </span>
        </button>
    </div>
</script>

<script id="foxybdr-template-editor" type="text/html">
    <div id="foxybdr-editor">
        <div id="foxybdr-editor-inner">
            <button id="foxybdr-editor-button" class="button button-primary button-hero">
                <i class="foxybdr foxybdr-logo"></i>
                <?php echo esc_html__('Edit with Foxy Builder', 'foxy-builder'); ?>
            </button>
            <div class="foxybdr-loader-wrapper">
                <div class="foxybdr-loader">
                    <i class="foxybdr foxybdr-logo"></i>
                </div>
                <div class="foxybdr-loader-title"><?php echo esc_html__('Loading', 'foxy-builder'); ?></div>
            </div>
        </div>
    </div>
</script>
