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

    public function get_render_js_file_path()
    {
        return FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/widgets/layout/section.js';
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
                'type'    => self::$CONTROL_TEXT,
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
            'style_min_height',
            [
                'label'   => __('Min Height', 'foxy-builder'),
                'type'    => self::$CONTROL_NUMBER,
                'default' => 0,
                'selectors' => [
                    '{{WRAPPER}}' => 'min-height: {{VALUE}}px',
                ],
            ]
        );
        
        $this->end_controls_section();
    }

    protected function render()
    {

    }
}
