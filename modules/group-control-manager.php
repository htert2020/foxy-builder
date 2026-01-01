<?php

namespace FoxyBuilder\Modules;

if (!defined('ABSPATH'))
    exit;

class GroupControlManager
{
    private $group_controls = [];

    private static $_instance = null;
    
    public static function instance()
    {
        if (self::$_instance === null)
        {
            self::$_instance = new self();
        }

        return self::$_instance;
    }

    public function add_group_controls()
    {
        require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/typography.php';
        require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/image-size.php';

        $this->group_controls = [
            new \FoxyBuilder\Modules\GroupControls\Typography(),
            new \FoxyBuilder\Modules\GroupControls\ImageSize(),
        ];
    }

    public function build_group_control_definitions()
    {
        $defs = [];

        foreach ($this->group_controls as $group_control)
        {
            $name = $group_control->get_name();

            $defs[$name] = $group_control->build_definition();
        }

        return $defs;
    }
}
