<?php

namespace FoxyBuilder\Admin\Includes;

if (!defined('ABSPATH'))
    exit;

class Header
{
    private $title = '';

    private $buttons = [];

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    public function set_title($title)
    {
        $this->title = $title;
    }

    public function add_button($label, $url = null, $id = null, $class = null)
    {
        $this->buttons[] = [
            'label' => $label,
            'url' => $url,
            'id' => $id,
            'class' => $class,
        ];
    }

    public function print_output_html()
    {
        ?><div id="foxybdr-admin-top-bar"><?php
            ?><div class="foxybdr-title"><?php
                ?><i class="foxybdr foxybdr-logo"></i><?php
                ?><span><?php echo esc_html($this->title); ?></span><?php
            ?></div><?php
            ?><div class="foxybdr-buttons"><?php

                foreach ($this->buttons as $button)
                {
                    ?><a <?php
                        if ($button['url'] !== null)
                        {
                            ?>href="<?php echo esc_url($button['url']); ?>"<?php
                        }
                        if ($button['id'] !== null)
                        {
                            ?>id="<?php echo esc_attr($button['id']); ?>"<?php
                        }
                        if ($button['class'] !== null)
                        {
                            ?>class="<?php echo esc_attr($button['class']); ?>"<?php
                        }
                    ?>><?php

                        echo esc_html($button['label']);

                    ?></a><?php
                }

            ?></div><?php
        ?></div><?php
    }
}
