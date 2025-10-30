<?php

namespace FoxyBuilder\Admin\Editor;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/document.php';

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
    }

    public function action_foxy_builder()
    {
		if (empty($_REQUEST['post']))
			return;

        $post_id = absint($_REQUEST['post']);

        $document = \FoxyBuilder\Modules\Document::get_document($post_id);

        if ($document === null || $document->can_user_edit() === false)
            return;

        if ($document->edit_mode() === false)
        {
            $document->edit_mode(true);
            $document->save();
        }

		@header('Content-Type: ' . get_option( 'html_type' ) . '; charset=' . get_option('blog_charset'));

        require FOXYBUILDER_PLUGIN_PATH . '/admin/editor/editor-page.php';
        
        die;
    }
}
