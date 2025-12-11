<?php

namespace FoxyBuilder\Modules;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/document.php';

class FrontEnd
{
    private $is_front_end = false;

    private $is_preview = false;

    private $document = null;

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    public function init()
    {
        add_action('wp', [ $this, 'action_wp' ]);
        add_action('wp_enqueue_scripts', [ $this, 'action_enqueue_scripts' ]);
    }

    public function action_wp()
    {
        if (is_singular([ 'post', 'page', 'foxybdr_template' ]))
        {
            $post_id = get_queried_object_id();

            $this->document = \FoxyBuilder\Modules\Document::get_document($post_id);

            if ($this->document !== null && $this->document->edit_mode() === true)
            {
                $this->is_front_end = true;

                add_filter('the_content', [ $this, 'filter_the_content' ], 9);
            }

            if (isset($_GET['foxybdr_preview']) && absint($_GET['foxybdr_preview']) === $post_id)
            {
                $this->is_preview = true;

                add_filter('show_admin_bar', '__return_false');
            }
        }
    }

    public function action_enqueue_scripts()
    {
        $suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

        if ($this->is_front_end)
        {
            wp_enqueue_style('foxybdr-front-end', FOXYBUILDER_PLUGIN_URL . "assets/css/modules-front-end.css", [], FOXYBUILDER_VERSION);
        }

        if ($this->is_preview)
        {
            wp_enqueue_style('foxybdr-front-end-preview', FOXYBUILDER_PLUGIN_URL . "assets/css/modules-front-end-preview.css", [], FOXYBUILDER_VERSION);

            wp_enqueue_style('dashicons');
        }
    }

    public function filter_the_content($content)
    {
        $content = $this->document->render(true);

		foreach ([ 'wpautop', 'shortcode_unautop', 'wptexturize' ] as $filter)
        {
			if (has_filter('the_content', $filter))
				remove_filter('the_content', $filter);
		}

        return $content;
    }
}
