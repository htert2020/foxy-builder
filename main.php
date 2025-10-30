<?php

namespace FoxyBuilder;

if (!defined('ABSPATH'))
    exit;

class Main
{
    const MINIMUM_PHP_VERSION = '7.1.3';

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    function __construct()
    {
        add_action('plugins_loaded', [ $this, 'action_plugins_loaded' ]);

        register_activation_hook(FOXYBUILDER_PLUGIN_PATHANDFILE, [ $this, 'plugin_activate' ]);
        register_deactivation_hook(FOXYBUILDER_PLUGIN_PATHANDFILE, [ $this, 'plugin_deactivate' ]);
        register_uninstall_hook(FOXYBUILDER_PLUGIN_PATHANDFILE, [ $this, 'plugin_uninstall' ]);
    }

    public function action_plugins_loaded()
    {
        if (!$this->is_compatible())
            return;

        add_action('init', [ $this, 'action_init' ]);
    }
    
    public function action_init()
    {
        if (is_admin())
        {
            require_once FOXYBUILDER_PLUGIN_PATH . '/admin/admin.php';
            \FoxyBuilder\Admin\Admin::instance()->init();

            require_once FOXYBUILDER_PLUGIN_PATH . '/admin/doc-editor/doc-editor.php';
            \FoxyBuilder\Admin\DocEditor\DocEditor::instance()->init();

            require_once FOXYBUILDER_PLUGIN_PATH . '/admin/editor/editor.php';
            \FoxyBuilder\Admin\Editor\Editor::instance()->init();
        }
    }
    
    private function is_compatible()
    {
        $retval = true;

        if (version_compare(PHP_VERSION, self::MINIMUM_PHP_VERSION, '<'))
        {
            add_action('admin_notices',
                function()
                {
                    $message = sprintf(__('Foxy Builder requires PHP version %s or greater.', 'foxy-builder'), self::MINIMUM_PHP_VERSION);

                    ?>
                        <div class="notice notice-error is-dismissible">
                            <p><?php echo esc_html($message); ?></p>
                        </div>
                    <?php
                }
            );

            $retval = false;
        }
        
        return $retval;
    }

    public function plugin_activate()
    {
    }

    public function plugin_deactivate()
    {
    }

    public function plugin_uninstall()
    {
    }
}
