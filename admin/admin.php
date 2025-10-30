<?php

namespace FoxyBuilder\Admin;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/admin/menu/settings.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/admin/menu/widgets.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/document.php';

class Admin
{
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
        add_action('admin_menu', [ $this, 'action_menu' ]);

		add_action('admin_enqueue_scripts', [ $this, 'action_enqueue_scripts' ]);
		add_action('admin_footer', [ $this, 'action_footer' ]);

        add_filter('display_post_states', [ $this, 'filter_display_post_states' ], 10, 2);
		add_filter('post_row_actions', [ $this, 'filter_post_row_actions' ], 11, 2);
		add_filter('page_row_actions', [ $this, 'filter_post_row_actions' ], 11, 2);

        \FoxyBuilder\Admin\Menu\Settings::instance()->init();
        \FoxyBuilder\Admin\Menu\Widgets::instance()->init();
    }

    public function action_menu()
    {
        $capability = 'edit_pages';
        $app_title = __('Foxy Builder', 'foxy-builder');

        do_action('foxybdr_admin_menu', null);
        
        add_menu_page(
            $app_title,
            $app_title,
            $capability,
            'foxybuilder',
            '',  // callback function
            '',  // default icon
            58
        );

        \FoxyBuilder\Admin\Menu\Settings::instance()->admin_menu();
        do_action('foxybdr_admin_menu', \FoxyBuilder\Admin\Menu\Settings::instance()->menu_short_name);

        \FoxyBuilder\Admin\Menu\Widgets::instance()->admin_menu();
        do_action('foxybdr_admin_menu', \FoxyBuilder\Admin\Menu\Widgets::instance()->menu_short_name);
    }

    public function action_enqueue_scripts($page_name)
    {
        $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

        wp_enqueue_style('foxybdr-admin-icons', FOXYBUILDER_PLUGIN_URL . "admin/assets/fonts/foxybuilder/foxybuilder.css", [], FOXYBUILDER_VERSION);

        wp_enqueue_style('foxybdr-admin', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/admin.css", [], FOXYBUILDER_VERSION);

        wp_enqueue_script('foxybdr-admin', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/admin' . $suffix . '.js', [], FOXYBUILDER_VERSION);

        wp_localize_script('foxybdr-admin', 'FOXYBUILDER', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'dialogs' => [
                'nonceError' => [
                    'title' => __('Error', 'foxy-builder'),
                    'message' => __('Failed communication with server. Please reload this page.', 'foxy-builder'),
                    'okLabel' => __('OK', 'foxy-builder'),
                ],
            ],
        ]);
    }

    public function action_footer()
    {
        require FOXYBUILDER_PLUGIN_PATH . '/admin/assets/html/admin.php';
    }

    public function filter_display_post_states($post_states, $post)
    {
        $document = \FoxyBuilder\Modules\Document::get_document($post->ID);

        if ($document !== null && $document->edit_mode() === true && $document->can_user_edit() === true)
        {
            $post_states['foxy_builder'] = esc_html__('Foxy Builder', 'foxy-builder');
        }

        return $post_states;
    }

    public function filter_post_row_actions($actions, $post)
    {
        $document = \FoxyBuilder\Modules\Document::get_document($post->ID);

        if ($document !== null && $document->edit_mode() === true && $document->can_user_edit() === true)
        {
            $actions['edit_with_foxy_builder'] = sprintf(
                '<a href="%1$s">%2$s</a>',
                esc_url($document->get_edit_url()),
                esc_html(__('Edit with Foxy Builder', 'foxy-builder'))
            );
        }

		return $actions;
    }
}
