<?php

namespace FoxyBuilder\Modules;

if (!defined('ABSPATH'))
    exit;

class WidgetManager
{
    private $categories = [];

    private $category_index = [];  // Maps category name to index position in $categories array.

    private $widgets = [];

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    public function add_category($name, $title)
    {
        $this->categories[] = [
            'name' => $name,
            'title' => $title,
            'widgets' => [],
        ];

        $this->category_index[$name] = count($this->categories) - 1;
    }

    public function add_widgets()
    {
        require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/settings/site.php';
        require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/layout/section.php';

        $this->widgets = [
            new \FoxyBuilder\Modules\Widgets\Settings\Site(),
            new \FoxyBuilder\Modules\Widgets\Layout\Section(),
        ];
    }

    public function add_widget($widgetObj)
    {
        $this->widgets[] = $widgetObj;
    }

    public function build_category_definitions()
    {
        foreach ($this->widgets as $widget)
        {
            $widget_name = $widget->get_name();
            $cats = $widget->get_categories();

            foreach ($cats as $cat)
            {
                if (isset($this->category_index[$cat]))
                {
                    $index = $this->category_index[$cat];
                    $category = &$this->categories[$index];

                    $category['widgets'][] = $widget_name;
                }
            }
        }

        return $this->categories;
    }

    public function build_widget_definitions()
    {
        $widget_defs = [];

        foreach ($this->widgets as $widget)
        {
            $widget_name = $widget->get_name();

            $widget_defs[$widget_name] = $widget->build_widget_definition();
        }

        return $widget_defs;
    }
}
