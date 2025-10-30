<?php

namespace FoxyBuilder\Admin\DocEditor;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/includes/security.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/document.php';

class DocEditor
{
    private $enqueue = false;

    private $nonceContext = 'doc-editor';

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
		add_action('enqueue_block_editor_assets', [ $this, 'action_enqueue_assets' ]);
		add_action('admin_footer', [ $this, 'action_footer' ]);

        add_action('wp_ajax_foxybdr_doc-editor_edit_mode', [ $this, 'set_edit_mode' ]);
        add_action('wp_ajax_foxybdr_doc-editor_refresh_nonce', [ $this, 'refresh_nonce' ]);
    }

    public function action_enqueue_assets()
    {
        $document = \FoxyBuilder\Modules\Document::get_document(get_the_ID());

        if ($document === null || $document->can_user_edit() === false)
            return;

        if ($document->post_type() !== 'page')
            return;
        
        $this->enqueue = true;

        $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

        wp_enqueue_style('foxybdr-admin-doc-editor', FOXYBUILDER_PLUGIN_URL . "admin/assets/css/doc-editor.css", [], FOXYBUILDER_VERSION);

        wp_enqueue_script('foxybdr-admin-doc-editor', FOXYBUILDER_PLUGIN_URL . 'admin/assets/js/doc-editor' . $suffix . '.js', [], FOXYBUILDER_VERSION, true);

        wp_localize_script('foxybdr-admin-doc-editor', 'FOXYAPP', [
            'editMode' => $document->edit_mode(),
            'editUrl' => $document->get_edit_url(),
            'nonce' => wp_create_nonce($this->nonceContext),
            'dialogs' => [
                'switchMode' => [
                    'title' => __('Restore WordPress Editing', 'foxy-builder'),
                    'message' => __('Are you sure you want to remove all Foxy Builder content from this page?', 'foxy-builder'),
                    'cancelLabel' => __('Cancel', 'foxy-builder'),
                    'confirmLabel' => __('Confirm', 'foxy-builder'),
                ],
            ],
        ]);
    }

    public function action_footer()
    {
        if (!$this->enqueue)
            return;

        require FOXYBUILDER_PLUGIN_PATH . '/admin/assets/html/doc-editor.php';
    }

    public function set_edit_mode()
    {
        $doc_id = (int)\FoxyBuilder\Includes\Security::sanitize_request($_POST, 'id');
        $new_edit_mode = \FoxyBuilder\Includes\Security::sanitize_request($_POST, 'edit_mode') === 'true' ? true : false;

        if (wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), $this->nonceContext) === false)
        {
            wp_send_json([
                'status' => 'ERROR',
            ], 403);
            return;
        }

        $document = \FoxyBuilder\Modules\Document::get_document($doc_id);

        if ($document === null || $document->can_user_edit() === false)
        {
            wp_send_json([
                'status' => 'ERROR',
            ], 500);
            return;
        }

        $document->edit_mode($new_edit_mode);

        $document->save();
        
        wp_send_json([
            'status' => 'OK',
            'edit_mode' => $new_edit_mode,
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
