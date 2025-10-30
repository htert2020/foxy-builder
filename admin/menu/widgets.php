<?php

namespace FoxyBuilder\Admin\Menu;

if (!defined('ABSPATH'))
    exit;

class Widgets
{
    private $page_loading = false;

    private $sub_page = null;

    public $menu_short_name = null;

    public $menu_long_name = null;

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    protected function __construct()
    {
    }

    public function init()
    {
        add_action('in_admin_header', [ $this, 'action_in_admin_header' ]);
    }

    public function admin_menu()
    {
        $capability = 'edit_pages';
        $app_title = __('Foxy Builder', 'foxy-builder');
        $page_label = __('Widgets', 'foxy-builder');
        $this->menu_short_name = 'foxybuilder_widgets';

        $this->menu_long_name = add_submenu_page(
            'foxybuilder',
            "{$app_title} - {$page_label}",
            $page_label,
            $capability,
            $this->menu_short_name,
            [ $this, 'print_page' ]
        );

        add_action('admin_print_scripts-' . $this->menu_long_name, [ $this, 'enqueue' ]);
    }

    public function enqueue()
    {
        $this->page_loading = true;

        $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

        wp_enqueue_style('foxybdr-admin-includes-notice', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/includes-notice.css", [], FOXYBUILDER_VERSION);
        wp_enqueue_style('foxybdr-admin-includes-header-fonts', 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap', [], FOXYBUILDER_VERSION);
        wp_enqueue_style('foxybdr-admin-includes-header', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/includes-header.css", [], FOXYBUILDER_VERSION);
    }

    public function action_in_admin_header()
    {
        if ($this->page_loading)
        {
            require_once FOXYBUILDER_PLUGIN_PATH . '/admin/includes/header.php';

            \FoxyBuilder\Admin\Includes\Header::instance()->set_title(__('Widgets', 'foxy-builder'));

            \FoxyBuilder\Admin\Includes\Header::instance()->print_output_html();
        }
    }

    public function print_page()
    {
        require FOXYBUILDER_PLUGIN_PATH . '/admin/menu/pages/widgets.php';
    }
}
