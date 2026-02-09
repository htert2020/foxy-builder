<?php

namespace FoxyBuilder\Modules\Widgets\Layout;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class Column extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_LAYOUT = 'layout';

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
                $tab['title'] = 'Column';
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

        $this->add_control(
            'widget_size_width',
            [
                'label'   => __('Proportional Width', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'description' => 'The width of this column will be this proportional width divided by the sum of the proportional widths of all the columns in the section, multiplied by 100%.',
                'default' => 1,
                'selectors' => [
                    '{{WIDGET}}' => '--foxybdr-column-width: {{VALUE}}',
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
