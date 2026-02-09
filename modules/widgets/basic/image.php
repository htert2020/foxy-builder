<?php

namespace FoxyBuilder\Modules\Widgets\Basic;

if (!defined('ABSPATH'))
    exit;

require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/controls/control-utils.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/group-controls/group-control-type.php';
require_once FOXYBUILDER_PLUGIN_PATH . '/modules/widgets/base-widget.php';

use \FoxyBuilder\Modules\Controls\ControlType;
use \FoxyBuilder\Modules\GroupControls\GroupControlType;

class Image extends \FoxyBuilder\Modules\Widgets\BaseWidget
{
    protected static $TAB_IMAGE = 'image';

    public function get_name()
    {
        return 'foxybdr.basic.image';
    }
    
    public function get_title()
    {
        return 'Image';
    }
    
    public function get_icon()
    {
        return 'fas fa-image';
    }
    
    public function get_categories()
    {
        return [ 'basic' ];
    }

    public function get_render_js_file_path()
    {
        return FOXYBUILDER_PLUGIN_PATH . '/admin/assets/js/widgets/basic/image.js';
    }

    protected function is_child_container()
    {
        return false;
    }

    protected function declare_tabs()
    {
        $this->tabs = [
            [
                'title' => __('Image', 'foxy-builder'),
                'name' => self::$TAB_IMAGE,
                'sections' => [],
            ],
        ];

        parent::declare_tabs();
    }

    protected function _register_controls()
    {
        $this->start_controls_section(
            'image_content',
            [
                'label' => __('Content', 'foxy-builder'),
                'tab' => self::$TAB_IMAGE,
            ]
        );

        $this->add_control(
            'image_content_image',
            [
                'label' => __('Image', 'foxy-builder'),
                'type'  => ControlType::$MEDIA,
                'media_title' => 'Image',
            ]
        );

        $image_size_options = \FoxyBuilder\Modules\Controls\ControlUtils::get_image_sizes();

        $this->add_control(
            'image_content_image-size',
            [
                'label'   => __('Image Resolution', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => $image_size_options,
                'default' => 'full',
                'label_block' => true,
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'image_link',
            [
                'label' => __('Link', 'foxy-builder'),
                'tab' => self::$TAB_IMAGE,
            ]
        );

        $this->add_control(
            'image_link_type',
            [
                'label'   => __('Type', 'foxy-builder'),
                'type'    => ControlType::$SELECT,
                'options' => [
                    ''                => __('None', 'foxy-builder'),
                    'full_size_image' => __('Full Size Image', 'foxy-builder'),
                    'custom'          => __('Custom...', 'foxy-builder'),
                ],
            ]
        );
        
        $this->add_control(
            'image_link_custom-link',
            [
                'label'   => __('Custom Link', 'foxy-builder'),
                'type'    => ControlType::$URL,
                'placeholder' => __('Enter URL', 'foxy-builder'),
                'condition' => [
                    'image_link_type' => 'custom',
                ],
            ]
        );

        $this->add_control(
            'image_link_new-window',
            [
                'label' => __('Open in New Window', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
                'condition' => [
                    'image_link_type!' => '',
                ],
            ]
        );

        $this->add_control(
            'image_link_no-follow',
            [
                'label' => __('Add nofollow', 'foxy-builder'),
                'type' => ControlType::$SWITCHER,
                'label_off' => __('No', 'foxy-builder'),
                'label_on' => __('Yes', 'foxy-builder'),
                'condition' => [
                    'image_link_type!' => '',
                ],
            ]
        );

        $this->end_controls_section();


        $selector_image = '{{WRAPPER}} img';


        $this->start_controls_section(
            'image_style',
            [
                'label' => __('Style', 'foxy-builder'),
                'tab' => self::$TAB_IMAGE,
            ]
        );

        {
            $this->start_controls_tabs();

            {
                $this->start_controls_tab(__('Normal', 'foxy-builder'));

                $this->add_control(
                    'image_style_normal_opacity',
                    [
                        'label' => __('Opacity', 'foxy-builder'),
                        'type' => ControlType::$SLIDER,
                        'size_units' => [ ' ' ],
                        'range' => [
                            ' ' => [
                                'min'  => 0.00,
                                'max'  => 1.00,
                                'step' => 0.01,
                            ],
                        ],
                        'selectors' => [
                            $selector_image => 'opacity: {{SIZE}}',
                        ],
                    ]
                );

                $this->add_group_control(
                    GroupControlType::$COLOR_FILTER,
                    [
                        'name' => 'image_style_normal_color-filter',
                        'selector' => $selector_image,
                    ]
                );
        
                $this->end_controls_tab();
            }

            {
                $this->start_controls_tab(__('Hover', 'foxy-builder'));

                $this->add_control(
                    'image_style_hover_opacity',
                    [
                        'label' => __('Opacity', 'foxy-builder'),
                        'type' => ControlType::$SLIDER,
                        'size_units' => [ ' ' ],
                        'range' => [
                            ' ' => [
                                'min'  => 0.00,
                                'max'  => 1.00,
                                'step' => 0.01,
                            ],
                        ],
                        'selectors' => [
                            "{$selector_image}:hover" => 'opacity: {{SIZE}}',
                        ],
                    ]
                );

                $this->add_group_control(
                    GroupControlType::$COLOR_FILTER,
                    [
                        'name' => 'image_style_hover_color-filter',
                        'selector' => "{$selector_image}:hover",
                    ]
                );
        
                $this->end_controls_tab();
            }

            $this->end_controls_tabs();
        }

        $this->end_controls_section();


        $this->start_controls_section(
            'image_boundary',
            [
                'label' => __('Boundary', 'foxy-builder'),
                'tab' => self::$TAB_IMAGE,
            ]
        );

        $this->add_group_control(
            GroupControlType::$BORDER,
            [
                'name' => 'image_boundary_border',
                'selector' => $selector_image,
            ]
        );

        $this->add_responsive_control(
            'image_boundary_border-radius',
            [
                'label' => __('Border Radius', 'foxy-builder'),
                'type' => ControlType::$DIMENSIONS,
                'sub_type' => 'corners',
                'size_units' => [ 'px', '%', 'em', 'rem' ],
                'selectors' => [
                    $selector_image => 'border-radius: {{LEFT}}{{UNIT}} {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}}',
                ],
            ]
        );

        $this->add_group_control(
            GroupControlType::$BOX_SHADOW,
            [
                'name' => 'image_boundary_box-shadow',
                'selector' => $selector_image,
            ]
        );

        $this->end_controls_section();


        $this->start_controls_section(
            'image_size',
            [
                'label' => __('Size', 'foxy-builder'),
                'tab' => self::$TAB_IMAGE,
            ]
        );

        $this->add_responsive_control(
            'image_size_width',
            [
                'label' => __('Width', 'foxy-builder'),
                'type' => ControlType::$SLIDER,
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
                'selectors' => [
                    $selector_image => 'width: {{SIZE}}{{UNIT}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'image_size_max-width',
            [
                'label' => __('Max Width', 'foxy-builder'),
                'type' => ControlType::$SLIDER,
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
                'selectors' => [
                    $selector_image => 'max-width: {{SIZE}}{{UNIT}}',
                ],
            ]
        );

        $this->add_responsive_control(
            'image_size_height',
            [
                'label' => __('Height', 'foxy-builder'),
                'type' => ControlType::$SLIDER,
                'size_units' => [ 'px', '%' ],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 500,
                    ],
                    '%' => [
                        'min' => 0,
                        'max' => 100,
                    ],
                ],
                'selectors' => [
                    $selector_image => 'height: {{SIZE}}{{UNIT}}',
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
