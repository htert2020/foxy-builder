<?php

namespace FoxyBuilder\Admin\Editor;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/includes/security.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/document.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-control-manager.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widget-manager.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/asset-manager.php';

class Editor
{
    private $group_controls = null;

    private $categories = null;

    private $widgets = null;

    private $fonts = null;

    private $icon_libraries = null;

    private $nonceContext = 'editor';

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
        if (isset($_GET['action']) && $_GET['action'] === 'foxy_builder')
        {
            add_action('admin_action_foxy_builder', [ $this, 'action_foxy_builder' ]);
        }

        add_filter('upload_mimes', [ $this, 'filter_upload_mimes' ]);

        add_action('wp_ajax_foxybdr_editor_get_wysiwyg_links', [ $this, 'get_wysiwyg_links' ]);
        add_action('wp_ajax_foxybdr_editor_get_image_urls', [ $this, 'get_image_urls' ]);
        add_action('wp_ajax_foxybdr_editor_refresh_nonce', [ $this, 'refresh_nonce' ]);
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

        add_action('wp_enqueue_scripts', [ $this, 'action_enqueue_scripts' ], 999999);

        add_action('wp_footer', [ $this, 'action_footer' ]);

        require FOXYBUILDER_PLUGIN_PATH . '/admin/editor/editor-page.php';
        
