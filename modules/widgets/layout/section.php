<?php

namespace FoxyBuilder\Modules\Widgets\Layout;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

class Section extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    public function get_name()
    {
        return 'foxybdr.layout.section';
    }
    
    public function get_title()
    {
        return 'Section';
    }
    
    public function get_icon()
    {
        return 'foxybdr-fa-section';
    }
    
    public function get_categories()
    {
        return [ 'layout' ];
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'content',
            [
                'label' => __('Content', 'foxy-builder'),
                'tab' => self::$TAB_CONTENT,
            ]
        );
        
        $this->add_control(
            'content.text',
            [
                'label'   => __('Text', 'foxy-builder'),
                'type'    => self::$CONTROL_TEXT,
                'default' => __('Default Text', 'foxy-builder'),
            ]
        );
        
        $this->end_controls_section();
    }

    protected function render()
    {

    }
}
