<?php

namespace FoxyBuilder\Modules\GroupControls;

if (!defined('ABSPATH'))
    exit;

abstract class BaseGroupControl
{
    abstract public function get_name();
    
    abstract public function get_title();

    abstract public function get_is_dropdown();
    
    abstract protected function _register_controls();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // BASE CLASS MEMBERS AND METHODS
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    protected $title = '';

    protected $is_dropdown = false;

    protected $ordered_settings = [];  // Setting names in display order.

    protected $settings = [];  // Map of setting names to setting params.

    public function build_definition()
    {
        $this->title = $this->get_title();
        $this->is_dropdown = $this->get_is_dropdown();

        $this->_register_controls();

        return [
            'title' => $this->title,
            'isDropdown' => $this->is_dropdown,
            'orderedSettings' => $this->ordered_settings,
            'settings' => $this->settings,
        ];
    }

    public function add_control($setting_name, $args)
    {
        $this->ordered_settings[] = $setting_name;

        $this->settings[$setting_name] = $args;
    }

    public function add_responsive_control($setting_name, $args)
    {
        $this->add_control($setting_name, array_merge($args, [ 'responsive' => true ]));
    }
}
