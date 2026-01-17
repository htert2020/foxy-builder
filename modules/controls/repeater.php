<?php

namespace FoxyBuilder\Modules\Controls;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';

use \FoxyBuilder\Modules\Controls\ControlType;
    
class Repeater
{
    protected $ordered_settings = [];  // Setting names in display order.

    protected $settings = [];  // Map of setting names to setting params.

    public function add_control($setting_name, $args)
    {
        $this->ordered_settings[] = $setting_name;

        $this->settings[$setting_name] = $args;
    }

    public function add_responsive_control($setting_name, $args)
    {
        $this->add_control($setting_name, array_merge($args, [ 'responsive' => true ]));
    }

    public function add_group_control($group_control_type, $args)
    {
        $args['type'] = ControlType::$GROUP;
        $args['sub_type'] = $group_control_type;

        $setting_name = $args['name'];
        unset($args['name']);

        $this->add_control($setting_name, $args);
    }

    public function get_controls()
    {
        return [
            'orderedSettings' => $this->ordered_settings,
            'settings' => $this->settings,
        ];
    }
}
