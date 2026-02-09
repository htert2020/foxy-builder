<?php

namespace FoxyBuilder\Modules\Widgets\Basic;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;

class Icon extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_ICON = 'icon';

    public function get_name()
    {
        return 'foxybdr.basic.icon';
    }
    
    public function get_title()
    {
        return 'Icon';
    }
    
    public function get_icon()
    {
        return 'fas fa-star';
    }
    
    public function get_categories()
    {
        return [ 'basic' ];
    }

    public function get_render_js_file_path()
    {
        return FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/widgets/basic/icon.js';
    }

    protected function is_child_container()
    {
        return false;
    }

    protected function declare_tabs()
    {
        $this->tabs = [
            [
                'title' => __('Icon', 'foxy-builder'),
                'name' => self::$TAB_ICON,
                'sections' => [],
            ],
        ];

        parent::declare_tabs();
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'icon_content',
            [
                'label' => __('Content', 'foxy-builder'),
                'tab' => self::$TAB_ICON,
            ]
        );

        $this->add_control(
            'icon_content_icon',
            [
                'label' => __('Icon', 'foxy-builder'),
                'type' => ControlType::$ICONS,
                'default' => [
                    'value' => 'fas fa-star',
                    'library' => 'fa-solid',
                ],
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'icon_link',
            [
                'label' => __('Link', 'foxy-builder'),
                'tab' => self::$TAB_ICON,
            ]
        );

        $this->add_control(
            'icon_link_link',
            [
                'label'   => __('Link', 'foxy-builder'),
                'type'    => ControlType::$URL,
                'placeholder' => __('Enter URL', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'icon_link_new-window',
            [
                'label' => __('Open in New Window', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'icon_link_no-follow',
            [
                'label' => __('Add nofollow', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
            ]
        );

        $this->end_controls_section();


        $selector_icon = '{{WRAPPER}} .foxybdr-icon';


        $this->start_controls_section(
            'icon_style',
            [
                'label' => __('Style', 'foxy-builder'),
                'tab' => self::$TAB_ICON,
            ]
        );

        {
            $this->start_controls_tabs();

            {
                $this->start_controls_tab(__('Normal', 'foxy-builder'));

                $this->add_control(
                    'icon_style_normal_color',
                    [
                        'label' => __('Icon Color', 'foxy-builder'),
                        'type' => ControlType::$COLOR,
                        'default' => '#808080',
                        'selectors' => [
                            $selector_icon => 'color: {{VALUE}}',
                        ],
                    ]
                );

                $this->end_controls_tab();
            }

            {
                $this->start_controls_tab(__('Hover', 'foxy-builder'));

                $this->add_control(
                    'icon_style_hover_color',
                    [
                        'label' => __('Icon Color', 'foxy-builder'),
                        'type' => ControlType::$COLOR,
                        'selectors' => [
                            "{$selector_icon}:hover" => 'color: {{VALUE}}',
                        ],
                    ]
                );

                $this->end_controls_tab();
            }

            $this->end_controls_tabs();
        }

        $this->add_control(
            'icon_style_rotation',
            [
                'label' => __('Rotation', 'foxy-builder'),
                'type' => ControlType::$SLIDER,
                'size_units' => [ 'deg' ],
                'range' => [
                    'deg' => [
                        'min' => -360,
                        'max' =>  360,
                    ],
                ],
                'selectors' => [
                    "{$selector_icon} i" => 'transform: rotate({{SIZE}}{{UNIT}})',
                ],
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'icon_boundary',
            [
                'label' => __('Boundary', 'foxy-builder'),
                'tab' => self::$TAB_ICON,
            ]
        );

        $this->add_responsive_control(
            'icon_boundary_padding',
            [
                'label' => __('Padding', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                'size_units' => [ 'px', '%', 'em', 'rem' ],
                'default' => [
                    'left'   => 25,
                    'top'    => 25,
                    'right'  => 25,
                    'bottom' => 25,
                    'unit'   => 'px',
                    'locked' => true
                ],
                'selectors' => [
                    $selector_icon => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
                ],
            ]
        );

        $this->add_control(
            'icon_boundary_border-style',
            [
                'label'   => __('Border Type', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    ''       => __('Default', 'foxy-builder'),
                    'none'   => __('None', 'foxy-builder'),
                    'solid'  => __('Solid', 'foxy-builder'),
                    'double' => __('Double', 'foxy-builder'),
                    'dotted' => __('Dotted', 'foxy-builder'),
                    'dashed' => __('Dashed', 'foxy-builder'),
                    'groove' => __('Groove', 'foxy-builder'),
                ],
                'default' => 'solid',
                'selectors' => [
                    $selector_icon => 'border-style: {{VALUE}}',
                ],
            ]
        );
        
        $this->add_responsive_control(
            'icon_boundary_border-width',
            [
                'label' => __('Border Width', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                'size_units' => [ 'px', 'em', 'rem', 'vw' ],
                'default' => [
                    'left'   => 3,
                    'top'    => 3,
                    'right'  => 3,
                    'bottom' => 3,
                    'unit'   => 'px',
                    'locked' => true
                ],
                'selectors' => [
                    $selector_icon => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}}',
                ],
            ]
        );

        {
            $this->start_controls_tabs();

            {
                $this->start_controls_tab(__('Normal', 'foxy-builder'));

                $this->add_control(
                    'icon_boundary_normal_border-color',
                    [
                        'label' => __('Border Color', 'foxy-builder'),
                        'type' => ControlType::$COLOR,
                        'default' => '#808080',
                        'selectors' => [
                            $selector_icon => 'border-color: {{VALUE}}',
                        ],
                    ]
                );

                $this->end_controls_tab();
            }

            {
                $this->start_controls_tab(__('Hover', 'foxy-builder'));

                $this->add_control(
                    'icon_boundary_hover_border-color',
                    [
                        'label' => __('Border Color', 'foxy-builder'),
                        'type' => ControlType::$COLOR,
                        'selectors' => [
                            "{$selector_icon}:hover" => 'border-color: {{VALUE}}',
                        ],
                    ]
                );

                $this->end_controls_tab();
            }

            $this->end_controls_tabs();
        }

        $this->add_responsive_control(
            'icon_boundary_border-radius',
            [
                'label' => __('Border Radius', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                'sub_type' => 'corners',
                'size_units' => [ 'px', '%', 'em', 'rem' ],
                'default' => [
                    'left'   => 50,
                    'top'    => 50,
                    'right'  => 50,
                    'bottom' => 50,
                    'unit'   => '%',
                    'locked' => true
                ],
                'selectors' => [
                    $selector_icon => 'border-radius: {{LEFT}}{{UNIT}} {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}}',
                ],
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'icon_size',
            [
                'label' => __('Size', 'foxy-builder'),
                'tab' => self::$TAB_ICON,
            ]
        );

        $this->add_responsive_control(
            'icon_size_size',
            [
                'label' => __('Icon Size', 'foxy-builder'),
                'type' => ControlType::$SLIDER,
                'size_units' => [ 'px', 'em', 'rem' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 400,
                    ],
                    'em' => [
                        'min' => 0.1,
                        'max' => 10.0,
                        'step' => 0.1,
                    ],
                    'rem' => [
                        'min' => 0.1,
                        'max' => 10.0,
                        'step' => 0.1,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 50,
                ],
                'selectors' => [
                    $selector_icon => 'font-size: {{SIZE}}{{UNIT}}',
                ],
            ]
        );

        $this->end_controls_section();


        $this->add_controls_widget(self::$TAB_WIDGET);


        $this->add_controls_advanced(self::$TAB_ADVANCED);
    }

    protected function render()
    {

    }
}