        die;
    }

    public function action_enqueue_scripts()
    {
        global $wp_styles, $wp_scripts;

        $wp_styles = new \WP_Styles();
        $wp_scripts = new \WP_Scripts();

        $group_control_manager = \FoxyBuilder\Modules\GroupControlManager::instance();
        $group_control_manager->add_group_controls();
        $this->group_controls = $group_control_manager->build_group_control_definitions();
    
        $widget_manager = \FoxyBuilder\Modules\WidgetManager::instance();
        $widget_manager->add_category('layout', 'Layout');
        $widget_manager->add_widgets();
        $this->categories = $widget_manager->build_category_definitions();
        $this->widgets = $widget_manager->build_widget_definitions();
        $this->fonts = \FoxyBuilder\Modules\AssetManager::instance()->get_fonts();
        $this->icon_libraries = \FoxyBuilder\Modules\AssetManager::instance()->get_icon_libraries();

        $foxybuilder_icon_url = FOXYBUILDER_PLUGIN_URL . "admin/assets/fonts/foxybuilder/foxybuilder.css?ver=" . FOXYBUILDER_VERSION;

        $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

        wp_enqueue_style('foxybdr-admin-wp-common', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/wp-common.css", [], FOXYBUILDER_VERSION);
        wp_enqueue_style('foxybdr-admin', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/admin.css", [], FOXYBUILDER_VERSION);
        wp_enqueue_style('foxybdr-admin-editor-page', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/editor-page.css", [], FOXYBUILDER_VERSION);
        wp_enqueue_style('foxybdr-admin-editor-controls', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/editor-controls.css", [], FOXYBUILDER_VERSION);
    
        wp_enqueue_script('foxybdr-admin', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/admin' . $suffix . '.js', [], FOXYBUILDER_VERSION);
        wp_enqueue_script('foxybdr-admin-editor-page', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/editor-page.js', [], FOXYBUILDER_VERSION);
        wp_enqueue_script('foxybdr-admin-editor-controls', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/editor-controls.js', [], FOXYBUILDER_VERSION);

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

        ?><link href="<?php echo esc_url($foxybuilder_icon_url); ?>" rel="stylesheet" type="text/css" /><?php

        $fontAwesomeCssUrl = \FoxyBuilder\Modules\AssetManager::instance()->get_font_awesome_css_url();
        ?><link href="<?php echo esc_url($fontAwesomeCssUrl); ?>" rel="stylesheet" type="text/css" /><?php

        foreach ($this->icon_libraries as $name => $library)
        {
            $url = $library['css_url'];

            ?><link href="<?php echo esc_url($url); ?>" rel="stylesheet" type="text/css" /><?php
        }

        foreach ($this->fonts as $group => $groupInfo)
        {
            if ($group === 'google')
                continue;

            foreach ($groupInfo['font_list'] as $font)
            {
                if (is_array($font) && !array_is_list($font) && isset($font['css_url']))
                {
                    ?><link href="<?php echo esc_url($font['css_url']); ?>" rel="stylesheet" type="text/css" /><?php
                }
            }
        }
    
        wp_print_scripts([ 'wp-tinymce' ]);
    
        wp_enqueue_media();

        wp_enqueue_style('dashicons');
    }

    public function action_footer()
    {
        $post_id = absint($_GET['post']);

        $document = \FoxyBuilder\Modules\Document::get_document($post_id);

        require FOXYBUILDER_PLUGIN_PATH . '/admin/assets/html/admin.php';

        $optStr = get_option('foxybdr_upload_file_types');
        $uploadFileTypes = $optStr !== false ? explode('|', $optStr) : [];

        ?>

        <script type="text/javascript" id="foxybdr-admin-editor-page-js-extra">

            var FOXYAPP = <?php echo wp_json_encode([
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'pluginUrl' => FOXYBUILDER_PLUGIN_URL,
                'templateID' => $post_id,
                'widgetInstanceIdCounter' => $document->widget_instance_id_counter(),
                'groupControls' => $this->group_controls,
                'widgetCategories' => $this->categories,
                'widgets' => $this->widgets,
                'assets' => [
                    'fonts' => $this->fonts,
                    'iconLibraries' => $this->icon_libraries,
                    'fontAwesomeCssUrl' => \FoxyBuilder\Modules\AssetManager::instance()->get_font_awesome_css_url(),
                ],
                'uploadFileTypes' => $uploadFileTypes,
                'nonce' => wp_create_nonce($this->nonceContext),
            ]); ?>;

            <?php
                foreach ($this->icon_libraries as $id => $library)
                {
                    $icon_list_json = \FoxyBuilder\Modules\AssetManager::instance()->get_icon_library_icons($id);

                    ?>
                        FOXYAPP.assets.iconLibraries['<?php echo esc_html($id); ?>']['icons'] = <?php echo $icon_list_json; ?>;
                    <?php
                }
            ?>

        </script>

        <script type="text/plain" id="foxybdr-tmpl-thread">

            <?php

                require_once FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/editor-thread.js';

                foreach ($this->widgets as $widgetName => $widgetDefinition)
                {
                    if (isset($widgetDefinition['render']) && $widgetDefinition['render'] !== null)
                    {
                        ?>

FoxyRender.renderFunctions['<?php echo esc_html($widgetName); ?>'] = function(wInstanceID, settings) {

let obj = {
    id: wInstanceID
};

FoxyRender.Printer.clear();

let print = FoxyRender.Printer.write;
let printEscape = FoxyRender.Printer.writeEscape;
let esc_html = FoxyApp.Function.escapeHtml;
let esc_attr = FoxyApp.Function.escapeHtml;
let esc_url = FoxyApp.Function.escapeHtml;

<?php
    require_once $widgetDefinition['render'];
?>

return FoxyRender.Printer.getOutput();
};

                        <?php
                    }
                }

            ?>
        
        </script>
        
        <?php
    }

    public function filter_upload_mimes($mimes)
    {
        $user = wp_get_current_user();

        if ($user->ID !== 0 && $user->has_cap('edit_pages'))
        {
            $upload_context = \FoxyBuilder\Includes\Security::sanitize_request($_POST, 'foxybdr-media-upload');

            if ($upload_context === 'foxybdr-upload-from-editor')
            {
                $optStr = get_option('foxybdr_upload_file_types');
                $uploadFileTypes = $optStr !== false ? explode('|', $optStr) : [];

                foreach ($uploadFileTypes as $fileType)
                {
                    if (!isset($mimes[$fileType]))
                    {
                        $mimeType = null;

                        switch ($fileType)
                        {
                            case 'svg':
                                $mimeType = 'image/svg+xml';
                                break;
                        }

                        if ($mimeType !== null)
                            $mimes[$fileType] = $mimeType;
                    }
                }
            }
        }

        return $mimes;
    }

    public function get_wysiwyg_links()
    {
        if (wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), $this->nonceContext) === false)
        {
            wp_send_json([
                'status' => 'ERROR',
            ], 403);
            return;
        }

        $post_types = get_post_types([ 'public' => true ], 'objects');

        $types = [];
        $links_by_type = [];

        foreach ($post_types as $type => $pt)
        {
            $types[] = $type;
            $links_by_type[$type] = [];
        }

        $query = new \WP_Query([
            'post_type' => $types,
            'post_status' => 'publish',
            'orderby' => 'title',
            'order' => 'ASC',
            'nopaging' => true
        ]);

        if ($query->have_posts())
        {
            while ($query->have_posts())
            {
                $query->the_post();

                $url = get_permalink($query->post->ID);
                $title = $query->post->post_title;
                $type = $query->post->post_type;

                $links_by_type[$type][] = [
                    'title' => $title,
                    'value' => $url
                ];
            }
        }

        $links = [];
        foreach ($links_by_type as $type => $linkList)
        {
            if (count($linkList) === 0)
                continue;

            $links[] = [
                'title' => $post_types[$type]->label,
                'menu' => $linkList
            ];
        }

        wp_send_json([
            'status' => 'OK',
            'links' => $links,
        ], 200);
    }

    public function get_image_urls()
    {
        if (wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), $this->nonceContext) === false)
        {
            wp_send_json([
                'status' => 'ERROR',
            ], 403);
            return;
        }

		$image_sizes = get_intermediate_image_sizes();
		$image_sizes[] = 'full';

        $str = \FoxyBuilder\Includes\Security::sanitize_request($_POST, 'id_list');

        $id_list = json_decode($str, true);

        if ($id_list === null || !is_array($id_list) || !array_is_list($id_list))  // sanitize
        {
            wp_send_json([
                'status' => 'ERROR',
            ], 400);
            return;
        }

        $images = [];

        foreach ($id_list as $item)
        {
            $id = (int)$item;  // sanitize

            $image = [];

            foreach ($image_sizes as $image_size)
            {
                $image_data = wp_get_attachment_image_src($id, $image_size, true);
            
                if (is_array($image_data) && !empty($image_data) && !empty($image_data[0]))
                    $image[$image_size] = $image_data[0];
            }

            $images[(string)$id] = $image;
        }

        wp_send_json([
            'status' => 'OK',
            'images' => $images,
        ], 200);
    }

    public function refresh_nonce()
    {
        if (wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), $this->nonceContext) === false)
        {
            wp_send_json([
                'status' => 'ERROR',
            ], 403);
            return;
        }

        wp_send_json([
            'status' => 'OK',
            'nonce' => wp_create_nonce($this->nonceContext),
        ], 200);
    }
}
