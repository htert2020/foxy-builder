<?php

namespace FoxyBuilder\Modules\Widgets\Layout;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class Column extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    public function get_name()
    {
        return 'foxybdr.layout.column';
    }
    
    public function get_title()
    {
        return 'Column';
    }
    
    public function get_icon()
    {
        return 'foxybdr-fa-section';
    }
    
    public function get_categories()
    {
        return [ 'layout' ];
    }

    public function get_render_js_file_path()
    {
        return FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/widgets/layout/column.js';
    }

    protected function is_child_container()
    {
        return true;
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
                'type'    => ControlType::$TEXT,
                'default' => __('Default Text', 'foxy-builder'),
            ]
        );
        
        $this->end_controls_section();


        $this->start_controls_section(
            'style',
            [
                'label' => __('Style', 'foxy-builder'),
                'tab' => self::$TAB_STYLE,
            ]
        );
        
        $this->add_responsive_control(
            'style_propwidth',
            [
                'label'   => __('Proportional Width', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'default' => 1,
                'selectors' => [
                    '{{WIDGET}}' => 'flex-grow: {{VALUE}}; flex-shrink: {{VALUE}}',
                ],
            ]
        );
        
        $this->end_controls_section();
    }

    protected function render()
    {

    }
}
