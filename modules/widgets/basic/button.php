<?php

namespace FoxyBuilder\Modules\Widgets\Basic;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/group-control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;
use \FoxyBuilder\Modules\GroupControls\GroupControlType;

class Button extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_BUTTON = 'button';

    protected static $TAB_BUTTON_NORMAL = 'button-normal';

    protected static $TAB_BUTTON_HOVER = 'button-hover';

    public function get_name()
    {
        return 'foxybdr.basic.button';
    }
    
    public function get_title()
    {
        return 'Button';
    }
    
    public function get_icon()
    {
        return 'fas fa-gear';
    }
    
    public function get_categories()
    {
        return [ 'basic' ];
    }

    public function get_render_js_file_path()
    {
        return FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/widgets/basic/button.js';
    }

    protected function is_child_container()
    {
        return false;
    }

    protected function declare_tabs()
    {
        $this->tabs = [
            [
                'title' => __('Button', 'foxy-builder'),
                'name' => self::$TAB_BUTTON,
                'sections' => [],
            ],
            [
                'title' => __('Button - Normal', 'foxy-builder'),
                'name' => self::$TAB_BUTTON_NORMAL,
                'sections' => [],
            ],
            [
                'title' => __('Button - Hover', 'foxy-builder'),
                'name' => self::$TAB_BUTTON_HOVER,
                'sections' => [],
            ],
        ];

        parent::declare_tabs();
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'button_content',
            [
                'label' => __('Content', 'foxy-builder'),
                'tab' => self::$TAB_BUTTON,
            ]
        );

        $this->add_control(
            'button_content_text',
            [
                'label'   => __('Text', 'foxy-builder'),
                'type'    => ControlType::$TEXT,
                'default' => __('Click Here', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'button_content_icon',
            [
                'label' => __('Icon', 'foxy-builder'),
                'type' => ControlType::$ICONS,
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'button_link',
            [
                'label' => __('Link', 'foxy-builder'),
                'tab' => self::$TAB_BUTTON,
            ]
        );

        $this->add_control(
            'button_link_link',
            [
                'label'   => __('Link', 'foxy-builder'),
                'type'    => ControlType::$URL,
                'placeholder' => __('Enter URL', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'button_link_new-window',
            [
                'label' => __('Open in New Window', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
            ]
        );

        $this->add_control(
            'button_link_no-follow',
            [
                'label' => __('Add nofollow', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
            ]
        );

        $this->end_controls_section();


        $selector_button = '{{WRAPPER}} .foxybdr-button';


        $this->start_controls_section(
            'button_style',
            [
                'label' => __('Style', 'foxy-builder'),
                'tab' => self::$TAB_BUTTON,
            ]
        );

        $this->add_group_control(
            GroupControlType::$TYPOGRAPHY,
            [
                'name' => 'button_style_typography',
                'label' => __('Typography', 'foxy-builder'),
                'default' => [
                    'size' => [
                        'desktop' => [
                            'unit' => 'px',
                            'size' => 16,
                        ],
                    ],
                ],
                'selector' => "{$selector_button} > span > span",
            ]
        );

        {
            $this->start_controls_tabs();

            {
                $this->start_controls_tab(__('Normal', 'foxy-builder'));

                $this->add_control(
                    'button_style_normal_color',
                    [
                        'label' => __('Text Color', 'foxy-builder'),
                        'type' => ControlType::$COLOR,
                        'default' => '#C0C0C0',
                        'selectors' => [
                            "{$selector_button} > span" => 'color: {{VALUE}}',
                        ],
                    ]
                );

                $this->end_controls_tab();
            }

            {
                $this->start_controls_tab(__('Hover', 'foxy-builder'));

                $this->add_control(
                    'button_style_hover_color',
                    [
                        'label' => __('Text Color', 'foxy-builder'),
                        'type' => ControlType::$COLOR,
                        'selectors' => [
                            "{$selector_button}:hover > span" => 'color: {{VALUE}}',
                        ],
                    ]
                );

                $this->end_controls_tab();
            }

            $this->end_controls_tabs();
        }

        $this->add_group_control(
            GroupControlType::$TEXT_SHADOW,
            [
                'name' => 'button_style_text-shadow',
                'selector' => "{$selector_button} > span",
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'button_style-icon',
            [
                'label' => __('Icon Style', 'foxy-builder'),
                'tab' => self::$TAB_BUTTON,
                'condition' => [
                    'button_content_icon.value!' => '',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_style-icon_size',
            [
                'label' => __('Size', 'foxy-builder'),
                'type' => ControlType::$SLIDER,
                'size_units' => [ 'px', 'em', 'rem' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 200,
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
                    'size' => 16,
                ],
                'selectors' => [
                    "{$selector_button} > span > i" => 'font-size: {{SIZE}}{{UNIT}}',
                ],
            ]
        );

        $this->add_control(
            'button_style-icon_position',
            [
                'label'   => __('Position', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    '-1'   => __('Before', 'foxy-builder'),
                    '1'    => __('After', 'foxy-builder'),
                ],
                'default' => '-1',
                'selectors' => [
                    "{$selector_button} > span > i" => 'order: {{VALUE}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_style-icon_spacing',
            [
                'label' => __('Spacing', 'foxy-builder'),
                'type' => ControlType::$SLIDER,
                'size_units' => [ 'px', 'em', 'rem' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 100,
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
                    'size' => 4,
                ],
                'selectors' => [
                    "{$selector_button} > span" => 'gap: {{SIZE}}{{UNIT}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'button_style-icon_vertical-offset',
            [
                'label'   => __('Vertical Offset', 'foxy-builder'),
                'type'    => ControlType::$NUMBER,
                'selectors' => [
                    "{$selector_button} > span > i" => 'top: {{VALUE}}px',
                ],
            ]
        );

        $this->end_controls_section();


        $this->omit_setting('button_boundary_margin');
        $this->add_defaults([
            "button_boundary_padding" => [
                'left'   => 24,
                'top'    => 12,
                'right'  => 24,
                'bottom' => 12,
                'unit'   => 'px',
                'locked' => false
            ],
            'button_boundary_border-radius' => [
                'left'   => 4,
                'top'    => 4,
                'right'  => 4,
                'bottom' => 4,
                'unit'   => 'px',
                'locked' => true
            ],
        ]);
        $this->add_controls_boundary(self::$TAB_BUTTON, $selector_button, 'button');


        $this->start_controls_section(
            'button_size',
            [
                'label' => __('Size', 'foxy-builder'),
                'tab' => self::$TAB_BUTTON,
            ]
        );

        $this->add_responsive_control(
            'button_size_full-width',
            [
                'label' => __('Full Width', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
                'selectors' => [
                    $selector_button => 'width: 100%',
                ],
            ]
        );

        $this->end_controls_section();


        $this->add_defaults([
            'button-normal_background_color' => '#404040',
        ]);
        $this->add_controls_background(self::$TAB_BUTTON_NORMAL, $selector_button, 'button-normal');


        $this->add_controls_background(self::$TAB_BUTTON_HOVER, "{$selector_button}:hover", 'button-hover');


        $this->add_controls_widget(self::$TAB_WIDGET);


        $this->add_controls_advanced(self::$TAB_ADVANCED);
    }

    protected function render()
    {

    }
}
