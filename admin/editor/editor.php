<?php

namespace FoxyBuilder\Admin\Editor;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/document.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widget-manager.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/asset-manager.php';

class Editor
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
        add_action('admin_action_foxy_builder', [ $this, 'action_foxy_builder' ]);

        \FoxyBuilder\Modules\WidgetManager::instance()->add_category('layout', 'Layout');

        \FoxyBuilder\Modules\WidgetManager::instance()->add_widgets();
    }

    public function action_foxy_builder()
    {
		if (empty($_GET['post']))
			return;

        $post_id = absint($_GET['post']);

        $document = \FoxyBuilder\Modules\Document::get_document($post_id);

        if ($document === null || $document->can_user_edit() === false)
            return;

        if ($document->edit_mode() === false)
        {
            $document->edit_mode(true);
            $document->save();
        }

		@header('Content-Type: ' . get_option( 'html_type' ) . '; charset=' . get_option('blog_charset'));

        add_filter('show_admin_bar', '__return_false');

        remove_all_actions('wp_head');
        remove_all_actions('wp_print_styles');
        remove_all_actions('wp_print_head_scripts');
        remove_all_actions('wp_footer');

        add_action('wp_head', 'wp_enqueue_scripts', 1);
        add_action('wp_head', 'wp_print_styles', 8);
        add_action('wp_head', 'wp_print_head_scripts', 9);

        remove_all_actions('wp_enqueue_scripts');

        remove_all_actions('after_wp_tiny_mce');

        add_action('wp_enqueue_scripts', [ $this, 'enqueue' ], 999999);

        require FOXYBUILDER_PLUGIN_PATH . '/admin/editor/editor-page.php';
        
        die;
    }

    public function enqueue()
    {
        global $wp_styles, $wp_scripts;

        $categories = \FoxyBuilder\Modules\WidgetManager::instance()->build_category_definitions();
        $widgets = \FoxyBuilder\Modules\WidgetManager::instance()->build_widget_definitions();

        $foxybuilder_icon_url = FOXYBUILDER_PLUGIN_URL . "admin/assets/fonts/foxybuilder/foxybuilder.css?ver=" . FOXYBUILDER_VERSION;

        $icon_libraries = \FoxyBuilder\Modules\AssetManager::instance()->get_icon_libraries();
        $fas_icon_urls = $icon_libraries['fas']['css_urls'];

        $wp_styles = new \WP_Styles();
        $wp_scripts = new \WP_Scripts();
    
        $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

        wp_enqueue_style('foxybdr-admin-wp-common', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/wp-common.css", [], FOXYBUILDER_VERSION);
        wp_enqueue_style('foxybdr-admin-editor-page', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/editor-page.css", [], FOXYBUILDER_VERSION);
        wp_enqueue_style('foxybdr-admin-editor-controls', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/editor-controls.css", [], FOXYBUILDER_VERSION);
    
        wp_enqueue_script('foxybdr-admin-editor-page', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/editor-page.js', [], FOXYBUILDER_VERSION);
        wp_enqueue_script('foxybdr-admin-editor-controls', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/editor-controls.js', [], FOXYBUILDER_VERSION);

        wp_localize_script('foxybdr-admin-editor-page', 'FOXYAPP', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'widgetCategories' => $categories,
            'widgets' => $widgets,
            'assets' => [
                'iconLibraries' => $icon_libraries,
            ],
            'requiredAssetUrls' => $fas_icon_urls,
        ]);

        ?><link href="<?php echo esc_url($foxybuilder_icon_url); ?>" rel="stylesheet" type="text/css" /><?php

        foreach ($fas_icon_urls as $url)
        {
            ?><link href="<?php echo esc_url($url); ?>" rel="stylesheet" type="text/css" foxybdr-asset="foxybdr-asset" /><?php
        }
    
        wp_print_scripts([ 'wp-tinymce' ]);
    
        wp_enqueue_media();
    }
}
