<?php

namespace FoxyBuilder\Modules\Widgets\Layout;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class Component extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_LAYOUT = 'layout';

    public function get_name()
    {
        return 'foxybdr.layout.component';
    }
    
    public function get_title()
    {
        return 'Component';
    }
    
    public function get_icon()
    {
        return 'foxybdr-fa-section';
    }
    
    public function get_categories()
    {
        return [];
    }

    public function get_render_js_file_path()
    {
        return null;
    }

    protected function is_child_container()
    {
        return true;
    }

    protected function declare_tabs()
    {
        $this->tabs = [
            [
                'title' => __('Layout', 'foxy-builder'),
                'name' => self::$TAB_LAYOUT,
                'sections' => [],
            ],
        ];

        parent::declare_tabs();

        foreach ($this->tabs as &$tab)
        {
            if ($tab['name'] === self::$TAB_WIDGET)
                $tab['title'] = 'Component';
        }
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'layout',
            [
                'label' => __('Layout', 'foxy-builder'),
                'tab' => self::$TAB_LAYOUT,
            ]
        );

        $this->add_responsive_control(
            'layout_widget-spacing',
            [
                'label'   => __('Widget Spacing', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'selectors' => [
                    '{{WRAPPER}}' => '--foxybdr-widget-spacing: {{VALUE}}px',
                ],
            ]
        );

        $this->add_control(
            'layout_horizontal-alignment',
            [
                'label'   => __('Horizontal Alignment', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    ''              => __('Default', 'foxy-builder'),
                    'flex-start'    => __('Left', 'foxy-builder'),
                    'center'        => __('Center', 'foxy-builder'),
                    'flex-end'      => __('Right', 'foxy-builder'),
                    'space-between' => __('Space Between', 'foxy-builder'),
                    'space-around'  => __('Space Around', 'foxy-builder'),
                    'space-evenly'  => __('Space Evenly', 'foxy-builder'),
                ],
                'selectors' => [
                    '{{WRAPPER}}' => 'justify-content: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'layout_vertical-alignment',
            [
                'label'   => __('Vertical Alignment', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    ''              => __('Default', 'foxy-builder'),
                    'flex-start'    => __('Top', 'foxy-builder'),
                    'center'        => __('Middle', 'foxy-builder'),
                    'flex-end'      => __('Bottom', 'foxy-builder'),
                    'space-between' => __('Space Between', 'foxy-builder'),
                    'space-around'  => __('Space Around', 'foxy-builder'),
                    'space-evenly'  => __('Space Evenly', 'foxy-builder'),
                ],
                'selectors' => [
                    '{{WRAPPER}}' => 'align-content: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'layout_widget-alignment',
            [
                'label'   => __('Widget Alignment', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'description' => 'If multiple widgets are on the same line, Widget Alignment controls their vertical alignment relative to each other.',
                'options' => [
                    ''           => __('Stretch', 'foxy-builder'),
                    'flex-start' => __('Top', 'foxy-builder'),
                    'center'     => __('Middle', 'foxy-builder'),
                    'flex-end'   => __('Bottom', 'foxy-builder'),
                ],
                'selectors' => [
                    '{{WRAPPER}}' => 'align-items: {{VALUE}}',
                ],
            ]
        );

        $this->end_controls_section();


        $this->add_controls_boundary(self::$TAB_WIDGET, '{{WRAPPER}}');


        $this->start_controls_section(
            "widget_position",
            [
                'label' => __('Position', 'foxy-builder'),
                'tab' => self::$TAB_WIDGET,
            ]
        );

        $this->add_control(
            "widget_position_z-index",
            [
                'label'   => __('Z Position', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'selectors' => [
                    '{{WIDGET}}' => 'z-index: {{VALUE}}',
                ],
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'widget_size',
            [
                'label' => __('Size', 'foxy-builder'),
                'tab' => self::$TAB_WIDGET,
            ]
        );

        $this->add_responsive_control(
            'widget_size_width',
            [
                'label'   => __('Width', 'foxy-builder'),
                'type'    => ControlType::$SLIDER,
                'size_units' => [ 'px', '%' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 1000,
                    ],
                    '%' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                ],
                'default' => [
                    'unit' => '%',
                    'size' => 100,
                ],
                'selectors' => [
                    '{{WIDGET}}' => '--foxybdr-block-width: {{SIZE}}{{UNIT}}',
                ],
            ]
        );

        $this->end_controls_section();


        $this->add_controls_background(self::$TAB_WIDGET, '{{WRAPPER}}');

        $this->add_controls_advanced(self::$TAB_ADVANCED);
    }

    protected function render()
    {

    }
}
