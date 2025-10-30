<?php

namespace FoxyBuilder\Admin\Includes;

if (!defined('ABSPATH'))
    exit;

class Panel
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

    public function print_start_html($title, $id = null, $classes = null)
    {
        ?><div class="foxybdr-panel <?php echo $classes !== null ? esc_attr($classes) : ''; ?>" <?php
            if ($id !== null)
            {
                ?>id="<?php echo esc_attr($id) ?>" <?php
            }
        ?>><?php
            ?><div class="foxybdr-panel-title-bar"><?php
                ?><h2><?php echo esc_html($title); ?></h2><?php
            ?></div><?php
            ?><div class="foxybdr-panel-body"><?php
    }

    public function print_end_html()
    {
            ?></div><?php
        ?></div><?php
    }
}
